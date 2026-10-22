import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "firebase-admin/storage";
import { FieldValue, type DocumentReference } from "firebase-admin/firestore";
import { createHash } from "node:crypto";
import { z } from "zod";
import { db, cloudFirebase } from "@/lib/firebase";
import { sessionIdentity } from "@/lib/access-workflows";
import { boundedJson, consumeLimit } from "@/lib/request-guards";
import { uploadLimit, validatePrescriptionFile } from "@/lib/intake-files";
import { readPrescriptionDocument } from "@/lib/document-reading";
export const runtime = "nodejs";
class IntakeError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
const text = z.string().trim().min(1).max(4000);
async function handle(
  req: NextRequest,
  context: { params: Promise<{ action: string[] }> },
) {
  try {
    let identity;
    try {
      identity = await sessionIdentity(req);
    } catch {
      throw new IntakeError(
        "Sign in with a verified account to continue.",
        401,
      );
    }
    const member = (
      await db.collection("members").doc(identity.uid).get()
    ).data();
    if (
      !member ||
      member.status === "disabled" ||
      !["patient", "doctor", "receptionist"].includes(member.role)
    )
      throw new IntakeError("This action is unavailable to your account.", 403);
    const org = db.collection("organizations").doc(member.tenantId);
    const orgRecord = (await org.get()).data();
    if (!orgRecord || !["active", "trial_active"].includes(orgRecord.state))
      throw new IntakeError("Your provider workspace is unavailable.", 403);
    const { action } = await context.params;
    const post = req.method === "POST";
    if (
      post &&
      !req.headers.get("authorization") &&
      req.headers.get("origin") !==
        `${req.nextUrl.protocol}//${req.headers.get("host")}`
    )
      throw new IntakeError("Invalid request origin.", 403);
    const requests = org.collection("prescriptionRequests");
    async function patientAccess(patientId: string) {
      const ref = org.collection("patients").doc(idSchema.parse(patientId));
      const patient = (await ref.get()).data();
      if (
        !patient ||
        (member!.role === "patient" &&
          (member!.patientId !== patientId ||
            patient.accountUid !== identity!.uid)) ||
        (member!.role === "doctor" && patient.doctorId !== identity!.uid)
      )
        throw new IntakeError("Patient access denied.", 403);
      return { ref, patient };
    }
    if (action[0] === "list" && !post) {
      let query = requests.orderBy("createdAt", "desc").limit(100);
      if (member.role === "patient") {
        await patientAccess(member.patientId);
        query = requests
          .where("patientId", "==", member.patientId)
          .orderBy("createdAt", "desc")
          .limit(100);
      } else if (member.role === "doctor")
        query = requests
          .where("doctorId", "==", identity.uid)
          .orderBy("createdAt", "desc")
          .limit(100);
      const data = await query.get();
      const items = [];
      for (const document of data.docs) {
        const record = document.data();
        if (member.role === "doctor") {
          try {
            await patientAccess(record.patientId);
          } catch {
            continue;
          }
        }
        const { objectPath, contentHash, ...safe } = record;
        if (member.role !== "doctor") {
          delete safe.aiText;
          delete safe.aiUnclear;
        }
        if (member.role === "receptionist") {
          delete safe.transcription;
          delete safe.reviewSummary;
          delete safe.aiText;
          delete safe.patientComment;
        }
        items.push({ id: document.id, ...safe });
      }
      return NextResponse.json(
        { items, limit: 100, timezone: "Asia/Kolkata" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (action[0] === "upload" && post) {
      if (member.role !== "patient")
        throw new IntakeError(
          "Only patients can submit through this flow.",
          403,
        );
      if (cloudFirebase)
        throw new IntakeError(
          "Document uploads are awaiting the provider’s security-scanning configuration. Contact your clinic.",
          503,
        );
      if (!(await consumeLimit(`upload:${identity.uid}`, 10, 3600000)))
        throw new IntakeError(
          "Upload limit reached. Try again in one hour.",
          429,
        );
      const { ref: patientRef, patient } = await patientAccess(
        member.patientId,
      );
      // Read before parsing multipart to enforce the cap for chunked requests too.
      const reader = req.body?.getReader();
      if (!reader) throw new IntakeError("Choose a document.");
      const chunks: Uint8Array[] = [];
      let total = 0;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          total += part.value.length;
          if (total > uploadLimit + 65536) {
            await reader.cancel();
            throw new IntakeError("Maximum file size is 8 MB.", 413);
          }
          chunks.push(part.value);
        }
      } finally {
        reader.releaseLock();
      }
      const form = await new Response(Buffer.concat(chunks), {
        headers: { "Content-Type": req.headers.get("content-type") || "" },
      }).formData();
      const file = form.get("file");
      const replacementId = form.get("replacementId");
      const replacementRef =
        typeof replacementId === "string" && replacementId
          ? requests.doc(idSchema.parse(replacementId))
          : null;
      if (replacementRef) {
        const previous = (await replacementRef.get()).data();
        if (
          !previous ||
          previous.patientId !== member.patientId ||
          previous.state !== "clarification_requested"
        )
          throw new IntakeError(
            "This request cannot be replaced. Refresh and check its current status.",
            409,
          );
      }
      if (
        !(file instanceof File) ||
        form.get("consent") !== "true" ||
        form.get("belongsToMe") !== "true"
      )
        throw new IntakeError(
          "Confirm that this is your prescription and consent to your clinic reviewing it.",
        );
      let checked;
      const raw = Buffer.from(await file.arrayBuffer());
      try {
        checked = await validatePrescriptionFile(raw);
      } catch {
        throw new IntakeError(
          "The file could not be accepted. Use a clear JPEG/PNG (at least 400×400), or a plain unencrypted PDF of 1–10 pages, up to 8 MB.",
        );
      }
      const contentHash = createHash("sha256").update(raw).digest("hex");
      const requestId = createHash("sha256")
        .update(`${member.patientId}:${contentHash}`)
        .digest("hex");
      const ref = requests.doc(requestId);
      const existing = await ref.get();
      if (existing.exists)
        return NextResponse.json({
          id: ref.id,
          duplicate: true,
          message:
            "This document was already submitted. Open its existing request.",
        });
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
      const objectPath = `private/${member.tenantId}/${member.patientId}/${requestId}.${checked.extension}`;
      const bucket = getStorage().bucket("demo-withyou.appspot.com");
      await bucket.file(objectPath).save(checked.bytes, {
        resumable: false,
        metadata: {
          contentType: checked.type,
          cacheControl: "private, no-store",
        },
      });
      const now = new Date().toISOString();
      const value = {
        patientId: member.patientId,
        patientName: patient.name,
        doctorId: patient.doctorId,
        uploadedBy: identity.uid,
        createdAt: now,
        updatedAt: now,
        state: "awaiting_review",
        revision: 1,
        filename: `prescription.${checked.extension}`,
        objectPath,
        contentHash,
        mimeType: checked.type,
        pages: checked.pages,
        size: checked.bytes.length,
        quality: checked.quality,
        aiStatus: "not_run",
        reviewSummary: "",
        consentVersion: "prescription-review-v1",
        consentAt: now,
        identityAttestationAt: now,
        replacesRequestId: replacementRef?.id || null,
        timezone: "Asia/Kolkata",
      };
      await db.runTransaction(async (tx) => {
        const prior = await tx.get(ref);
        const fresh = await tx.get(patientRef);
        const replacement = replacementRef
          ? await tx.get(replacementRef)
          : null;
        if (prior.exists) return;
        if (
          fresh.data()?.accountUid !== identity!.uid ||
          fresh.data()?.doctorId !== patient.doctorId
        )
          throw new IntakeError(
            "Patient assignment changed. Refresh and try again.",
            409,
          );
        tx.create(ref, value);
        if (replacementRef && replacement) {
          const previous = replacement.data();
          if (
            !previous ||
            previous.patientId !== member.patientId ||
            previous.state !== "clarification_requested"
          )
            throw new IntakeError(
              "The original request changed. Refresh before replacing it.",
              409,
            );
          tx.create(
            replacementRef
              .collection("versions")
              .doc(String(previous.revision)),
            { ...previous, retainedAt: now },
          );
          tx.update(replacementRef, {
            state: "replaced",
            replacementRequestId: ref.id,
            updatedAt: now,
            revision: previous.revision + 1,
          });
        }
        tx.update(patientRef, { activityRevision: FieldValue.increment(1) });
        tx.create(org.collection("audit").doc(), {
          action: "prescription.upload",
          actor: identity!.uid,
          recordId: ref.id,
          at: now,
        });
      });
      return NextResponse.json({
        id: ref.id,
        message: "Document securely submitted for clinician review.",
      });
    }
    const ref = requests.doc(idSchema.parse(action[0]));
    const snapshot = await ref.get();
    const record = snapshot.data();
    if (!record) throw new IntakeError("Request not found.", 404);
    const { ref: patientRef } = await patientAccess(record.patientId);
    if (action[1] === "file" && !post) {
      if (member.role === "receptionist")
        throw new IntakeError(
          "Clinical documents require patient or clinician access.",
          403,
        );
      if (cloudFirebase)
        throw new IntakeError(
          "Document security scanning is not configured.",
          503,
        );
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
      const [bytes] = await getStorage()
        .bucket("demo-withyou.appspot.com")
        .file(record.objectPath)
        .download();
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          "Content-Type": record.mimeType,
          "Content-Disposition": `attachment; filename="${record.filename}"`,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (
      !post ||
      ![
        "read",
        "review",
        "patient-response",
        "book",
        "confirm",
        "cancel",
      ].includes(action[1])
    )
      throw new IntakeError("Action not found.", 404);
    const body = await boundedJson(req);
    const revision = z.number().int().min(1).parse(body.revision);
    let change: Record<string, unknown> = {};
    let expected: string[] = [];
    let slotRef: DocumentReference | undefined;
    if (action[1] === "read") {
      if (member.role !== "doctor")
        throw new IntakeError(
          "Only the assigned clinician can request an assisted reading.",
          403,
        );
      if (process.env.GEMINI_DATA_APPROVED !== "true")
        throw new IntakeError(
          "AI reading is unavailable. Review the original document manually.",
          503,
        );
      if (cloudFirebase)
        throw new IntakeError(
          "Document security scanning is not configured.",
          503,
        );
      if (
        record.revision !== revision ||
        !["awaiting_review", "clarification_requested"].includes(record.state)
      )
        throw new IntakeError("Refresh this request before reading.", 409);
      if (!(await consumeLimit(`document-ai:${identity.uid}`, 10, 3600000)))
        throw new IntakeError(
          "Reading limit reached. Manual review remains available.",
          429,
        );
      process.env.FIREBASE_STORAGE_EMULATOR_HOST ||= "127.0.0.1:9199";
      const [bytes] = await getStorage()
        .bucket("demo-withyou.appspot.com")
        .file(record.objectPath)
        .download();
      const reading = await readPrescriptionDocument(bytes, record.mimeType);
      expected = ["awaiting_review", "clarification_requested"];
      change = {
        state: record.state,
        aiText: reading.transcription,
        aiUnclear: reading.unclear,
        aiStatus: "proposed_reading",
        aiReadAt: new Date().toISOString(),
      };
    } else if (action[1] === "review") {
      if (member.role !== "doctor")
        throw new IntakeError("A clinician must review the prescription.", 403);
      const input = z
        .object({
          summary: text,
          outcome: z.enum(["ask_patient", "request_reupload"]),
          identityChecked: z.literal(true),
          sourceChecked: z.literal(true),
        })
        .parse(body);
      expected = ["awaiting_review", "clarification_requested"];
      change = {
        state:
          input.outcome === "ask_patient"
            ? "awaiting_patient"
            : "clarification_requested",
        reviewSummary: input.summary,
        reviewedBy: identity.uid,
        reviewedAt: new Date().toISOString(),
        patientConfirmedAt: null,
      };
    } else if (action[1] === "patient-response") {
      if (member.role !== "patient")
        throw new IntakeError("The patient must respond.", 403);
      const input = z
        .object({ correct: z.boolean(), comment: z.string().trim().max(2000) })
        .parse(body);
      expected = ["awaiting_patient"];
      change = {
        state: input.correct ? "ready_to_book" : "clarification_requested",
        patientComment: input.comment,
        patientConfirmedAt: input.correct ? new Date().toISOString() : null,
      };
    } else if (action[1] === "book") {
      if (member.role !== "patient")
        throw new IntakeError(
          "Only the patient can request this appointment.",
          403,
        );
      const input = z
        .object({
          preferredAt: z.iso.datetime({ offset: true }),
          reason: z.string().trim().max(1000),
          contactConfirmed: z.literal(true),
        })
        .parse(body);
      const when = Date.parse(input.preferredAt);
      if (when <= Date.now() || when > Date.now() + 60 * 86400000)
        throw new IntakeError(
          "Choose a future appointment preference within 60 days.",
        );
      expected = ["ready_to_book"];
      change = {
        state: "booking_requested",
        preferredAt: new Date(when).toISOString(),
        bookingReason: input.reason,
        contactConfirmedAt: new Date().toISOString(),
      };
    } else if (action[1] === "confirm") {
      if (member.role !== "receptionist")
        throw new IntakeError("Reception staff confirm appointments.", 403);
      const input = z
        .object({
          scheduledAt: z.iso.datetime({ offset: true }),
          location: z.string().trim().min(1).max(300),
        })
        .parse(body);
      const when = Date.parse(input.scheduledAt);
      // Thirty-minute allocation avoids overlaps without pretending the requested time was available.
      if (
        when <= Date.now() ||
        when > Date.now() + 60 * 86400000 ||
        when % 1800000 !== 0
      )
        throw new IntakeError(
          "Choose a future 30-minute appointment slot within 60 days.",
        );
      slotRef = org
        .collection("appointmentSlots")
        .doc(`${record.doctorId}_${when}`);
      expected = ["booking_requested"];
      change = {
        state: "confirmed",
        scheduledAt: new Date(when).toISOString(),
        durationMinutes: 30,
        location: input.location,
        confirmedBy: identity.uid,
        confirmedAt: new Date().toISOString(),
        confirmationChannel: "in_app",
        deliveryStatus: "available_in_app",
      };
    } else {
      if (!["patient", "receptionist"].includes(member.role))
        throw new IntakeError(
          "This account cannot cancel an appointment request.",
          403,
        );
      expected = ["ready_to_book", "booking_requested", "confirmed"];
      change = {
        state: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: identity.uid,
      };
      if (record.scheduledAt)
        slotRef = org
          .collection("appointmentSlots")
          .doc(`${record.doctorId}_${Date.parse(record.scheduledAt)}`);
    }
    await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(ref)).data();
      const patient = (await tx.get(patientRef)).data();
      const freshMember = (
        await tx.get(db.collection("members").doc(identity!.uid))
      ).data();
      const slot = slotRef ? await tx.get(slotRef) : null;
      if (
        !freshMember ||
        freshMember.status === "disabled" ||
        freshMember.tenantId !== member.tenantId ||
        freshMember.role !== member.role ||
        !patient ||
        (member.role === "patient" && patient.accountUid !== identity!.uid) ||
        (member.role === "doctor" && patient.doctorId !== identity!.uid) ||
        fresh?.doctorId !== patient.doctorId
      )
        throw new IntakeError("Access or assignment changed. Refresh.", 403);
      if (
        !fresh ||
        fresh.revision !== revision ||
        !expected.includes(fresh.state)
      )
        throw new IntakeError(
          "This request changed. Refresh before continuing.",
          409,
        );
      if (action[1] === "confirm" && slot?.exists)
        throw new IntakeError(
          "That clinician’s slot is already booked. Choose another.",
          409,
        );
      const now = new Date().toISOString();
      tx.create(ref.collection("versions").doc(String(revision)), {
        ...fresh,
        retainedAt: now,
      });
      tx.update(ref, { ...change, revision: revision + 1, updatedAt: now });
      tx.update(patientRef, { activityRevision: FieldValue.increment(1) });
      if (slotRef && action[1] === "confirm")
        tx.create(slotRef, {
          requestId: ref.id,
          patientId: record.patientId,
          doctorId: record.doctorId,
          scheduledAt: change.scheduledAt,
        });
      if (
        slotRef &&
        action[1] === "cancel" &&
        slot?.data()?.requestId === ref.id
      )
        tx.delete(slotRef);
      tx.create(org.collection("audit").doc(), {
        action: `prescription.${action[1]}`,
        actor: identity!.uid,
        recordId: ref.id,
        from: fresh.state,
        to: change.state,
        at: now,
      });
    });
    return NextResponse.json({ ok: true, state: change.state });
  } catch (error) {
    const status =
      error instanceof IntakeError
        ? error.status
        : error instanceof z.ZodError
          ? 400
          : 503;
    return NextResponse.json(
      {
        error:
          error instanceof IntakeError
            ? error.message
            : status === 400
              ? "Check the required fields and confirmations."
              : "This service is temporarily unavailable. Retry or contact your clinic.",
      },
      { status },
    );
  }
}
export const GET = handle;
export const POST = handle;

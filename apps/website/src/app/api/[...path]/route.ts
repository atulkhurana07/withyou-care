import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Query } from "firebase-admin/firestore";
import fontkit from "@pdf-lib/fontkit";
import { printableLines } from "@/lib/print-layout";
import {
  auth,
  db,
  cloudFirebase,
  firebaseMode,
  identityBase,
  identityKey,
} from "@/lib/firebase";
import { sendTransactionalEmail } from "@/lib/mail";
import {
  publicAccessWorkflow,
  staffAccessWorkflow,
} from "@/lib/access-workflows";
import { boundedJson, consumeLimit } from "@/lib/request-guards";
import {
  canUseDevelopmentCheckout,
  acceptedTestCard,
} from "@/lib/development-checkout";
import { extractNotes } from "@/lib/extraction";
import {
  fromMedicine,
  extractFixture,
  publicationIssues,
  occurrenceDates,
} from "@/lib/clinical";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Candidate,
  Patient,
  Report,
  Role,
} from "../../../../../../packages/shared-types";
export const runtime = "nodejs";
type Member = { tenantId: string; role: Role; patientId?: string };
class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const string = z.string().trim().min(1).max(300);
const medicineSchema = z.object({
  name: string,
  strength: string,
  dose: string,
  route: string,
  frequency: string,
  times: z.string().max(100),
  start: z.iso.date(),
  end: z.iso.date(),
  food: z.string().max(300),
});
async function member(req: NextRequest, allowPending = false) {
  const token =
    req.headers.get("authorization")?.replace(/^Bearer /, "") ||
    req.cookies.get("withyou-session")?.value;
  if (!token) throw new ApiError("Sign in to continue.", 401);
  let uid: string;
  try {
    const decoded =
      cloudFirebase && !req.headers.get("authorization")
        ? await auth.verifySessionCookie(token, true)
        : await auth.verifyIdToken(token, cloudFirebase);
    uid = decoded.uid;
    if (cloudFirebase && !decoded.email_verified)
      throw new ApiError(
        "Verify your email before accessing your workspace.",
        403,
      );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Your session expired. Please sign in again.", 401);
  }
  const record = await db.collection("members").doc(uid).get();
  if (!record.exists)
    throw new ApiError("No authorized workspace membership.", 403);
  const membership = record.data() as Member;
  if (record.data()?.status === "disabled")
    throw new ApiError(
      "Your team access has been disabled. Contact your organization.",
      403,
    );
  const organization = await db
    .collection("organizations")
    .doc(membership.tenantId)
    .get();
  if (
    !organization.exists ||
    (membership.role !== "patient" &&
      !["active", "trial_active"].includes(organization.data()?.state) &&
      !(allowPending && membership.role === "admin"))
  )
    throw new ApiError(
      "Your organization does not have an active workspace entitlement.",
      403,
    );
  return { uid, ...membership };
}
function permitted(m: Member, roles: Role[]) {
  if (!roles.includes(m.role))
    throw new ApiError("Your role cannot perform this action.", 403);
}
function tenant(m: Member) {
  return db.collection("organizations").doc(m.tenantId);
}
async function patientAccess(m: Member & { uid: string }, id: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id))
    throw new ApiError("Invalid patient identifier.");
  const doc = await tenant(m).collection("patients").doc(id).get();
  if (!doc.exists)
    throw new ApiError("Patient not found in your workspace.", 404);
  const p = doc.data() as Patient;
  if (m.role === "patient" && (m.patientId !== id || p.accountUid !== m.uid))
    throw new ApiError("Patient access denied.", 403);
  if (m.role === "doctor" && p.doctorId !== m.uid)
    throw new ApiError("Patient is assigned to another doctor.", 403);
  if (m.role === "admin")
    throw new ApiError(
      "Administrative membership does not grant clinical access.",
      403,
    );
  return p;
}
async function audit(
  m: Member & { uid: string },
  action: string,
  recordId: string,
) {
  await tenant(m).collection("audit").add({
    actor: m.uid,
    role: m.role,
    action,
    recordId,
    at: new Date().toISOString(),
  });
}
async function handler(req: NextRequest, params: Promise<{ path: string[] }>) {
  try {
    const { path } = await params;
    const route = path.join("/");
    const post = req.method === "POST";
    const requestOrigin = `${req.nextUrl.protocol}//${req.headers.get("host")}`;
    if (
      post &&
      req.headers.get("origin") !== requestOrigin &&
      !req.headers.get("authorization")
    )
      throw new ApiError("Invalid request origin.", 403);
    let body: any = {};
    try {
      body = post ? await boundedJson(req) : {};
    } catch {
      throw new ApiError(
        "Send valid JSON within the 32 KB request limit.",
        413,
      );
    }
    if (
      post &&
      [
        "session",
        "register",
        "invitation-account",
        "invitation-accept",
        "password-reset",
      ].includes(route)
    ) {
      if (
        !(await consumeLimit(`public:${route}`, 300, 60000)) ||
        !(await consumeLimit(
          `${route}:${String(body.email || body.token || "").toLowerCase()}`,
          30,
          600000,
        ))
      )
        throw new ApiError(
          "Too many attempts. Please wait before retrying.",
          429,
        );
    }
    if (route === "public/config" && !post)
      return NextResponse.json({
        checkoutAvailable: canUseDevelopmentCheckout(
          firebaseMode,
          process.env.DEVELOPMENT_CHECKOUT,
        ),
        emailVerificationRequired: cloudFirebase,
      });
    if (route === "register" && post) {
      const input = z
        .object({
          name: string,
          email: z.email(),
          contact: string,
          phone: z.string().regex(/^\+?[\d\s-]{10,16}$/),
          category: z.enum(["Clinic", "Hospital", "Enterprise"]),
          address: string,
          plan: z.enum(["Clinic", "Hospital", "Enterprise"]),
          password: z
            .string()
            .min(12)
            .max(128)
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
          acceptedTerms: z.literal(true),
        })
        .parse(body);
      if (
        cloudFirebase &&
        (!identityKey ||
          !process.env.RESEND_API_KEY ||
          !process.env.EMAIL_FROM ||
          !process.env.APP_URL?.startsWith("https://"))
      )
        throw new ApiError(
          "Organization registration is being configured. Please contact support.",
          503,
        );
      const { password, acceptedTerms, ...organization } = input;
      let user;
      try {
        user = await auth.createUser({
          email: input.email,
          password,
          displayName: input.contact,
        });
      } catch (error) {
        if ((error as { code?: string }).code === "auth/email-already-exists")
          throw new ApiError(
            "An account already uses this email. Sign in to continue.",
            409,
          );
        throw error;
      }
      const ref = db.collection("organizations").doc();
      const at = new Date().toISOString();
      try {
        const batch = db.batch();
        batch.set(ref, {
          ...organization,
          id: ref.id,
          state: "pending_checkout",
          verificationState: "pending",
          configured: false,
          createdAt: at,
          ownerUid: user.uid,
        });
        batch.set(db.collection("members").doc(user.uid), {
          tenantId: ref.id,
          role: "admin",
        });
        batch.set(ref.collection("audit").doc(), {
          actor: user.uid,
          action: "organization_registered",
          at,
          termsAcceptedAt: at,
        });
        await batch.commit();
      } catch (error) {
        await auth.deleteUser(user.uid);
        throw error;
      }
      let verificationStatus = "not_required";
      if (!cloudFirebase && process.env.EMAIL_MODE === "local") {
        try {
          await sendTransactionalEmail(
            input.email,
            "Your WithYou account is ready",
            `Welcome ${input.contact}. Your organization account for ${input.name} has been created. Sign in to continue subscription activation and workspace setup.`,
          );
        } catch {
          // Email preview failures do not discard a successfully created account.
        }
      }
      if (cloudFirebase) {
        try {
          const link = await auth.generateEmailVerificationLink(input.email, {
            url: `${process.env.APP_URL}/sign-in`,
          });
          await sendTransactionalEmail(
            input.email,
            "Verify your WithYou account",
            `Verify your email to continue setting up your WithYou workspace: ${link}`,
          );
          verificationStatus = "submitted";
        } catch {
          verificationStatus = "delivery_failed";
        }
      }
      return NextResponse.json({
        id: ref.id,
        emailVerificationRequired: cloudFirebase,
        verificationStatus,
      });
    }
    if (route === "session" && post) {
      const input = z
        .object({ email: z.email(), password: z.string().min(8).max(128) })
        .parse(body);
      const response = await fetch(
        `${identityBase}/accounts:signInWithPassword?key=${identityKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, returnSecureToken: true }),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new ApiError("Email or password is incorrect.", 401);
      const result = NextResponse.json({ ok: true, token: data.idToken });
      const cookie = cloudFirebase
        ? await auth.createSessionCookie(data.idToken, { expiresIn: 3600000 })
        : data.idToken;
      result.cookies.set("withyou-session", cookie, {
        httpOnly: true,
        sameSite: "strict",
        secure: cloudFirebase || req.nextUrl.protocol === "https:",
        maxAge: 3600,
        path: "/",
      });
      return result;
    }
    if (route === "sign-out" && post) {
      const result = NextResponse.json({ ok: true });
      result.cookies.delete("withyou-session");
      return result;
    }
    const publicResult = await publicAccessWorkflow(req, route, body);
    if (publicResult) return publicResult;
    const m = await member(
      req,
      route === "checkout/activate" || route === "workspace",
    );
    const staffResult = await staffAccessWorkflow(route, post, body, m);
    if (staffResult) return staffResult;
    if (route === "checkout/activate" && post) {
      permitted(m, ["admin"]);
      if (
        !canUseDevelopmentCheckout(
          firebaseMode,
          process.env.DEVELOPMENT_CHECKOUT,
        )
      )
        throw new ApiError(
          "Subscription activation is not available in this environment.",
          503,
        );
      const input = z
        .object({ paymentToken: z.string(), idempotencyKey: z.string().uuid() })
        .strict()
        .parse(body);
      if (!acceptedTestCard(input.paymentToken))
        throw new ApiError("This payment method could not be authorized.", 400);
      const orgRef = tenant(m);
      const subRef = orgRef.collection("subscriptions").doc("current");
      await db.runTransaction(async (tx) => {
        const org = await tx.get(orgRef);
        const sub = await tx.get(subRef);
        if (!org.exists || org.data()?.ownerUid !== m.uid)
          throw new ApiError(
            "Only the workspace owner can activate its subscription.",
            403,
          );
        if (sub.exists && sub.data()?.state === "active") return;
        const at = new Date().toISOString();
        tx.set(subRef, {
          state: "active",
          plan: org.data()!.plan,
          provider: "development",
          idempotencyKey: input.idempotencyKey,
          startedAt: at,
          chargedAmount: 0,
          chargeStatus: "not_charged",
        });
        tx.update(orgRef, { state: "active", activatedAt: at });
        tx.set(orgRef.collection("audit").doc(), {
          actor: m.uid,
          action: "subscription_access_activated",
          provider: "development",
          chargedAmount: 0,
          at,
        });
      });
      return NextResponse.json({ state: "active", chargedAmount: 0 });
    }
    if (route === "care/version" && !post) {
      permitted(m, ["patient"]);
      const patient = await patientAccess(m, m.patientId!);
      return NextResponse.json({
        version: (patient as any).publishedVersion || 0,
        activityRevision: (patient as any).activityRevision || 0,
      });
    }
    if (route === "workspace" && !post) {
      const org = await tenant(m).get();
      let patients: Patient[] = [];
      let reports: Report[] = [];
      if (m.role !== "admin") {
        let q = tenant(m)
          .collection("patients")
          .where("tenantId", "==", m.tenantId);
        if (m.role === "doctor") q = q.where("doctorId", "==", m.uid);
        if (m.role === "patient") q = q.where("accountUid", "==", m.uid);
        patients = (await q.get()).docs.map((d) => d.data() as Patient);
        let reportQuery: Query = tenant(m).collection("reports");
        if (m.role === "patient")
          reportQuery = reportQuery
            .where("patientId", "==", m.patientId)
            .where("state", "==", "published");
        if (m.role === "receptionist")
          reportQuery = reportQuery.select(
            "id",
            "tenantId",
            "patientId",
            "encounterId",
            "doctorId",
            "state",
            "version",
            "approvedAt",
            "approvedBy",
          );
        let reportDocs;
        if (m.role === "doctor") {
          const groups: string[][] = [];
          for (let index = 0; index < patients.length; index += 30)
            groups.push(patients.slice(index, index + 30).map((p) => p.id));
          reportDocs = (
            await Promise.all(
              groups.map((ids) =>
                tenant(m)
                  .collection("reports")
                  .where("patientId", "in", ids)
                  .get(),
              ),
            )
          ).flatMap((s) => s.docs);
        } else reportDocs = (await reportQuery.get()).docs;
        reports = reportDocs
          .map((d) => d.data() as Report)
          .filter(
            (r) =>
              patients.some((p) => p.id === r.patientId) &&
              (m.role !== "patient" || r.state === "published"),
          );
        if (m.role === "receptionist")
          reports = reports.map((r) => ({ ...r, notes: "", candidates: [] }));
      }
      const tasks =
        m.role === "patient" && reports.length
          ? (
              await tenant(m)
                .collection("tasks")
                .where("patientId", "==", m.patientId)
                .where("reportId", "==", reports[0].id)
                .get()
            ).docs
              .map((d) => d.data())
              .filter(
                (t) =>
                  t.completion !== "superseded" &&
                  reports.some((r) => r.id === t.reportId),
              )
          : [];
      const invitations =
        m.role === "receptionist"
          ? (await tenant(m).collection("invitations").get()).docs.map((d) => ({
              id: d.id,
              status: d.data().status,
              patientId: d.data().patientId,
              expiresAt: d.data().expiresAt,
              deliveryStatus: d.data().deliveryStatus || "created",
            }))
          : [];
      return NextResponse.json({
        member: m,
        organization: org.data(),
        patients,
        reports,
        tasks,
        invitations,
        team:
          m.role === "admin"
            ? (
                await db
                  .collection("members")
                  .where("tenantId", "==", m.tenantId)
                  .get()
              ).docs.map((d) => ({
                uid: d.id,
                role: d.data().role,
                displayName: d.data().displayName || d.data().role,
                email: d.data().email || "",
                status: d.data().status || "active",
                registrationNumber: d.data().registrationNumber || "",
                specialty: d.data().specialty || "",
                clinicalVerified: d.data().clinicalVerified || false,
                verificationReference: d.data().verificationReference || "",
              }))
            : [],
        staffInvitations:
          m.role === "admin"
            ? (await tenant(m).collection("staffInvitations").get()).docs.map(
                (d) => ({ id: d.id, ...d.data() }),
              )
            : [],
        doctors:
          m.role === "receptionist"
            ? (
                await db
                  .collection("members")
                  .where("tenantId", "==", m.tenantId)
                  .where("role", "==", "doctor")
                  .get()
              ).docs
                .filter((d) => d.data().status !== "disabled")
                .map((d) => ({
                  uid: d.id,
                  name: d.data().displayName || "Assigned clinician",
                }))
            : [],
      });
    }
    if (route === "setup" && post) {
      permitted(m, ["admin"]);
      const input = z
        .object({
          department: string,
          template: z.enum([
            "Consultation report",
            "Discharge summary",
            "Follow-up report",
          ]),
          language: z.enum(["English", "Hindi"]),
          timezone: z.literal("Asia/Kolkata"),
        })
        .parse(body);
      await tenant(m).update({ ...input, configured: true });
      await audit(m, "workspace_configured", m.tenantId);
      return NextResponse.json({ ok: true });
    }
    if (route === "patients" && post) {
      permitted(m, ["receptionist"]);
      const input = z
        .object({
          name: string,
          age: z.number().int().min(0).max(125),
          phone: z.string().regex(/^$|^\+?[\d\s-]{10,16}$/),
          language: z.enum(["English", "Hindi"]),
          invitationOptIn: z.boolean(),
          email: z
            .union([z.literal(""), z.email()])
            .optional()
            .default(""),
          doctorId: z.string().optional(),
          contactVerified: z.boolean().optional().default(false),
          duplicateConfirmed: z.boolean().optional(),
        })
        .parse(body);
      const existing = await tenant(m).collection("patients").get();
      const possible = existing.docs.filter(
        (d) =>
          d.data().name.toLowerCase() === input.name.toLowerCase() ||
          (input.phone && d.data().phone === input.phone),
      );
      if (possible.length && !input.duplicateConfirmed)
        return NextResponse.json(
          {
            error:
              "Possible duplicate. Review existing registrations before creating a separate record.",
            matches: possible.map((d) => ({ id: d.id, name: d.data().name })),
          },
          { status: 409 },
        );
      const doctors = await db
        .collection("members")
        .where("tenantId", "==", m.tenantId)
        .where("role", "==", "doctor")
        .get();
      if (doctors.empty)
        throw new ApiError(
          "An authorized doctor must be added before registering an encounter.",
        );
      const id = tenant(m).collection("patients").doc().id;
      const assigned = input.doctorId
        ? await db.collection("members").doc(input.doctorId).get()
        : doctors.docs.find((d) => d.data().status !== "disabled");
      if (
        !assigned?.exists ||
        assigned.data()?.tenantId !== m.tenantId ||
        assigned.data()?.role !== "doctor" ||
        assigned.data()?.status === "disabled"
      )
        throw new ApiError(
          "Choose an active clinician in your organization.",
          409,
        );
      const encounterId = randomBytes(8).toString("hex");
      const p: Patient = {
        ...input,
        id,
        tenantId: m.tenantId,
        encounterId,
        doctorId: assigned.id,
        doctorName: assigned.data()?.displayName || "Assigned clinician",
        state: "waiting",
        registeredBy: m.uid,
        createdAt: new Date().toISOString(),
        invitationPermissionAt: input.invitationOptIn
          ? new Date().toISOString()
          : null,
        contactVerifiedAt: input.contactVerified
          ? new Date().toISOString()
          : null,
      };
      const patientBatch = db.batch();
      patientBatch.set(tenant(m).collection("patients").doc(id), p);
      patientBatch.set(tenant(m).collection("encounters").doc(encounterId), {
        id: encounterId,
        patientId: id,
        doctorId: assigned.id,
        type: "Consultation",
        state: "waiting",
        createdBy: m.uid,
        createdAt: p.createdAt,
      });
      await patientBatch.commit();
      await audit(m, "patient_registered_and_encounter_created", id);
      return NextResponse.json(p);
    }
    if (path[0] === "patients" && path[1] && path[2] === "visits" && post) {
      permitted(m, ["receptionist"]);
      const p = await patientAccess(m, path[1]);
      const input = z
        .object({
          doctorId: string,
          visitType: z.enum(["Consultation", "Follow-up", "Discharge"]),
        })
        .parse(body);
      const doctor = await db.collection("members").doc(input.doctorId).get();
      if (
        !doctor.exists ||
        doctor.data()?.tenantId !== m.tenantId ||
        doctor.data()?.role !== "doctor" ||
        doctor.data()?.status === "disabled"
      )
        throw new ApiError(
          "Choose an active clinician in your organization.",
          409,
        );
      const ref = tenant(m).collection("encounters").doc();
      const at = new Date().toISOString();
      const batch = db.batch();
      batch.set(ref, {
        id: ref.id,
        patientId: p.id,
        doctorId: input.doctorId,
        type: input.visitType,
        state: "waiting",
        createdBy: m.uid,
        createdAt: at,
      });
      batch.update(tenant(m).collection("patients").doc(p.id), {
        encounterId: ref.id,
        doctorId: input.doctorId,
        doctorName: doctor.data()?.displayName || "Assigned clinician",
        state: "waiting",
      });
      batch.set(tenant(m).collection("audit").doc(), {
        actor: m.uid,
        action: "encounter_created",
        patientId: p.id,
        encounterId: ref.id,
        at,
      });
      await batch.commit();
      return NextResponse.json({ id: ref.id });
    }
    if (path[0] === "drafts" && path[1]) {
      permitted(m, ["doctor"]);
      const patient = await patientAccess(m, path[1]);
      const ref = tenant(m)
        .collection("clinicalDrafts")
        .doc(`${m.uid}_${patient.encounterId}`);
      if (!post) {
        const draft = (await ref.get()).data();
        return NextResponse.json({
          fields: draft?.state === "converted" ? {} : draft?.fields || {},
          revision: draft?.revision || 0,
          encounterId: patient.encounterId,
        });
      }
      const input = z
        .object({
          revision: z.number().int().min(0),
          encounterId: string,
          fields: z.record(z.string().max(40), z.string().max(12000)),
        })
        .parse(body);
      if (input.encounterId !== patient.encounterId)
        throw new ApiError(
          "The visit changed. Refresh before continuing this draft.",
          409,
        );
      let revision = 0;
      await db.runTransaction(async (tx) => {
        const current = (await tx.get(ref)).data();
        const assigned = (
          await tx.get(tenant(m).collection("patients").doc(patient.id))
        ).data();
        if (
          assigned?.doctorId !== m.uid ||
          assigned?.encounterId !== input.encounterId
        )
          throw new ApiError(
            "Patient assignment or visit changed. Refresh before saving.",
            409,
          );
        if ((current?.revision || 0) !== input.revision)
          throw new ApiError(
            "This draft changed in another window. Reload it before saving more changes.",
            409,
          );
        revision = input.revision + 1;
        const at = new Date().toISOString();
        tx.set(ref, {
          patientId: patient.id,
          encounterId: patient.encounterId,
          doctorId: m.uid,
          revision,
          fields: input.fields,
          updatedAt: at,
        });
        tx.set(ref.collection("versions").doc(String(revision)), {
          revision,
          fields: input.fields,
          actor: m.uid,
          at,
        });
        tx.set(tenant(m).collection("audit").doc(), {
          actor: m.uid,
          action: "clinical_draft_saved",
          encounterId: patient.encounterId,
          revision,
          at,
        });
      });
      return NextResponse.json({ revision });
    }
    if (route === "reports" && post) {
      permitted(m, ["doctor"]);
      const input = z
        .object({
          patientId: string,
          notes: z.string().max(12000),
          medicine: medicineSchema,
          followUp: z.string().max(300),
          followUpDate: z.union([z.literal(""), z.iso.date()]),
          followUpTime: z.string().max(5),
        })
        .parse(body);
      const p = await patientAccess(m, input.patientId);
      const candidates: Candidate[] = [
        fromMedicine(input.medicine),
        ...(await extractNotes(input.notes)),
      ];
      if (input.followUp) {
        const valid =
          !!input.followUpDate &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(input.followUpTime);
        candidates.push({
          id: "follow-up",
          title: "Follow-up appointment",
          instruction: input.followUp,
          source: `${input.followUp} | ${input.followUpDate} ${input.followUpTime}`,
          times: valid ? [input.followUpTime] : [],
          start: input.followUpDate,
          end: input.followUpDate,
          type: "follow-up",
          status: valid ? "extracted" : "needs_clarification",
          issues: valid ? [] : ["Explicit appointment date and time required."],
        });
      }
      const ref = tenant(m).collection("reports").doc();
      const report: Report = {
        id: ref.id,
        tenantId: m.tenantId,
        patientId: p.id,
        encounterId: p.encounterId,
        doctorId: m.uid,
        notes: input.notes,
        version: 1,
        state: "awaiting_review",
        candidates,
      };
      await db.runTransaction(async (tx) => {
        const patientRef = tenant(m).collection("patients").doc(p.id);
        const current = await tx.get(patientRef);
        report.version = (current.data()?.latestVersion || 0) + 1;
        tx.update(patientRef, { latestVersion: report.version });
        tx.set(ref, report);
        tx.set(
          tenant(m)
            .collection("clinicalDrafts")
            .doc(`${m.uid}_${p.encounterId}`),
          { state: "converted", convertedToReport: ref.id },
          { merge: true },
        );
      });
      await audit(m, "report_created", ref.id);
      return NextResponse.json(report);
    }
    if (path[0] === "reports" && path[1]) {
      const ref = tenant(m).collection("reports").doc(path[1]);
      const snap = await ref.get();
      if (!snap.exists) throw new ApiError("Report not found.", 404);
      const report = snap.data() as Report;
      const p = await patientAccess(m, report.patientId);
      if (path[2] === "pdf" && !post) {
        permitted(m, ["doctor", "patient"]);
        if (report.state !== "published" && report.state !== "superseded")
          throw new ApiError("Only finalized reports can be downloaded.", 409);
        const pdf = await PDFDocument.create();
        let page = pdf.addPage([595, 842]);
        pdf.registerFontkit(fontkit);
        const font = await pdf.embedFont(
          await readFile(
            join(process.cwd(), "public", "fonts", "NotoSansDevanagari.ttf"),
          ),
          { subset: true },
        );
        const logo = await pdf.embedPng(
          await readFile(
            join(process.cwd(), "public", "brand", "WithYou_logo.png"),
          ),
        );
        page.drawImage(logo, { x: 50, y: 760, width: 75, height: 50 });
        let y = 730;
        const line = (value: string, size = 11) => {
          let rows: string[];
          try {
            rows = printableLines(value, font, size);
          } catch (error) {
            throw new ApiError((error as Error).message, 409);
          }
          for (const row of rows) {
            if (y < 55) {
              page = pdf.addPage([595, 842]);
              y = 790;
            }
            page.drawText(row, {
              x: 50,
              y,
              size,
              font,
              color: rgb(0.04, 0.2, 0.22),
            });
            y -= size + 7;
          }
          y -= 5;
        };
        line("WithYou | Clinical care report", 19);
        line(`Provider: ${(await tenant(m).get()).data()?.name || "WithYou"}`);
        line(`Record state: ${report.state}`);
        line(`Patient: ${p.name} | Age: ${p.age} | Local ID: ${p.id}`);
        line(`Encounter: ${report.encounterId}`);
        line(`Report: ${report.id} | Version ${report.version}`);
        line(
          `Approved by: ${report.approvedByName || "Clinician"} | Registration: ${report.approvedRegistration || "Not recorded"}`,
        );
        line(`Approval: ${report.approvedBy} | ${report.approvedAt}`);
        if (report.notes) {
          line("Original clinical notes", 15);
          line(report.notes);
        }
        line("Approved instructions", 15);
        for (const c of report.candidates.filter(
          (c) => c.status === "approved",
        )) {
          line(c.title, 13);
          line(c.instruction);
          line(`${c.start} to ${c.end} | ${c.times.join(", ")} Asia/Kolkata`);
          line(`Source: ${c.source}`);
        }
        line(
          "Verify the issuing clinician and report version. Contact your clinical team for clarification.",
        );
        const bytes = await pdf.save();
        await audit(m, "report_pdf_downloaded", report.id);
        return new NextResponse(Buffer.from(bytes), {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="withyou-${report.id}-v${report.version}.pdf"`,
            "Cache-Control": "no-store",
          },
        });
      }
      permitted(m, ["doctor"]);
      if (report.doctorId !== m.uid)
        throw new ApiError(
          "Only the assigned clinician can review this report.",
          403,
        );
      if (report.state === "published" || report.state === "superseded")
        throw new ApiError(
          "Finalized reports are immutable. Revisions require a new version.",
          409,
        );
      if (path[2] === "add-medicine" && post) {
        permitted(m, ["doctor"]);
        const medicine = medicineSchema.parse(body);
        const candidate = fromMedicine(
          medicine,
          `medicine-${randomBytes(8).toString("hex")}`,
        );
        await db.runTransaction(async (tx) => {
          const current = (await tx.get(ref)).data() as Report;
          if (
            current.state !== "awaiting_review" ||
            current.candidates.length >= 20
          )
            throw new ApiError(
              "This report cannot accept another instruction.",
              409,
            );
          tx.update(ref, { candidates: [...current.candidates, candidate] });
          tx.set(tenant(m).collection("audit").doc(), {
            actor: m.uid,
            action: "structured_medicine_added",
            reportId: report.id,
            candidateId: candidate.id,
            at: new Date().toISOString(),
          });
        });
        return NextResponse.json({ ok: true });
      }
      if (path[2] === "review" && post) {
        const input = z
          .object({
            id: string,
            action: z.enum(["verified", "rejected", "edit"]),
            medicine: medicineSchema.optional(),
          })
          .parse(body);
        let candidates: Candidate[] = [];
        await db.runTransaction(async (tx) => {
          const current = (await tx.get(ref)).data() as Report;
          if (current.state !== "awaiting_review")
            throw new ApiError("Finalized reports are locked.", 409);
          candidates = current.candidates.map((c) => {
            if (c.id !== input.id) return c;
            if (input.action === "edit") {
              if (!input.medicine || c.type !== "medication")
                throw new ApiError(
                  "Provide complete structured medication fields.",
                );
              return fromMedicine(input.medicine, c.id);
            }
            if (input.action === "verified" && c.issues.length)
              throw new ApiError(
                "Resolve missing fields in a new structured report or reject this item.",
              );
            return { ...c, status: input.action };
          });
          if (!candidates.some((c) => c.id === input.id))
            throw new ApiError("Candidate not found.", 404);
          tx.update(ref, { candidates });
          tx.set(tenant(m).collection("audit").doc(), {
            actor: m.uid,
            action: "candidate_" + input.action,
            reportId: report.id,
            candidateId: input.id,
            previousSource: current.candidates.find((c) => c.id === input.id)
              ?.source,
            newSource: candidates.find((c) => c.id === input.id)?.source,
            at: new Date().toISOString(),
          });
        });
        return NextResponse.json({ ...report, candidates });
      }
      if (path[2] === "publish" && post) {
        await db.runTransaction(async (tx) => {
          const fresh = (await tx.get(ref)).data() as Report;
          const patientRef = tenant(m).collection("patients").doc(p.id);
          const patientSnapshot = await tx.get(patientRef);
          const reviewer = (
            await tx.get(db.collection("members").doc(m.uid))
          ).data();
          if (
            !reviewer ||
            reviewer.role !== "doctor" ||
            reviewer.tenantId !== m.tenantId ||
            reviewer.status === "disabled" ||
            (cloudFirebase && reviewer.clinicalVerified !== true)
          )
            throw new ApiError(
              "Your organization must approve an active clinician profile before publication.",
              403,
            );
          if (
            patientSnapshot.data()?.doctorId !== m.uid ||
            patientSnapshot.data()?.encounterId !== fresh.encounterId
          )
            throw new ApiError(
              "Patient assignment or encounter changed. Refresh and review the current visit before publishing.",
              409,
            );
          const priorReports = await tx.get(
            tenant(m)
              .collection("reports")
              .where("patientId", "==", p.id)
              .where("state", "==", "published"),
          );
          const priorTasks = await tx.get(
            tenant(m)
              .collection("tasks")
              .where("patientId", "==", p.id)
              .where("completion", "==", "scheduled"),
          );
          if (fresh.state === "published" || fresh.state === "superseded")
            throw new ApiError("Report already published.", 409);
          if ((patientSnapshot.data()?.publishedVersion || 0) >= fresh.version)
            throw new ApiError(
              "A newer report is already approved. Review a new version instead.",
              409,
            );
          const issues = publicationIssues(fresh.candidates);
          if (issues.length) throw new ApiError(issues.join(" "), 409);
          const candidates = fresh.candidates.map((c) =>
            c.status === "verified" ? { ...c, status: "approved" as const } : c,
          );
          const at = new Date().toISOString();
          for (const old of priorReports.docs)
            tx.update(old.ref, { state: "superseded" });
          for (const old of priorTasks.docs)
            tx.update(old.ref, { completion: "superseded" });
          tx.update(ref, {
            candidates,
            state: "published",
            approvedBy: m.uid,
            approvedByName: reviewer.displayName || "Clinician",
            approvedRegistration: reviewer.registrationNumber || "Not recorded",
            approvedAt: at,
          });
          for (const c of candidates.filter((c) => c.status === "approved"))
            for (const date of occurrenceDates(c.start, c.end))
              for (const time of c.times) {
                // A separate occurrence is created per authorized time; no arbitrary timings are inferred.
                const id = `${report.id}-${c.id}-${date}-${time.replace(":", "")}`;
                tx.set(tenant(m).collection("tasks").doc(id), {
                  ...c,
                  id,
                  times: [time],
                  start: date,
                  end: date,
                  tenantId: m.tenantId,
                  patientId: p.id,
                  reportId: report.id,
                  version: report.version,
                  timezone: "Asia/Kolkata",
                  completion: "scheduled",
                });
              }
          tx.update(tenant(m).collection("patients").doc(p.id), {
            state: "plan_published",
            publishedVersion: fresh.version,
          });
          tx.set(tenant(m).collection("audit").doc(), {
            actor: m.uid,
            action: "clinician_approved_and_published",
            reportId: report.id,
            version: report.version,
            encounterId: p.encounterId,
            at,
          });
        });
        return NextResponse.json({ ok: true });
      }
    }
    if (route === "invitations" && post) {
      permitted(m, ["receptionist"]);
      const id = string.parse(body.patientId);
      const p = await patientAccess(m, id);
      if (!p.invitationOptIn)
        throw new ApiError(
          "Optional invitation permission has not been recorded.",
          409,
        );
      const reports = await tenant(m)
        .collection("reports")
        .where("patientId", "==", id)
        .where("state", "==", "published")
        .get();
      if (reports.empty)
        throw new ApiError(
          "Publish an approved report before creating an invitation.",
          409,
        );
      const token = randomBytes(32).toString("hex");
      const recipientEmail =
        (p as Patient & { email?: string }).email ||
        (p.accountUid ? (await auth.getUser(p.accountUid)).email : "");
      if (!recipientEmail)
        throw new ApiError(
          "Record the patient's verified contact email before inviting them.",
          409,
        );
      const ref = tenant(m).collection("invitations").doc(hash(token));
      if (
        !p.accountUid &&
        !(p as Patient & { contactVerified?: boolean }).contactVerified
      )
        throw new ApiError(
          "Confirm the intended recipient's email with the patient before creating an invitation.",
          409,
        );
      await ref.set({
        patientId: id,
        email: recipientEmail.toLowerCase(),
        tenantId: m.tenantId,
        status: "created",
        channel: "local_preview",
        tokenHash: hash(token),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });
      let deliveryStatus = "failed";
      try {
        deliveryStatus = (
          await sendTransactionalEmail(
            recipientEmail,
            "Your WithYou care invitation",
            `Your healthcare provider invited you to securely access your approved care information. Accept within 24 hours: ${process.env.APP_URL || "http://127.0.0.1:3000"}/join?tenant=${m.tenantId}&token=${token}&kind=patient`,
          )
        ).status;
      } catch {}
      await ref.update({ deliveryStatus });
      await audit(m, "invitation_preview_created", id);
      return NextResponse.json({
        token,
        tenantId: m.tenantId,
        status: "created",
        deliveryStatus,
        message:
          "Your healthcare provider has invited you to access your care information through WithYou. Open the secure invitation to get started.",
      });
    }
    if (path[0] === "invitations" && path[1] && path[2] === "revoke" && post) {
      permitted(m, ["receptionist"]);
      const ref = tenant(m).collection("invitations").doc(path[1]);
      await db.runTransaction(async (tx) => {
        const invitation = (await tx.get(ref)).data();
        if (!invitation || invitation.status !== "created")
          throw new ApiError("Only pending invitations can be revoked.", 409);
        tx.update(ref, {
          status: "revoked",
          revokedAt: new Date().toISOString(),
          revokedBy: m.uid,
        });
        tx.set(tenant(m).collection("audit").doc(), {
          actor: m.uid,
          action: "patient_invitation_revoked",
          patientId: invitation.patientId,
          at: new Date().toISOString(),
        });
      });
      return NextResponse.json({ ok: true });
    }
    if (route === "claim" && post) {
      permitted(m, ["patient"]);
      const input = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/), tenantId: string })
        .parse(body);
      const org = db.collection("organizations").doc(input.tenantId);
      const ref = org.collection("invitations").doc(hash(input.token));
      await db.runTransaction(async (tx) => {
        const invitation = await tx.get(ref);
        if (!invitation.exists)
          throw new ApiError("Invitation is invalid.", 404);
        const inv = invitation.data()!;
        if (
          inv.status !== "created" ||
          inv.expiresAt < new Date().toISOString()
        )
          throw new ApiError("Invitation is used, expired, or revoked.", 409);
        const patientRef = org.collection("patients").doc(inv.patientId);
        const p = await tx.get(patientRef);
        // Local demo verification is deliberately restricted to the pre-linked synthetic identity.
        if (p.data()?.accountUid !== m.uid)
          throw new ApiError(
            "This invitation belongs to a different verified patient account.",
            403,
          );
        tx.update(ref, {
          status: "claimed",
          claimedAt: new Date().toISOString(),
        });
        tx.set(db.collection("members").doc(m.uid), {
          tenantId: input.tenantId,
          role: "patient",
          patientId: inv.patientId,
        });
      });
      return NextResponse.json({ ok: true });
    }
    if (path[0] === "tasks" && path[1] && post) {
      permitted(m, ["patient"]);
      const completion = z
        .enum(["completed", "skipped", "scheduled"])
        .parse(body.completion);
      const ref = tenant(m).collection("tasks").doc(path[1]);
      await db.runTransaction(async (tx) => {
        const s = await tx.get(ref);
        if (!s.exists || s.data()?.patientId !== m.patientId)
          throw new ApiError("Task not found.", 404);
        if (s.data()?.completion === "superseded")
          throw new ApiError(
            "This instruction has been replaced. Refresh your care plan.",
            409,
          );
        const source = await tx.get(
          tenant(m).collection("reports").doc(s.data()!.reportId),
        );
        if (source.data()?.state !== "published")
          throw new ApiError(
            "This report has been replaced. Refresh your care plan.",
            409,
          );
        tx.update(ref, {
          completion,
          completedAt:
            completion === "completed" ? new Date().toISOString() : null,
        });
        tx.update(tenant(m).collection("patients").doc(m.patientId!), {
          activityRevision: FieldValue.increment(1),
        });
      });
      await audit(m, "task_self_reported_" + completion, path[1]);
      return NextResponse.json({ ok: true });
    }
    throw new ApiError("Endpoint not found.", 404);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        {
          error: error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    if (error instanceof ApiError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error(
      "API operation failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      {
        error:
          "The application service is temporarily unavailable. Please retry or contact your organization.",
      },
      { status: 503 },
    );
  }
}
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const result = await handler(req, params);
  result.headers.set("Cache-Control", "no-store");
  return result;
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handler(req, params);
}

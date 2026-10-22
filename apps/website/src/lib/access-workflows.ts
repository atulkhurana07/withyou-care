import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { auth, db, cloudFirebase } from "./firebase";
import { sendTransactionalEmail } from "./mail";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const text = z.string().trim().min(1).max(300);
const invitationInput = z.object({
  tenantId: text,
  token: z.string().regex(/^[a-f0-9]{64}$/),
  kind: z.enum(["staff", "patient"]),
});
function failure(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
function invitationRef(input: z.infer<typeof invitationInput>) {
  return db
    .collection("organizations")
    .doc(input.tenantId)
    .collection(input.kind === "staff" ? "staffInvitations" : "invitations")
    .doc(hash(input.token));
}
export async function sessionIdentity(req: NextRequest, verified = true) {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer /, "");
  const token = bearer || req.cookies.get("withyou-session")?.value;
  if (!token) throw new Error("Sign in to continue.");
  const decoded =
    cloudFirebase && !bearer
      ? await auth.verifySessionCookie(token, true)
      : await auth.verifyIdToken(token, cloudFirebase);
  if (verified && cloudFirebase && !decoded.email_verified)
    throw new Error("Verify your email before continuing.");
  return decoded;
}
export async function publicAccessWorkflow(
  req: NextRequest,
  route: string,
  body: unknown,
) {
  if (
    !["invitation-account", "invitation-accept", "password-reset"].includes(
      route,
    )
  )
    return null;
  if (req.method !== "POST") return failure("Use POST for this action.", 405);
  if (route === "password-reset") {
    const { email } = z.object({ email: z.email() }).parse(body);
    try {
      const link = await auth.generatePasswordResetLink(email);
      await sendTransactionalEmail(
        email,
        "Reset your WithYou password",
        `Reset your password using this secure link: ${link}`,
      );
    } catch {
      /* The same result prevents disclosing registered accounts. */
    }
    return NextResponse.json({
      ok: true,
      message:
        "If this account exists, password reset instructions are available through its configured email channel.",
    });
  }
  const input = invitationInput.parse(body);
  const ref = invitationRef(input);
  const snapshot = await ref.get();
  const invitation = snapshot.data();
  if (
    !invitation ||
    invitation.status !== "created" ||
    Date.parse(invitation.expiresAt) <= Date.now()
  )
    return failure("Invitation is invalid, expired, used or revoked.", 409);
  if (!invitation.email)
    return failure(
      "Your organization must verify the invitation recipient's email before account activation.",
      409,
    );
  if (route === "invitation-account") {
    const account = z
      .object({
        email: z.email(),
        name: text,
        password: z
          .string()
          .min(12)
          .max(128)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      })
      .parse(body);
    if (account.email.toLowerCase() !== invitation.email.toLowerCase())
      return failure("Use the email address your organization invited.", 403);
    let user;
    try {
      user = await auth.createUser({
        email: account.email,
        password: account.password,
        displayName: account.name,
      });
    } catch {
      return failure(
        "This account could not be created. If it already exists, sign in to accept the invitation.",
        409,
      );
    }
    let verificationStatus = "not_required";
    if (cloudFirebase) {
      try {
        const link = await auth.generateEmailVerificationLink(account.email);
        await sendTransactionalEmail(
          account.email,
          "Verify your WithYou account",
          `Verify your account before accepting your organization invitation: ${link}`,
        );
        verificationStatus = "submitted";
      } catch {
        verificationStatus = "delivery_failed";
      }
    }
    return NextResponse.json({
      created: true,
      emailVerificationRequired: cloudFirebase,
      verificationStatus,
    });
  }
  let identity;
  try {
    identity = await sessionIdentity(req);
  } catch {
    return failure("Sign in with your verified invited account.", 401);
  }
  if (identity.email?.toLowerCase() !== invitation.email.toLowerCase())
    return failure("This invitation belongs to another account.", 403);
  const org = db.collection("organizations").doc(input.tenantId);
  const membership = db.collection("members").doc(identity.uid);
  const acceptedRole = input.kind === "staff" ? invitation.role : "patient";
  if (!["doctor", "receptionist", "patient"].includes(acceptedRole))
    return failure("Invitation role is invalid.", 409);
  try {
    await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(ref)).data();
      const existing = (await tx.get(membership)).data();
      const organization = (await tx.get(org)).data();
      const patientRef =
        input.kind === "patient"
          ? org.collection("patients").doc(invitation.patientId)
          : null;
      const patient = patientRef ? (await tx.get(patientRef)).data() : null;
      if (
        !fresh ||
        fresh.status !== "created" ||
        Date.parse(fresh.expiresAt) <= Date.now() ||
        fresh.email !== invitation.email ||
        fresh.role !== invitation.role ||
        fresh.patientId !== invitation.patientId
      )
        throw new Error("Invitation is no longer available.");
      if (
        !organization ||
        !["active", "trial_active"].includes(organization.state)
      )
        throw new Error("This organization's workspace is unavailable.");
      if (
        existing &&
        (existing.tenantId !== input.tenantId ||
          existing.role !== acceptedRole ||
          (input.kind === "patient" &&
            existing.patientId !== invitation.patientId))
      )
        throw new Error(
          "This account already belongs to a different workspace or role. Contact the organization; accounts cannot be silently reassigned.",
        );
      if (
        input.kind === "patient" &&
        (!patient ||
          (patient.accountUid && patient.accountUid !== identity.uid))
      )
        throw new Error("Patient record is already linked or unavailable.");
      const at = new Date().toISOString();
      tx.set(membership, {
        tenantId: input.tenantId,
        role: acceptedRole,
        displayName: identity.name || invitation.name || "Team member",
        email: identity.email,
        status: "active",
        ...(input.kind === "patient"
          ? { patientId: invitation.patientId }
          : {}),
      });
      if (patientRef) tx.update(patientRef, { accountUid: identity.uid });
      tx.update(ref, {
        status: "claimed",
        claimedAt: at,
        claimedBy: identity.uid,
      });
      tx.set(org.collection("audit").doc(), {
        actor: identity.uid,
        action: `${input.kind}_invitation_accepted`,
        at,
      });
    });
  } catch (error) {
    return failure((error as Error).message, 409);
  }
  return NextResponse.json({ ok: true, role: acceptedRole });
}
export async function staffAccessWorkflow(
  route: string,
  post: boolean,
  body: any,
  member: { uid: string; tenantId: string; role: string },
) {
  if (!route.startsWith("team/")) return null;
  if (member.role !== "admin")
    return failure(
      "Only an organization administrator can manage team access.",
      403,
    );
  const org = db.collection("organizations").doc(member.tenantId);
  if (route === "team/invitations" && post) {
    const input = z
      .object({
        email: z.email().transform((e) => e.toLowerCase()),
        name: text,
        role: z.enum(["doctor", "receptionist"]),
      })
      .parse(body);
    const token = randomBytes(32).toString("hex");
    const ref = org.collection("staffInvitations").doc(hash(token));
    const expiresAt = new Date(Date.now() + 86400000).toISOString();
    await ref.set({
      ...input,
      status: "created",
      expiresAt,
      createdBy: member.uid,
      createdAt: new Date().toISOString(),
    });
    const link = `${process.env.APP_URL || "http://127.0.0.1:3000"}/join?tenant=${member.tenantId}&token=${token}&kind=staff`;
    let deliveryStatus = "failed";
    try {
      deliveryStatus = (
        await sendTransactionalEmail(
          input.email,
          "Join your WithYou team",
          `Your organization invited you as ${input.role}. Accept within 24 hours: ${link}`,
        )
      ).status;
    } catch {}
    await ref.update({ deliveryStatus });
    await org.collection("audit").add({
      actor: member.uid,
      action: "staff_invitation_created",
      invitationId: ref.id,
      role: input.role,
      at: new Date().toISOString(),
    });
    return NextResponse.json({
      id: ref.id,
      expiresAt,
      deliveryStatus,
      ...(!cloudFirebase ? { link } : {}),
    });
  }
  if (route === "team/revoke" && post) {
    const { id } = z.object({ id: text }).parse(body);
    const ref = org.collection("staffInvitations").doc(id);
    await db.runTransaction(async (tx) => {
      const invite = await tx.get(ref);
      if (!invite.exists || invite.data()?.status !== "created")
        throw new Error("Only pending invitations can be revoked.");
      tx.update(ref, { status: "revoked" });
      tx.set(org.collection("audit").doc(), {
        actor: member.uid,
        action: "staff_invitation_revoked",
        invitationId: id,
        at: new Date().toISOString(),
      });
    });
    return NextResponse.json({ ok: true });
  }
  if (route === "team/clinician-profile" && post) {
    const input = z
      .object({
        uid: text,
        fullName: text,
        registrationNumber: text,
        specialty: text,
        verificationReference: text,
        clinicalVerified: z.boolean(),
      })
      .parse(body);
    const ref = db.collection("members").doc(input.uid);
    try {
      await db.runTransaction(async (tx) => {
        const clinician = (await tx.get(ref)).data();
        if (
          !clinician ||
          clinician.tenantId !== member.tenantId ||
          clinician.role !== "doctor"
        )
          throw new Error("This clinician is not in your organization.");
        const at = new Date().toISOString();
        tx.update(ref, {
          displayName: input.fullName,
          registrationNumber: input.registrationNumber,
          specialty: input.specialty,
          clinicalVerified: input.clinicalVerified,
          verificationReference: input.verificationReference,
          verifiedBy: member.uid,
          verifiedAt: at,
        });
        tx.set(org.collection("audit").doc(), {
          actor: member.uid,
          action: "clinician_profile_reviewed",
          recordId: input.uid,
          clinicalVerified: input.clinicalVerified,
          at,
        });
      });
    } catch (error) {
      return failure((error as Error).message, 409);
    }
    return NextResponse.json({ ok: true });
  }
  if (route === "team/access" && post) {
    const input = z
      .object({ uid: text, status: z.enum(["active", "disabled"]) })
      .parse(body);
    if (input.uid === member.uid)
      return failure("You cannot disable your own administrator account.", 409);
    const ref = db.collection("members").doc(input.uid);
    await db.runTransaction(async (tx) => {
      const staff = (await tx.get(ref)).data();
      if (
        !staff ||
        staff.tenantId !== member.tenantId ||
        !["doctor", "receptionist"].includes(staff.role)
      )
        throw new Error("Staff member unavailable.");
      tx.update(ref, { status: input.status });
      tx.set(org.collection("audit").doc(), {
        actor: member.uid,
        action: `staff_access_${input.status}`,
        recordId: input.uid,
        at: new Date().toISOString(),
      });
    });
    if (input.status === "disabled") await auth.revokeRefreshTokens(input.uid);
    return NextResponse.json({ ok: true });
  }
  return failure("Team action not found.", 404);
}

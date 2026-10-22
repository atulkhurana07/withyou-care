import { auth, db } from "../apps/website/src/lib/firebase";
const tenantId = "demo-clinic";
const users = [
  {
    uid: "demo-admin",
    role: "admin",
    email: "admin@withyou.test",
    name: "Aarav Mehta",
  },
  {
    uid: "demo-receptionist",
    role: "receptionist",
    email: "reception@withyou.test",
    name: "Riya Shah",
  },
  {
    uid: "demo-doctor",
    role: "doctor",
    email: "doctor@withyou.test",
    name: "Dr. Sharma",
  },
  {
    uid: "demo-patient",
    role: "patient",
    email: "patient@withyou.test",
    name: "Kamla Devi",
  },
];
for (const u of users) {
  try {
    await auth.createUser({
      uid: u.uid,
      email: u.email,
      password: "WithYouDemo2026!",
      displayName: u.name,
    });
  } catch (e) {
    if (
      (e as { code: string }).code !== "auth/uid-already-exists" &&
      (e as { code: string }).code !== "auth/email-already-exists"
    )
      throw e;
  }
  await db
    .collection("members")
    .doc(u.uid)
    .set({
      tenantId,
      role: u.role,
      ...(u.role === "patient" ? { patientId: "kamla-devi" } : {}),
    });
}
const org = db.collection("organizations").doc(tenantId);
await org.set({
  id: tenantId,
  name: "WithYou Demo Clinic",
  state: "trial_active",
  configured: true,
  department: "General medicine",
  timezone: "Asia/Kolkata",
  environment: "synthetic_demo",
});
if (!(await org.collection("patients").doc("kamla-devi").get()).exists)
  await org.collection("patients").doc("kamla-devi").set({
    id: "kamla-devi",
    tenantId,
    name: "Kamla Devi",
    age: 62,
    phone: "+919000000001",
    language: "English",
    invitationOptIn: true,
    encounterId: "DEMO-ENC-001",
    doctorId: "demo-doctor",
    state: "waiting",
    accountUid: "demo-patient",
  });
console.log(
  "Seeded synthetic clinic, patient, and four role accounts. No real messages or payments.",
);

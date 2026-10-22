import { test, expect } from "@playwright/test";
import { demoStart, demoEnd } from "./dates";
const headers = { origin: "http://127.0.0.1:3000" };
test("a new organization provisions its team and connects a new patient without shared identities", async ({
  request,
}) => {
  const suffix = Date.now();
  const password = "ConnectedCare2026!";
  const owner = `owner-flow-${suffix}@withyou.test`,
    doctor = `doctor-flow-${suffix}@withyou.test`,
    reception = `reception-flow-${suffix}@withyou.test`,
    patient = `patient-flow-${suffix}@withyou.test`;
  async function post(path: string, data: unknown, status = 200) {
    const response = await request.post(`/api/${path}`, { data, headers });
    expect(response.status(), await response.text()).toBe(status);
    return response.json();
  }
  async function login(email: string) {
    await post("session", { email, password });
  }
  const org = await post("register", {
    name: "Connected Care Integration",
    email: owner,
    contact: "Owner",
    phone: "+919876543210",
    category: "Clinic",
    address: "Integration Street",
    plan: "Clinic",
    password,
    acceptedTerms: true,
  });
  await login(owner);
  await post("checkout/activate", {
    paymentToken: "visa-success",
    idempotencyKey: crypto.randomUUID(),
  });
  async function invite(email: string, role: string) {
    await login(owner);
    const result = await post("team/invitations", { email, name: role, role });
    const url = new URL(result.link);
    return {
      tenantId: org.id,
      token: url.searchParams.get("token"),
      kind: "staff",
    };
  }
  const doctorInvite = await invite(doctor, "doctor");
  await post(
    "invitation-account",
    { ...doctorInvite, email: patient, name: "Wrong person", password },
    403,
  );
  await post("invitation-account", {
    ...doctorInvite,
    email: doctor,
    name: "Doctor Integration",
    password,
  });
  await login(doctor);
  await post("invitation-accept", doctorInvite);
  await post("invitation-accept", doctorInvite, 409);
  const doctorWorkspace = await (await request.get("/api/workspace")).json();
  const doctorId = doctorWorkspace.member.uid;
  await post(
    "team/invitations",
    { email: patient, name: "Unauthorized", role: "doctor" },
    403,
  );
  await login(owner);
  await post("team/clinician-profile",{uid:doctorId,fullName:"Doctor Integration",registrationNumber:"TEST-REG-2026",specialty:"General medicine",verificationReference:"Synthetic integration verification fixture",clinicalVerified:true});
  const receptionistInvite = await invite(reception, "receptionist");
  await post("invitation-account", {
    ...receptionistInvite,
    email: reception,
    name: "Reception Integration",
    password,
  });
  await login(reception);
  await post("invitation-accept", receptionistInvite);
  const p = await post("patients", {
    name: "New Connected Patient",
    age: 52,
    phone: "",
    email: patient,
    language: "English",
    invitationOptIn: true,
    contactVerified: true,
    doctorId,
  });
  await post("invitations", { patientId: p.id }, 409);
  await login(doctor);
  const draft = await (await request.get(`/api/drafts/${p.id}`)).json();
  await post(`drafts/${p.id}`, {
    revision: 0,
    encounterId: p.encounterId,
    fields: { notes: "Fictional draft note" },
  });
  await post(
    `drafts/${p.id}`,
    {
      revision: 0,
      encounterId: p.encounterId,
      fields: { notes: "Conflicting edit" },
    },
    409,
  );
  expect(
    (await (await request.get(`/api/drafts/${p.id}`)).json()).fields.notes,
  ).toBe("Fictional draft note");
  const report = await post("reports", {
    patientId: p.id,
    notes: "",
    medicine: {
      name: "Examplemed",
      strength: "10mg",
      dose: "1tablet",
      route: "oral",
      frequency: "twice daily",
      times: "08:00, 20:00",
      start: demoStart,
      end: demoEnd,
      food: "",
    },
    followUp: "",
    followUpDate: "",
    followUpTime: "",
  });
  await post(`reports/${report.id}/add-medicine`, {
    name: "ExamplemedTwo",
    strength: "5mg",
    dose: "1tablet",
    route: "oral",
    frequency: "once daily",
    times: "12:00",
    start: demoStart,
    end: demoEnd,
    food: "",
  });
  await post(`reports/${report.id}/review`, {
    id: report.candidates[0].id,
    action: "verified",
  });
  await post(`reports/${report.id}/publish`, {}, 409);
  const reviewed = await (await request.get("/api/workspace")).json();
  const secondMedicine = reviewed.reports
    .find((r: any) => r.id === report.id)
    .candidates.find((c: any) => c.title === "ExamplemedTwo");
  await post(`reports/${report.id}/review`, {
    id: secondMedicine.id,
    action: "verified",
  });
  await post(`reports/${report.id}/publish`, {});
  await login(reception);
  const invitation = await post("invitations", { patientId: p.id });
  const patientInvite = {
    tenantId: org.id,
    token: invitation.token,
    kind: "patient",
  };
  await post("invitation-account", {
    ...patientInvite,
    email: patient,
    name: "Connected Patient",
    password,
  });
  await login(patient);
  expect((await request.get("/api/workspace")).status()).toBe(403);
  await post("invitation-accept", patientInvite);
  const care = await (await request.get("/api/workspace")).json();
  expect(care.patients[0].id).toBe(p.id);
  expect(care.tasks).toHaveLength(9);
  expect((await request.get(`/api/drafts/${p.id}`)).status()).toBe(403);
  expect(care.team).toEqual([]);
  expect((await request.get(`/api/reports/${report.id}/pdf`)).status()).toBe(
    200,
  );
  await post(`tasks/${care.tasks[0].id}`, { completion: "completed" });
  await login(reception);
  const nextVisit = await post(`patients/${p.id}/visits`, {
    doctorId,
    visitType: "Follow-up",
  });
  expect(nextVisit.id).not.toBe(p.encounterId);
  await login(doctor);
  expect(
    (await (await request.get(`/api/drafts/${p.id}`)).json()).revision,
  ).toBe(0);
  await post(
    `drafts/${p.id}`,
    {
      revision: 1,
      encounterId: p.encounterId,
      fields: { notes: "Old visit edit" },
    },
    409,
  );
  await login(owner);
  await post("team/access", { uid: doctorId, status: "disabled" });
  await login(doctor);
  expect((await request.get("/api/workspace")).status()).toBe(403);
  await login(owner);
  await post("team/access", { uid: doctorId, status: "active" });
  const revoked = await post("team/invitations", {
    email: `revoked-${suffix}@withyou.test`,
    name: "Revoked",
    role: "doctor",
  });
  await post("team/revoke", { id: revoked.id });
  const revokedUrl = new URL(revoked.link);
  await post(
    "invitation-account",
    {
      tenantId: org.id,
      token: revokedUrl.searchParams.get("token"),
      kind: "staff",
      email: `revoked-${suffix}@withyou.test`,
      name: "Revoked",
      password,
    },
    409,
  );
});

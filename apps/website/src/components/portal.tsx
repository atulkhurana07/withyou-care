"use client";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Send,
  Settings,
  LogOut,
  Plus,
  Search,
  CalendarDays,
  Check,
  ArrowLeft,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/client";
import { Badge, Brand, ButtonLink } from "./ui";
import { Field, SetupForm } from "./forms";
import { TeamPanel } from "./team";
import { IntakePanel } from "./intake";
import type {
  Candidate,
  Patient,
  Report,
  Role,
} from "../../../../packages/shared-types";
type Workspace = {
  member: { role: Role; uid: string; tenantId: string; displayName?: string };
  organization: { name: string; state: string };
  patients: Patient[];
  reports: Report[];
  invitations: {
    id: string;
    patientId: string;
    status: string;
    expiresAt: string;
    deliveryStatus?: string;
  }[];
  team: any[];
  staffInvitations: any[];
  doctors: { uid: string; name: string }[];
};
const navItems = [
  {
    path: "/portal/requests",
    label: "Prescription requests",
    icon: CalendarDays,
    roles: ["doctor", "receptionist"],
  },
  { path: "/portal/team", label: "Team access", icon: Users, roles: ["admin"] },
  {
    path: "/portal",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["doctor", "receptionist", "admin"],
  },
  {
    path: "/portal/patients",
    label: "Patients",
    icon: Users,
    roles: ["doctor", "receptionist"],
  },
  {
    path: "/portal/reports",
    label: "Medical reports",
    icon: FileText,
    roles: ["doctor", "receptionist"],
  },
  {
    path: "/portal/reviews",
    label: "Review queue",
    icon: ShieldCheck,
    roles: ["doctor"],
  },
  {
    path: "/portal/communications",
    label: "Communications",
    icon: Send,
    roles: ["receptionist"],
  },
  {
    path: "/portal/settings",
    label: "Settings",
    icon: Settings,
    roles: ["admin"],
  },
];
export default function Portal() {
  const path = usePathname();
  const router = useRouter();
  const [w, setW] = useState<Workspace | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [invitation, setInvitation] = useState<any>(null);
  const [message, setMessage] = useState("");
  async function load() {
    try {
      const data = await api<Workspace>("workspace");
      if (data.member.role === "patient") {
        router.replace("/care");
        return;
      }
      if (data.organization.state === "pending_checkout") {
        router.replace("/start");
        return;
      }
      setW(data);
      setError("");
    } catch (err) {
      if (err instanceof ApiClientError && [401, 403].includes(err.status))
        setW(null);
      setError((err as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, [path]);
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!w)
    return (
      <main id="main" className="page-shell">
        <Brand />
        {error ? (
          <>
            <div role="alert" className="alert error">
              {error}
            </div>
            <ButtonLink href="/sign-in">Sign in</ButtonLink>
            <button
              className="button button-secondary"
              onClick={load}
              style={{ marginLeft: 15 }}
            >
              Retry
            </button>
          </>
        ) : (
          <>
            <p style={{ marginTop: 30 }}>Loading your authorized workspace…</p>
            <div className="skeleton" />
          </>
        )}
      </main>
    );
  const role = w.member.role;
  const parts = path.split("/").filter(Boolean);
  const section = parts[1] || "overview";
  const id = parts[2];
  const report = w.reports.find((r) => r.id === id);
  const patient = w.patients.find((p) => p.id === id);
  const patientForReport = report
    ? w.patients.find((p) => p.id === report.patientId)
    : undefined;
  const patients = w.patients.filter((p) =>
    `${p.name} ${p.id} ${p.phone}`.toLowerCase().includes(query.toLowerCase()),
  );
  const allowed =
    navItems
      .find((n) => n.path === `/portal/${section}`)
      ?.roles.includes(role) ?? section === "overview";
  const heading =
    section === "overview"
      ? role === "doctor"
        ? "Your day, at a glance."
        : role === "receptionist"
          ? "A warm welcome starts here."
          : "Your organization, connected."
      : section === "patients"
        ? id === "new"
          ? "Register a patient."
          : patient
            ? patient.name
            : "Patients."
        : section === "reviews"
          ? "A thoughtful review."
          : section === "reports"
            ? report
              ? "From report to care plan."
              : "Medical reports."
            : section === "communications"
              ? "Keep the connection going."
              : section === "team"
                ? "Your care team."
                : section === "requests"
                  ? "Prescription requests & appointments."
                  : "Workspace settings.";
  return (
    <div className="portal-layout">
      <aside className="portal-sidebar">
        <Brand />
        <nav aria-label="Workspace navigation">
          {navItems
            .filter((n) => n.roles.includes(role))
            .map((n) => (
              <Link
                className={
                  path === n.path ||
                  (n.path !== "/portal" && path.startsWith(n.path))
                    ? "active"
                    : ""
                }
                href={n.path}
                key={n.path}
              >
                <n.icon size={17} />
                {n.label}
              </Link>
            ))}
        </nav>
        <div className="sidebar-foot">
          <ShieldCheck size={18} />
          <p style={{ marginTop: 12 }}>
            {w.organization.name}
            <br />
            Authorized team access
          </p>
          <Link className="text-link" href="/">
            Visit website
          </Link>
        </div>
      </aside>
      <div className="portal-content">
        <header className="portal-top">
          <span>
            {w.organization.name}
            <span style={{ marginLeft: 10 }}>
              <Badge>
                {w.organization.state === "active" ? "Active" : "Trial"}
              </Badge>
            </span>
          </span>
          <div className="row">
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => action(async () => {})}
            >
              Refresh workspace
            </button>
            <span>
              {w.member.displayName ||
                (role === "admin" ? "Administrator" : "Team member")}{" "}
              · {role}
            </span>
            <button
              className="button button-secondary"
              aria-label="Sign out"
              style={{ padding: 9, minHeight: 38 }}
              onClick={async () => {
                await api("sign-out", {});
                router.push("/sign-in");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main id="main" className="portal-main">
          <div className="page-title">
            <span className="eyebrow">
              WITHYOU ENTERPRISE · {role.toUpperCase()}
            </span>
            <h1>{heading}</h1>
            <p>
              {role === "doctor"
                ? "Document clearly. Review thoughtfully. Publish only what you approve."
                : role === "receptionist"
                  ? "Register patients, route encounters and share approved reports."
                  : "Configure your organization and keep your team connected."}
            </p>
          </div>
          {error && (
            <div role="alert" className="alert error">
              {error}
            </div>
          )}
          {message && (
            <div role="status" className="alert success">
              {message}
            </div>
          )}
          {!allowed ? (
            <div className="panel empty-state">
              <ShieldCheck />
              <h3>This view isn’t available to your role.</h3>
              <p>Choose an authorized workspace action from the navigation.</p>
              <ButtonLink href="/portal">Return to overview</ButtonLink>
            </div>
          ) : role === "admin" ? (
            section === "team" ? (
              <TeamPanel
                team={w.team || []}
                invitations={w.staffInvitations || []}
                onChanged={load}
              />
            ) : section === "settings" ? (
              <SetupForm
                onComplete={() => setMessage("Workspace preferences saved.")}
              />
            ) : (
              <div className="panel">
                <h2 style={{ fontSize: 27 }}>Your workspace is active.</h2>
                <p style={{ marginTop: 20 }}>
                  Organization administration is separate from clinical access.
                  Clinical work requires an authorized receptionist or doctor
                  account.
                </p>
                <div className="form-actions">
                  <ButtonLink href="/portal/settings">
                    Configure workspace
                  </ButtonLink>
                  <ButtonLink href="/portal/team">
                    Manage team access
                  </ButtonLink>
                  <ButtonLink href="/sign-in" secondary>
                    Sign in with another account
                  </ButtonLink>
                </div>
              </div>
            )
          ) : section === "requests" ? (
            <IntakePanel role={role} />
          ) : section === "patients" && id === "new" ? (
            role === "receptionist" ? (
              <PatientForm
                doctors={w.doctors || []}
                busy={busy}
                onSave={(data) =>
                  action(async () => {
                    const p = await api("patients", data);
                    router.push(`/portal/patients/${p.id}`);
                  })
                }
              />
            ) : (
              <div className="alert">
                Patient registration requires a receptionist account.
              </div>
            )
          ) : patient ? (
            <div className="split-panels">
              <section className="panel">
                <div className="row">
                  <span className="avatar mint">
                    {patient.name
                      .split(" ")
                      .map((s) => s[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <Badge>{patient.state.replaceAll("_", " ")}</Badge>
                </div>
                <h2 style={{ fontSize: 28, marginTop: 24 }}>{patient.name}</h2>
                <p style={{ marginTop: 12 }}>
                  Age {patient.age} · {patient.language}
                </p>
                <p className="tiny">
                  Patient ID: {patient.id}
                  <br />
                  Encounter: {patient.encounterId}
                  <br />
                  Contact: {patient.phone || "Not provided"}
                  <br />
                  Assigned clinician:{" "}
                  {patient.doctorName || "Assigned clinician"}
                </p>
                <div className="form-actions">
                  {role === "doctor" ? (
                    <ButtonLink
                      href={`/portal/reports/new?patient=${patient.id}`}
                    >
                      Create medical report
                    </ButtonLink>
                  ) : (
                    <button
                      className="button"
                      disabled={busy || patient.state !== "plan_published"}
                      onClick={() =>
                        action(async () => {
                          setInvitation(
                            await api("invitations", { patientId: patient.id }),
                          );
                        })
                      }
                    >
                      Create invitation preview
                    </button>
                  )}
                </div>
                <p className="tiny" style={{ marginTop: 18 }}>
                  Invitation preference:{" "}
                  {patient.invitationOptIn ? "Opted in" : "Not requested"}.
                  Patient accounts are never linked by matching names or phone
                  numbers.
                </p>
                {role === "receptionist" && (
                  <form
                    style={{ marginTop: 24 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const values = Object.fromEntries(
                        new FormData(e.currentTarget),
                      );
                      action(async () => {
                        await api(`patients/${patient.id}/visits`, values);
                        setMessage(
                          "New encounter created. Your earlier approved plan remains available until the clinician publishes its replacement.",
                        );
                      });
                    }}
                  >
                    <h3>Create a new visit</h3>
                    <div className="form-grid">
                      <label className="field">
                        Visit clinician
                        <select
                          name="doctorId"
                          defaultValue={patient.doctorId}
                          required
                        >
                          {w.doctors.map((d) => (
                            <option key={d.uid} value={d.uid}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="field">
                        Visit category
                        <select name="visitType">
                          <option>Consultation</option>
                          <option>Follow-up</option>
                          <option>Discharge</option>
                        </select>
                      </label>
                    </div>
                    <button
                      className="button button-secondary"
                      disabled={busy}
                      style={{ marginTop: 16 }}
                    >
                      Create visit
                    </button>
                  </form>
                )}
              </section>
              <section className="panel">
                <p className="section-label">Encounter reports</p>
                {w.reports
                  .filter((r) => r.patientId === patient.id)
                  .map((r) => (
                    <div className="candidate-card" key={r.id}>
                      <Badge
                        tone={r.state === "published" ? "success" : "warning"}
                      >
                        {r.state.replaceAll("_", " ")}
                      </Badge>
                      <p className="tiny" style={{ marginTop: 12 }}>
                        Version {r.version} · {r.id}
                      </p>
                      {role === "doctor" && (
                        <ButtonLink secondary href={`/portal/reports/${r.id}`}>
                          Open report
                        </ButtonLink>
                      )}
                    </div>
                  ))}
                {!w.reports.some((r) => r.patientId === patient.id) && (
                  <p>No reports yet. The visit is ready for Dr. Sharma.</p>
                )}
              </section>
            </div>
          ) : section === "reports" && id === "new" ? (
            <ReportForm
              patients={w.patients}
              busy={busy}
              onSave={(data) =>
                action(async () => {
                  const r = await api("reports", data);
                  router.push(`/portal/reports/${r.id}`);
                })
              }
            />
          ) : report ? (
            role === "doctor" ? (
              <>
                <div className="row" style={{ marginBottom: 24 }}>
                  <span>
                    {patientForReport?.name} · Report version {report.version}
                  </span>
                  <Badge
                    tone={report.state === "published" ? "success" : "warning"}
                  >
                    {report.state === "published"
                      ? "Clinician approved"
                      : "Awaiting review"}
                  </Badge>
                </div>
                <div className="split-panels">
                  <section className="panel">
                    <p className="section-label">Original report · Source</p>
                    <p>
                      Patient: {patientForReport?.name}
                      <br />
                      Encounter: {report.encounterId}
                    </p>
                    {report.notes && (
                      <div className="source-text">{report.notes}</div>
                    )}
                    {report.candidates.map((c) => (
                      <div key={c.id} style={{ marginTop: 20 }}>
                        <h3 style={{ fontSize: 18, marginBottom: 10 }}>
                          {c.title}
                        </h3>
                        <div className="source-text">{c.source}</div>
                      </div>
                    ))}
                    <div className="alert">
                      Structured fields generate proposed tasks directly.
                      Automated extraction requires approved data processing;
                      unsupported notes stay in clarification. Every instruction
                      requires clinician review.
                    </div>
                  </section>
                  <section className="panel">
                    <p className="section-label">
                      Patient tasks · Clinical review
                    </p>
                    {report.state === "awaiting_review" && (
                      <InstructionEditor
                        candidate={{
                          id: "additional-medicine",
                          title: "",
                          instruction: "",
                          source: "{}",
                          times: [],
                          start: "",
                          end: "",
                          type: "medication",
                          status: "extracted",
                          issues: [],
                        }}
                        busy={busy}
                        label="Add another medicine"
                        onSave={(medicine) =>
                          action(async () => {
                            await api(
                              `reports/${report.id}/add-medicine`,
                              medicine,
                            );
                            setMessage(
                              "Medicine added. Verify it before publishing.",
                            );
                          })
                        }
                      />
                    )}
                    {report.candidates.map((c) => (
                      <div className="candidate-card" key={c.id}>
                        <Badge
                          tone={
                            ["approved", "verified"].includes(c.status)
                              ? "success"
                              : c.status === "rejected"
                                ? "neutral"
                                : "warning"
                          }
                        >
                          {c.status.replaceAll("_", " ")}
                        </Badge>
                        <h3>{c.title}</h3>
                        <p>{c.instruction}</p>
                        <p className="tiny">
                          {c.start || "Date missing"} →{" "}
                          {c.end || "Date missing"}
                          <br />
                          {c.times.length
                            ? c.times.join(", ") + " · Asia/Kolkata"
                            : "Reminder times missing"}
                        </p>
                        {c.issues.map((issue) => (
                          <div className="alert" key={issue}>
                            {issue}
                          </div>
                        ))}
                        {!["published", "superseded"].includes(
                          report.state,
                        ) && (
                          <div className="candidate-actions">
                            <button
                              className="button"
                              disabled={
                                busy ||
                                !!c.issues.length ||
                                c.status === "verified"
                              }
                              onClick={() =>
                                action(async () => {
                                  await api(`reports/${report.id}/review`, {
                                    id: c.id,
                                    action: "verified",
                                  });
                                })
                              }
                            >
                              <Check size={14} />
                              Verify
                            </button>
                            <button
                              className="button button-secondary"
                              disabled={busy || c.status === "rejected"}
                              onClick={() =>
                                action(async () => {
                                  await api(`reports/${report.id}/review`, {
                                    id: c.id,
                                    action: "rejected",
                                  });
                                })
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {!["published", "superseded"].includes(report.state) &&
                          c.type === "medication" && (
                            <InstructionEditor
                              candidate={c}
                              busy={busy}
                              onSave={(medicine) =>
                                action(async () => {
                                  await api(`reports/${report.id}/review`, {
                                    id: c.id,
                                    action: "edit",
                                    medicine,
                                  });
                                  setMessage(
                                    "Instruction corrected. Review and verify the updated candidate.",
                                  );
                                })
                              }
                            />
                          )}
                      </div>
                    ))}
                    {["published", "superseded"].includes(report.state) ? (
                      <>
                        <div className="alert success">
                          Approved by{" "}
                          {report.approvedByName || report.approvedBy} on{" "}
                          {new Date(report.approvedAt!).toLocaleString(
                            "en-IN",
                            { timeZone: "Asia/Kolkata" },
                          )}
                          . Published instructions are locked.
                          {report.state === "superseded"
                            ? " This version has been replaced."
                            : ""}
                        </div>
                        <a
                          className="button"
                          href={`/api/reports/${report.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View / print finalized PDF
                          <FileText size={16} />
                        </a>
                      </>
                    ) : (
                      <>
                        <button
                          className="button"
                          style={{ width: "100%" }}
                          disabled={
                            busy ||
                            !report.candidates.some(
                              (c) => c.status === "verified",
                            ) ||
                            report.candidates.some(
                              (c) =>
                                !["verified", "rejected"].includes(c.status),
                            )
                          }
                          onClick={() =>
                            action(async () => {
                              await api(`reports/${report.id}/publish`, {});
                              setMessage(
                                "Approved plan published. Patient tasks are now available.",
                              );
                            })
                          }
                        >
                          <ShieldCheck size={18} />
                          Approve & publish
                        </button>
                        <p className="tiny" style={{ marginTop: 16 }}>
                          Verify or reject every item. Missing clinical details
                          block approval. Edit an instruction to correct its
                          structured fields before verification.
                        </p>
                      </>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <div className="alert">
                Clinical report content is restricted to the assigned doctor.
              </div>
            )
          ) : section === "communications" ? (
            <section className="panel">
              <h2 style={{ fontSize: 25, marginBottom: 20 }}>
                Invitation history
              </h2>
              <div className="alert">
                Channel status is tracked separately from invitation acceptance.
                A provider submission or local preview does not establish inbox
                delivery.
              </div>
              {w.invitations.length ? (
                w.invitations.map((i) => (
                  <div className="candidate-card" key={i.id}>
                    <div className="row">
                      <strong>
                        {w.patients.find((p) => p.id === i.patientId)?.name}
                      </strong>
                      <Badge>{i.status}</Badge>
                    </div>
                    <p className="tiny" style={{ marginTop: 12 }}>
                      Expires:{" "}
                      {new Date(i.expiresAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </p>
                    <p className="tiny">
                      Email:{" "}
                      {i.deliveryStatus === "preview_available"
                        ? "Preview available"
                        : i.deliveryStatus === "submitted"
                          ? "Submitted to provider"
                          : "Delivery needs attention"}
                    </p>
                    {i.status === "created" && (
                      <button
                        className="button button-secondary"
                        disabled={busy}
                        onClick={() =>
                          action(async () => {
                            await api(`invitations/${i.id}/revoke`, {});
                            setMessage(
                              "Invitation revoked. Its link can no longer be accepted.",
                            );
                          })
                        }
                      >
                        Revoke invitation
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <Send />
                  <h3>No invitations yet.</h3>
                  <p>
                    Open a patient with a published plan to create a preview.
                  </p>
                  <ButtonLink href="/portal/patients">View patients</ButtonLink>
                </div>
              )}
            </section>
          ) : section === "reviews" || section === "reports" ? (
            <section className="panel">
              <div className="row">
                <h2 style={{ fontSize: 24 }}>
                  {section === "reviews"
                    ? "Ready for your review"
                    : "Report history"}
                </h2>
                {role === "doctor" && (
                  <ButtonLink href="/portal/reports/new">New report</ButtonLink>
                )}
              </div>
              {w.reports
                .filter(
                  (r) => section !== "reviews" || r.state === "awaiting_review",
                )
                .map((r) => (
                  <div
                    className="candidate-card"
                    key={r.id}
                    style={{ marginTop: 22 }}
                  >
                    <div className="row">
                      <div>
                        <h3>
                          {w.patients.find((p) => p.id === r.patientId)?.name}
                        </h3>
                        <p className="tiny">
                          Report {r.id} · Version {r.version}
                        </p>
                      </div>
                      <Badge
                        tone={r.state === "published" ? "success" : "warning"}
                      >
                        {r.state.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    {role === "doctor" && (
                      <Link
                        className="text-link"
                        href={`/portal/reports/${r.id}`}
                      >
                        Open report →
                      </Link>
                    )}
                  </div>
                ))}
              {!w.reports.filter(
                (r) => section !== "reviews" || r.state === "awaiting_review",
              ).length && (
                <div className="empty-state">
                  <FileText />
                  <h3>
                    {section === "reviews"
                      ? "No pending reviews."
                      : "A clear record starts here."}
                  </h3>
                  <p>
                    {section === "reviews"
                      ? "New clinical reports will appear here."
                      : "Create a report for an assigned encounter."}
                  </p>
                </div>
              )}
            </section>
          ) : (
            <>
              {section === "overview" && (
                <div className="metric-grid">
                  <div className="panel">
                    <span>Assigned patients</span>
                    <strong>{w.patients.length}</strong>
                  </div>
                  <div className="panel">
                    <span>Awaiting review</span>
                    <strong>
                      {
                        w.reports.filter((r) => r.state === "awaiting_review")
                          .length
                      }
                    </strong>
                  </div>
                  <div className="panel">
                    <span>Published reports</span>
                    <strong>
                      {w.reports.filter((r) => r.state === "published").length}
                    </strong>
                  </div>
                </div>
              )}
              <section className="panel">
                <div className="row" style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 24 }}>
                    {section === "overview"
                      ? "Your patient queue"
                      : "Patient registrations"}
                  </h2>
                  {role === "receptionist" && (
                    <ButtonLink href="/portal/patients/new">
                      Add patient
                    </ButtonLink>
                  )}
                </div>
                <label
                  className="field"
                  style={{ maxWidth: 400, marginBottom: 20 }}
                >
                  Search patient registrations
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Name, local ID or phone"
                  />
                </label>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Encounter</th>
                        <th>State</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>{p.name}</strong>
                            <p>
                              {p.age} years · {p.language}
                            </p>
                          </td>
                          <td>
                            <span className="tiny">{p.encounterId}</span>
                          </td>
                          <td>
                            <Badge
                              tone={
                                p.state === "plan_published"
                                  ? "success"
                                  : "neutral"
                              }
                            >
                              {p.state.replaceAll("_", " ")}
                            </Badge>
                          </td>
                          <td>
                            <Link
                              className="text-link"
                              href={`/portal/patients/${p.id}`}
                            >
                              Open patient →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!patients.length && (
                  <div className="empty-state">
                    <Users />
                    <h3>No patients found.</h3>
                    <p>Try another search or register a new patient.</p>
                  </div>
                )}
              </section>
            </>
          )}
          {invitation && (
            <section className="panel" style={{ marginTop: 24 }}>
              <p className="section-label">Secure invitation</p>
              <p>{invitation.message}</p>
              <Badge>
                {invitation.deliveryStatus === "submitted"
                  ? "Submitted to email provider"
                  : invitation.deliveryStatus === "preview_available"
                    ? "Email preview available"
                    : "Created · Delivery needs attention"}
              </Badge>
              <p className="tiny" style={{ marginTop: 16 }}>
                Single-use token · expires in 24 hours · No clinical data in the
                message.
              </p>
              <div className="source-text">{`${window.location.origin}/join?token=${invitation.token}&tenant=${invitation.tenantId}&kind=patient`}</div>
              <div className="form-actions">
                <button
                  className="button button-secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/join?token=${invitation.token}&tenant=${invitation.tenantId}&kind=patient`,
                    );
                    setMessage("Invitation link copied.");
                  }}
                >
                  Copy invitation link
                </button>
                <button
                  className="button button-secondary"
                  onClick={() => setInvitation(null)}
                >
                  Close preview
                </button>
              </div>
              <p className="tiny" style={{ marginTop: 18 }}>
                Open the invitation to create or sign in to the intended
                recipient's account. Your email and the one-time invitation must
                both match.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
function InstructionEditor({
  candidate,
  busy,
  onSave,
  label = "Edit instruction",
}: {
  candidate: Candidate;
  busy: boolean;
  onSave: (medicine: any) => void;
  label?: string;
}) {
  let defaults: any = {};
  try {
    defaults = JSON.parse(candidate.source);
  } catch {}
  return (
    <details style={{ marginTop: 15 }}>
      <summary className="text-link">{label}</summary>
      <form
        style={{ marginTop: 18 }}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <div className="form-grid">
          {[
            { name: "name", label: "Medicine name" },
            { name: "strength", label: "Strength" },
            { name: "dose", label: "Prescribed dose & unit" },
            { name: "route", label: "Route" },
            { name: "frequency", label: "Frequency" },
            { name: "times", label: "Approved times" },
            { name: "start", label: "Start date", type: "date" },
            { name: "end", label: "End date", type: "date" },
            { name: "food", label: "Food instructions (if specified)" },
          ].map((f) => (
            <Field
              key={f.name}
              fieldId={`${candidate.id}-${f.name}`}
              name={f.name}
              label={f.label}
              type={f.type}
              defaultValue={defaults[f.name] || ""}
              required={f.name !== "food"}
            />
          ))}
        </div>
        <button
          className="button button-secondary"
          style={{ marginTop: 18 }}
          disabled={busy}
        >
          {label === "Add another medicine"
            ? "Add medicine for review"
            : "Save corrected instruction"}
        </button>
      </form>
    </details>
  );
}
function PatientForm({
  doctors,
  busy,
  onSave,
}: {
  doctors: { uid: string; name: string }[];
  busy: boolean;
  onSave: (data: any) => void;
}) {
  return (
    <form
      className="panel"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onSave({
          ...Object.fromEntries(fd),
          age: Number(fd.get("age")),
          invitationOptIn: fd.get("invitationOptIn") === "on",
          contactVerified: fd.get("contactVerified") === "on",
          duplicateConfirmed: fd.get("duplicateConfirmed") === "on",
        });
      }}
    >
      <div className="form-grid">
        <Field label="Full name" name="name" />
        <label className="field">
          Age
          <input name="age" type="number" min="0" max="125" required />
        </label>
        <Field
          label="Contact number (optional)"
          name="phone"
          type="tel"
          required={false}
        />
        <Field
          label="Patient email (for secure activation)"
          name="email"
          type="email"
          required={false}
        />
        <label className="field">
          Preferred language
          <select name="language">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
        <label className="field">
          Assigned doctor
          <select name="doctorId" required>
            {doctors.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Visit type
          <input value="Consultation" readOnly />
        </label>
        <label className="check-label full-width">
          <input type="checkbox" name="invitationOptIn" />
          Patient has chosen to receive an optional WithYou invitation.
        </label>
        <label className="check-label full-width">
          <input type="checkbox" name="contactVerified" />I confirmed this
          activation email with the patient or their authorized representative.
        </label>
        <label className="check-label full-width">
          <input type="checkbox" name="duplicateConfirmed" />I reviewed a
          possible duplicate and confirmed this is a separate patient
          registration.
        </label>
      </div>
      <div className="alert">
        Registration creates a distinct encounter and routes it to an assigned
        clinician. Review possible duplicates before continuing.
      </div>
      <div className="form-actions">
        <button className="button" disabled={busy}>
          {busy ? "Registering…" : "Register & create visit"}
        </button>
        <Link className="text-link" href="/portal/patients">
          Cancel
        </Link>
      </div>
    </form>
  );
}
function ReportForm({
  patients,
  busy,
  onSave,
}: {
  patients: Patient[];
  busy: boolean;
  onSave: (data: any) => void;
}) {
  const selected =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("patient")
      : null;
  const form = useRef<HTMLFormElement>(null);
  const [patientId, setPatientId] = useState(selected || patients[0]?.id || "");
  const [draftStatus, setDraftStatus] = useState("Loading saved draft…");
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const draftContext = useRef({ patientId: "", revision: 0, encounterId: "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(Promise.resolve(true));
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    setReady(false);
    let cancelled = false;
    api(`drafts/${patientId}`)
      .then((draft) => {
        if (cancelled || !form.current) return;
        draftContext.current = {
          patientId,
          revision: draft.revision,
          encounterId: draft.encounterId,
        };
        for (const element of Array.from(form.current.elements)) {
          if (
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement
          ) {
            element.value = draft.fields[element.name] || "";
          }
        }
        setDraftStatus(
          draft.revision
            ? "Saved draft restored."
            : "Draft is saved to your workspace as you type.",
        );
        setReady(true);
      })
      .catch((error) => {
        if (!cancelled) setDraftStatus(error.message);
      });
    return () => {
      cancelled = true;
      alive.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [patientId]);
  function saveDraft(patientSwitch = false) {
    if (!form.current || !ready) return saving.current;
    if (timer.current) clearTimeout(timer.current);
    const fields = Object.fromEntries(new FormData(form.current)) as Record<
      string,
      string
    >;
    const context = draftContext.current;
    if (!patientSwitch && fields.patientId !== context.patientId)
      return saving.current;
    delete fields.patientId;
    setDraftStatus("Saving draft…");
    saving.current = saving.current
      .then(async () => {
        const result = await api(`drafts/${context.patientId}`, {
          revision: context.revision,
          encounterId: context.encounterId,
          fields,
        });
        context.revision = result.revision;
        if (alive.current && context === draftContext.current)
          setDraftStatus(
            "Draft saved. Nothing is published until you approve it.",
          );
        return true;
      })
      .catch((error) => {
        if (alive.current && context === draftContext.current)
          setDraftStatus(`Draft not saved: ${error.message}`);
        return false;
      });
    return saving.current;
  }
  return (
    <form
      ref={form}
      className="panel"
      onChange={() => {
        if (ready) {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => saveDraft(), 1200);
          setDraftStatus("Changes waiting to save…");
        }
      }}
      onBlur={(e) => {
        if (ready && !e.currentTarget.contains(e.relatedTarget as Node))
          saveDraft();
      }}
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const medicine = Object.fromEntries(
          [
            "name",
            "strength",
            "dose",
            "route",
            "frequency",
            "times",
            "start",
            "end",
            "food",
          ].map((k) => [k, String(fd.get(k) || "")]),
        );
        setSubmitting(true);
        try {
          if (!(await saveDraft())) return;
          await onSave({
            patientId: fd.get("patientId"),
            notes: fd.get("notes"),
            medicine,
            followUp: fd.get("followUp"),
            followUpDate: fd.get("followUpDate"),
            followUpTime: fd.get("followUpTime"),
          });
        } finally {
          if (alive.current) setSubmitting(false);
        }
      }}
    >
      <label className="field" style={{ marginBottom: 25 }}>
        Assigned patient
        <select
          name="patientId"
          value={patientId}
          disabled={submitting || busy}
          onChange={async (e) => {
            const id = e.target.value;
            const saved = saveDraft(true);
            setReady(false);
            await saved;
            setPatientId(id);
          }}
          required
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.encounterId}
            </option>
          ))}
        </select>
      </label>
      <p role="status" className="tiny" style={{ marginBottom: 16 }}>
        {draftStatus}
      </p>
      <fieldset
        disabled={!ready || busy || submitting}
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <p className="section-label">Structured prescription</p>
        <p className="tiny">
          These fields create candidate tasks directly. Enter only
          clinician-authorized details.
        </p>
        <div className="form-grid">
          <Field label="Medicine name" name="name" />
          <Field
            label="Strength"
            name="strength"
            help="e.g. the exact strength on the prescription"
          />
          <Field label="Prescribed dose & unit" name="dose" />
          <Field label="Route" name="route" />
          <Field label="Frequency" name="frequency" />
          <Field
            label="Approved reminder times"
            name="times"
            help="24-hour format, separated by commas: 08:00, 20:00"
          />
          <Field label="Start date" name="start" type="date" />
          <Field label="End date" name="end" type="date" />
          <Field
            label="Food instructions (if specified)"
            name="food"
            required={false}
          />
        </div>
        <p className="section-label" style={{ marginTop: 30 }}>
          Additional instructions
        </p>
        <div className="form-grid">
          <label className="field full-width">
            Free-text clinical notes
            <textarea
              name="notes"
              placeholder="Original notes. Unsupported free text remains blocked for clarification."
            />
          </label>
          <Field
            label="Follow-up instruction (optional)"
            name="followUp"
            required={false}
          />
          <Field
            label="Follow-up date"
            name="followUpDate"
            type="date"
            required={false}
          />
          <Field
            label="Follow-up time"
            name="followUpTime"
            type="time"
            required={false}
          />
        </div>
        <div className="form-actions">
          <button className="button" disabled={busy || !patients.length}>
            {busy ? "Saving report…" : "Save report & review tasks"}
          </button>
          <Link className="text-link" href="/portal/reports">
            Cancel
          </Link>
        </div>
      </fieldset>
    </form>
  );
}

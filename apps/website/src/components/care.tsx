"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Check,
  FileText,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/client";
import { Badge, Brand, ButtonLink } from "./ui";
import { SimpleHeader } from "./forms";
export default function Care() {
  const [w, setW] = useState<any>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("Today");
  const [busy, setBusy] = useState(false);
  const [notification, setNotification] = useState(false);
  const router = useRouter();
  async function load() {
    try {
      const data = await api("workspace");
      if (data.member.role !== "patient") {
        router.replace("/portal");
        return;
      }
      setW(data);
    } catch (err) {
      if (err instanceof ApiClientError && [401, 403].includes(err.status))
        setW(null);
      setError((err as Error).message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const tasks =
    w?.tasks?.filter(
      (t: any) => tab === "Schedule" || (t.start <= today && t.end >= today),
    ) || [];
  const complete = tasks.filter(
    (t: any) => t.completion === "completed",
  ).length;
  return (
    <>
      <header className="simple-header">
        <Brand />
        <div className="row">
          <button
            className="button button-secondary"
            aria-label="Preview a private reminder"
            onClick={() => setNotification(true)}
          >
            <Bell size={18} />
          </button>
          <button
            className="button button-secondary"
            aria-label="Sign out"
            onClick={async () => {
              await api("sign-out", {});
              router.push("/sign-in");
            }}
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>
      <main id="main" className="page-shell" style={{ maxWidth: 950 }}>
        {error && (
          <div role="alert" className="alert error">
            {error}
          </div>
        )}
        {!w ? (
          <>
            <p>Loading your approved care information…</p>
            {error && <ButtonLink href="/sign-in">Sign in</ButtonLink>}
          </>
        ) : (
          <>
            <div className="page-title">
              <span className="eyebrow">WITHYOU CARE</span>
              <h1>
                Hello, {w.patients[0]?.name || "there"}.<br />
                One step at a time.
              </h1>
              <p>
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  timeZone: "Asia/Kolkata",
                })}{" "}
                · Your approved care information
              </p>
            </div>
            <div
              className="tabs"
              role="tablist"
              aria-label="Care navigation"
              style={{ display: "inline-flex", marginBottom: 28 }}
            >
              {["Today", "Schedule", "Reports", "Profile"].map((t) => (
                <button
                  key={t}
                  role="tab"
                  id={`care-${t}`}
                  aria-selected={tab === t}
                  aria-controls="care-panel"
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {notification && (
              <div role="status" className="alert success">
                <strong>Reminder preview · Not a device notification</strong>
                <p style={{ margin: "8px 0" }}>
                  WithYou: You have a scheduled care task. Open the app to view
                  it.
                </p>
                <button
                  className="text-link"
                  onClick={() => setNotification(false)}
                  style={{ background: "none", border: 0 }}
                >
                  Dismiss preview
                </button>
              </div>
            )}
            <section
              id="care-panel"
              role="tabpanel"
              aria-labelledby={`care-${tab}`}
              className="panel"
            >
              {tab === "Today" || tab === "Schedule" ? (
                <>
                  <div className="row">
                    <div>
                      <p className="section-label">
                        {tab === "Today" ? "Today’s care" : "Approved schedule"}
                      </p>
                      <h2 style={{ fontSize: 28 }}>
                        {complete} of {tasks.length} completed
                      </h2>
                    </div>
                    <ShieldCheck color="var(--primary)" />
                  </div>
                  <p className="tiny" style={{ marginTop: 16 }}>
                    Completion is your self-report, not clinical verification.
                    All times are in Asia/Kolkata.
                  </p>
                  {tasks
                    .sort((a: any, b: any) =>
                      a.times[0].localeCompare(b.times[0]),
                    )
                    .map((t: any) => (
                      <div className="schedule-task" key={t.id}>
                        <span className="task-time">{t.times[0]}</span>
                        <div style={{ flex: 1 }}>
                          <Badge
                            tone={
                              t.completion === "completed"
                                ? "success"
                                : "neutral"
                            }
                          >
                            {t.completion}
                          </Badge>
                          <h3 style={{ marginTop: 12 }}>{t.title}</h3>
                          <p>{t.instruction}</p>
                          <p className="tiny">
                            {t.start} to {t.end} · Approved report v{t.version}
                          </p>
                          <Link
                            className="text-link"
                            href={`/api/reports/${t.reportId}/pdf`}
                            target="_blank"
                          >
                            View source report →
                          </Link>
                        </div>
                        <div className="task-actions">
                          <button
                            className="button"
                            disabled={busy || t.completion === "completed"}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                await api(`tasks/${t.id}`, {
                                  completion: "completed",
                                });
                                await load();
                              } catch (err) {
                                setError((err as Error).message);
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            <Check size={14} />
                            Complete
                          </button>
                          <button
                            className="button button-secondary"
                            disabled={busy || t.completion === "skipped"}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              try {
                                await api(`tasks/${t.id}`, {
                                  completion:
                                    t.completion === "completed"
                                      ? "scheduled"
                                      : "skipped",
                                });
                                await load();
                              } catch (err) {
                                setError((err as Error).message);
                              } finally {
                                setBusy(false);
                              }
                            }}
                          >
                            {t.completion === "completed" ? "Undo" : "Skip"}
                          </button>
                        </div>
                      </div>
                    ))}
                  {!tasks.length && (
                    <div className="empty-state">
                      <CalendarDays />
                      <h3>
                        {tab === "Today"
                          ? "No tasks scheduled for today."
                          : "Your approved plan will appear here."}
                      </h3>
                      <p>
                        Your provider must review and publish a care plan before
                        tasks are shown.
                      </p>
                    </div>
                  )}
                </>
              ) : tab === "Reports" ? (
                <>
                  <h2 style={{ fontSize: 28, marginBottom: 24 }}>
                    Your medical reports.
                  </h2>
                  {w.reports.map((r: any) => (
                    <div className="candidate-card" key={r.id}>
                      <div className="row">
                        <FileText color="var(--primary)" />
                        <Badge tone="success">
                          Clinician approved · v{r.version}
                        </Badge>
                      </div>
                      <h3 style={{ marginTop: 20 }}>Consultation report</h3>
                      <p>
                        {w.organization.name} · Approved{" "}
                        {new Date(r.approvedAt).toLocaleDateString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })}
                      </p>
                      <a
                        className="button button-secondary"
                        href={`/api/reports/${r.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View finalized report
                      </a>
                    </div>
                  ))}
                  {!w.reports.length && (
                    <div className="empty-state">
                      <FileText />
                      <h3>No published reports yet.</h3>
                      <p>Only approved reports are shared with you.</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: 28 }}>Your care profile.</h2>
                  <p style={{ marginTop: 20 }}>
                    {w.patients[0]?.name} · {w.patients[0]?.language}
                  </p>
                  <p>
                    Provider: {w.organization.name}
                    <br />
                    Time zone: Asia/Kolkata
                  </p>
                  <div className="alert">
                    Device notifications, caregiver permissions and account
                    settings are not available yet.
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
export function AcceptInvitation() {
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [claimed, setClaimed] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell" style={{ maxWidth: 700 }}>
        <div className="page-title">
          <span className="eyebrow">A PRIVATE CONNECTION</span>
          <h1>Your care, all in one place.</h1>
          <p>
            Sign in with your verified patient account before claiming this
            invitation. Medical information stays private until authentication
            and authorization succeed.
          </p>
        </div>
        <div className="panel">
          {error && (
            <div role="alert" className="alert error">
              {error}
            </div>
          )}
          {claimed ? (
            <>
              <div className="alert success">
                Invitation verified and claimed.
              </div>
              <ButtonLink href="/care">Open your care plan</ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink secondary href="/sign-in">
                Sign in to your account
              </ButtonLink>
              <button
                className="button"
                style={{ margin: 16 }}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await api("claim", {
                      token: params.get("token"),
                      tenantId: params.get("tenant"),
                    });
                    setClaimed(true);
                  } catch (err) {
                    setError((err as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Verifying…" : "Verify & claim invitation"}
              </button>
              <p className="tiny">
                Single-use links expire after 24 hours. New patient identity
                verification and password setup remain a separate production
                implementation requirement.
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

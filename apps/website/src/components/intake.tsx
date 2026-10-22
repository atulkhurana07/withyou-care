"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
const labels: Record<string, string> = {
  awaiting_review: "Awaiting clinician review",
  awaiting_patient: "Patient confirmation needed",
  clarification_requested: "Clarification needed",
  ready_to_book: "Ready to request appointment",
  booking_requested: "Appointment requested",
  confirmed: "Appointment confirmed",
  cancelled: "Cancelled",
  replaced: "Replaced by a clearer document",
};
export function IntakePanel({ role }: { role: string }) {
  const [items, setItems] = useState<any[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setItems((await api<{ items: any[] }>("intake/list")).items);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function submit(
    event: React.FormEvent<HTMLFormElement>,
    item: any,
    action: string,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setBusy(true);
    try {
      await api(`intake/${item.id}/${action}`, {
        ...data,
        revision: item.revision,
        identityChecked: data.identityChecked === "on",
        sourceChecked: data.sourceChecked === "on",
        scheduledAt: data.scheduledAt
          ? `${data.scheduledAt}:00+05:30`
          : undefined,
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="stack">
      <div className="panel">
        <h2>Prescription requests & appointments</h2>
        <p>
          Review the original document, clarify uncertainty, and allocate
          appointments after the patient confirms the reading. Uploads never
          become an approved medication plan automatically.
        </p>
        <button
          className="button button-secondary"
          disabled={busy}
          onClick={load}
        >
          Refresh requests
        </button>
      </div>
      {error && (
        <p role="alert" className="alert error">
          {error}
        </p>
      )}
      {!items.length && (
        <div className="panel empty-state">No prescription requests yet.</div>
      )}
      {items.map((item) => (
        <article className="panel" key={item.id}>
          <span className="eyebrow">{labels[item.state]}</span>
          <h3>{item.patientName}</h3>
          <p>
            {new Date(item.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}{" "}
            · {item.pages} page(s) · v{item.revision}
          </p>
          {role === "doctor" && (
            <>
              <p>{item.quality}</p>
              <a
                className="button button-secondary"
                href={`/api/intake/${item.id}/file`}
              >
                Download original prescription
              </a>
              {["awaiting_review", "clarification_requested"].includes(
                item.state,
              ) && (
                <button
                  className="button button-secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await api(`intake/${item.id}/read`, {
                        revision: item.revision,
                      });
                      await load();
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Read with AI assistance
                </button>
              )}
              <p>
                AI reading is a proposed transcription. Medical correctness,
                doses, conflicts and identity require clinician verification.
              </p>
              {item.aiText && (
                <details>
                  <summary>
                    Proposed AI reading · verify against every original page
                  </summary>
                  <p style={{ whiteSpace: "pre-wrap" }}>{item.aiText}</p>
                  {item.aiUnclear?.map((line: string, index: number) => (
                    <p key={index}>Unclear: {line}</p>
                  ))}
                </details>
              )}
              {item.reviewSummary && (
                <p style={{ whiteSpace: "pre-wrap" }}>{item.reviewSummary}</p>
              )}
              {["awaiting_review", "clarification_requested"].includes(
                item.state,
              ) && (
                <form
                  className="form-grid"
                  onSubmit={(event) => submit(event, item, "review")}
                >
                  <label className="field full">
                    Patient-readable review / clarification
                    <textarea
                      name="summary"
                      required
                      maxLength={4000}
                      defaultValue={item.reviewSummary}
                    />
                  </label>
                  <label className="check-line full">
                    <input type="checkbox" name="identityChecked" required /> I
                    checked patient identity against the original document.
                  </label>
                  <label className="check-line full">
                    <input type="checkbox" name="sourceChecked" required /> I
                    checked all pages and source details; this reading does not
                    authorize new medication instructions.
                  </label>
                  <label className="field">
                    Next step
                    <select name="outcome">
                      <option value="ask_patient">
                        Ask patient to confirm reading
                      </option>
                      <option value="request_reupload">
                        Request clarification / clearer upload
                      </option>
                    </select>
                  </label>
                  <button className="button" disabled={busy}>
                    Save clinician review
                  </button>
                </form>
              )}
            </>
          )}
          {item.patientComment && (
            <p>Patient clarification: {item.patientComment}</p>
          )}
          {item.preferredAt && (
            <p>
              Requested:{" "}
              {new Date(item.preferredAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </p>
          )}
          {role === "receptionist" && item.state === "booking_requested" && (
            <form
              className="form-grid"
              onSubmit={(event) => submit(event, item, "confirm")}
            >
              <label className="field">
                Allocated appointment (IST)
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  step={1800}
                  required
                />
              </label>
              <label className="field">
                Clinic / visit location
                <input name="location" required maxLength={300} />
              </label>
              <button className="button" disabled={busy}>
                Confirm appointment
              </button>
              <p>
                30-minute allocation. Conflicting clinician slots are rejected.
              </p>
            </form>
          )}
          {item.state === "confirmed" && (
            <p role="status">
              Confirmed:{" "}
              {new Date(item.scheduledAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST · {item.location} · confirmation available in the patient app.
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

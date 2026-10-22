"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Field } from "./forms";
export function TeamPanel({
  team,
  invitations,
  onChanged,
}: {
  team: any[];
  invitations: any[];
  onChanged: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="panel">
      <h2>Your care team.</h2>
      <p>
        Invite each staff member to their own account. Access is limited to the
        assigned role and this organization.
      </p>
      {error && (
        <div role="alert" className="alert error">
          {error}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const values = Object.fromEntries(new FormData(form));
          run(async () => {
            const result = await api("team/invitations", values);
            setLink(result.link || "");
            form.reset();
          });
        }}
      >
        <div className="form-grid">
          <Field name="name" label="Staff name" />
          <Field name="email" type="email" label="Staff email" />
          <label className="field">
            Staff role
            <select name="role">
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </label>
        </div>
        <button className="button" style={{ marginTop: 20 }} disabled={busy}>
          Invite team member
        </button>
      </form>
      {link && (
        <div role="status" className="alert">
          <p>
            Invitation created. The email channel has a local preview; this does
            not establish inbox delivery.
          </p>
          <a className="inline-link" href={link}>
            Open invitation
          </a>
          <button
            className="button button-secondary"
            onClick={() => navigator.clipboard.writeText(link)}
          >
            Copy invitation
          </button>
        </div>
      )}
      <h3 style={{ marginTop: 32 }}>Members</h3>
      {team.map((person) => (
        <div
          className="row"
          key={person.uid}
          style={{
            padding: "16px 0",
            borderBottom: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong>{person.displayName}</strong>
            <p>
              {person.email} · {person.role} · {person.status}
            </p>
          </div>
          {person.role !== "admin" && (
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await api("team/access", {
                    uid: person.uid,
                    status:
                      person.status === "disabled" ? "active" : "disabled",
                  });
                })
              }
            >
              {person.status === "disabled"
                ? "Restore access"
                : "Disable access"}
            </button>
          )}
          {person.role === "doctor" && (
            <details style={{ width: "100%", marginTop: 12 }}>
              <summary className="text-link">
                Clinician profile ·{" "}
                {person.clinicalVerified
                  ? "Organization approved"
                  : "Needs review"}
              </summary>
              <p>
                Record professional details and the evidence your organization
                checked. WithYou does not independently certify clinician
                registration.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const values = Object.fromEntries(
                    new FormData(e.currentTarget),
                  );
                  run(async () => {
                    await api("team/clinician-profile", {
                      ...values,
                      uid: person.uid,
                      clinicalVerified: values.clinicalVerified === "on",
                    });
                  });
                }}
              >
                <div className="form-grid">
                  {[
                    {
                      name: "fullName",
                      label: "Clinical full name",
                      value: person.displayName,
                    },
                    {
                      name: "registrationNumber",
                      label: "Professional registration number",
                      value: person.registrationNumber,
                    },
                    {
                      name: "specialty",
                      label: "Specialty",
                      value: person.specialty,
                    },
                    {
                      name: "verificationReference",
                      label: "Verification reference",
                      value: person.verificationReference,
                    },
                  ].map((f) => (
                    <Field
                      key={f.name}
                      name={f.name}
                      label={f.label}
                      defaultValue={f.value}
                      fieldId={`${person.uid}-${f.name}`}
                    />
                  ))}
                </div>
                <label className="check-label">
                  <input
                    type="checkbox"
                    name="clinicalVerified"
                    defaultChecked={person.clinicalVerified}
                  />
                  Our organization checked this clinician's identity and
                  prescribing authority.
                </label>
                <button className="button button-secondary" disabled={busy}>
                  Save clinician profile
                </button>
              </form>
            </details>
          )}
        </div>
      ))}
      <h3 style={{ marginTop: 32 }}>Invitations</h3>
      {invitations.length === 0 && <p>No pending invitations.</p>}
      {invitations.map((invite) => (
        <div key={invite.id} className="row" style={{ padding: "16px 0" }}>
          <div>
            <strong>{invite.name}</strong>
            <p>
              {invite.role} · {invite.status} · {invite.deliveryStatus}
            </p>
            <small>
              Expires{" "}
              {new Date(invite.expiresAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              · Asia/Kolkata
            </small>
          </div>
          {invite.status === "created" && (
            <button
              disabled={busy}
              className="button button-secondary"
              onClick={() =>
                run(async () => {
                  await api("team/revoke", { id: invite.id });
                })
              }
            >
              Revoke invitation
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

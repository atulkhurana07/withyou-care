"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Field, SimpleHeader } from "./forms";
export default function Join() {
  const params = useSearchParams();
  const router = useRouter();
  const [existing, setExisting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const invitation = {
    token: params.get("token"),
    tenantId: params.get("tenant"),
    kind: params.get("kind") === "staff" ? "staff" : "patient",
  };
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell" style={{ maxWidth: 640 }}>
        <div className="page-title">
          <span className="eyebrow">A PRIVATE CONNECTION</span>
          <h1>
            {invitation.kind === "staff"
              ? "Join your care team."
              : "Your care, connected."}
          </h1>
          <p>
            Use the email address your organization invited. Medical information
            stays private until your account and invitation are verified.
          </p>
        </div>
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setMessage("");
            const data = Object.fromEntries(new FormData(e.currentTarget));
            try {
              if (!existing) {
                if (data.password !== data.confirm)
                  throw new Error("Passwords do not match.");
                const created = await api("invitation-account", {
                  ...invitation,
                  ...data,
                });
                if (created.emailVerificationRequired) {
                  setExisting(true);
                  setMessage(
                    created.verificationStatus === "submitted"
                      ? "Verify the link sent to your email, then sign in here to accept."
                      : "Account created. Verification email needs attention; contact your organization.",
                  );
                  return;
                }
              }
              await api("session", {
                email: data.email,
                password: data.password,
              });
              const accepted = await api("invitation-accept", invitation);
              router.replace(accepted.role === "patient" ? "/care" : "/portal");
            } catch (err) {
              setError((err as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {!existing && <Field name="name" label="Your full name" />}
          <Field name="email" type="email" label="Invited email" />
          <Field
            name="password"
            type="password"
            label={existing ? "Password" : "Create password"}
            help={
              existing
                ? undefined
                : "At least 12 characters, including uppercase, lowercase and a number."
            }
          />
          {!existing && (
            <Field name="confirm" type="password" label="Confirm password" />
          )}
          {error && (
            <div role="alert" className="alert error">
              {error}
            </div>
          )}
          {message && (
            <div role="status" className="alert">
              {message}
            </div>
          )}
          <button className="button" disabled={busy} style={{ marginTop: 24 }}>
            {busy
              ? "Verifying account…"
              : existing
                ? "Sign in & accept invitation"
                : "Create account & accept invitation"}
          </button>
          <button
            type="button"
            className="text-link"
            style={{ marginTop: 20, display: "block" }}
            onClick={() => {
              setExisting(!existing);
              setError("");
            }}
          >
            {existing
              ? "Create a new account"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </main>
    </>
  );
}

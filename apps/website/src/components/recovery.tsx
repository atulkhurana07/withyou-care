"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { Field, SimpleHeader } from "./forms";
export default function Recovery() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell" style={{ maxWidth: 600 }}>
        <div className="page-title">
          <h1>Recover your account.</h1>
          <p>Request a secure password reset using your account email.</p>
        </div>
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const email = new FormData(e.currentTarget).get("email");
            try {
              const result = await api("password-reset", { email });
              setMessage(result.message);
            } catch (error) {
              setMessage((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field name="email" label="Account email" type="email" />
          <button disabled={busy} className="button" style={{ marginTop: 20 }}>
            Request password reset
          </button>
          {message && (
            <div role="status" className="alert">
              {message}
            </div>
          )}
        </form>
      </main>
    </>
  );
}

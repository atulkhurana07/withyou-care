"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/client";
import { Brand, ButtonLink } from "./ui";
export function SimpleHeader() {
  return (
    <header className="simple-header">
      <Brand />
      <Link className="text-link" href="/">
        Back to website
      </Link>
    </header>
  );
}
export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = true,
  help,
  fieldId,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  help?: string;
  fieldId?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={fieldId || name}>{label}</label>
      <input
        id={fieldId || name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={help ? `${fieldId || name}-help` : undefined}
      />
      {help && <small id={`${fieldId || name}-help`}>{help}</small>}
    </div>
  );
}
export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell login-layout">
        <div>
          <span className="eyebrow">WELCOME TO WITHYOU</span>
          <h1>
            A clearer workflow.
            <br />A connected day.
          </h1>
          <p>
            Sign in to your organization workspace or access your approved care
            information.
          </p>
          <ButtonLink href="/how-it-works" secondary>
            Explore the workflow
          </ButtonLink>
        </div>
        <div className="panel">
          <h2 style={{ fontSize: 28 }}>Welcome back.</h2>
          <p style={{ fontSize: 13, marginTop: 12 }}>
            Use your WithYou account to continue.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api("session", { email, password });
                const w = await api("workspace");
                window.location.assign(
                  w.organization.state === "pending_checkout"
                    ? "/start"
                    : w.member.role === "patient"
                      ? "/care"
                      : "/portal",
                );
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-grid">
              <label className="field full-width">
                Email address
                <input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="field full-width">
                Password
                <div className="row">
                  <input
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="button button-secondary"
                    aria-label={show ? "Hide password" : "Show password"}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>
            </div>
            {error && (
              <div role="alert" className="alert error">
                {error}
              </div>
            )}
            <button
              className="button"
              style={{ width: "100%", marginTop: 24 }}
              disabled={busy}
            >
              {busy ? "Signing in…" : "Sign in"}
              <ArrowRight size={18} />
            </button>
          </form>
          <Link href="/forgot-password" className="text-link">
            Forgot password?
          </Link>
          <p className="tiny" style={{ marginTop: 24 }}>
            New to WithYou?{" "}
            <Link href="/start" className="text-link">
              Create your organization account
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
export function SetupForm({ onComplete }: { onComplete: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api("setup", {
            ...Object.fromEntries(new FormData(e.currentTarget)),
            timezone: "Asia/Kolkata",
          });
          onComplete();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>Make yourself at home.</h2>
      <div className="form-grid">
        <Field
          label="Primary department"
          name="department"
          defaultValue="General medicine"
        />
        <label className="field">
          Default language
          <select name="language">
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
        <label className="field">
          Document template
          <select name="template">
            <option>Consultation report</option>
            <option>Discharge summary</option>
            <option>Follow-up report</option>
          </select>
        </label>
        <label className="field">
          Time zone
          <input value="Asia/Kolkata" readOnly />
        </label>
      </div>
      <div className="alert">
        These preferences apply to your organization workspace. Clinical work
        requires separately authorized staff accounts.
      </div>
      {error && (
        <div role="alert" className="alert error">
          {error}
        </div>
      )}
      <div className="form-actions">
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Finish setup"}
        </button>
      </div>
    </form>
  );
}

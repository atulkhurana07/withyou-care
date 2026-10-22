"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/client";
import { Field, SimpleHeader, SetupForm } from "./forms";
export default function Onboarding() {
  const params = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(
    ["Clinic", "Hospital", "Enterprise"].includes(params.get("plan") || "")
      ? params.get("plan")!
      : "Clinic",
  );
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const details = useRef<Record<string, string>>({});
  const idempotency = useRef("");
  useEffect(() => {
    api("public/config")
      .then(setConfig)
      .catch(() =>
        setError("Account services are temporarily unavailable. Please retry."),
      );
    idempotency.current = crypto.randomUUID();
    api("workspace")
      .then((w) => {
        if (w.member.role !== "admin") return;
        setOrganization(w.organization.name);
        setPlan(w.organization.plan || "Clinic");
        if (w.organization.state === "pending_checkout") setStep(3);
        else if (!w.organization.configured) setStep(5);
        else router.replace("/portal");
      })
      .catch(() => {});
  }, []);
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell" style={{ maxWidth: 1040 }}>
        <div className="page-title">
          <span className="eyebrow">WITHYOU ENTERPRISE</span>
          <h1>Your team. Your workspace.</h1>
          <p>
            Bring your organization, clinical documentation and patient care
            together.
          </p>
        </div>
        <div className="stepper">
          {[
            "Choose your plan",
            "Organization & account",
            "Subscription",
            "Workspace setup",
          ].map((s, i) => (
            <span
              key={s}
              className={
                (step >= 4 ? i === 3 : step === i + 1) ? "current" : ""
              }
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
        {error && (
          <div role="alert" className="alert error">
            {error}
          </div>
        )}
        {step === 1 ? (
          <div className="panel">
            <h2 style={{ fontSize: 30 }}>A plan for your kind of care.</h2>
            <div className="plan-selection">
              {["Clinic", "Hospital", "Enterprise"].map((p) => (
                <button
                  className={plan === p ? "selected" : ""}
                  key={p}
                  aria-pressed={plan === p}
                  onClick={() => setPlan(p)}
                >
                  <ShieldCheck size={23} />
                  <strong>{p}</strong>
                  <span>
                    {p === "Clinic"
                      ? "A focused practice"
                      : p === "Hospital"
                        ? "Connected clinical teams"
                        : "Growing organizations"}
                  </span>
                  {plan === p && <Check size={17} />}
                </button>
              ))}
            </div>
            <p>
              Commercial terms are confirmed with your organization before paid
              billing begins.
            </p>
            <button
              className="button"
              onClick={() => {
                setError("");
                setStep(2);
              }}
            >
              Continue
              <ArrowRight size={17} />
            </button>
          </div>
        ) : step === 2 ? (
          <form
            className="panel"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fd = new FormData(e.currentTarget);
              details.current = Object.fromEntries(fd) as Record<
                string,
                string
              >;
              try {
                const result = await api("register", {
                  ...details.current,
                  plan,
                  acceptedTerms: fd.get("acceptedTerms") === "on",
                });
                setOrganization(String(fd.get("name")));
                if (result.emailVerificationRequired) {
                  setError(
                    result.verificationStatus === "submitted"
                      ? "Check your email to verify your account, then sign in."
                      : "Your account was created, but verification email delivery needs attention. Please contact support.",
                  );
                  return;
                }
                await api("session", {
                  email: fd.get("email"),
                  password: fd.get("password"),
                });
                delete details.current.password;
                setStep(3);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2 style={{ fontSize: 28, marginBottom: 25 }}>
              Introduce your organization.
            </h2>
            <div className="form-grid">
              <Field
                name="name"
                label="Organization name"
                defaultValue={details.current.name}
              />
              <Field
                name="email"
                label="Official email"
                type="email"
                defaultValue={details.current.email}
              />
              <Field
                name="contact"
                label="Administrator’s full name"
                defaultValue={details.current.contact}
              />
              <Field
                name="phone"
                label="Contact phone"
                type="tel"
                defaultValue={details.current.phone}
              />
              <label className="field">
                Organization type
                <select
                  name="category"
                  defaultValue={details.current.category || "Clinic"}
                >
                  <option>Clinic</option>
                  <option>Hospital</option>
                  <option>Enterprise</option>
                </select>
              </label>
              <Field
                name="address"
                label="Organization address"
                defaultValue={details.current.address}
              />
              <Field
                name="password"
                label="Create your password"
                type="password"
                help="At least 12 characters, including uppercase, lowercase and a number."
              />
              <label className="check-label full-width">
                <input name="acceptedTerms" type="checkbox" required />I agree
                to the{" "}
                <Link href="/terms" className="inline-link">
                  terms
                </Link>{" "}
                and have read the{" "}
                <Link href="/privacy" className="inline-link">
                  privacy information
                </Link>
                .
              </label>
            </div>
            <div className="form-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button className="button" disabled={busy}>
                {busy ? "Creating your account…" : "Create account & continue"}
              </button>
            </div>
          </form>
        ) : step === 3 ? (
          <div className="checkout-layout">
            <form
              className="panel"
              onSubmit={async (e) => {
                e.preventDefault();
                setError("");
                const digits = card.replace(/\s/g, "");
                const match = expiry.match(/^(\d{2})\/?(\d{2})$/);
                const now = new Date();
                if (digits !== "4111111111111111") {
                  setError(
                    "Use the designated development card: 4111 1111 1111 1111. Other card details are not accepted.",
                  );
                  return;
                }
                if (
                  !match ||
                  Number(match[1]) < 1 ||
                  Number(match[1]) > 12 ||
                  new Date(2000 + Number(match[2]), Number(match[1]), 1) <= now
                ) {
                  setError(
                    "Enter a valid expiry month and year, such as 11/29. The card must not be expired.",
                  );
                  return;
                }
                if (!/^\d{3}$/.test(cvc)) {
                  setError("Enter a three-digit security code.");
                  return;
                }
                setBusy(true);
                try {
                  await api("checkout/activate", {
                    paymentToken: "visa-success",
                    idempotencyKey: idempotency.current,
                  });
                  setCard("");
                  setExpiry("");
                  setCvc("");
                  details.current = {};
                  setStep(4);
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="row">
                <h2 style={{ fontSize: 29 }}>Activate your subscription.</h2>
                <CreditCard color="var(--primary)" />
              </div>
              <p style={{ marginTop: 18 }}>
                Access begins as soon as your subscription is activated. No
                charge today.
              </p>
              {config && !config.checkoutAvailable && (
                <div role="status" className="alert">
                  Subscription activation is not available yet. Your account is
                  saved; you can return when billing is enabled.
                </div>
              )}
              <label className="field">
                Cardholder name
                <input autoComplete="off" required />
              </label>
              <label className="field" style={{ marginTop: 20 }}>
                Card number
                <input
                  autoComplete="off"
                  inputMode="numeric"
                  placeholder="4111 1111 1111 1111"
                  value={card}
                  maxLength={19}
                  onChange={(e) =>
                    setCard(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  required
                />
              </label>
              <div className="form-grid" style={{ marginTop: 20 }}>
                <label className="field">
                  Expiry
                  <input
                    value={expiry}
                    inputMode="numeric"
                    placeholder="MM/YY"
                    maxLength={5}
                    onChange={(e) => {
                      const digits = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);
                      setExpiry(
                        digits.length > 2
                          ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                          : digits,
                      );
                    }}
                    required
                  />
                </label>
                <label className="field">
                  Security code
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cvc}
                    maxLength={3}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="checkout-assurance">
                <LockKeyhole size={16} />
                <span>
                  Card details stay in this screen and are not stored.
                </span>
              </div>
              <button
                className="button"
                style={{ width: "100%" }}
                disabled={busy || !config?.checkoutAvailable}
              >
                {busy ? "Activating your workspace…" : "Activate subscription"}
                <ArrowRight size={16} />
              </button>
              <button
                className="text-link"
                type="button"
                onClick={() => {
                  setCard("");
                  setCvc("");
                  router.push("/sign-in");
                }}
                style={{ border: 0, background: "none", marginTop: 14 }}
              >
                Cancel and return later
              </button>
            </form>
            <aside className="panel checkout-summary">
              <span className="eyebrow">YOUR SUBSCRIPTION</span>
              <h3>{plan}</h3>
              <p style={{ marginTop: 15 }}>{organization}</p>
              <ul>
                <li>
                  <Check size={16} />
                  Organization workspace
                </li>
                <li>
                  <Check size={16} />
                  Clinical documentation
                </li>
                <li>
                  <Check size={16} />
                  Approved patient care plans
                </li>
              </ul>
              <div className="row checkout-total">
                <span>Due today</span>
                <strong>₹0</strong>
              </div>
              <p className="tiny">
                Paid billing begins only after your organization accepts its
                commercial terms.
              </p>
            </aside>
          </div>
        ) : step === 4 ? (
          <div className="panel subscription-success">
            <div className="success-ring">
              <Check size={42} />
            </div>
            <span className="eyebrow">YOU’RE ALL SET</span>
            <h2>Your subscription is active.</h2>
            <p>
              {organization} · {plan}
            </p>
            <p>Your workspace is ready. Let’s set up your team.</p>
            <button className="button" onClick={() => setStep(5)}>
              Set up workspace
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <SetupForm onComplete={() => window.location.assign("/portal")} />
        )}
      </main>
    </>
  );
}

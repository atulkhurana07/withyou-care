import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Badge,
  ButtonLink,
  EnterpriseArtwork,
  PatientArtwork,
} from "@/components/ui";
import { SimpleHeader } from "@/components/forms";
import tokens from "../../../../../packages/design-tokens/tokens.json";
const content: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    sections: { title: string; text: string }[];
  }
> = {
  "for-hospitals": {
    eyebrow: "WITHYOU ENTERPRISE",
    title: "A focused workspace.\nA connected care journey.",
    description:
      "Bring registration, clinical documentation, reviewed care plans and patient delivery into one workflow.",
    sections: [
      {
        title: "Welcome and route the encounter",
        text: "Receptionists register patients, review possible duplicates and create a visit for the assigned doctor.",
      },
      {
        title: "Document once, review carefully",
        text: "Doctors enter structured instructions and review source-linked tasks. Missing fields and ambiguous timing remain blocked.",
      },
      {
        title: "Publish with a clear record",
        text: "Only an authorized clinician can publish. Approved instructions become patient tasks and a versioned, printable report.",
      },
    ],
  },
  "for-patients": {
    eyebrow: "WITHYOU CARE",
    title: "Your care,\nall in one place.",
    description:
      "A reassuring way to see authorized reports, approved daily tasks and upcoming follow-ups. Designed for patients and their authorized families.",
    sections: [
      {
        title: "A clear view of today",
        text: "See approved instructions and their scheduled time. Mark a task completed or skipped; completion is a patient self-report.",
      },
      {
        title: "Your reports, close at hand",
        text: "View the finalized report that created each task. Your reminder settings must never change a doctor-authorized prescription.",
      },
      {
        title: "A private connection",
        text: "Access follows authentication, identity verification and permission. A phone number alone must not connect or merge medical records.",
      },
    ],
  },
  "how-it-works": {
    eyebrow: "FROM YOUR DOCTOR’S DESK TO YOUR DAY",
    title: "One report.\nA useful daily experience.",
    description:
      "Clinical documentation → clinical verification → personalized task scheduling → patient delivery → reminder tracking.",
    sections: [
      {
        title: "01 — Register and document",
        text: "The hospital creates a distinct registration and encounter. The assigned doctor writes the clinical report.",
      },
      {
        title: "02 — Structure and verify",
        text: "Structured values create tasks directly. Free-text interpretation needs source mapping and clinician review; ambiguities never authorize themselves.",
      },
      {
        title: "03 — Publish and connect",
        text: "The approved version becomes a finalized PDF and private patient schedule. An optional invitation is shared through an authorized channel.",
      },
      {
        title: "04 — Support the patient’s day",
        text: "Patients see their approved plan, follow-ups and task status. Reminder delivery and patient completion are separate events.",
      },
    ],
  },
  contact: {
    eyebrow: "LET’S CONNECT",
    title: "Start with\na conversation.",
    description:
      "Create your organization account to begin setup. Commercial terms must be agreed with your organization before paid billing begins.",
    sections: [
      {
        title: "For healthcare providers",
        text: "Choose Clinic, Hospital or Enterprise. Organization verification and approval are required before clinical use.",
      },
      {
        title: "For patients and families",
        text: "Clinical questions belong with your care provider. WithYou organizes approved instructions and does not make treatment decisions.",
      },
    ],
  },
  privacy: {
    eyebrow: "PRIVACY INFORMATION",
    title: "Privacy,\nby design.",
    description:
      "Understand the information used by your workspace and how access is controlled. Your organization must approve its privacy notice and processing arrangements before accepting patient records.",
    sections: [
      {
        title: "Workspace information",
        text: "The workspace stores organization profiles, staff memberships, patient registrations, reports, tasks, invitation hashes and audit events. Administrators must establish retention and deletion procedures before clinical use.",
      },
      {
        title: "Who can access records",
        text: "The server checks authenticated membership, organization, clinical assignment and patient association. Database and Storage client rules deny direct access.",
      },
      {
        title: "External services",
        text: "Email, messaging, payments and automated extraction depend on configured providers. Provider contracts and data handling must be approved before sending patient information to external services.",
      },
      {
        title: "Local data and account sessions",
        text: "Web authentication uses an HttpOnly session cookie with a one-hour lifetime. Medical records are not kept in browser local storage. Sign out when using a shared device.",
      },
    ],
  },
  terms: {
    eyebrow: "SERVICE INFORMATION",
    title: "Clear responsibilities.\nConnected care.",
    description:
      "Use WithYou only through an authorized organization. Organization approval and agreed commercial terms are required before paid or clinical service begins.",
    sections: [
      {
        title: "Authorized use",
        text: "Keep your account secure, use only records you are authorized to access, and follow your organization's clinical and privacy policies. Subscription access does not establish clinical approval or guarantee notification delivery.",
      },
      {
        title: "Clinical responsibility",
        text: "An authorized clinician determines and approves instructions. The product must not diagnose, prescribe or independently alter a treatment.",
      },
      {
        title: "Before a clinical pilot",
        text: "Provider verification, legally appropriate authentication, security review, privacy notices, retention, incident response, vendor contracts and notification reliability must be completed.",
      },
    ],
  },
};
export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (page === "pricing")
    return (
      <>
        <SimpleHeader />
        <main id="main" className="page-shell">
          <div className="page-title">
            <h1>A plan for your kind of care.</h1>
            <p>
              Clinic, Hospital and Enterprise. Commercial pricing is being
              finalized.
            </p>
          </div>
          <ButtonLink href="/start">
            Create your organization account
          </ButtonLink>
        </main>
      </>
    );
  if (page === "design-system")
    return (
      <>
        <SimpleHeader />
        <main id="main" className="page-shell">
          <div className="page-title">
            <span className="eyebrow">WITHYOU · DESIGN FOUNDATION</span>
            <h1>Confidence. Clarity. Care.</h1>
            <p>
              Shared colors, typography, spacing, components and meaningful
              states across the website, enterprise workspace and Flutter
              patient app.
            </p>
          </div>
          <div className="swatches">
            {Object.entries(tokens.color).map(([name, color]) => (
              <div className="swatch" key={name}>
                <div style={{ background: color }} />
                <p>
                  <strong>{name}</strong>
                  <br />
                  {color}
                </p>
              </div>
            ))}
          </div>
          <section className="panel" style={{ marginTop: 32 }}>
            <p className="section-label">Typography · Manrope</p>
            <h2>From your doctor’s desk to your day.</h2>
            <p style={{ marginTop: 22 }}>
              16px primary reading, fluid editorial headings, generous line
              height. Clinical instructions stay readable and stable.
            </p>
            <div className="form-actions">
              <Badge>Draft</Badge>
              <Badge tone="warning">Needs clarification</Badge>
              <Badge tone="success">Clinician approved</Badge>
              <ButtonLink href="/sign-in">Primary action</ButtonLink>
              <ButtonLink href="/" secondary>
                Secondary action
              </ButtonLink>
            </div>
            <p className="tiny" style={{ marginTop: 24 }}>
              Focus: visible blue outline · Motion: 180ms interaction, 500ms
              reveal · Reduced motion: animations disabled · Controls: 44px+
              target · Status: text plus color
            </p>
          </section>
          <div className="split-panels" style={{ marginTop: 32 }}>
            <section className="panel">
              <h3>4px spacing foundation</h3>
              <p style={{ marginTop: 20 }}>{tokens.space.join(" / ")} px</p>
              <h3>Purposeful geometry</h3>
              <p style={{ marginTop: 20 }}>
                12px controls · 20px cards · 28px feature panels · 32px visual
                compositions
              </p>
            </section>
            <section className="panel">
              <h3>Original brand asset</h3>
              <img
                src="/brand/WithYou_logo.png"
                width="360"
                height="240"
                alt="Original WithYou logo"
                style={{ marginTop: 20, borderRadius: 12 }}
              />
              <p className="tiny" style={{ marginTop: 12 }}>
                Original supplied raster, preserved without recoloring or
                replacement. Blue is retained as a supporting interaction color.
              </p>
            </section>
          </div>
        </main>
      </>
    );
  const c = content[page];
  if (!c) notFound();
  return (
    <>
      <SimpleHeader />
      <main id="main" className="page-shell">
        <div className="page-title">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1 style={{ whiteSpace: "pre-line", maxWidth: 800 }}>{c.title}</h1>
          <p>{c.description}</p>
        </div>
        {page === "for-hospitals" ? (
          <EnterpriseArtwork />
        ) : page === "for-patients" ? (
          <div
            style={{
              background: "var(--mint)",
              padding: 30,
              borderRadius: 24,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <PatientArtwork />
          </div>
        ) : null}
        <div className="prose">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </section>
          ))}
        </div>
        <div className="form-actions">
          <ButtonLink href={page === "for-hospitals" ? "/start" : "/sign-in"}>
            {page === "for-hospitals"
              ? "Get started for hospitals"
              : "Get started"}
          </ButtonLink>
          <ButtonLink secondary href="/">
            Back to WithYou
          </ButtonLink>
        </div>
      </main>
    </>
  );
}

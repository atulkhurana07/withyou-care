"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  FileText,
  ShieldCheck,
  CalendarDays,
  Bell,
  Check,
  Users,
  ChevronDown,
  HeartHandshake,
  LockKeyhole,
} from "lucide-react";
import { Badge, Brand, ButtonLink } from "./ui";
import { MarketingArt } from "./marketing-art";
const stages = [
  {
    title: "A patient, welcomed.",
    text: "The hospital registers a patient and routes the visit to their doctor.",
    icon: Users,
  },
  {
    title: "Instructions, documented.",
    text: "The doctor writes the report once, using structured fields or clinical notes.",
    icon: FileText,
  },
  {
    title: "A plan, verified.",
    text: "Source-linked tasks are reviewed. Unclear instructions stay unpublished.",
    icon: ShieldCheck,
  },
  {
    title: "Care, connected.",
    text: "An approved report becomes a private daily schedule and timely reminders.",
    icon: Bell,
  },
];
export default function Marketing() {
  const [menu, setMenu] = useState(false);
  const [audience, setAudience] = useState("Doctors");
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setStage(Number((e.target as HTMLElement).dataset.stage));
      },
      { rootMargin: "-25% 0px -35% 0px" },
    );
    document
      .querySelectorAll("[data-stage]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <header className="site-header">
        <div className="nav-wrap">
          <Brand />
          <nav aria-label="Main navigation" className={menu ? "nav-open" : ""}>
            <details className="product-menu">
              <summary>
                Product <ChevronDown size={13} />
              </summary>
              <div>
                <Link href="/for-hospitals">WithYou Enterprise</Link>
                <Link href="/for-patients">WithYou Care</Link>
                <Link href="/design-system">Design system</Link>
              </div>
            </details>
            <Link href="/for-hospitals">For Hospitals</Link>
            <Link href="/for-patients">For Patients</Link>
            <Link href="#how-it-works" onClick={() => setMenu(false)}>
              How It Works
            </Link>
            <Link href="#pricing" onClick={() => setMenu(false)}>
              Pricing
            </Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="nav-actions">
            <Link className="sign-in" href="/sign-in">
              Sign in
            </Link>
            <ButtonLink href="/start">Get started</ButtonLink>
          </div>
          <button
            className="menu-button"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <h1>
              From your
              <br />
              doctor’s desk
              <br />
              to <span>your day.</span>
            </h1>
            <p className="hero-description">
              Digital medical reports, approved care schedules and timely
              reminders. Care that stays connected, even after you head home.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/start">Get started for hospitals</ButtonLink>
              <Link className="text-link" href="#how-it-works">
                See how it works <ArrowRight size={18} />
              </Link>
            </div>
            <div className="hero-assurance">
              <ShieldCheck size={17} />
              <span>Clinician-led. Patient-centered. With you.</span>
            </div>
          </div>
          <div className="hero-visual generated-hero">
            <MarketingArt asset="hero" preload />
            <div className="art-caption">
              A connected journey · Generated product illustration
            </div>
          </div>
        </section>
        <section
          className="overview-strip container"
          aria-label="Product capabilities"
        >
          <p>
            One platform.
            <br />
            <strong>Continuous care.</strong>
          </p>
          <div>
            <FileText />
            <span>
              Digital medical
              <br />
              reports
            </span>
          </div>
          <div>
            <ShieldCheck />
            <span>
              Clinician-approved
              <br />
              care schedules
            </span>
          </div>
          <div>
            <HeartHandshake />
            <span>
              A connected
              <br />
              patient experience
            </span>
          </div>
        </section>
        <section className="problem-section container">
          <div>
            <span className="eyebrow">BEYOND THE CONSULTATION</span>
            <h2>
              The appointment ends.
              <br />
              <span>Care continues.</span>
            </h2>
          </div>
          <div>
            <p className="large-copy">
              A report holds the instructions.
              <br />A day brings the questions.
            </p>
            <p>
              What comes next? When is the follow-up? Where is that report?
              WithYou connects what your doctor documents with the things you
              need to do, one clear step at a time.
            </p>
            <Link className="text-link" href="/for-patients">
              Meet your care companion <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
        <section className="products-section" id="product">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  TWO EXPERIENCES. ONE CONNECTION.
                </span>
                <h2>
                  Built for the people
                  <br />
                  on both sides of care.
                </h2>
              </div>
              <p>
                A focused workspace for providers.
                <br />A reassuring companion for patients.
              </p>
            </div>
            <div className="product-grid">
              <article className="enterprise-card">
                <span className="product-label">FOR HOSPITALS & DOCTORS</span>
                <h3>
                  WithYou Enterprise<span>↗</span>
                </h3>
                <p>
                  From patient registration to a published care plan. One
                  thoughtful workflow for your team.
                </p>
                <div className="product-mini generated-product">
                  <MarketingArt asset="enterprise" />
                </div>
                <Link className="text-link" href="/for-hospitals">
                  Explore Enterprise <ArrowUpRight size={18} />
                </Link>
              </article>
              <article className="care-card">
                <span className="product-label">FOR PATIENTS & FAMILIES</span>
                <h3>
                  WithYou Care<span>↗</span>
                </h3>
                <p>
                  Your reports, approved tasks and upcoming appointments. A
                  little more clarity in every day.
                </p>
                <div className="care-card-visual generated-product">
                  <MarketingArt asset="care" />
                </div>
                <Link className="text-link" href="/for-patients">
                  Explore the patient experience <ArrowUpRight size={18} />
                </Link>
              </article>
            </div>
          </div>
        </section>
        <section className="workflow-section container" id="how-it-works">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE CONNECTION THAT MATTERS</span>
              <h2>
                From prescription
                <br />
                to personal care.
              </h2>
            </div>
            <p>
              One clinical workflow.
              <br />A useful daily experience.
            </p>
          </div>
          <div className="workflow-layout">
            <div className="workflow-visual generated-workflow">
              <MarketingArt
                asset={
                  stage === 0
                    ? "hospital"
                    : stage === 1
                      ? "doctor"
                      : stage === 2
                        ? "workflow"
                        : "patient"
                }
              />
              <div className="workflow-image-caption">
                <span>0{stage + 1} / 04</span>
                <strong>{stages[stage].title}</strong>
                <small>Generated illustration · Synthetic screens</small>
              </div>
            </div>
            <div className="workflow-steps">
              {stages.map((s, i) => (
                <div
                  data-stage={i}
                  key={s.title}
                  className={`workflow-step ${stage === i ? "selected" : ""}`}
                >
                  <button
                    onClick={() => setStage(i)}
                    aria-pressed={stage === i}
                  >
                    <span>0{i + 1}</span>
                    <s.icon size={22} />
                    <h3>{s.title}</h3>
                  </button>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="showcase-section">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">A CLOSER LOOK</span>
                <h2>Clarity, at every step.</h2>
              </div>
              <div
                className="tabs"
                role="tablist"
                aria-label="Product previews"
              >
                {["Doctors", "Hospitals", "Patients"].map((a) => (
                  <button
                    role="tab"
                    id={`tab-${a}`}
                    aria-controls="showcase-panel"
                    aria-selected={a === audience}
                    key={a}
                    onClick={() => setAudience(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div
              id="showcase-panel"
              role="tabpanel"
              aria-labelledby={`tab-${audience}`}
              className="showcase-panel generated-showcase"
            >
              <MarketingArt
                asset={
                  audience === "Patients"
                    ? "patient"
                    : audience === "Hospitals"
                      ? "hospital"
                      : "doctor"
                }
              />
              <div className="showcase-copy">
                <div>
                  <h3>
                    {audience === "Patients"
                      ? "Your day, a little clearer."
                      : audience === "Hospitals"
                        ? "A connected team. A clear next step."
                        : "Review thoughtfully. Publish confidently."}
                  </h3>
                  <p>
                    {audience === "Patients"
                      ? "Authorized reports and approved tasks, close at hand."
                      : audience === "Hospitals"
                        ? "Registration, encounters and report delivery in one shared workflow."
                        : "Original instructions and proposed tasks, reviewed together."}
                  </p>
                </div>
                <Link
                  className="text-link"
                  href={
                    audience === "Patients" ? "/for-patients" : "/for-hospitals"
                  }
                >
                  Explore{" "}
                  {audience === "Patients" ? "WithYou Care" : "Enterprise"}{" "}
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
            <p className="showcase-caption">Product illustrations</p>
          </div>
        </section>
        <section className="safety-section container">
          <div>
            <span className="eyebrow">THOUGHTFUL BY DESIGN</span>
            <h2>
              Thoughtful technology.
              <br />
              <span>Clinician-led care.</span>
            </h2>
            <p>
              AI helps organize what’s documented.
              <br />
              Your doctor decides what reaches your day.
            </p>
            <Link className="text-link" href="/how-it-works">
              Understand the approval process <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="safety-grid">
            {[
              {
                icon: ShieldCheck,
                title: "Reviewed before it’s shared",
                text: "Patient schedules need an authorized clinician’s approval.",
              },
              {
                icon: FileText,
                title: "Every task has a source",
                text: "Instructions link back to the report that created them.",
              },
              {
                icon: LockKeyhole,
                title: "Access with permission",
                text: "Records are available through authenticated, authorized access.",
              },
              {
                icon: Bell,
                title: "Uncertainty stays visible",
                text: "Missing or ambiguous details require clarification.",
              },
            ].map((s) => (
              <article key={s.title}>
                <s.icon size={24} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="pricing-section" id="pricing">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">START WITH YOUR TEAM</span>
                <h2>
                  A workspace for
                  <br />
                  your kind of care.
                </h2>
              </div>
              <p>
                Start with a conversation.
                <br />
                Commercial pricing is being finalized.
              </p>
            </div>
            <div className="pricing-grid">
              {[
                {
                  name: "Clinic",
                  label: "For a focused practice",
                  features: [
                    "Patient registration",
                    "Digital medical reports",
                    "Approved care schedules",
                  ],
                },
                {
                  name: "Hospital",
                  label: "For connected clinical teams",
                  features: [
                    "Everything in Clinic",
                    "Staff roles & permissions",
                    "Follow-up workflows",
                  ],
                },
                {
                  name: "Enterprise",
                  label: "For growing organizations",
                  features: [
                    "Multi-branch requirements",
                    "Integration discovery",
                    "Onboarding planning",
                  ],
                },
              ].map((p, i) => (
                <article className={i === 1 ? "featured" : ""} key={p.name}>
                  <div className="row">
                    <span className="plan-icon">
                      {i === 0 ? (
                        <HeartHandshake />
                      ) : i === 1 ? (
                        <Users />
                      ) : (
                        <ShieldCheck />
                      )}
                    </span>
                    {i === 1 && <Badge>For teams</Badge>}
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.label}</p>
                  <strong className="plan-price">Talk to us</strong>
                  <span className="tiny">A plan shaped around your needs</span>
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}>
                        <Check size={16} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    href={`/start?plan=${p.name}`}
                    secondary={i !== 1}
                  >
                    Get started
                  </ButtonLink>
                </article>
              ))}
            </div>
            <p className="pricing-note">
              Create your organization account. Commercial terms are confirmed
              before paid billing begins.
            </p>
          </div>
        </section>
        <section className="faq-section container">
          <h2>
            A few things
            <br />
            you might be wondering.
          </h2>
          <div>
            {[
              {
                q: "Does WithYou make medical decisions?",
                a: "No. WithYou organizes documented instructions. An authorized clinician reviews and approves patient tasks before publication.",
              },
              {
                q: "Do patients need a separate app for each hospital?",
                a: "The product is designed around one patient experience. Provider records must be linked through verification and permission, never automatically merged by name or phone.",
              },
              {
                q: "Can a patient use ordinary hospital services without the app?",
                a: "Yes. Optional app invitations and notifications do not determine access to treatment. An approved report can still be printed.",
              },
              {
                q: "Can I try the workflow?",
                a: "Create an organization account to begin setup. Administrators manage workspace preferences; authorized clinicians review and publish care plans. Communication availability depends on your organization's configuration.",
              },
            ].map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <ChevronDown size={18} />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-cta container">
          <div className="eyebrow">YOUR HEALTH JOURNEY. WE’RE WITH YOU.</div>
          <h2>
            Make every care
            <br />
            instruction count.
          </h2>
          <p>
            Bring your clinical workflow and your patient’s day closer together.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/start">Start WithYou Enterprise</ButtonLink>
            <ButtonLink secondary href="/for-patients">
              Explore WithYou Care
            </ButtonLink>
          </div>
          <span className="cta-decoration" aria-hidden="true">
            ↗
          </span>
        </section>
      </main>
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Brand dark />
            <p>
              From your doctor’s desk to your day.
              <br />
              Care that stays connected.
            </p>
          </div>
          <div>
            <strong>Product</strong>
            <Link href="/for-hospitals">WithYou Enterprise</Link>
            <Link href="/for-patients">WithYou Care</Link>
            <Link href="/how-it-works">How it works</Link>
          </div>
          <div>
            <strong>Company</strong>
            <Link href="/contact">Contact</Link>
            <Link href="/design-system">Design system</Link>
            <Link href="/sign-in">Sign in</Link>
          </div>
          <div>
            <strong>Information</strong>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/#pricing">Plans</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 WithYou. Your health journey. We’re with you.</span>
          <span>WithYou · Connected care</span>
        </div>
      </footer>
    </>
  );
}

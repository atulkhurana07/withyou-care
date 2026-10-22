# Requirements audit and traceability

Historical implementation review. Later updates supersede individual pending-feature statements below: use [the workflow audit](workflow-production-audit.md), [prescription/appointment flow](prescription-appointment-flow.md), [validation record](validation.md) and [GitHub readiness](github-readiness.md) for the latest status.

Source documents: `aayu_hackathon.prd.md` (PRD v2.0), `design.md.md` (master design v1.0), `WithYou_logo.png`. Reviewed 13 October 2026.

## Initial project state

The folder contained the two specifications and one original logo. There was no existing application, dependency manifest, database or Git checkout. The implementation follows the prescribed Next.js/React/TypeScript/Tailwind web stack and Flutter/Dart patient stack. No existing application stack was replaced.

## Resolved inconsistencies and implementation choices

| Topic | Source difference or gap | Resolution |
|---|---|---|
| Backend | PRD §18 recommends FastAPI/PostgreSQL; design §13 requests Firebase emulators and a Next.js server layer | Use the concrete local-development design for the synthetic prototype. Preserve a checked server boundary; production database choice remains open |
| Palette | PRD §21 uses #126E69/#102C3A; design §3 proposes #0D6E68/#0B3438 | Use companion design values consistently, retain original blue/green logo colors, add blue focus/supporting token, darken warning text |
| Hero copy | PRD marketing copy differs from design's detailed hero | Use “From your doctor's desk to your day” from the phase-one creative brief; retain PRD clinical meaning and both audiences |
| Hero CTAs | Design §1 uses Explore Enterprise / See How It Works; §8 uses Get Started / Explore Patient App | Primary hospital onboarding CTA and secondary workflow action; patient entry appears in navigation, product cards and final CTA |
| Asset filenames | Suggested SVG/logo variants do not exist | Use the actual original PNG; do not invent vector or light variants |
| Pricing | Named plans exist, but commercial prices and trial terms are not finalized | Show Talk to us; provide explicitly synthetic, no-charge demo activation with no paid entitlement |
| Invitation onboarding | PRD and design list identity verification and password setup in different screen orders | Authenticate the pre-verified synthetic patient before claiming; do not expose records from a token alone. General new-user activation is pending |
| State terminology | PRD/companion use both finalized/published and verified/approved | Candidate verified is distinct from a report published/approved; publication is one atomic demo transition with a stored version |
| Monorepo | Separate website/enterprise directories are suggested, not required | Public site, operational portal and API share one Next.js app under `apps/website`, with distinct routes and shared components; Flutter remains a separate app |
| Support access | Platform owner/admin can manage organizations but not automatically read clinical content | Administrator has organization setup only; clinical data is withheld from its workspace response |
| Reminder timing | Twice-daily frequency is not a clock schedule | Require exact clinician-entered times, create separate dated occurrences and never fill missing timing |
| Scope | Design phases 1A–1E are much larger than a design-system edit | Deliver the design foundation and a working bounded synthetic workflow; list every material incomplete integration below |

## Requirement coverage

“Implemented” means present in source and locally exercised where listed in validation. “Partial” does not mean full PRD acceptance.

| Requirement | Source | Status | Implementation / limit |
|---|---|---|---|
| Original logo, cohesive tokens, Manrope, responsive layouts | Design §§2–5, 9 | Implemented | Original raster, token source, reusable components, generated Flutter theme |
| Public navigation, product/benefit story, real UI mockups, workflow showcase | Design §8 / PRD §22 | Implemented | Public website, provider/patient pages, interactive tabs/story, FAQ, footer |
| No fabricated trust claims or prices | Design §22 | Implemented | Synthetic labels, no claimed customers/certifications/outcomes |
| Motion and reduced-motion support | Design §6 | Implemented | Purposeful entries, story stages, native scrolling and reduced-motion CSS |
| Configured plan selection and organization form | Design §10 / PRD §4 | Partial | Demo plan selection, validated registration and Firestore tenant creation; no commercial offer |
| Checkout/payment verification | Design §10.4 | Pending | No Razorpay SDK, keys, test payment or captured charge |
| Workspace setup wizard | Design §10.7 / PRD §5 | Partial | Profile from registration, department, language, timezone and template persisted. Staff invitations, branches, signatures and communication settings pending |
| Role-specific receptionist, doctor and admin surfaces | PRD §§3, 14 | Implemented, bounded | Actual seeded Firebase identities and server permissions. No nurse/caregiver/platform-owner flows |
| Patient registration and duplicate review | PRD §6 | Implemented | Distinct patient/encounter IDs, explicit duplicate confirmation; optional invitation consent |
| Visit creation and doctor assignment | PRD §6 | Partial | Registration creates an encounter assigned to the demo doctor. Full appointment calendar and separate visit creation pending |
| Structured medical report entry | PRD §7 | Partial | Medication, free-text notes and date-specific follow-up. Full assessments, investigations, warning signs, templates and uploaded OCR pending |
| AI interpretation with source mapping | PRD §9 | Partial | Validated vendor-neutral server adapter. No approved live provider configured; offline notes stay blocked and are not represented as AI |
| Review, correction, rejection, approval gate | PRD §10 | Implemented, bounded | Medication correction, before/after audit source, transaction locking; arbitrary care-task clarification editor pending |
| Report finalization and printable PDF | PRD §8 | Partial | Version, patient, encounter, author/time, approved instructions and source; basic PDF. Full branded templates and Unicode medical-document support pending |
| New versions and superseded schedules | PRD §§8.3, 10.5 | Implemented, bounded | Monotonic per-patient version, immutable approved reports, historical reports retained, outstanding tasks superseded. Patient plan-update notification pending |
| Task schedule and completion tracking | PRD §11 | Implemented, bounded | Dated daily medication occurrences and one-time follow-up. Limits: four times/day, 30 days, 200 tasks/plan. Weekdays/advanced recurrence pending |
| Secure patient invitation | PRD §12 / design §15 | Partial | Hash at rest, 24h expiry, one-time claim, permission and pre-linked identity checks; general new-user verification/password setup and native deep links pending |
| Flutter Today/Schedule/Reports/Profile | PRD §13 / design §12 | Implemented, bounded | Real Flutter source and compiled web preview, shared authenticated API, reports, tasks and completion |
| Follow-up reminder | PRD §13 | Partial | Approved follow-up task and neutral in-app reminder preview; scheduled device push/local notification pending |
| Email/WhatsApp delivery | PRD §12 / design §14 | Pending | Local invitation preview only; status remains created, never sent/delivered |
| Patient offline behavior and notification preferences | PRD §13 | Pending | Network errors surface; no record cache, retry queue or operating-system permission flow |
| Tenant and assigned-patient isolation | PRD §16 | Implemented, bounded | Server membership/tenant/assignment checks; deny-all client rules; access tests. Not a full penetration test |
| Backend subscription entitlement | PRD §4 | Partial | Active/trial checks for staff; no commercial billing lifecycle |
| Audit trail | PRD §§10.4, 16.9 | Partial | Local write events for clinical/registration/invitation/task actions; tamper-resistant production audit infrastructure pending |
| Legal/privacy/ABDM/compliance | PRD §§17, 32 | Pending production discovery | Development disclosures only; no unsupported compliance claim |
| Performance and accessibility targets | Design §20 | Measured scope only | See validation report. Automated results are not universal conformance or field performance |

## Route coverage

Working public routes: `/`, `/for-hospitals`, `/for-patients`, `/how-it-works`, `/pricing`, `/contact`, `/privacy`, `/terms`, `/design-system`. Authentication: `/sign-in`, `/accept-invitation`. `/start` runs the in-page demo activation steps; `/start/*` uses the same flow, not independent resumable steps. The portal implements overview, patients/new/profile, reports/new/review, review queue, communications and admin settings. `/care` is an additional web companion for checking shared patient state.

Separate appointment, care-plan, team, billing and notification-center pages, password reset, and all independent B2C self-service features remain unimplemented. Unknown public pages return a real not-found screen; unavailable portal routes display a role-appropriate unavailable state.

## MVP conclusion

The design system and bounded synthetic clinician-to-patient workflow are usable and reviewable. The complete PRD §33 definition of done is **not claimed**: live AI extraction is unconfigured, notification delivery is simulated, general patient activation is pending, and native Android/device behavior has not been fully validated. This distinction is intentional evidence of actual scope, rather than a visual claim that all services exist.
# Provider update — 13 October 2026

The owner supplied Firebase Cloud web configuration, Resend and Gemini keys. Read-only checks succeeded for all three. Gemini 3.5 Flash-Lite is now implemented as the server extraction provider and passed a live fixed-fictional-input test; local validation and clinician publication gates remain mandatory. Patient-note transmission is disabled until an appropriate data-processing arrangement is approved, because Google's unpaid services exclude sensitive/personal information. Firebase server credentials and a verified Resend sending domain are still missing. The staged cloud configuration is private and inactive. Earlier statements below about no live provider refer to the earlier audit; current setup and remaining flow work are recorded in `docs/live-setup-guide.md`.


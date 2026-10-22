# Validation results

Validated locally on 13 October 2026 against the production Next.js build and the `demo-withyou` Firebase emulators.

## Executed checks

| Check | Result | Evidence / scope |
|---|---|---|
| Next.js production build | Pass | App routes compile and TypeScript completes successfully |
| TypeScript check | Pass | Strict application type checking |
| Clinical/extraction tests | 9 passed | Approval gate, source preservation, missing timings, conditional medicines, date boundaries, duplicate candidates, provider absence/failure |
| Browser integration tests | 4 passed | Registration/duplicate gate, tenant isolation, clinical corrections, locked reports, invitation replay prevention, compiled Flutter, public website and full clinician-to-patient workflow |
| Responsive landing page | Pass | No document overflow at 360, 390, 768, 1024 and 1440px |
| Automated accessibility | Pass in tested states | Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA scans on landing and care pages |
| Flutter analysis | Pass | No analysis issues after formatting and cleanup |
| Flutter widget test | 1 passed | Clinical information and care navigation stay behind authentication |
| Flutter web build | Pass | Compiled actual Flutter app, not a web reimplementation |
| Flutter integration | Pass | Sign-in, shared approved report/tasks, completion and neutral reminder preview against the common backend |
| Printable PDF | Pass, bounded | Header and original logo, synthetic identity, organization, encounter, version, approval, instructions and source; rendered with Poppler and visually inspected |
| Original application logo preservation | Pass | Web and Flutter retain the original copied asset. The workspace root logo now differs from those copies; this image-replacement task did not modify or overwrite any logo files |
| Production dependency audit | 0 advisories | `npm audit --omit=dev` at time of validation |

The browser tests use synthetic records and may leave additional registrations/reports in the emulator. No real messages or payments were submitted.

## Mobile Lighthouse

Production build, Chrome 154 headless on Windows, Lighthouse 13.5, default simulated mobile conditions. Full raw report: `docs/lighthouse-mobile.json`.

| Metric | Result | Documentation target |
|---|---|---|
| Performance | 95 | 90+ |
| Accessibility | 100 | 95+ |
| Best practices | 100 | No fixed score specified |
| SEO | 100 | No fixed score specified |
| Largest Contentful Paint | 3.0 seconds | 2.5 seconds or better; current imagery run is above this target |
| Cumulative Layout Shift | 0 | 0.1 or better |
| Total Blocking Time | 20ms | Lab diagnostic, not INP |
| Speed Index | 0.8 seconds | Lab diagnostic |

An earlier run measured 74 performance / 98 accessibility. Font, favicon, animation and semantic improvements brought the code-only version to 98 performance / 100 accessibility with 2.4-second LCP. After adding the requested seven GPT-generated image assets, the measured result is 95 performance / 100 accessibility with 3.0-second LCP. The performance score remains above the 90 target, while this run's LCP exceeds the 2.5-second target. The table records the current image-based page, not the earlier version.

INP has not been measured from field usage. A single local Lighthouse run does not establish production performance, uptime or full accessibility conformance.

## Visual evidence

`docs/screenshots/` contains desktop/mobile marketing, clinical review, web patient care, Flutter Today and Flutter reminder screenshots. `generated-home-desktop.png`, `generated-home-mobile.png` and `generated-landing-desktop.png` show the latest generated-image layout. The illustrative public images are distinct from the functioning operational screens. Internal fixtures and development documentation identify synthetic test data; website account screens use ordinary organization labels. All four browser integration tests also passed after the image replacement, with a further landing-only pass after obsolete-style cleanup.

## Meaningful verification limits

- Native Android execution was not completed. The installed Android toolchain reports outstanding SDK license acceptance and no connected Android device. No licenses were accepted on the user's behalf.
- Device push/local notifications, native invitation app links, general patient verification/password setup, email/WhatsApp delivery, Razorpay checkout, nurse/caregiver flows and offline synchronization remain pending.
- The server-side AI extraction adapter is implemented and fails closed, but no live clinical extraction provider is configured or validated. Its default offline fallback is not AI.
- The basic PDF is for English synthetic data. Full Unicode medical-document templates and legally appropriate prescribing signatures require a separate implementation.
- The development dependency audit has 19 advisories (10 high, 9 moderate) across retained emulator/audit tooling and transitive packages; see `docs/dependency-audit.json`. Runtime production dependencies reported zero. Firebase CLI 14 is retained because the available runtime is Java 17; upgrading that tooling requires a compatible JDK and renewed emulator checks.
- Access-control checks and tests cover the implemented API and demo roles. This is not a penetration test or a claim of clinical, privacy or regulatory certification.

See `docs/requirements-audit.md` for the complete feature-by-feature coverage and unresolved requirements.

## Organization and subscription update — 13 October 2026

The production build and TypeScript check passed. All 10 unit tests and all 5 browser integration tests passed. A further checkout-specific pass confirmed a 390px layout without horizontal overflow, automated WCAG A/AA checks on the card and success screens, rejection of raw card fields by the API, repeat activation without changing subscription start time, and reload recovery into workspace setup. Existing clinical, PDF, invitation, role isolation and Flutter tests also passed after removing website role shortcuts.

The new account flow provisions an independent organization and administrator, persists a zero-charge development subscription, and animates success only after the activation transaction completes. Cloud mode cannot enable development activation, uses verified emails and Firebase session cookies, and supports a Resend verification submission adapter. Cloud authentication/email delivery have not been exercised with real credentials. The complete credential instructions and outstanding production implementation are in `docs/live-setup-guide.md`.

Visual evidence: `subscription-card-mobile.png` and `subscription-active.png`. Automated accessibility results do not establish full accessibility conformance. Git status could not be read because the existing `.git/index` reports a mapping error; the repository index was not modified or repaired.

## Provider configuration — 13 October 2026

Later development-mode update: the server credential was saved and validated. Read-only Firebase Authentication access succeeded; cloud Firestore returned HTTP 403 `SERVICE_DISABLED`. The cloud credential pointer is staged privately, and local emulator mode remains active as requested. `EMAIL_MODE=local` now writes account welcome previews under the ignored private `.local-mail/` directory without contacting Resend; it rejects cloud mode. The production build, 12 unit tests and signup/checkout browser test passed, including a check that signup produced its local preview. No domain or external email delivery is required for this development flow. Earlier missing-credential statements below describe the preceding check.

Firebase project-config lookup, Gemini model discovery and Resend domain lookup returned HTTP 200 using the supplied credentials. The selected stable `gemini-3.5-flash-lite` model is available to this key and passed a live extraction test using one fixed fictional medication instruction. No patient records were loaded, no email was sent, and no real cloud organization was created. Resend returned no verified domains; Firebase application-default credentials are not configured. The cloud environment is staged in an ignored private file and is not active.

The production build, TypeScript check, 11 unit tests and all 5 browser integration tests passed after the provider change. Unit tests include Gemini source preservation, prohibition of automatic approval, the data-processing configuration gate, incomplete response handling, missing explicit timings, invented values/source and HTTP 429 handling. Both private environment files were confirmed ignored, and a scan found neither Gemini nor Resend secret values in the built public browser assets. The model is free-tier eligible according to current Google pricing; account billing status and actual quota were not independently established. Application notes remain blocked from external Gemini transmission until an appropriate data arrangement is approved. See `docs/live-setup-guide.md` for exact setup steps and primary sources.

## Full workflow and Android update — 13 October 2026

This section supersedes earlier statements about missing team/patient activation, password recovery, Hindi printing, SDK license status and native execution. The earlier sections are historical run records.

- Next.js production build and TypeScript check passed; 14 server/unit tests and all 7 browser integration tests passed in the final complete run.
- Flutter analysis returned no issues, and all 5 tests passed, including large text/private welcome and reminder eligibility, invalid dates/times and scheduling bounds. Both web compilation and Android debug APK compilation passed.
- Android SDK licenses were already accepted when checked. A headless Android 36 emulator was provisioned; the latest debug APK was installed and executed. Synthetic patient sign-in loaded the shared approved care plan. Today, Schedule, Reports and Profile navigation was checked against actual native accessibility controls and screenshot evidence.
- Android notification permission, a neutral OS confirmation notification, and cancellation on disabling passed. Scheduling uses approved outstanding times in Asia/Kolkata for the next 24 hours, at most 200 inexact alarms. Future alarm delivery, physical-phone behavior, background plan replacement and remote FCM are not established by these checks.
- New organization integration covers owner/activation, own staff accounts, clinician profile attestation, recipient mismatches/replay/revocation, patient registration/contact verification, draft revisions/conflicts, multiple medicines, repeat visits, publication, new patient account linkage, PDF authorization and disabled staff denial.
- The doctor editor now restores encounter-scoped server drafts; debounced serialized saves use revisions and preserve audit/history. Changing patient waits for the previous save and blocks editing until the new draft is loaded. Concurrent revisions fail explicitly.
- Hindi/Latin PDF fixture was rendered and visually inspected. Unsupported characters fail explicitly rather than silently disappearing. Clinical signature/full template approval remains outstanding.
- Native screen evidence is in `docs/screenshots/android-{today,schedule,reports,profile}.png`. The copied debug binary is `output/mobile/withyou-care-development.apk`, configured for the emulator's host bridge `http://10.0.2.2:3000`. It is not a signed store release or a build for a standalone physical phone.
- Production preflight reports `configurationReady: false` for the intentionally active local environment. Firebase server access was verified read-only; cloud Firestore is disabled. No external email or real cloud clinical record was created by these validation runs.

See `docs/workflow-production-audit.md` for all 35 reviewed steps, overhead, primary research and remaining requirements. Large-clinic pagination, complete PRD clinical templates/schedules, privileged MFA, native secure persistent sessions, app links, remote/background messaging, encrypted offline handling, cloud staging, operational recovery and organizational clinical/privacy approval remain release gates.

## Patient upload → review → appointment update — 13 October 2026

Added the fifth Flutter navigation destination, Requests, plus the doctor/receptionist web Prescription requests queue. The [workflow implementation and research](prescription-appointment-flow.md) records the diagram/PRD difference, real state transitions, overhead and remaining integration limits.

Final web build and TypeScript compilation passed. All 17 unit/server tests and all 9 browser integration tests passed together after the update. New checks cover upload signatures, image metadata removal, invalid/tiny images, active/encrypted/over-page PDF restrictions, duplicate handling, protected source downloads, patient/staff permissions, clarification and confirmation, revision conflicts, booking prerequisites, allocated-slot conflicts, cancellation and the connected Flutter Requests tab. Flutter analysis is clean; five Flutter tests and Android debug/web compilation passed.

The proposed Gemini document-reading adapter is implemented and mocked contract/gate tests pass. A live fictional PDF reading received HTTP 503/high demand and another request timed out. Live OCR success and clinical correctness are not claimed. Application patient-document transmission remains blocked by the existing data-processing approval flag; manual clinician review is operational. No new cloud record or external confirmation message was created during these tests.

The Android Requests screen and native file picker were inspected. Returning from the picker exposed a transient screen-state loss; a stable keyed screen now preserves the pending selection across foreground refresh. Request records reload when the provider changes the patient's activity revision. Updated emulator upload results are recorded below.

Additional replacement test passed: a clearer upload is linked to its own clarification request, marks the prior request replaced, retains its revision history and starts the new document in clinician review. Tests now use isolated synthetic patient identities so repeated runs do not consume another fixture's upload quota.

Native upload rerun passed after installing the explicit main-entry APK: Android document picker → selected filename preserved after resume → patient ownership/consent → authenticated private upload → actual server success acknowledgement. Evidence: `docs/screenshots/android-prescription-uploaded.png`. The earlier interrupted attempt was not counted as a pass. The updated binary is saved under `output/mobile/withyou-care-development.apk`.

Final combined browser rerun: all 10 integration tests passed, including linked replacements, isolated patient upload quotas, booking conflicts and the Flutter Requests destination. Native authenticated submission also passed and its success screenshot was visually inspected. Earlier interrupted native runs and rate-limited shared-fixture attempts are superseded by these explicit successful checks.

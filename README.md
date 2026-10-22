# WithYou

From your doctor's desk to your day.

A local, synthetic-data healthcare workflow prototype built from `aayu_hackathon.prd.md` and `design.md.md`. The supplied documents and logo are preserved. This repository originally contained those three assets and no application code.

## What is implemented

- Responsive marketing website, provider/patient pages, interactive workflow story, product previews, plans, FAQ and contact/information pages.
- Shared design tokens, Manrope typography, reusable web components and a generated Flutter Material 3 theme.
- Seven GPT-generated marketing image assets replace the former drawn product mockups. See [image placements and prompts](docs/marketing-images.md); generated screens and people are clearly illustrative.
- Separate organization/owner registration, saved development subscription activation with a card screen and success animation, reload recovery and basic department/template setup. No charge or payment collection; activation is disabled in cloud mode.
- Firebase Cloud configuration and server session-cookie support, plus verification, invitation and recovery mail adapters. Credentials passed read-only provider checks; full cloud operation remains blocked by disabled Firestore and missing verified sender/domain.
- Firebase Authentication emulator accounts with server-enforced organization, role and assigned-patient access.
- Receptionist registration, duplicate-review gate, encounter creation and doctor assignment.
- Doctor structured prescription and follow-up entry, source comparison, correction, verification/rejection and transactional approval.
- Versioned report publication, printable PDF, daily task occurrences and supersession of outstanding prior tasks.
- Team invitations, recipient-bound account creation/acceptance, revocation, staff access controls and clinician verification profiles. New organizations can provision their own clinical team and invite new patient accounts.
- Encounter-scoped server draft autosave with conflict detection, repeat visits, multiple medicines and Hindi/Latin PDF output.
- Web care and Flutter Today/Schedule/Reports/Profile screens share approved records and completion/skip/undo. Android reminders require permission, contain neutral text, and cancel on refresh, disabling or sign-out. Android debug execution has been validated on an emulator.
- Server-side Gemini structured extraction adapter with validation, source checks, storage disabled and mandatory clinician approval. The supplied key and stable Gemini 3.5 Flash-Lite passed a live fictional-input test. Patient-note extraction remains blocked pending an appropriate provider/data arrangement; manual structured entry remains usable.

The [35-step workflow audit](docs/workflow-production-audit.md) records requirements, implementation, costs, evidence and remaining release gates. The full PRD and production clinical acceptance are not complete.

For the real launch, follow [the exact account and credential setup guide](docs/live-setup-guide.md). It separates credentials from implementation still needed and explains why the existing Firebase emulators are not a cloud account. Payment-provider setup is deferred as requested.

For the current local development request, no domain is needed. `EMAIL_MODE=local` stores new-account welcome email previews privately under `apps/website/.local-mail/`; no external message is sent. Keep Firebase emulators and development checkout enabled. Cloud credentials and verified sender-domain requirements apply only when switching environments.

## Run locally

Validated toolchain: Node **24.14.0** (`.nvmrc`), Java **17** for Firebase CLI 14, Flutter **3.47.2** and Dart **3.13.2**. Android SDK 36 is used for native development. No cloud account or secrets are required for the local synthetic-data flow.

From the repository root:

```powershell
npm ci
Copy-Item apps/website/.env.example apps/website/.env.local
npm run emulators
```

Copy the environment example only on first setup; keep an existing private environment file intact. The emulator launcher starts fresh when no export exists and imports `firebase/data/` on later launches after a successful shutdown/export. Both the export and private credentials remain ignored by Git.

In another terminal, once emulators report ready:

```powershell
npm run seed
npm run dev
```

Open [WithYou](http://127.0.0.1:3000), [demo sign-in](http://127.0.0.1:3000/sign-in), [design system](http://127.0.0.1:3000/design-system) or [Firebase emulator UI](http://127.0.0.1:4000).

All demo accounts use the password `WithYouDemo2026!`. These accounts exist only in the authentication emulator.

| Role | Email |
|---|---|
| Receptionist | reception@withyou.test |
| Doctor | doctor@withyou.test |
| Administrator | admin@withyou.test |
| Patient: Kamla Devi | patient@withyou.test |

Enter the account credentials directly; the server determines membership after Firebase authentication. The seed restores local fixture memberships and preserves an existing Kamla registration. Organization activation can associate the fixture administrator with a new local tenant; rerun the seed to restore its original membership.

The emulators bind only to loopback. Medical records are stored in one shared Firestore environment, never in browser local storage. Clean emulator shutdown exports its database to the ignored `firebase/data/` directory; the next start imports it. Emulator mode rejects non-`demo-` Firebase project IDs; cloud mode requires a real project and separately validated configuration. Direct Firestore/Storage client access is denied; clinical operations use the checked server API.

## Flutter preview

```powershell
cd apps/patient-mobile
flutter pub get
flutter build web --base-href /care-app/
cd ../..
node scripts/prepare-mobile-preview.mjs
```

Open [the compiled Flutter app](http://127.0.0.1:3000/care-app/index.html) while the web server and emulators are running. The generated preview is ignored by Git and can be rebuilt. This Flutter preview runs on the same origin as the web API; it uses the same approved records and task completion state.

For Android development on a connected device, forward the API port rather than exposing the emulators:

```powershell
adb reverse tcp:3000 tcp:3000
cd apps/patient-mobile
flutter run --dart-define=API_BASE=http://127.0.0.1:3000
```

The debug Android manifest permits local HTTP. The emulator build uses `API_BASE=http://10.0.2.2:3000`; a physical phone uses the forwarding instructions above. Production signing requires a private keystore, and there is no debug-signing fallback. Native app links, remote push, encrypted offline behavior, persistent secure sessions and physical-phone QA remain release work. Session tokens stay in memory; sign in again after expiry or app restart.

## Demonstrate the workflow

1. Sign in as Receptionist. Register a **synthetic** patient and review the generated encounter. The seeded Kamla Devi identity is the record connected to the patient demo account.
2. Sign in as Doctor. Open Kamla Devi and create a report. Use clearly synthetic medicine details, explicit daily frequency, dates and authorized times; optional notes remain blocked when extraction is unconfigured.
3. Compare each candidate with its source. Edit incomplete fields, verify valid candidates and reject unsupported items. Publication stays disabled until all items are resolved.
4. Approve and publish. View the finalized PDF. Creating and approving a subsequent report replaces the previous plan while retaining its historical record.
5. Sign in as Receptionist. Open Kamla Devi and create an invitation preview. Its status is `created`, not sent or delivered. Copy the link.
6. Open the invitation and create or sign into the intended recipient's own account. A single-use transaction links the account to exactly the invited patient. Names and phone similarity never establish identity. Cloud requires verified email.
7. Open Care or the compiled Flutter app. View the approved source report, complete a task and refresh the other client to see shared state. On Android, Profile provides an explicit reminder permission choice.

Default scheduler limits: explicit daily medication frequency, at most four times per day, up to 30 days, and at most 200 occurrences per approved plan. Conditional medicines remain blocked; weekly schedules, investigations, independent personal tasks and general care-task editing are pending.

## Validation

```powershell
npm run tokens
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
cd apps/patient-mobile
flutter analyze
flutter test
flutter build web --base-href /care-app/
```

Browser tests require the web server, seeded emulators and compiled Flutter preview. They cover responsive widths, accessible interactions, clinical approval, PDF output, role restrictions, tenant isolation, invitation replay prevention, daily scheduling and Flutter authentication/completion. The tests create synthetic records in the local emulator.

Production dependencies have a separate audit check: `npm audit --omit=dev`. Firebase CLI 14 is retained for the available Java 17 runtime; its development dependency advisories must be reviewed before promoting the tooling. Do not use `npm audit fix --force` without checking the resulting Java requirement and emulator behavior.

See [design system](docs/design-system.md), [research](docs/research.md), [coverage](docs/requirements-audit.md) and [validation results](docs/validation.md).

## GitHub preparation

Run `npm run check:repository` before committing. It checks the repository root, private/generated paths, file sizes and selected secret patterns; it does not certify security or inspect old history. Keep environment files, Firebase credentials, emulator records, outbox messages and signing keys private. APKs are ignored; distribute reviewed development builds as GitHub Release assets with their local-server requirements explained.

The GitHub workflow checks repository hygiene, server tests, website typing/build, Flutter analysis/tests (including the private-network build flag) and Flutter web compilation. Browser/native workflows require separate running-backend tests and are not included in that workflow. The workflow's first remote run happens after upload.

See the [GitHub readiness and remaining launch work](docs/github-readiness.md). GitHub stores source; deploying the live Next.js API and mobile production service is a separate step. The project has no selected reuse license yet; bundled fonts retain their included license files.

## Patient-submitted prescription and booking flow

Flutter now includes **Requests** for private photo/PDF upload, clinician clarification, patient reading confirmation and appointment preference/confirmation. The web portal includes **Prescription requests** for assigned doctors and reception staff. See [implementation/research](docs/prescription-appointment-flow.md).

Local upload validation and protected Firebase Storage emulator objects are implemented. Cloud uploads require a separate approved malware-scanning pipeline and remain blocked. Gemini document transcription is proposed source text only, gated by the approved data arrangement; live synthetic testing encountered provider high demand. No autonomous prescription safety approval, drug-interaction check, medication task generation or external confirmation delivery is implied.

# WithYou: accounts needed for a real launch

## Current development mode — no domain needed

The owner wants to run locally for now. Keep `FIREBASE_MODE=emulator`, `DEVELOPMENT_CHECKOUT=true` and `EMAIL_MODE=local` in `apps/website/.env.local`. Organization signup, saved checkout activation and workspace setup do not require a domain, sender address or Firebase server key in this mode. Resend credentials stay saved for later use; no external email is sent. Welcome email previews from new registrations are written privately to `apps/website/.local-mail/` when the website runs through the root npm script. These ignored files are developer evidence, not inbox delivery, and contain no password. They are not served through the public website.

The alternative [Resend testing domain](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain) can send to the Resend account owner's email only. Other recipients need a verified domain. This limitation belongs to Resend, not to running the website on localhost. A production domain is unnecessary for the current local workflow.

The cloud setup instructions below apply when cloud testing or launch is requested. Do not replace the running environment with the staged cloud file merely to test local signup or subscription.

The running application uses `demo-withyou`: local Authentication, Firestore and Storage emulators. The owner has provided Firebase web configuration and a valid server credential for `withyou-ef85d`, a Resend key and a Gemini key. Read-only checks confirmed Firebase server Authentication access, and the other keys passed their provider checks on 13 October 2026. Cloud Firestore returned `SERVICE_DISABLED`; enable the Cloud Firestore API and create/configure the database before requesting cloud operation. The real project configuration is staged privately; local mode remains active. Resend has no verified sending domain, which is unnecessary for local email previews. Cloud mode rejects emulator endpoints and requires verified account emails. The current subscription screen is a development activation flow, persists access, and charges zero. It cannot activate subscriptions in cloud mode.

Credentials are saved in ignored environment files, never in public assets or documentation. `apps/website/.env.cloud.local` is a prepared configuration file; Next.js does not automatically load it. After cloud Firestore, sender/domain and HTTPS app URL are ready, the developer must explicitly activate the cloud configuration and validate staging. Current local accounts and data remain intact. The server JSON stays privately in `secrets/firebase-service-account.json`.

## What the owner needs to provide

1. Legal/product owner name, actual first organization name, public support email and domain. These are business facts, not API keys. They are needed for accurate public contact, terms, privacy notices and sender identity.
2. A Firebase Cloud project and an email-sending account for verified account creation.
3. An approved extraction provider if automated note extraction is required. Structured manual documentation already works without an AI key.

Payment credentials can wait as requested. WhatsApp and push credentials are needed only when those delivery channels are implemented and enabled. Do not send passwords, private JSON keys, billing card details or API secrets in chat. Save secrets locally in ignored files; tell the developer when configuration is ready.

## Firebase Cloud

Use [Firebase Admin setup](https://firebase.google.com/docs/admin/setup) as the source for project and server credentials.

1. In the [Firebase console](https://console.firebase.google.com/), create a project owned by your organization. Choose its billing account and review the services' actual charges; the emulator project is unrelated to production billing.
2. Enable Authentication → Email/Password. Add your final domain to authorized domains. Register a web app; copy its project ID and web API key into the variables below. The web API key identifies the project; it does not replace server authorization.
3. Create Firestore in production mode. Choose the region before creating it; consider where patients and staff are located. [Firestore location guidance](https://firebase.google.com/docs/firestore/locations) explains available locations and dependencies. Keep direct client access closed unless separately designed rules and tests authorize it; the website uses its authorized server API.
4. For local cloud integration, Project settings → Service accounts → Generate new private key. Save the JSON under `secrets/firebase-service-account.json`; that folder is ignored. Prefer managed application-default credentials on the eventual hosting platform, with least-privilege service permissions, rather than uploading a long-lived key.
5. Copy `apps/website/.env.example` to an appropriate private environment file. Set `FIREBASE_MODE=cloud`, real `FIREBASE_PROJECT_ID`, `FIREBASE_WEB_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS` pointing at the private JSON, and your HTTPS `APP_URL`. Remove all three emulator host variables. Set `DEVELOPMENT_CHECKOUT=false`. Rebuild/restart for changes to apply.
6. Test a new organization account, the verification email, verified sign-in, tenant isolation and revoked-session access in staging. Cloud mode uses server-managed Firebase session cookies; see [Firebase session-cookie guidance](https://firebase.google.com/docs/auth/admin/manage-cookies). Server Authentication access was confirmed with the supplied credential; cloud Firestore operation is blocked by the disabled API. Full cloud signup/email and database flows remain untested.

Storage uploads are not an implemented user flow. Do not enable or fund extra services on the assumption that all PRD integrations are finished. Hosting region, billing, backup/restore, retention and incident handling must be decided before patient data is accepted.

## Verification email through Resend

1. Create an account at [Resend](https://resend.com/). Add a domain or sending subdomain you own. Add the supplied DNS records at your domain registrar and wait for verification. [Domain setup](https://resend.com/docs/dashboard/domains/introduction) explains SPF/DKIM records.
2. Create a sending-scoped key for that domain using [API key management](https://resend.com/docs/dashboard/api-keys/introduction). Put it in `RESEND_API_KEY` locally.
3. Set `EMAIL_FROM` to an address on that verified domain, such as `WithYou <accounts@your-owned-domain>`. Use your actual domain; the example is not a configured sender.
4. The implemented adapter submits verification, invitation and password-recovery links through Resend. A provider's accepted submission is not proof of delivery. Verify receipt, spam behavior, sender address and the link's return URL in staging. Delivery webhooks and resend-verification UI remain release work.

## Gemini extraction

Gemini replaces the previously proposed provider. The supplied key passed model discovery, and `gemini-3.5-flash-lite` completed a real structured extraction request with fixed fictional input. Google lists this [model as stable](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), with document parsing and structured-output support. Its [pricing entry](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.5-flash-lite) lists free-tier input/output. This is the chosen starting model for low-cost extraction development, not a claim of clinical accuracy. Exact project quotas and billing status must be checked in AI Studio; a valid key does not prove unlimited or free usage. The adapter never silently switches to another model or retries through paid providers.

The implemented server adapter uses `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and the pinned `GEMINI_MODEL`. It uses Google's [structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) through the [Interactions API](https://ai.google.dev/api/interactions-api), disables interaction storage, validates the response locally, checks source quotes and never assigns clinician approval. Empty/missing fields remain unresolved; timeouts, quota errors, invalid responses and invented source/values fail closed. No patient name, contact information or organization metadata is appended to the request; notes themselves may still contain sensitive information.

`GEMINI_DATA_APPROVED=false` currently prevents application notes from being sent. The [unpaid-service terms](https://ai.google.dev/gemini-api/terms#unpaid-services) explicitly exclude sensitive, confidential and personal information and permit product-improvement use. Free-tier testing must therefore use fictional, non-sensitive input, as the fixed `scripts/smoke-gemini.ts` test does. Real patient-note extraction needs an appropriate paid/data-processing arrangement and organizational review; only then may the developer enable this flag. Turning off interaction storage alone does not change provider terms or establish zero retention. Manual structured clinical fields remain usable while automated extraction is blocked.

Validation commands: `node scripts/check-providers.mjs` checks configured credentials without printing them; `npx tsx scripts/smoke-gemini.ts` sends only its fixed fictional note. Neither reads patient records. The smoke test changes its own process flag only; it does not enable patient-note extraction in the running website.

## Subscription now and later

The current screen accepts only the designated test number `4111 1111 1111 1111`, a future expiry and three-digit code. Use test values, never an actual card. Card fields stay in browser memory, are cleared after activation/cancellation and are not sent to the server. The server accepts a development token, stores `chargedAmount: 0` and `chargeStatus: not_charged`, and performs an idempotent activation transaction. Returning users resume subscription or workspace setup from saved organization state. The success animation appears only after a successful server response.

For paid billing later, select a provider supported for your business. For Razorpay, complete business onboarding/KYC, use test keys first, and follow [Standard Checkout integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/). The provider must collect the card. The server creates orders, verifies signatures, checks amounts/currency and handles signed, idempotent payment/subscription webhooks. Paid access must follow confirmed provider state, not a browser success animation. Test failed/cancelled payments, duplicate webhooks, renewals, refunds and past-due access before using live keys. This integration is not implemented yet; no Razorpay keys are needed for the present development checkout.

## Flow completion still required

Credentials alone do not complete the product. The following work remains before a real clinic can use the entire documented flow:

- Independent organization/professional vetting and clinical acceptance. Team invitation/acceptance, access administration and recorded clinician verification are implemented; the recorded verification is an organization attestation.
- Staging validation of recipient-bound patient activation and email ownership. The new flow supports previously unlinked patient accounts; name/phone matching does not establish identity.
- Verification resend, distributed edge controls/privileged MFA, consent versioning and a verified public support channel. Recovery and bounded application rate controls are implemented.
- Approved live AI data arrangement, full report/signature requirements and clinical acceptance tests. Hindi/Latin printing is implemented and visually checked.
- External email delivery evidence/webhooks, WhatsApp consent/templates, remote device push and native app links. Optional neutral Android local reminders have passed emulator permission/confirmation/cancellation checks; physical device and background update handling remain gates.
- Production deployment, monitoring, backups with restore tests, retention/deletion procedures and an organization-approved privacy/security assessment.

The implemented sequence is plan → owner account and organization → saved subscription activation → workspace preferences → role-scoped records → clinician review → publication → authorized patient tasks. Receptionists cannot approve clinical instructions; administrators do not receive clinical notes; patients only see published plans linked to their account. These controls are tested locally, not certified for production.

The final company information, provider accounts and staging validation are necessary before launch. Public copy must not invent an organization, price, clinician, delivery result or medical certification to make unfinished functionality appear live.

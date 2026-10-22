# WITHYOU — MASTER DESIGN SYSTEM & PHASE 1 BUILD SPECIFICATION

**Version:** 1.0  
**Companion document:** WithYou PRD v2.0  
**Purpose:** Design and implement a premium healthcare SaaS website, enterprise onboarding experience, operational dashboard and connected Flutter patient application.  
**Build strategy:** Website first → Enterprise activation → Hospital portal → Patient onboarding → Flutter application → Messaging and reminders.

---

# 1. Creative Direction

## 1.1 Design Philosophy

Create a premium healthcare technology brand that feels human, trustworthy, modern and exceptionally polished.

The visual experience should combine:

- The warmth of a patient-centered healthcare brand.
- The sophistication of a well-designed SaaS platform.
- The clarity and reliability of professional medical software.
- Purposeful animation that explains how the product works.

The result must not look like a generic AI-generated SaaS template.

Avoid repetitive gradient blobs, meaningless floating charts, excessive glassmorphism, oversized icons and generic robot illustrations.

Every visual should explain the product, reinforce trust or support an important user action.

## 1.2 Brand Positioning

**Brand:** WithYou

**Core idea:** Medical instructions should stay useful after the doctor hands over the report.

**Hero headline:**

"From your doctor's desk to your day."

**Supporting copy:**

WithYou connects digital medical reports, doctor-approved care schedules and timely reminders, helping healthcare providers and patients stay connected beyond the consultation.

**Primary CTA:** Explore WithYou Enterprise

**Secondary CTA:** See How It Works

**Brand tone:**

Warm, confident, clear, reassuring, innovative and professional.

Avoid exaggerated promises such as "never miss a medicine again" or "guaranteed better recovery."

## 1.3 Design Priorities

1. Establish credibility within the first five seconds.
2. Explain the product without requiring long paragraphs.
3. Demonstrate the hospital-to-patient workflow visually.
4. Give enterprise buyers a clear route to subscription onboarding.
5. Make the mobile application look like a genuinely useful healthcare companion.
6. Keep the experience fast, accessible and responsive.

---

# 2. Existing Logo and Brand Assets

## 2.1 Mandatory Logo Rule

Use the original WithYou logo supplied in the project asset folder.

Do not redesign, replace, approximate or regenerate the logo without approval.

The development team should inspect the existing logo before finalizing the palette.

If the original logo's colors conflict with the proposed colors below, adjust the secondary design tokens to harmonize with the logo while preserving contrast and accessibility.

## 2.2 Asset Organization

Recommended asset locations:

- /public/brand/logo.svg
- /public/brand/logo-mark.svg
- /public/brand/logo-light.svg
- /public/brand/favicon.png
- /public/images/hero/
- /public/images/story/
- /public/images/product/
- /public/images/people/
- /public/animations/

Actual filenames should match the supplied assets.

Preserve transparent backgrounds, image proportions, clear space and original logo colors.

## 2.3 Logo Usage

**Website navigation:** Primary horizontal logo.

**Footer:** Original logo variant suitable for the background.

**Hospital portal:** Compact horizontal logo in the sidebar.

**Flutter app:** Original symbol or approved app icon.

**Loading screen:** Subtle animation around the logo is acceptable, but avoid deforming the logo.

The original logo is the brand's visual anchor.

---

# 3. Color System

The following is a provisional visual palette until the existing logo is inspected.

| Token | HEX | Purpose |
|---|---|---|
| Brand Primary | #0D6E68 | Main CTA, active states, highlighted text |
| Brand Deep | #0B3438 | Dark sections, headlines, footer |
| Brand Mint | #DDF4EA | Highlight backgrounds |
| Page Background | #F8FBF9 | Main page background |
| Surface | #FFFFFF | Cards, navigation, panels |
| Surface Alt | #EFF7F3 | Alternating sections |
| Text Primary | #142C30 | Primary reading color |
| Text Secondary | #52676A | Descriptions, metadata |
| Border | #D9E7E2 | Subtle outlines |
| Accent Warm | #F5B28C | Decorative accents, illustration details |
| Success | #157A55 | Verified and completed status |
| Warning | #A96812 | Clarification and pending state |
| Danger | #B43C42 | Important blocking errors |

### Color Rules

- Use light backgrounds for approximately 75–80% of the landing page.
- Use dark sections sparingly to create contrast and memorable storytelling moments.
- Reserve high-saturation accent colors for important interactions.
- Do not use green alone to communicate clinical approval.
- Do not use red decoratively inside clinical interfaces.
- Ensure regular text achieves appropriate WCAG contrast.
- Accent Warm should not be used as small text on white without a sufficient contrast check.

### Suggested Background Treatment

Use very subtle radial color washes rather than heavy gradients.

Example:

- Page base: nearly white.
- Top-right hero glow: desaturated mint.
- Bottom-left hero glow: very pale blue-green.
- Floating interface cards: opaque white with restrained shadows.

---

# 4. Typography

## 4.1 Website Typefaces

**Primary:** Manrope

**Secondary option:** DM Sans

Use one cohesive type family across most interfaces. Do not introduce multiple decorative fonts simply for visual novelty.

Load fonts efficiently using Next.js font optimization.

## 4.2 Desktop Typography

| Style | Size | Weight | Line height |
|---|---|---|---|
| Hero H1 | 76–104px | 600–700 | 1.02–1.08 |
| Section H2 | 48–64px | 600–700 | 1.1 |
| H3 | 28–36px | 600 | 1.2 |
| Card title | 20–24px | 600 | 1.3 |
| Body large | 18–20px | 400–500 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Caption | 13–14px | 500 | 1.45 |
| Button | 14–16px | 600 | 1.2 |

Use fluid typography rather than abrupt jumps across screen sizes.

## 4.3 Mobile Typography

- Hero: approximately 42–56px.
- Section title: approximately 30–38px.
- Card title: approximately 20px.
- Body: 16px minimum for primary reading.
- Important clinical instructions: comfortably readable and never dependent on tiny captions.

## 4.4 Typography Personality

Headlines should be editorial, spacious and concise.

Body text should be clear and practical.

Use accent-colored words selectively.

Do not highlight every second word.

---

# 5. Layout and Spacing

## 5.1 Grid

**Desktop:** 12-column grid.

**Tablet:** 8-column grid.

**Mobile:** 4-column grid or straightforward single-column content.

## 5.2 Container Width

- Standard maximum: 1240px.
- Wide storytelling container: up to 1440px.
- Long-form text: approximately 720px maximum reading width.

## 5.3 Spacing Scale

Use a consistent 4px base scale.

Recommended values:

4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128.

### Section Padding

- Desktop: 96–144px vertically.
- Tablet: 72–96px.
- Mobile: 56–80px.

## 5.4 Border Radius

- Small controls: 10px.
- Buttons and inputs: 12–14px.
- Standard cards: 20px.
- Feature cards: 24–28px.
- Large visual containers: 32px.
- Pill elements: 999px.

Do not make every single element excessively rounded.

## 5.5 Shadows and Borders

Cards should rely on very light borders, small tonal differences and subtle shadows.

Hover elevation should be restrained.

Avoid thick black shadows, heavy outlines and overly saturated borders.

---

# 6. Motion and Animation System

Animations should make WithYou feel crafted, not distracting.

## 6.1 Recommended Libraries

**Primary:** Motion for React (motion/react).

Use for:
- Hero entrances.
- Scroll reveals.
- Staggered feature cards.
- Hover and tap interactions.
- Layout transitions.
- Modal transitions.

**Secondary:** GSAP + ScrollTrigger.

Use for:
- One signature scroll-driven storytelling section.
- Complex choreography between mockup elements.
- Carefully controlled pinned product demonstrations.

**Optional:** Lenis.

Use only if smooth scrolling provides a measurable improvement and does not interfere with accessibility, native scrolling or GSAP timing.

Avoid introducing multiple animation systems for the same interaction.

## 6.2 Motion Tokens

| Motion | Duration | Behavior |
|---|---|---|
| Button hover | 160–220ms | Subtle lift or color change |
| Card hover | 220–320ms | 3–5px lift |
| Menu transition | 180–260ms | Opacity and small translation |
| Content reveal | 450–650ms | Fade with 16–28px movement |
| Hero sequence | 700–1100ms total | Staggered entrance |
| Modal entrance | 220–320ms | Opacity and restrained scale |
| Success state | 350–550ms | Clear confirmation |
| Page transition | 200–350ms | Light transition without delaying navigation |

Preferred easing should feel controlled and natural, without excessive overshoot.

## 6.3 Hero Animation Sequence

The home page should load in this sequence:

1. Navigation fades into view.
2. Eyebrow label appears.
3. Main headline reveals line by line.
4. Supporting copy fades upward.
5. CTA buttons enter.
6. Main product interface settles into place.
7. Two small supporting cards animate in.

Avoid replaying the entire sequence every time the user returns to the top of the page.

## 6.4 Signature Scroll Story

Create a visual transformation:

**Doctor's digital report → Verified care plan → Patient mobile schedule → Reminder received.**

The visual sequence should reveal how one approved medical document turns into useful patient actions.

Suggested treatment:

- A report appears inside a desktop medical editor.
- Verified structured fields become visible.
- A transition reveals a mobile care-plan interface.
- A scheduled task appears in the mobile timeline.
- A neutral reminder notification becomes visible.

This should be the website's main visual storytelling moment.

Use actual UI mockups with realistic synthetic information, not random charts.

## 6.5 Microinteractions

Include:

- Animated underline or highlight for active navigation.
- Button arrow movement of 3–5px.
- Gentle hover lift on product cards.
- Tab transitions between Patients and Providers.
- Accordion expand and collapse.
- Form field focus transitions.
- Pricing card selection.
- Step progress indicators.
- Confirmation and loading states.

## 6.6 Accessibility Rules

- Respect prefers-reduced-motion.
- Disable extensive parallax and pinned effects for reduced-motion users.
- Avoid scroll hijacking.
- Do not animate essential medical information in ways that delay access.
- Do not animate large text continuously.
- Keep key interactions keyboard-accessible.
- Ensure the page remains understandable if animations fail.

---

# 7. Visual Asset Direction

## 7.1 Hero Visual

The hero should combine a carefully composed product mockup with a human healthcare element.

Recommended composition:

**Left:**
- Editorial headline.
- Short explanation.
- Primary and secondary CTA.

**Right:**
- Premium hospital dashboard visual.
- Overlapping Flutter phone mockup.
- Small floating report approval card.
- A reminder preview.
- Subtle dimensional depth.

The product interface should dominate the visual, rather than a generic photograph of a doctor holding a tablet.

## 7.2 Photography

Use authentic-looking, respectful healthcare photography.

Preferred subjects:
- Indian doctors and nurses working naturally.
- Patients receiving care information.
- Families helping older relatives.
- Realistic home healthcare environments.

Avoid:
- Exaggerated emotional distress.
- Artificial glowing medical holograms.
- Generic robots.
- Identifiable real patient records.
- Misleading medical treatment imagery.

Use licensed images with appropriate rights.

## 7.3 Product Mockups

Design original WithYou interfaces.

Mockups should include:
- Doctor consultation workspace.
- Digital report editor.
- AI verification panel.
- Printable report.
- Patient daily timeline.
- Follow-up notification.

Synthetic sample patient information must be consistent between website visuals, portal and app.

## 7.4 Illustrations

Prefer:
- Abstract connection lines.
- Minimal timeline diagrams.
- Clean medical task icons.
- Small editorial shapes.
- Product workflow compositions.

Avoid medical crosses or hospital symbols as the primary brand identity unless already present in the supplied logo.

---

# 8. Landing Page — Complete Screen Specification

## Section 01 — Premium Navigation

Navigation links:

- Product.
- For Hospitals.
- For Patients.
- How It Works.
- Pricing.
- Contact.

Right side:
- Sign In.
- Get Started.

Behavior:
- Transparent or lightly surfaced on hero.
- Becomes a refined white navigation bar on scroll.
- Small elevation transition.
- Functional dropdown for product experiences.
- Mobile menu with polished open/close animation.

## Section 02 — Hero

**Eyebrow:** Connected Care, Made Simple.

**Headline:** From your doctor's desk to your day.

**Supporting copy:**

Digital medical reports, approved care schedules and timely reminders — connected in one beautifully simple healthcare experience.

**CTA 1:** Get Started for Hospitals.

**CTA 2:** Explore Patient App.

Hero visual:

- A realistic WithYou Enterprise report interface.
- A mobile timeline layered in front.
- One approved follow-up card.
- One neutral reminder notification.

The product image must clearly communicate healthcare coordination.

## Section 03 — Trust and Product Overview

Small introductory content.

**Headline:** One platform. Continuous care.

Show three capabilities:

- Digital Medical Reports.
- Personalized Care Schedules.
- Connected Patient Experience.

Do not invent customer counts, hospital partnerships, certifications, awards or clinical outcome statistics.

## Section 04 — The Problem

**Headline:** The appointment ends. Care continues.

Show:
- A patient receives a medical report.
- Instructions are difficult to organize.
- Follow-up tasks are easy to overlook.

Then introduce WithYou as the connection between the clinician's instructions and the patient's everyday schedule.

Use an editorial two-column layout and strong photography or a document-to-phone visual.

## Section 05 — Two Connected Products

### Product Card A: WithYou Enterprise

**Audience:** Hospitals and Doctors.

Content:
- Register patients.
- Write digital medical reports.
- Review AI-organized care instructions.
- Publish approved care plans.
- Manage follow-ups.

CTA: Explore Enterprise.

Visual: Professional hospital dashboard.

### Product Card B: WithYou Care

**Audience:** Patients and Families.

Content:
- View medical reports.
- Understand approved daily tasks.
- Track medicines and appointments.
- Receive reminders.
- Stay organized.

CTA: Explore Patient Experience.

Visual: Beautiful Flutter phone mockup.

Both cards should feel like parts of one brand, while showing distinctly different user experiences.

## Section 06 — Signature Workflow Animation

**Headline:** From prescription to personal care.

Steps:

1. Hospital registers patient.
2. Doctor creates a digital report.
3. Medical tasks are structured and verified.
4. The approved report is published.
5. Patient accesses the care plan.
6. WithYou helps the patient remember important tasks.

This is the main scroll-based animated section.

## Section 07 — Product Screenshots

An interactive showcase with three tabs:

**Doctors**
- Clinical report workspace.
- Digital prescription.
- Approval interface.

**Hospitals**
- Patient management.
- Staff workflows.
- Report delivery.

**Patients**
- Today screen.
- Medical reports.
- Reminder calendar.

Screens must respond to tab selection, with polished transitions.

## Section 08 — Safety and Trust

**Headline:** Thoughtful technology. Clinician-led care.

Explain:
- Doctor verification.
- Source-linked instructions.
- Permission-based access.
- Private record sharing.
- Transparent clarification states.

Use honest design commitments. Do not claim unsupported security certifications.

## Section 09 — Plans and Enterprise Onboarding

Display:
- Clinic.
- Hospital.
- Enterprise.

Use realistic plan comparison cards.

Actual plan prices should be configured, not arbitrarily invented in the implementation.

If commercial pricing has not been finalized, use "Talk to Sales" or an explicitly configured trial offer rather than making up a commercial price.

CTA: Get Started.

The CTA opens the organization subscription journey.

## Section 10 — Final CTA

**Headline:** Make every care instruction count.

Supporting copy:

Bring digital reporting, personalized schedules and patient follow-through together with WithYou.

Buttons:
- Start WithYou Enterprise.
- Explore WithYou Care.

## Section 11 — Footer

Include:
- Original WithYou logo.
- Brand description.
- Product.
- Solutions.
- Company.
- Privacy.
- Terms.
- Contact.

Footer should use a deep teal background, high-contrast text and a restrained brand illustration.

---

# 9. Landing Page Responsive Behavior

## Desktop

- Editorial split hero.
- Rich product compositions.
- Large cinematic storytelling section.
- Multi-column cards.
- Spacious sections.

## Tablet

- Simplified hero composition.
- Fewer overlapping cards.
- Reduced pinned animation.
- Two-column features where appropriate.

## Mobile

- Single-column hero.
- Headline before product preview.
- One primary CTA clearly visible.
- Mobile-specific lightweight visuals.
- Horizontal carousels only when they are easy to use.
- No mandatory horizontal scrolling to understand product features.
- No hover-only interactions.
- Reduced animation intensity.

Test at widths including 360px, 390px, 768px, 1024px and 1440px.

---

# 10. Enterprise Subscription and Payment Experience

The onboarding screens must use the same premium design language as the marketing website.

## 10.1 Route Flow

Home → Pricing → Plan Selection → Organization Details → Checkout → Activation → Hospital Setup → Enterprise Dashboard.

## 10.2 Plan Selection

Show:
- Selected plan.
- Included features.
- Billing period.
- Configured price or trial terms.
- Clear action to proceed.

Use an elegant comparison layout.

## 10.3 Organization Registration Screen

Form fields:
- Organization name.
- Official email.
- Contact person.
- Phone.
- Organization category.
- Address.
- Password or account invitation setup, depending on authentication design.

Use:
- Form validation.
- Helpful inline guidance.
- Progress indication.
- Back navigation.
- Preservation of already entered values.

## 10.4 Checkout

**Recommended integration:** Razorpay in Test Mode during development and hackathon evaluation.

For test transactions:
- Use official Razorpay checkout.
- Create the corresponding order or subscription flow on the server.
- Use test credentials.
- Verify the provider response server-side.
- Record the test transaction.
- Continue activation only after the expected successful state.

Do not ask judges to enter real payment credentials into an imitation checkout.

Do not store full card details.

Do not present an unsuccessful or incomplete test payment as a real captured charge.

The UI should look like a finished commercial onboarding experience rather than a placeholder screen.

## 10.5 Activation

After the valid activation event:

- Create hospital organization.
- Create tenant reference.
- Associate selected plan.
- Create administrator identity or invitation.
- Set onboarding status.
- Redirect to hospital setup wizard.

## 10.6 Success Screen

Suggested headline:

"Your WithYou workspace is ready."

Supporting text:

"Let's set up your healthcare organization and bring your team together."

Primary CTA: Set Up Workspace.

Display:
- Hospital name.
- Selected plan or trial.
- Setup progress.

Do not claim a real charge has occurred when using the test-payment environment.

## 10.7 Workspace Setup Wizard

Steps:

1. Organization profile.
2. Hospital or clinic details.
3. Doctor and staff invitations.
4. Department settings.
5. Document template selection.
6. Finish setup.

Use an elegant progress indicator.

## 10.8 Payment States

Implement:
- Initialized.
- Awaiting payment.
- Processing.
- Successful.
- Failed.
- Cancelled.
- Retry available.

A cancelled payment must not grant paid subscription entitlements.

Provide a separately authorized no-charge trial activation path when needed for the hackathon.

---

# 11. Enterprise Portal Design System

## 11.1 Visual Direction

Unlike the marketing page, the portal should favor efficiency, clarity and stable layouts.

Use the same logo, colors and typography, but reduce decorative motion significantly.

## 11.2 Global Layout

- Left sidebar.
- Top header.
- Search.
- Role-specific navigation.
- Notification center.
- User account menu.
- Main content area.

## 11.3 Core Navigation

- Overview.
- Patients.
- Appointments.
- Medical Reports.
- Review Queue.
- Care Plans.
- Communications.
- Team.
- Billing.
- Settings.

Navigation must be filtered by role.

## 11.4 Receptionist Screens

**Dashboard**
- Today's appointments.
- New registrations.
- Waiting patients.
- Report status.

**Patient Registration**
- Structured form.
- Existing-patient search.
- Contact verification.
- Assigned doctor.
- Create encounter.

**Patient Profile**
- Patient information.
- Visit history.
- Authorized documents.
- Caregiver contact information.

## 11.5 Doctor Screens

**Doctor Dashboard**
- Assigned patient queue.
- Pending reports.
- Pending AI reviews.
- Upcoming consultations.

**Digital Medical Report Editor**
- Patient summary.
- Notes.
- Medication fields.
- Investigations.
- Follow-up instructions.
- Draft status.
- PDF preview.

**AI Verification Workspace**
- Original instructions on the left.
- Interpreted tasks on the right.
- Warnings and missing details.
- Confirm, edit or reject actions.

**Finalize Report**
- Clinical approval.
- Printable report.
- Publish care-plan action.

## 11.6 Portal Component Library

Implement reusable:

- Sidebar.
- Top navigation.
- Data table.
- Search input.
- Patient card.
- Document card.
- Status badge.
- Alert banner.
- Clinical form section.
- Tabs.
- Modal.
- Drawer.
- Calendar picker.
- Review comparison panel.
- PDF preview.
- Confirmation dialog.
- Loading skeleton.
- Empty state.
- Error state.

## 11.7 Clinical Status Colors

Approved: Green with text and approval metadata.

Pending: Amber with clear explanation.

Needs clarification: Amber or warning treatment.

Blocked: Red with explicit reason.

Draft: Neutral.

Superseded: Neutral with version indication.

No status may be communicated using color alone.

---

# 12. Flutter Mobile Application — Visual System

## 12.1 Design Foundation

Use Flutter Material 3 with a custom WithYou theme.

Share the same:
- Brand colors.
- Typography character.
- Corner radii.
- Icon treatment.
- Spacing scale.
- Approval/status meanings.

The Flutter app should not look like a web dashboard squeezed onto a phone.

## 12.2 Mobile Navigation

Bottom navigation:

- Today.
- Schedule.
- Reports.
- Profile.

Notifications can be accessed from the home screen header.

## 12.3 Welcome and Authentication

Screens:

1. Splash with original WithYou logo.
2. Welcome screen.
3. Activate invitation / Sign in.
4. Verify invitation.
5. Set password.
6. Confirm password.
7. Notification permission.
8. Home screen.

Use a clean, minimal, confidence-building design.

Never store user passwords in plain text.

## 12.4 Onboarding Design

### Welcome

Headline:

"Your care, all in one place."

Illustration:
- Phone displaying today's tasks.
- Small medical report card.
- Subtle connecting visual.

CTA: Continue.

### Invitation Verification

Show the relevant healthcare provider identity and an appropriate verification step.

Do not reveal sensitive records before authentication.

### Set Password

Fields:
- New password.
- Confirm password.

Provide:
- Password strength guidance.
- Show/hide toggle.
- Inline validation.
- Submit loading state.
- Error handling.

### Notification Permission

Explain:

"Receive reminders for your approved care tasks and upcoming appointments."

Provide permission controls without blocking access to medical reports unnecessarily.

## 12.5 Today Screen

Suggested visual structure:

**Header**
"Good morning"

Current patient identity and date.

**Primary Card**
Today's schedule progress.

**Daily Timeline**
- Morning.
- Afternoon.
- Evening.
- Night.

**Task Cards**
- Task name.
- Scheduled time.
- Approved instruction.
- Status.
- Completion control.

**Upcoming Follow-up**
Date and healthcare provider.

**Recent Report**
View report action.

## 12.6 Report Screen

- Document list.
- Search/filter.
- Report type.
- Date.
- Issuing hospital.
- Secure viewer.
- Current version indicator.

## 12.7 Reminder Interaction

Each task has:

- Due state.
- Complete action.
- Skip action.
- View details.
- Related report access.

A completion mark means the patient or caregiver reported completing the task.

Do not imply clinical verification.

## 12.8 Mobile Animations

Use:
- Subtle page transitions.
- Animated completion states.
- Card entry transitions.
- Lightweight progress changes.
- Smooth bottom-sheet opening.
- Clean report-loading states.

Avoid intensive motion, especially in medication instructions.

---

# 13. Firebase Local Development Architecture

## 13.1 Technical Intent

Use Firebase's local emulators for the hackathon implementation, with the ability to migrate to a hosted configuration later.

Use one shared backend data environment so the enterprise website and Flutter application see consistent patient records and care-plan updates.

The local emulators must be treated as development infrastructure, not as production healthcare infrastructure.

## 13.2 Proposed Services

**Firebase Authentication Emulator**
- Development account identities.
- Staff login.
- Patient login.
- Email/password flows.

**Cloud Firestore Emulator**
- Organizations.
- Staff memberships.
- Patients.
- Encounters.
- Reports metadata.
- Care plans.
- Tasks.
- Invitation records.

**Cloud Storage Emulator**
- PDF reports.
- Uploaded images.
- Document attachments.

**Next.js server-side application layer**
- Organization activation.
- Access checks.
- Clinical workflow APIs.
- Document generation.
- Messaging adapters.

**Flutter application**
- Patient interface.
- Authentication.
- Report access.
- Reminder display.
- Device notification handling.

## 13.3 Emulator Configuration

Default local ports:

- Auth: 9099.
- Firestore: 8080.
- Storage: 9199.
- Emulator UI: 4000.

Use a dedicated development project ID such as `demo-withyou`.

Keep all demo resources in the local environment.

## 13.4 Important Firebase Distinction

Firestore offline caching is not the same as hosting a shared local database.

For consistent data between the receptionist dashboard, doctor dashboard and Flutter application, all clients must connect to the same emulator/backend service.

Do not use unrelated local browser storage as the primary shared medical database.

## 13.5 Connection Rules

- Website on development machine: access the local emulator endpoint.
- Android emulator: use its host-machine mapping, commonly `10.0.2.2`.
- Physical Android phone: use the development machine's reachable LAN address.
- iOS simulator: use the corresponding reachable host configuration.

Devices must be able to reach the same backend.

Do not expose unsecured emulators directly to the public internet.

## 13.6 Data Persistence

Configure export/import of emulator data so that:

- Sample hospital accounts are preserved.
- Sample patient records are available.
- Previously approved reports can be restored.
- A clean demo environment can be reseeded.
- Interrupted demonstrations can be recovered.

## 13.7 Production Migration

The repository must separate:

- Development Firebase configuration.
- Production Firebase or replacement backend configuration.
- Messaging credentials.
- Payment credentials.
- AI provider credentials.

Do not hardcode localhost addresses or secrets throughout the application.

---

# 14. Email and WhatsApp Onboarding

## 14.1 Communication Architecture

Create one notification abstraction with multiple delivery adapters.

Adapters:

- Email provider.
- WhatsApp Business Platform.
- Local message preview.
- Mobile push notifications.

All channels should record an accurate status.

## 14.2 Recommended Email Provider

**Resend**

Use for:
- Staff invitations.
- Patient account invitations.
- Account activation links.
- Appropriate transactional messages.

The free plan currently advertises 3,000 emails per month with a 100-email daily limit, subject to provider terms and changes.

Use a verified sending domain and server-side API credentials.

## 14.3 Alternative Email Provider

Brevo or another reputable transactional email provider can be evaluated if Resend's verification, rate limits or account requirements do not fit the implementation.

Do not send production transactional emails directly from frontend code.

## 14.4 WhatsApp Integration

Preferred technical path:

**Official WhatsApp Cloud API.**

For development:
- Set up an official Meta developer application.
- Configure the WhatsApp test sender if available.
- Add verified test recipient numbers.
- Use the permitted test message template.
- Keep the access token server-side.
- Record API submission and actual delivery state separately.

For production:
- Configure the business account.
- Complete required verification.
- Obtain recipient opt-in.
- Use approved message templates.
- Configure billing.
- Implement webhook handling.

## 14.5 WhatsApp Content

Recommended onboarding message:

"Your healthcare provider has invited you to access your care information through WithYou. Open the secure invitation to get started."

Avoid placing diagnoses, prescribed medicines or sensitive clinical information directly in message templates.

## 14.6 What Not to Use

Do not depend on:
- Unofficial WhatsApp Web automation.
- Browser session scraping.
- Hidden mass-messaging tools.
- Untrusted bulk sender services.
- Hardcoded session cookies.
- Unapproved message templates.

These approaches create policy, privacy and reliability risks.

## 14.7 Message Fallback

If a WhatsApp integration is not ready, a clinician or receptionist should still be able to:
- Generate an invitation.
- Use the email channel.
- View invitation status.
- Resend where permitted.
- Copy the invitation for an authorized test scenario.

A WhatsApp link that opens a chat for manual sending is not an automated delivery integration.

---

# 15. Secure Patient Invitation and Password Setup

## 15.1 Invitation Generation

After report approval, the platform generates a single-use invitation.

Store:
- Patient reference.
- Intended communication destination.
- Invitation purpose.
- Creation timestamp.
- Expiration.
- Status.
- Token hash, rather than storing a reusable plain invitation token.

## 15.2 Invitation Flow

1. Invitation created.
2. Message sent.
3. User opens invitation.
4. Invitation token validated.
5. Intended identity verified.
6. Account association authorized.
7. User sets password.
8. Account activated.
9. User signs into Flutter app.
10. Authorized medical records become available.

## 15.3 Security Rules

- Do not create a reusable password from the patient's phone number.
- Never send a password in WhatsApp or email.
- Do not use a default shared password.
- Do not expose reports before verification.
- Expire or revoke used links.
- Enforce password security through the authentication provider.
- Prevent an unrelated person from linking another patient's records.

## 15.4 App Linking

Support a defined invitation link-handling flow.

The link should open the Flutter app when installed, or guide the user to installation and then resume the activation process.

For local demonstrations, verify that the chosen app-link or deep-link configuration works with the reachable development backend and test device.

---

# 16. Suggested Next.js Project Structure

A modular monorepo is recommended.

**apps/website**
- Public website.
- Marketing pages.
- Pricing.
- Checkout entry.
- Organization onboarding.

**apps/enterprise**
- Hospital operational portal.
- Receptionist workflows.
- Doctor workflows.
- Admin dashboards.

**apps/patient-mobile**
- Flutter patient app.

**packages/design-tokens**
- Shared colors.
- Typography definitions.
- Spacing.
- Product status conventions.

**packages/ui**
- Reusable web interface components.

**packages/shared-types**
- Shared TypeScript schemas for the web/backend.

**services/api**
- Backend business logic.
- Authorization.
- AI extraction.
- Document generation.
- Scheduling.
- Communication integration.

**firebase/**
- Emulator configuration.
- Rules.
- Local data fixtures.
- Seed data.

The Flutter application can mirror design tokens while retaining platform-native component structure.

---

# 17. Suggested Route Architecture

## Public

- /
- /for-hospitals
- /for-patients
- /how-it-works
- /pricing
- /contact

## Enterprise Activation

- /start
- /start/organization
- /start/plan
- /start/checkout
- /start/complete
- /setup

## Authentication

- /sign-in
- /forgot-password
- /accept-invitation

## Enterprise

- /portal
- /portal/patients
- /portal/patients/new
- /portal/patients/[id]
- /portal/appointments
- /portal/reports
- /portal/reports/[id]
- /portal/reviews
- /portal/care-plans
- /portal/communications
- /portal/team
- /portal/billing
- /portal/settings

Appropriate authorization is mandatory on each portal route.

---

# 18. Product State and Data Flow

The website, hospital portal and Flutter app must share consistent workflow states.

## Organization

Created → Trial / Awaiting Payment → Active → Configured.

## Patient

Registered → Encounter Assigned → Report Created → Plan Published → Invitation Sent → Account Activated.

## Medical Report

Draft → Ready for Review → Finalized → Published → Superseded.

## AI Care Plan

Extracted → Clarification Required / Ready for Review → Clinician Approved → Published.

## Invitation

Created → Queued → Sent → Delivered if confirmed → Claimed → Expired / Revoked.

## Reminder

Scheduled → Due → Notified → Acknowledged / Completed / Skipped / Unacknowledged.

Every transition should be persisted and displayed accurately.

A visual confirmation must correspond to an actual state change, not merely an animation.

---

# 19. Phase-by-Phase Implementation Plan

## Phase 1A — Premium Marketing Website

Build first.

Deliver:
- Original brand integration.
- Design tokens.
- Responsive navigation.
- Cinematic hero.
- Product storytelling.
- WithYou Enterprise section.
- WithYou Care section.
- Product screenshots.
- How It Works animation.
- Safety section.
- Pricing section.
- Final CTA.
- Footer.

The website should feel complete before introducing enterprise workflows.

## Phase 1B — Subscription and Activation

Deliver:
- Organization form.
- Plan selection.
- Checkout.
- Test payment verification or authorized trial path.
- Organization record creation.
- Activation success.
- Setup wizard.
- Enterprise portal redirect.

## Phase 1C — Hospital Operational Portal

Deliver:
- Admin shell.
- Receptionist dashboard.
- Patient registration.
- Encounter creation.
- Doctor dashboard.
- Digital report editor.
- AI interpretation review.
- Approval.
- Printable report.

## Phase 1D — Flutter Patient Application

Deliver:
- App splash.
- Invitation activation.
- Login and password setup.
- Home dashboard.
- Medical report viewer.
- Care task schedule.
- Reminder preview.
- Completion tracking.

## Phase 1E — Messaging and Integration

Deliver:
- Email invitations.
- WhatsApp test integration if available.
- Notification event history.
- Shared backend records.
- Invitation-to-app linkage.
- End-to-end testing.

---

# 20. Landing Page Performance and Quality Standards

Proposed targets:

- Lighthouse accessibility score: 95+.
- Lighthouse performance score: 90+ in the defined test environment.
- LCP: 2.5 seconds or better under representative conditions.
- CLS: 0.1 or better.
- INP: 200 milliseconds or better.
- Keyboard navigation throughout.
- Visible focus indicators.
- Appropriate contrast.
- Responsive layouts.
- No horizontal overflow.
- No broken navigation.
- No unnecessary animation-induced layout shifts.

Optimize:
- Images.
- Font loading.
- Client-side JavaScript.
- Animation libraries.
- Large visual assets.
- Responsive source sizes.
- Preloading of critical resources.

Do not use a heavy WebGL scene purely for decoration.

---

# 21. Design and Build Acceptance Criteria

## Landing Page

- Uses the approved original logo.
- Has a distinctive premium visual identity.
- Clearly explains the B2B and B2C experiences.
- Includes well-composed actual product UI mockups.
- Has working navigation and CTAs.
- Has smooth, purposeful animations.
- Works on mobile, tablet and desktop.
- Meets accessibility and performance targets where practically achievable.

## Subscription

- Plan selection works.
- Organization registration works.
- Payment or trial activation state is meaningful and enforced.
- Successful activation creates an organization workspace.
- Failed or cancelled checkout does not create a paid entitlement.
- Setup wizard preserves submitted information.

## Enterprise Portal

- Users have role-appropriate interfaces.
- Receptionist can register patients.
- Doctor can create reports.
- AI interpretations are reviewable.
- Doctor approval is required for actionable clinical schedules.
- Final report can be printed.
- Published records become available through the intended patient-access path.

## Flutter App

- Patient authentication works in the configured environment.
- Invitation activation is linked to the correct patient.
- Reports can be viewed.
- Approved tasks display accurately.
- Reminder and completion interactions work.
- Unapproved tasks are not presented as clinical instructions.

## Communication

- Email invitation flow is functional if configured.
- WhatsApp integration reports its real status.
- Sensitive medical information is not disclosed in ordinary message previews.
- No communication provider keys are exposed to clients.

---

# 22. Non-Negotiable Implementation Rules

1. Use the existing WithYou logo.
2. Do not create a generic template-based website.
3. Make the landing page feel like a real software company.
4. Keep the public site focused on product benefits, not internal engineering details.
5. Use coherent synthetic sample data throughout the product.
6. Use the same visual identity across website, portal and mobile app.
7. Do not fabricate real hospitals, testimonials, awards, compliance credentials or outcome statistics.
8. Do not present test payments as captured real payments.
9. Do not publish AI-derived clinical instructions without authorized review.
10. Do not expose patient information through public links.
11. Make primary actions functional.
12. Keep animations smooth and accessible.
13. Prioritize the complete end-to-end workflow over unnecessary features.
14. Keep the development infrastructure clearly separated from a future production environment.
15. Maintain consistent state between enterprise and patient applications.

---

# 23. Final Creative Brief

Design WithYou like a healthcare technology startup preparing to present its first serious enterprise platform to hospitals.

The visual identity must communicate two emotions at once:

**Confidence for healthcare organizations.**

**Reassurance for patients and families.**

The public website should immediately make visitors understand that WithYou connects clinical documentation with daily care.

The enterprise portal should give doctors and hospital staff a structured, efficient operational environment.

The Flutter application should turn approved medical schedules into an accessible, comforting daily experience.

The standout visual moment should be the transformation from a doctor's digital report into a patient's actionable daily timeline.

**WithYou — From your doctor's desk to your day.**
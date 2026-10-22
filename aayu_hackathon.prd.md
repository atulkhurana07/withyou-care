# WITHYOU
## Detailed Product Requirements Document — Version 2.0

**Product:** WithYou  
**Tagline:** Your health journey. We're with you.  
**Category:** Healthcare Operations SaaS + Patient Reminder Platform  
**Business strategy:** B2B-first, B2C expansion  
**Initial market:** India  
**Platforms:** Web-based hospital workspace, Flutter mobile application, public marketing website  
**Document status:** Product and engineering specification  
**Primary hackathon use case:** AAYU 2026, PS3 — Going Home Right  
**Document date:** 13 October 2026

---

# 1. Executive Summary

## 1.1 What is WithYou?

WithYou is a connected healthcare platform that transforms doctor-created medical instructions into organized, personalized tasks and reminders for patients.

The business operates through two interconnected approaches:

**B2B — WithYou Enterprise**

Doctors, clinics and hospitals purchase a subscription to access a web-based operational platform.

They can:

- Set up their hospital or clinic workspace.
- Create staff accounts with defined responsibilities.
- Register and manage patients.
- Digitally write prescriptions, visit reports and discharge instructions.
- Maintain an authorized record of medical visits.
- Generate printable medical documents.
- Use AI to organize written instructions into structured tasks.
- Review and approve AI-interpreted schedules.
- Invite patients to the WithYou application.
- Manage follow-up tasks and patient communications.

**B2C — WithYou Care**

Patients and authorized caregivers use the WithYou Flutter application to:

- Access medical records shared by their healthcare providers.
- View prescriptions and discharge summaries.
- Understand approved medication instructions.
- Receive reminders about medical tasks.
- Track completed tasks and appointments.
- View upcoming checkups.
- Access their medical history.
- Manage independently created personal reminders in a future self-service offering.

The initial growth strategy is B2B2C: hospitals and clinics onboard patients into WithYou Care.

A separate, independently acquired B2C customer segment can be developed after the hospital-connected product is validated.

## 1.2 Core Product Idea

A doctor should be able to create a medical report once, using their normal clinical workflow.

WithYou then makes the approved report useful in multiple formats:

1. A printable document for the patient.
2. A secure digital medical record.
3. A structured schedule of approved patient tasks.
4. A reminder experience inside the mobile application.
5. A continuing connection between the healthcare provider and the patient.

**The doctor creates the medical instructions. WithYou helps the patient follow them.**

## 1.3 Primary Differentiation

The product is not intended to be another generic hospital management system.

Its central feature is the connection between:

**Clinical documentation → clinical verification → personalized task scheduling → patient delivery → reminder tracking.**

A hospital's digital prescription should not become an isolated PDF.

It should become an actionable, approved daily care experience.

## 1.4 Business Objectives

- Acquire healthcare organizations through enterprise subscriptions.
- Help providers digitize medical documentation and patient follow-up.
- Reduce duplicated manual work in preparing patient-facing instructions.
- Make approved instructions accessible to patients after their visit.
- Encourage continued patient engagement through valuable reminders.
- Build a healthcare platform that can expand beyond discharge care.

## 1.5 Initial Product Boundaries

WithYou does not autonomously diagnose, prescribe medicines, alter treatments or recommend unapproved medical schedules.

AI assists with interpreting documentation. A responsible healthcare professional authorizes the clinical instructions that reach the patient.

---

# 2. Product Architecture at a Business Level

WithYou consists of four connected product surfaces.

| Product surface | Audience | Purpose |
|---|---|---|
| WithYou Website | Public, hospital buyers, patients | Brand discovery, product explanation and subscription interest |
| WithYou Enterprise | Doctors, receptionists, nurses, administrators | Patient registration, medical reports, clinical verification, operational workflows |
| WithYou Care | Patients and authorized caregivers | Digital reports, approved schedules, reminders and personal task tracking |
| WithYou Platform Services | Internal backend systems | Authentication, secure data storage, AI processing, scheduling, messaging and audit logs |

## 2.1 First Product: WithYou Enterprise

The enterprise application is the initial commercial product.

Target customers:

- Private clinics.
- Small and medium hospitals.
- Multispecialty clinics.
- Independent medical practices.
- Healthcare organizations managing recurring follow-ups.

The initial release should support one organization with multiple staff members and optionally multiple branches.

The architecture must allow more hospitals to subscribe without one hospital gaining access to another's records.

## 2.2 Second Product: WithYou Care

The patient-facing application is a shared consumer experience across subscribed healthcare providers.

One patient should eventually be able to see approved records from different participating providers, subject to appropriate verification, permissions and consent.

A patient should not need a different app for every subscribed hospital.

## 2.3 Important Identity Separation

The hospital's internal patient identifier is not the same as the patient's WithYou user account.

Example:

- Hospital A registers the patient as HOSP-A-1021.
- Hospital B registers the same patient as HOSP-B-4420.
- The patient signs into one WithYou account.
- The two records may be linked to that account only after appropriate verification and authorization.

A matching name or phone number must not automatically merge clinical records.

---

# 3. User Roles and Permissions

## 3.1 WithYou Platform Owner

This is the internal WithYou operations team.

Responsibilities:

- Manage enterprise subscriptions.
- Provision organizations.
- Monitor system availability.
- Manage billing and platform-level configuration.
- Handle authorized support requests.
- Monitor security and infrastructure incidents.

Restrictions:

- Platform support employees do not receive routine access to readable patient medical records.
- Any exceptional support access requires a documented authorization process, time limitations and audit records.

## 3.2 Hospital Administrator

Responsibilities:

- Complete organization setup.
- Add branches and departments.
- Invite doctors and staff.
- Assign roles.
- Configure operational settings.
- Manage subscription information.
- View organization-level operational reports.

Restrictions:

- An administrative role does not automatically grant unlimited access to every clinical record.
- Patient-level access is determined by the hospital's approved access policy.

## 3.3 Receptionist

Responsibilities:

- Register new patients.
- Search existing patient registrations.
- Verify patient identity and contact details.
- Create appointments or visits.
- Create a medical report draft containing administrative information.
- Route the draft to the assigned doctor.
- Print approved documents when permitted.
- Manage invitations and communication preferences.

Restrictions:

- Cannot prescribe medicines.
- Cannot modify signed clinical instructions.
- Cannot approve AI-generated clinical interpretations.
- Cannot access patients outside the receptionist's authorized scope.

## 3.4 Doctor

Responsibilities:

- View assigned patient encounters.
- Record clinical findings.
- Create prescriptions and medical reports.
- Set clinical follow-up instructions.
- Review AI-extracted instructions.
- Resolve medical ambiguities.
- Approve the digital report and care plan.
- Issue corrections or updated instructions.

## 3.5 Nurse / Care Coordinator

Responsibilities:

- View assigned patients.
- Help with care-plan preparation.
- Review administrative or permitted clinical details.
- Identify missing instructions.
- Route questions to doctors.
- Assist with patient onboarding and communication.

Clinical review or approval permissions must follow the organization’s policies and applicable professional requirements.

## 3.6 Patient

Responsibilities:

- Verify account ownership.
- View authorized medical reports.
- Receive and configure reminders.
- Mark tasks as completed, skipped or not yet completed.
- Manage notification preferences.
- Request clarification through a defined communication pathway.

Patients cannot change the doctor-authorized prescription by modifying reminder settings.

## 3.7 Family Caregiver

An authorized caregiver may:

- Access specifically shared patient information.
- See approved daily tasks.
- Help track task completion.
- Receive notifications if permitted.
- Assist with appointments.

Caregiver access must require an appropriate authorization workflow and must be revocable.

---

# 4. Complete B2B Business and Operational Workflow

This section defines the principal workflow that the development team should implement.

## Stage 1: Hospital Purchases a Subscription

### Actor
Hospital owner or administrator.

### User Journey

1. A hospital representative visits the WithYou marketing website.
2. They select **For Healthcare Providers**.
3. They review the enterprise offering.
4. They select **Start Trial**, **Request Demo** or **Contact Sales**.
5. The organization provides its name, official contact details and operational requirements.
6. WithYou verifies the organization according to its onboarding policy.
7. The appropriate subscription or approved trial is activated.
8. A tenant workspace is provisioned.
9. An authorized administrator receives an account activation invitation.

### Enterprise Registration Fields

Required initially:

- Organization name.
- Organization type.
- Official email.
- Authorized contact person's name.
- Contact phone number.
- Organization location.
- Billing details.
- Selected plan or trial.

Optional or verification-related:

- Registration or facility credentials.
- Healthcare facility identifier.
- Number of branches.
- Estimated doctor seats.
- Existing software integration requirements.

Collect only information necessary for the relevant business purpose.

### System Actions

- Create an organization record.
- Generate a unique tenant ID.
- Assign subscription state.
- Provision default permissions.
- Create an administrator invitation.
- Record acceptance of applicable terms.
- Set up billing records.

### Subscription States

- Trial pending.
- Trial active.
- Active.
- Payment overdue.
- Suspended.
- Cancelled.
- Expired.

### Acceptance Criteria

- An activated hospital has a separate authorized workspace.
- Only an authorized administrator can configure staff access.
- Subscription status and access entitlements are enforced on the backend.
- Cancellation does not immediately erase medical records; retention, access and export follow contract terms and applicable requirements.

---

# 5. Hospital Onboarding and Workspace Setup

## 5.1 Organization Setup Wizard

After account activation, the administrator completes a setup wizard.

### Step 1 — Hospital Profile

Fields:

- Hospital display name.
- Logo.
- Address.
- Official phone number.
- Official email.
- Facility details.
- Default language.
- Time zone.
- Print document settings.

### Step 2 — Branches and Departments

Examples:

- General medicine.
- Cardiology.
- Orthopedics.
- Pediatrics.
- Outpatient department.
- Inpatient discharge.

For a small clinic, the system can use a single default branch.

### Step 3 — Staff Invitations

The administrator invites:

- Doctors.
- Receptionists.
- Nurses.
- Care coordinators.
- Other authorized staff.

Each invitation must be:

- Bound to the correct organization.
- Time-limited.
- Revocable.
- Associated with a predefined role.

### Step 4 — Doctor Profiles

Recommended fields:

- Full name.
- Professional registration information.
- Specialty.
- Department.
- Practice location.
- Authorized signature or authentication configuration.
- Print header details.

### Step 5 — Clinical Document Templates

The hospital selects or configures:

- Outpatient prescription.
- Consultation report.
- Discharge summary.
- Follow-up visit report.
- Custom document template, if appropriate.

### Step 6 — Communication Settings

Configure:

- Authorized sender identity.
- Email provider.
- WhatsApp Business integration.
- Allowed message templates.
- Language preferences.
- Staff responsible for communication problems.

### Step 7 — Staff Training

Show short onboarding walkthroughs for:

- Registering a patient.
- Creating a visit.
- Writing a digital report.
- Reviewing extracted schedules.
- Printing a finalized report.
- Sharing the patient invitation.

---

# 6. Receptionist Workflow

## 6.1 Receptionist Dashboard

After login, the receptionist should see:

- Today's appointments.
- Patients waiting for consultation.
- New patient registration.
- Existing patient search.
- Draft medical records.
- Reports awaiting printing or delivery.
- Invitations requiring attention.

### Primary Actions

- Add Patient.
- Search Patient.
- Create Visit.
- Assign Doctor.
- Open Visit.
- View Report Status.

## 6.2 New Patient Registration

The receptionist selects **Add Patient**.

### Required Patient Information

- Full name.
- Age or date of birth, as appropriate.
- Contact number where available.
- Basic patient identifier.
- Relevant contact and identity-verification details.

### Conditional Information

- Sex, when clinically or operationally relevant.
- Email address.
- Address.
- Emergency contact.
- Preferred language.
- Authorized caregiver.
- Existing local patient ID.
- Optional ABHA identifier, through an appropriate integration when supported.

A person without a smartphone or email must still be able to receive ordinary hospital services.

### Duplicate Detection

Before creating a patient record, the system checks for possible duplicates using authorized matching fields.

Potential matches should be shown to staff for review.

Do not automatically merge records based only on phone numbers or name similarity.

## 6.3 Communication Preferences and Authorization

The receptionist explains the patient-facing service and records the relevant choices:

- Whether the patient wants a WithYou invitation.
- Email or WhatsApp preference.
- WhatsApp opt-in where applicable.
- Whether an authorized caregiver should receive access.
- Preferred language.
- Whether the patient wishes to receive nonessential notifications.

Store the relevant notice, purpose, permission or opt-in record and timestamp as appropriate.

Medical treatment must not be incorrectly conditioned on accepting optional app notifications.

## 6.4 Create Patient Encounter

Once registration is complete, the receptionist selects **Create Visit**.

Fields:

- Patient.
- Organization and branch.
- Department.
- Assigned doctor.
- Visit date and time.
- Visit type.
- Appointment reference.
- Reason for visit, if appropriately collected.

The system generates a unique encounter ID.

### Example

Patient: Kamla Devi  
Visit type: Discharge follow-up  
Assigned doctor: Dr. Sharma  
Status: Waiting for doctor

All names and details in the prototype will use synthetic data.

## 6.5 Create Report Shell

The receptionist clicks **Create Report**.

This creates a draft report containing:

- Patient identity.
- Visit metadata.
- Doctor assignment.
- Hospital details.
- Selected report template.

The receptionist can complete administrative fields but cannot enter or approve prescribing instructions.

The draft appears in the doctor's queue.

### Encounter States

- Registered.
- Waiting.
- In consultation.
- Clinical draft.
- Awaiting review.
- Finalized.
- Closed.
- Cancelled.

---

# 7. Doctor Workflow — Digital Report Creation

This is a central feature of WithYou Enterprise.

## 7.1 Doctor Dashboard

After login, a doctor should see:

- Today's patient queue.
- Assigned consultations.
- Reports requiring completion.
- AI interpretations awaiting verification.
- Follow-up requests.
- Recently finalized records.

### Key Actions

- Open Patient.
- Start Consultation.
- Create Prescription.
- Create Medical Report.
- Review AI Tasks.
- Finalize Report.
- Print Report.

## 7.2 Patient Consultation Workspace

When the doctor opens a patient, the interface displays:

**Left panel**
- Patient profile.
- Current encounter details.
- Available medical history.
- Existing reports that the doctor is authorized to access.

**Main panel**
- Clinical notes.
- Diagnosis or assessment.
- Medicine prescription.
- Tests and investigations.
- Follow-up schedule.
- Patient instructions.

**Right panel**
- Document preview.
- Missing information alerts.
- Save status.
- AI interpretation status.

The interface should support ordinary clinical workflows without forcing the doctor to interact with AI during every field entry.

## 7.3 Report Creation Modes

### Mode A — Structured Digital Prescription

The doctor enters medicines into dedicated fields.

Each medicine may contain:

- Medicine name.
- Formulation.
- Strength.
- Prescribed dose.
- Dose unit.
- Route.
- Frequency.
- Exact timing when specified.
- Food instructions when specified.
- Start date.
- End date or duration.
- Conditional use instructions.
- Additional clinical notes.

**Preferred architecture:** use structured values directly to generate tasks.

There is no need for AI to re-extract fields already entered reliably in a structured form.

### Mode B — Free-Text Clinical Notes

The doctor types normal medical shorthand or free-text instructions.

Example:

"Review after 7 days. Continue medicines as prescribed."

AI may identify potential task information from the text.

Every extracted instruction remains a proposed interpretation until verified.

### Mode C — Uploaded or Handwritten Report

The doctor uploads a scan, photograph or supported handwritten input.

The pipeline performs document reading or OCR, followed by structured extraction.

Illegible or ambiguous elements are flagged.

Handwriting recognition is not assumed to be reliable enough for autonomous prescribing.

### Design Recommendation

For the first version, prioritize structured input and typed free-text notes.

Add handwriting support after testing actual clinical document quality.

## 7.4 Medical Report Sections

The doctor should be able to create:

1. Patient and encounter details.
2. Presenting complaints and clinical notes.
3. Findings and observations.
4. Assessment or diagnosis, where appropriate.
5. Prescribed medicines.
6. Investigations.
7. Procedures or care instructions.
8. Follow-up appointment.
9. Discharge warning signs when applicable.
10. Doctor details and authentication.
11. Additional notes.

Fields must be configurable by document type.

## 7.5 Draft Saving

Features:

- Autosave during editing.
- Clear save indicators.
- Recovery after accidental navigation.
- Draft version history.
- Protection against concurrent edits.
- Explicit finalization.

No draft should automatically become a final prescription.

---

# 8. Printing and Finalization

The user experience should preserve the familiar hospital practice of giving a physical report to patients.

## 8.1 Print Workflow

The doctor can preview the printable report during authoring.

Recommended sequence:

1. Doctor creates the digital report.
2. Structured instructions or AI-extracted task candidates are prepared.
3. Doctor reviews and corrects them.
4. Doctor finalizes the report and approves the schedule.
5. The system generates a finalized PDF.
6. The finalized document is printed and handed to the patient.
7. The same approved version is made available digitally.

This order prevents a paper report and the app from unintentionally representing different clinical instructions.

If the hospital needs earlier printing, the system may offer a clearly marked draft print preview, but it must not be confused with a final issued document.

## 8.2 Printable Document Requirements

The printed report should include appropriate:

- Hospital identity.
- Patient details.
- Encounter date.
- Doctor identity.
- Document or prescription number.
- Clinical report content.
- Prescribed instructions.
- Follow-up instructions.
- Required clinician authentication or signature.
- Document version or verification reference.

The final signature and authentication approach must be reviewed against the applicable professional and legal requirements before production deployment.

A digitally generated document is not automatically a legally compliant prescription merely because it contains a typed doctor name.

## 8.3 Record Integrity

Every issued report should have:

- Unique document ID.
- Version number.
- Finalization timestamp.
- Author identity.
- Approval record.
- Immutable finalized content or tamper-evident record.
- File checksum.
- Audit events.

Corrections should create a new version rather than silently overwrite an issued report.

---

# 9. AI Medical Instruction Understanding Engine

## 9.1 Purpose

Convert the doctor's existing instructions into structured, understandable patient tasks.

The AI should not independently decide what treatment the patient needs.

## 9.2 Accepted Inputs

- Structured prescription fields.
- Typed medical notes.
- Discharge summaries.
- Follow-up instructions.
- Uploaded supported reports.
- Scanned documents where OCR is enabled.

## 9.3 Information to Extract

### Medication

- Name.
- Formulation.
- Strength.
- Prescribed dose.
- Unit.
- Route.
- Frequency.
- Timing.
- Duration.
- Start and end dates.
- Food instructions.
- Special conditions.

### Appointments

- Follow-up date.
- Follow-up time if documented.
- Clinic or department.
- Doctor.
- Appointment purpose.
- Scheduling status.

### Investigations

- Test name.
- Required date or window.
- Preparation instructions.
- Follow-up instructions.

### Daily Care Tasks

Examples, if explicitly documented:

- Perform a prescribed measurement.
- Record a specified observation.
- Complete a recommended exercise.
- Follow a documented care routine.
- Attend a follow-up review.

### Warning Signs

Extract only documented patient-specific warning signs or those added through an explicitly approved clinical protocol.

The system must not invent emergency instructions.

## 9.4 Normalization

The engine may expand unambiguous, contextually verified clinical abbreviations.

For example:

- BD: twice daily.
- TDS: three times daily.
- OD: once daily in the appropriate medication context.

However, a frequency does not automatically define an exact time of day.

"Twice daily" does not independently establish 9 AM and 9 PM, nor does it establish whether a medicine must be taken with food.

Exact reminder times must come from the verified prescription, an explicitly approved schedule, or a clinician-authorized timing policy appropriate for that instruction.

## 9.5 AI Processing Pipeline

**Step 1 — Input classification**

Identify structured fields, free text or document images.

**Step 2 — Text extraction**

Use structured values directly and OCR only where necessary.

**Step 3 — Structured interpretation**

Convert candidate instructions into a validated schema.

**Step 4 — Rule validation**

Check for:

- Missing clinically necessary fields.
- Conflicting dose or frequency.
- Invalid dates.
- Unsupported assumptions.
- Unclear abbreviations.
- Duplicate candidate instructions.
- Conflicting report versions.

**Step 5 — Source mapping**

Attach each extracted field to its original structured field or source-text location.

**Step 6 — Human verification**

The doctor reviews proposed interpretations.

**Step 7 — Approved schedule generation**

Only approved instructions become actionable scheduled tasks.

## 9.6 AI Output Statuses

Each candidate task must have one of the following states:

- Extracted.
- Needs clarification.
- Verified.
- Rejected.
- Approved.
- Superseded.

AI confidence scores can help prioritize review but must not automatically authorize instructions.

## 9.7 AI Safety Rules

The AI must not:

- Invent medicine doses.
- Guess unclear handwriting.
- Fill missing frequencies.
- Choose arbitrary reminder times.
- Add food instructions without support.
- Generate unapproved treatment recommendations.
- Convert conditional medicines into routine scheduled doses.
- Change medication duration.
- Alter the doctor's original clinical meaning.
- Publish a care plan without authorization.

## 9.8 Special Case: Conditional Medicines

Instructions such as "SOS" or "as needed" must not automatically become daily recurring medication reminders.

They require an approved condition, instructions and appropriate restrictions.

If insufficient information is available, the item stays in a clarification state.

---

# 10. Doctor Verification and Approval Workflow

## 10.1 Review Screen

The review screen uses a side-by-side layout.

**Left side: Original Report**

Displays the doctor's actual text, structured fields or uploaded document.

**Right side: Proposed Patient Tasks**

Displays:

- Medicine details.
- Candidate reminder schedule.
- Follow-up tasks.
- Investigation reminders.
- Care instructions.
- Uncertainty alerts.

## 10.2 Doctor Actions

For each item:

- Confirm.
- Edit.
- Reject.
- Request clarification.
- Mark as verified.

For the complete plan:

- Save review.
- Return for changes.
- Approve care plan.
- Finalize report.
- Publish.

## 10.3 Approval Validation

Before publication:

- The report must be associated with the correct patient.
- The authorizing clinician must have permission.
- Critical unresolved instructions must not be published as approved tasks.
- Scheduling details must be verified.
- Duplicate or contradictory instructions must be resolved.
- The finalized report must have an identifiable version.

## 10.4 Approval Audit

Store:

- Reviewer ID.
- Organization ID.
- Encounter ID.
- Reviewed item IDs.
- Changes made.
- Approval timestamp.
- Final version.
- Approval method.

## 10.5 Subsequent Changes

If the doctor changes the treatment:

1. Create a new report or approved amendment.
2. Reconcile the existing scheduled tasks.
3. Cancel or replace affected future reminders.
4. Retain historical records.
5. Publish the new approved version.
6. Notify the patient that their care plan has been updated.

The app must clearly identify the current approved version.

---

# 11. Personalized Medical Task Engine

The task engine is the functional heart of the patient experience.

## 11.1 Supported Task Types

| Task | Source | Patient experience |
|---|---|---|
| Medication | Clinician-approved prescription | Reminder with the approved instructions |
| Follow-up | Approved visit report | Appointment reminder |
| Investigation | Doctor's instructions | Test or investigation reminder |
| Daily care | Approved care plan | Scheduled care task |
| Observation | Approved monitoring instruction | Reminder to record a measurement |
| Manual personal task | Future B2C self-service | Clearly identified self-created reminder |

## 11.2 Task Model

Each task should contain:

- Task ID.
- Patient ID.
- Organization ID, when provider-originated.
- Source document ID.
- Approval version.
- Task type.
- Display title.
- Patient-friendly instructions.
- Effective start and end.
- Schedule definition.
- Time zone.
- Reminder preference.
- Status.
- Last update timestamp.

## 11.3 Scheduling Logic

The task scheduler must support:

- One-time tasks.
- Daily recurring tasks.
- Explicit multiple daily occurrences.
- Selected weekdays.
- Defined treatment periods.
- Date-specific follow-ups.
- As-needed instructions without invented recurring times.
- Schedule cancellation.
- Replaced schedules after clinical updates.

The system must distinguish:

**Prescription schedule:** what the clinician authorized.

**Notification schedule:** when the app reminds the patient about the approved instruction.

Patients may customize notification behavior only within rules that do not change the clinical instruction.

## 11.4 Reminder States

- Scheduled.
- Due.
- Notified.
- Acknowledged.
- Completed.
- Skipped.
- Missed or unacknowledged.
- Cancelled.
- Superseded.

A reminder delivery event does not prove that medication was taken.

A task completion event is a patient or caregiver self-report unless independently verified.

## 11.5 Reminder Channels

**Primary:** Flutter application push notification and appropriately designed local reminders.

**Secondary:** Optional permitted email or WhatsApp communications.

Sensitive health details should be shown inside the authenticated application, rather than placed in ordinary lock-screen, email or WhatsApp previews.

## 11.6 Reminder Examples

A privacy-preserving phone notification:

"WithYou: You have a scheduled care task. Open the app to view it."

A follow-up reminder:

"You have an upcoming appointment. Open WithYou for details."

The patient can see the actual instructions after authenticating.

## 11.7 Notification Failure Handling

The backend must handle:

- Expired device tokens.
- Disabled push permissions.
- Offline devices.
- Duplicate delivery attempts.
- Changed phone numbers.
- Delivery provider errors.
- Cancelled care plans.
- Patient opt-outs.
- Stale or invalid schedules.

Use idempotent job processing to avoid duplicate task creation or notification floods.

Do not claim reminders are guaranteed to arrive; mobile operating systems and connectivity can delay notifications.

---

# 12. WhatsApp and Email Integration

## 12.1 Initial Purpose

WhatsApp and email primarily help a newly registered patient discover and activate their WithYou account.

They may later support permitted, consented, minimal notifications.

## 12.2 Approved Workflow

1. Receptionist records the correct contact details.
2. The system records the required communication choice or permission.
3. Doctor finalizes the relevant care plan.
4. WithYou generates a short-lived invitation.
5. Messaging service sends the approved invitation template.
6. Patient opens the invitation.
7. The patient verifies their identity.
8. Patient installs or opens WithYou Care.
9. The patient completes activation.
10. The app retrieves records only after authorization.

## 12.3 Example Invitation

"Hello, your healthcare provider has made your digital care information available through WithYou. Open the secure WithYou invitation to get started."

Do not include diagnosis, full medication lists or reports in the default message.

## 12.4 WhatsApp Requirements

- WhatsApp Business Platform integration.
- Correct recipient opt-in.
- Approved message templates.
- Valid sender configuration.
- Opt-out handling.
- API error handling.
- Delivery status webhooks.
- Message event records.
- Duplicate-send prevention.
- Message category and cost tracking.

WhatsApp policies and pricing can change; the provider integration must be reviewed before production launch.

## 12.5 Email Requirements

- Verified sending domain.
- Appropriate email authentication.
- Minimal invitation content.
- Short-lived activation links.
- Secure redirect to the app or official web domain.
- Bounce and delivery failure handling.
- Revocation of unused invitations.

## 12.6 Invitation Link Security

Invitation links must:

- Use unpredictable tokens.
- Have an expiry.
- Be revocable.
- Be bound to the intended onboarding process.
- Avoid exposing a medical record directly.
- Require sufficient identity verification.
- Not grant indefinite access merely because someone possesses the URL.

Treat a shared or recycled phone number as a potential account-security problem.

## 12.7 Messaging Status

Track:

- Queued.
- Submitted to provider.
- Delivered, if confirmed.
- Failed.
- Rejected.
- Expired.
- Opted out.

Do not display "delivered" based only on a successful HTTP request to the messaging provider.

---

# 13. Flutter Patient Application

## 13.1 Platform

- Android first for MVP validation.
- iOS support through Flutter when build and testing resources are available.
- One patient application that can connect to multiple approved providers in the future.

## 13.2 Patient Onboarding

### Screen 1 — Welcome

Show:
- WithYou branding.
- Sign in.
- Activate invitation.
- Language selection.

### Screen 2 — Identity Verification

Support an appropriate login method, such as phone-based verification, with protections against account takeover and phone reassignment.

Possession of a phone number alone must not automatically grant access to all records associated with that number.

### Screen 3 — Invitation Verification

Validate:
- Invitation status.
- Intended recipient.
- Expiration.
- Account association.
- Patient or caregiver authorization.

### Screen 4 — Permissions

Explain:
- Medical record access.
- Notification settings.
- Device privacy.
- Caregiver sharing.
- Relevant data-processing choices.

Request notification permissions at an appropriate point in onboarding.

### Screen 5 — Home Dashboard

Display today's approved tasks and next important events.

## 13.3 Home Screen

Recommended sections:

**Header**
- Greeting.
- Patient profile.
- Current date.

**Today**
- Tasks due.
- Tasks completed.
- Upcoming tasks.

**Daily Timeline**
- Morning.
- Afternoon.
- Evening.
- Night.

These groups are for presentation only; clinically authorized frequency and timing take precedence.

**Next Appointment**
- Date.
- Time.
- Hospital.
- Department.
- Appointment details.

**Latest Medical Report**
- Report title.
- Date.
- Issuing provider.
- View document.

## 13.4 My Reports Screen

Patients can view authorized:

- Prescriptions.
- Visit reports.
- Discharge summaries.
- Investigation documents when available.
- Follow-up instructions.

Filters:
- All reports.
- By provider.
- By date.
- By document type.

The document viewer should provide a readable preview and secure download where allowed.

## 13.5 My Schedule Screen

Display:

- Today's tasks.
- Upcoming tasks.
- Medication schedule.
- Follow-up appointments.
- Investigation reminders.
- Future care tasks.

Each task card displays the approved information and its status.

## 13.6 Task Details Screen

Show:

- Task name.
- Source healthcare provider.
- Approved instructions.
- Due time.
- Applicable duration.
- Related report.
- Status.
- Completion controls.
- Clarification contact where available.

For medication tasks, show the authorized instructions without changing their meaning.

## 13.7 History Screen

Display:

- Previous visits.
- Past reports.
- Task activity.
- Past appointments.
- Current and superseded care plans.

Mark completed tasks as patient-reported rather than clinically verified unless there is independent confirmation.

## 13.8 Notifications Screen

Display:

- Upcoming reminders.
- Missed or unacknowledged reminders.
- New approved reports.
- Changed schedules.
- New invitations.
- Account and security messages.

## 13.9 Settings

- Language.
- Profile.
- Notification preferences.
- Authorized caregivers.
- Security settings.
- Connected providers.
- Privacy controls.
- Support.
- Sign out.

## 13.10 Offline Behavior

The app may offer limited offline access to previously authorized content.

Requirements:

- Encrypted local storage.
- Restricted caching.
- Clear stale-data indicators.
- Reauthentication where appropriate.
- Removal of local data on secure sign-out.
- Synchronization when connectivity returns.

Production implementation must define how revised or revoked instructions are handled while offline.

---

# 14. WithYou Enterprise Dashboard — Information Architecture

## 14.1 Sidebar Navigation

**Dashboard**

Overview of the user's authorized operational responsibilities.

**Patients**

Registration, search, patient profiles and encounters.

**Appointments**

Today’s queue and future visits.

**Medical Reports**

Drafts, completed reports, document templates and print history.

**Review Queue**

AI-derived task candidates, ambiguities and pending approval.

**Care Plans**

Approved schedules, active plans and revisions.

**Communications**

Invitations, notification status and relevant opt-in information.

**Staff & Roles**

User invitations and permission management.

**Analytics**

Operational performance and workflow statistics.

**Billing**

Subscription, invoices and usage.

**Settings**

Hospital profile, branch settings, templates, integrations and security.

Navigation must change according to the signed-in user's permissions.

## 14.2 Receptionist Workspace

Prioritize:

- Quick patient registration.
- Patient search.
- Today's queue.
- Visit creation.
- Reports awaiting print or delivery.
- Communication errors.

## 14.3 Doctor Workspace

Prioritize:

- Assigned patient queue.
- Medical record editor.
- Prescription entry.
- AI verification.
- Clinical approval.
- Print preview.
- Relevant patient history.

## 14.4 Admin Workspace

Prioritize:

- Staff management.
- Organization configuration.
- Branch administration.
- Subscription status.
- Operational analytics.
- Access and audit overview.
- Integration health.

---

# 15. B2C Strategy — Future Independent Product

The second commercial approach introduces direct-to-consumer users who may not have been onboarded by a hospital.

## 15.1 Independent B2C Journey

1. User discovers WithYou.
2. Installs the Flutter app.
3. Creates an account.
4. Adds personal medical tasks.
5. Configures reminders.
6. Uploads personal documents if supported.
7. Organizes appointments.
8. Optionally shares records with a caregiver or authorized healthcare provider.

## 15.2 Self-Created Tasks

Examples:

- Personal appointment reminder.
- Reminder to contact a clinic.
- Reminder to collect a test report.
- User-entered medication reminder based on existing medical instructions.

Self-entered tasks must be visibly distinguished from clinician-approved tasks.

The app must not imply that manually entered medical schedules have been checked by a doctor.

## 15.3 Future Subscription Options

Potential models:

- Free basic reminder tier.
- Premium document organization.
- Family caregiver coordination.
- Additional authorized sharing and storage features.

No prices are finalized in this PRD.

Pricing must be validated against operating costs and consumer willingness to pay.

## 15.4 Shared Patient Identity

A patient may use WithYou independently and later connect an authorized hospital.

The platform should support both origins without unintentionally merging records or exposing private information between providers.

---

# 16. Secure Data Architecture

## 16.1 Data Protection Objective

WithYou will process highly sensitive patient and provider information.

The security architecture must address:

- Unauthorized data access.
- Data leakage between hospitals.
- Account takeover.
- Accidental disclosure.
- Medical record modification.
- Backup loss.
- API abuse.
- AI data exposure.
- Unauthorized caregiver access.

## 16.2 Recommended Architecture

Use a managed cloud platform with an explicitly selected deployment region and documented subcontractors.

For India-first hosting, AWS Mumbai is one available choice.

Example production design:

**Application layer**
- Web frontend.
- Backend API.
- Authentication service.
- Background workers.
- Notification services.

**Data layer**
- PostgreSQL database.
- Private object storage.
- Backup storage.
- Audit log storage.
- Cache and job queue.

**Security layer**
- Key management.
- Network restrictions.
- Access policies.
- Centralized monitoring.
- Secret management.
- Security alerts.

Indian regional hosting is a sensible initial design choice, but it does not automatically establish legal compliance. Review actual data flows, vendor subprocessors and applicable transfer requirements.

## 16.3 Multi-Tenant Isolation

Each healthcare organization receives a tenant identifier.

Example:

- Tenant A: Sunrise Clinic.
- Tenant B: City Hospital.
- Tenant C: Valley Medical Centre.

Clinical records, staff memberships and operational permissions are scoped to the appropriate tenant.

Recommended controls:

- Tenant IDs on scoped records.
- Backend tenant authorization.
- Role-based permissions.
- Database row-level security where supported.
- Tenant-scoped document access.
- Access-control tests on every patient API.
- Isolation tests between organizations.
- Separate enterprise billing and configuration records.

A user cannot access another tenant's patient record simply by changing a URL or API identifier.

## 16.4 Patient Identity Versus Tenant Membership

Global identity and provider-specific records must be modeled separately.

A patient can have one WithYou identity with multiple independently authorized provider relationships.

Doctors and staff can have one login with distinct memberships and permissions across organizations.

Any cross-provider record access must require an explicit authorization path.

## 16.5 Encryption

Production design should implement:

**In transit**
- HTTPS with modern TLS.
- Authenticated backend-to-service connections.
- Secure integration endpoints.

**At rest**
- Managed database encryption.
- Encrypted object storage.
- Encrypted backups.
- Secure key management.

**Mobile**
- Encrypted sensitive local storage.
- Secure token storage.
- No secrets embedded in application source code.

## 16.6 Authentication

**Enterprise staff**
- Secure login.
- Multi-factor authentication for privileged roles.
- Strong session management.
- Revocation on employee departure.
- Enterprise SSO as a later feature.

**Patients**
- Identity verification.
- Secure session and refresh-token handling.
- Reauthentication for sensitive changes.
- Device and session management.

## 16.7 Authorization

All access decisions must be checked by the backend.

Examples:

- Receptionist cannot prescribe.
- Doctor cannot approve a report outside an authorized assignment.
- Caregiver cannot view an unrelated patient's records.
- Hospital A cannot view Hospital B's patients without a valid authorized relationship.
- Platform support cannot silently browse clinical records.

## 16.8 Document Storage

Store medical PDFs and uploads in private object storage, not public website directories.

Requirements:

- Private-by-default access.
- Authorized download endpoints.
- Short-lived signed access where appropriate.
- Malware scanning.
- File-type validation.
- File-size limits.
- Versioning.
- Retention policy.
- Backup and recovery.
- Auditable download events.

Avoid exposing document object paths or credentials in public logs.

## 16.9 Audit Logging

Record high-value events:

- Patient registration.
- Document creation.
- Document modification.
- Report finalization.
- Clinical approval.
- Medical record access.
- Print/export.
- Caregiver authorization.
- Invitation delivery.
- Reminder scheduling.
- Administrative permission changes.
- Failed access attempts.

Audit logs must be protected against unauthorized alteration.

## 16.10 Retention and Deletion

Define retention policies by:

- Record type.
- Legal and professional requirements.
- Hospital contract.
- Data-processing purpose.
- Applicable user rights.
- Backup lifecycle.

Patient app deletion requests and termination of enterprise subscriptions must not bypass records that the healthcare provider is legally required to retain.

Establish a documented export, archival and deletion workflow.

## 16.11 Incident Response

Define procedures for:

- Security incident detection.
- Internal escalation.
- Access revocation.
- Containment.
- Investigation.
- Breach assessment.
- Required notifications.
- Evidence preservation.
- Service recovery.
- Post-incident review.

Legal notification obligations and timelines must be determined from the applicable rules, contracts and incident circumstances.

---

# 17. India-Specific Healthcare and Privacy Considerations

## 17.1 Digital Personal Data Protection Framework

WithYou must be designed with the Digital Personal Data Protection Act, 2023, the notified DPDP Rules, 2025 and their staged commencement in mind.

Important design topics:

- Clear privacy notices.
- Appropriate lawful processing and consent where applicable.
- Purpose limitation.
- Data minimization.
- User rights workflows.
- Processor contracts.
- Security safeguards.
- Breach handling.
- Retention and erasure procedures.
- Grievance and support processes.

The notification published on 13 November 2025 uses staged commencement dates; not every provision becomes applicable at the same time.

Before launch, obtain qualified legal review of the precise obligations applicable to WithYou, the hospital and each data-processing activity.

## 17.2 Hospital and WithYou Responsibilities

The arrangement may involve:

- Hospital as the organization determining clinical documentation and care purposes.
- WithYou as a technology service provider processing data under a contract.
- Independent WithYou purposes for direct-to-consumer accounts.

The precise legal roles cannot be determined from product branding alone.

Contracts must define:

- Permitted purposes.
- Responsibilities.
- Authorized subprocessors.
- Security obligations.
- Patient requests.
- Retention.
- Incident cooperation.
- Data exports.
- Contract termination.

## 17.3 ABDM Compatibility

WithYou should be designed for potential interoperability with Ayushman Bharat Digital Mission infrastructure.

Future capabilities may include:

- Optional ABHA-related workflows.
- Healthcare provider and facility identity integrations.
- Consent-based health record exchange.
- ABDM-compatible health record structures.
- Relevant FHIR-based APIs.

Do not claim ABDM certification or integration unless the implementation actually meets the relevant requirements.

ABHA must not be treated as a mandatory identifier for using the initial WithYou product.

## 17.4 Healthcare Data Standards

Use structured data models that can later map to appropriate HL7 FHIR resources.

Examples:

- Patient.
- Practitioner.
- Organization.
- Encounter.
- MedicationRequest.
- CarePlan.
- Appointment.
- DocumentReference.
- Provenance.
- AuditEvent.

The exact exchange profiles must follow the supported ABDM implementation guide version when integration is implemented.

## 17.5 Medical Documentation Requirements

Production launch must validate:

- Prescribing authority.
- Prescription content requirements.
- Doctor identity and registration details.
- Signature and authentication rules.
- Record retention.
- Document amendments.
- Patient access.
- Applicable facility-specific requirements.

This requires legal and clinical confirmation; the initial prototype should not present itself as a certified electronic prescribing system.

---

# 18. Backend System Architecture

## 18.1 Recommended Technology Stack

| Component | Recommended choice |
|---|---|
| Marketing website | Next.js, TypeScript, Tailwind CSS |
| Enterprise dashboard | Next.js, React, TypeScript |
| Patient application | Flutter, Dart |
| Backend API | FastAPI, Python |
| Primary database | PostgreSQL |
| Database ORM | SQLAlchemy |
| Schema validation | Pydantic |
| Background job queue | Redis-backed worker or managed queue |
| Document storage | Private cloud object storage |
| AI service | Controlled LLM extraction service |
| OCR | Document extraction or OCR service when needed |
| Mobile push | Firebase Cloud Messaging |
| Email | Transactional email provider |
| WhatsApp | Official WhatsApp Business Platform |
| Monitoring | Centralized logs, metrics and error tracking |
| Deployment | Managed infrastructure with regional configuration |

These are recommendations rather than mandatory dependencies.

## 18.2 Major Backend Modules

### A. Organization Service

- Enterprise registration.
- Tenant provisioning.
- Subscription state.
- Branch configuration.

### B. Identity and Access Service

- Staff authentication.
- Patient authentication.
- Role membership.
- Authorization policies.
- Invitations.

### C. Patient Service

- Patient registration.
- Patient identifiers.
- Duplicate checks.
- Patient-provider relationships.
- Caregiver authorization.

### D. Encounter Service

- Visit creation.
- Doctor assignment.
- Consultation status.
- Encounter history.

### E. Clinical Document Service

- Draft editing.
- Finalization.
- Versioning.
- PDF generation.
- Print records.

### F. AI Extraction Service

- Structured input processing.
- Free-text interpretation.
- OCR pipeline.
- Validation.
- Source mapping.

### G. Clinical Approval Service

- Review queue.
- Corrections.
- Approval.
- Rejection.
- Version replacement.

### H. Care Task Service

- Approved task creation.
- Recurrence.
- Scheduling.
- Cancellation.
- Completion tracking.

### I. Notification Service

- Push.
- Email.
- WhatsApp.
- Delivery tracking.
- Preference enforcement.

### J. Audit and Compliance Service

- Access logs.
- Clinical change history.
- Consent and communication records.
- Incident event records.

### K. Billing Service

- Plan entitlements.
- Subscription status.
- Invoices.
- Usage events.

## 18.3 Event-Driven Processing

Important system events:

- organization.activated
- patient.registered
- encounter.created
- report.draft_saved
- report.finalized
- extraction.completed
- clinical_review.required
- careplan.approved
- careplan.published
- invitation.created
- invitation.delivered
- patient.activated
- task.scheduled
- task.completed
- careplan.superseded

The scheduler should create reminder work only from the approved, published plan version.

Use reliable event publication, transactional outbox or an equivalent approach to prevent inconsistencies between saved records and queued messages.

---

# 19. Database Design

This is a proposed relational data model.

## 19.1 Core Tables

| Table | Important fields |
|---|---|
| organizations | id, name, type, status, created_at |
| organization_branches | id, organization_id, name, address |
| subscriptions | id, organization_id, plan_id, status, period_end |
| users | id, identity fields, authentication status |
| organization_memberships | id, organization_id, user_id, role, status |
| patients | id, identity and demographic fields |
| patient_identifiers | id, patient_id, organization_id, identifier_type, identifier |
| patient_provider_links | id, patient_id, organization_id, verification_status |
| caregiver_authorizations | id, patient_id, caregiver_user_id, scope, status |
| encounters | id, organization_id, patient_id, doctor_id, status |
| clinical_documents | id, encounter_id, author_id, document_type, status |
| document_versions | id, document_id, version, checksum, storage_reference |
| prescriptions | id, encounter_id, document_version_id, status |
| medication_orders | id, prescription_id, structured_instruction_fields |
| extraction_jobs | id, document_version_id, status, model_version |
| extracted_instructions | id, extraction_job_id, source_reference, candidate_value, status |
| clinical_reviews | id, document_version_id, reviewer_id, result, timestamp |
| care_plans | id, patient_id, organization_id, source_version_id, status |
| care_tasks | id, care_plan_id, task_type, schedule, status |
| task_occurrences | id, task_id, scheduled_at, completion_status |
| device_tokens | id, user_id, device_reference, status |
| invitations | id, patient_id, channel, token_hash, status, expiry |
| communication_preferences | id, user_id, channel, preference, updated_at |
| consent_records | id, subject_id, purpose, notice_version, status |
| notification_events | id, task_occurrence_id, channel, provider_reference, status |
| audit_events | id, actor_id, organization_id, action, object_reference, occurred_at |

This schema is illustrative and requires normalization, indexes, foreign-key design, data-lifecycle policies and security review.

## 19.2 Critical Database Rules

- Every provider-scoped record must have an enforceable tenant relationship.
- Finalized document versions must not be silently overwritten.
- Care tasks must reference the approved source.
- Reminder occurrence uniqueness must prevent accidental duplicate scheduling.
- Patient identities must remain distinct from organization-specific patient identifiers.
- Audit events should be append-only and tamper-resistant.
- Sensitive values must not appear in plain-text application logs.

---

# 20. API Requirements

Representative API routes:

## Enterprise APIs

- POST /v1/organizations
- GET /v1/organizations/current
- POST /v1/organizations/staff-invitations
- GET /v1/subscription

## Patient APIs

- POST /v1/patients
- GET /v1/patients
- GET /v1/patients/{id}
- POST /v1/patients/{id}/encounters

## Clinical APIs

- GET /v1/encounters/{id}
- POST /v1/encounters/{id}/reports
- PATCH /v1/reports/{id}/draft
- POST /v1/reports/{id}/finalize
- POST /v1/reports/{id}/extraction
- GET /v1/reports/{id}/review
- POST /v1/reports/{id}/review-decisions
- POST /v1/care-plans/{id}/approve
- POST /v1/care-plans/{id}/publish
- GET /v1/reports/{id}/print

## Patient App APIs

- POST /v1/patient-invitations/verify
- GET /v1/me/reports
- GET /v1/me/care-plans
- GET /v1/me/tasks
- POST /v1/me/task-occurrences/{id}/response
- GET /v1/me/appointments
- PATCH /v1/me/notification-preferences

## Communication APIs

- POST /v1/invitations
- GET /v1/communications/{id}/status
- POST /v1/webhooks/messaging-provider

All routes require:

- Explicit request validation.
- Appropriate authentication.
- Object-level authorization.
- Rate limiting.
- Idempotency where needed.
- Structured error responses.
- Audit handling.
- No unnecessary health information in logs or URLs.

The route list describes intended contracts, not existing deployed services.

---

# 21. UI and Design Specification

## 21.1 Brand Personality

WithYou should feel:

- Human.
- Reliable.
- Calm.
- Professional.
- Clear.
- Approachable.

It must not look like a diagnostic AI chatbot.

The brand centers on continuity, trust and daily support.

## 21.2 Brand Colors

Proposed palette:

- Deep teal: #126E69.
- Dark navy: #102C3A.
- Soft mint: #E5F4EF.
- White: #FFFFFF.
- Neutral gray: #667781.
- Amber: for pending clarification.
- Restrained red: for genuine blocking or safety alerts.

These colors are a design proposal, not a finalized brand identity.

## 21.3 Enterprise Design

A professional SaaS interface with:

- Persistent sidebar.
- Clear top navigation.
- Searchable tables.
- Patient profile panels.
- Status badges.
- Clinical forms.
- Print previews.
- Review comparison panels.
- Accessible confirmations and error states.

Efficiency is more important than decorative animation inside clinical workflows.

## 21.4 Patient App Design

A simple, mobile-first experience with:

- Large readable text.
- Clear task hierarchy.
- Easily accessible reports.
- Limited visual complexity.
- Strong contrast.
- Hindi and English options.
- Simple completion actions.
- Clear provider identity.

The app should be usable by older patients and family caregivers with limited technical confidence.

---

# 22. Landing Page PRD

The public WithYou website should market the broader platform, not only the hackathon discharge challenge.

## 22.1 Navigation

- Home.
- For Patients.
- For Providers.
- How It Works.
- Security.
- About.
- Get Started.

## 22.2 Hero

**Headline:** Better healthcare follow-through, every day.

**Subheadline:**

WithYou connects medical reports, doctor-approved care instructions and personal reminders in one simple experience for healthcare providers and their patients.

**Primary CTA:** Explore WithYou Enterprise.

**Secondary CTA:** Explore Patient App.

## 22.3 Product Sections

### WithYou Enterprise

Explain:

- Patient onboarding.
- Digital prescriptions and reports.
- AI-assisted task extraction.
- Doctor verification.
- Secure patient delivery.
- Follow-up management.

### WithYou Care

Explain:

- Medical report access.
- Personalized reminders.
- Daily medical tasks.
- Follow-up tracking.
- Caregiver-friendly experience.

## 22.4 Business Workflow Showcase

Show the complete journey:

Hospital subscribes → Staff registers patient → Doctor creates report → AI structures instructions → Doctor approves → Patient receives invitation → App provides reminders.

## 22.5 Trust Section

Communicate actual design commitments:

- Controlled access.
- Clinician verification.
- Privacy-aware communication.
- Source-backed instructions.
- Auditable records.

Do not display unsupported compliance or certification badges.

## 22.6 Enterprise CTA

**Headline:** Bring continuous care into your practice.

CTA options:

- Request a Demo.
- Join Pilot Program.
- Explore Enterprise Platform.

For the hackathon, a working demo request form or an explicitly labeled product walkthrough is sufficient.

---

# 23. Business Model and Monetization

## 23.1 B2B Subscription Model

Hospitals and clinics purchase access to WithYou Enterprise.

Potential billing components:

- Base organization subscription.
- Included staff or doctor seats.
- Additional branch access.
- Document-processing allowances.
- Messaging consumption.
- Advanced integrations.
- Enterprise support.

## 23.2 Proposed Plan Structure

### Clinic Plan

For independent doctors and small clinics.

Potential features:
- Patient registry.
- Digital reports.
- Care-plan creation.
- Basic patient reminders.

### Hospital Plan

For larger teams.

Potential features:
- Multi-role staff management.
- Departments.
- Clinical review workflow.
- Communication tools.
- Enhanced reporting.

### Enterprise Plan

For hospital groups.

Potential features:
- Multiple branches.
- SSO.
- Integration support.
- Custom operational policies.
- Contract-based service commitments.
- Advanced security and audit configuration.

No monetary prices are specified without market validation.

## 23.3 Value Proposition for Hospital Buyers

The business case should focus on validating:

- Reduced repetitive administrative work.
- Consistent digital documentation.
- Clearer patient instructions.
- Efficient handoff between staff and patients.
- Better access to follow-up information.
- More organized post-visit communication.

These are intended benefits, not clinically proven outcomes of WithYou.

## 23.4 Unit Economics to Measure

- Revenue per organization.
- Active doctor seats.
- Active patients per organization.
- Cost per processed document.
- Cost per scheduled reminder.
- WhatsApp and email charges.
- Storage cost per patient.
- Customer onboarding cost.
- Organization retention.
- Customer support cost.
- Gross margin.

Actual pricing should be tested with hospitals and clinics.

---

# 24. Non-Functional Requirements

## 24.1 Performance

Proposed engineering targets, subject to load testing:

- Common dashboard interactions should feel responsive under normal pilot conditions.
- Patient lists must support pagination and search.
- Document processing should run asynchronously when slow.
- Printing should remain available after finalization even if AI extraction needs retrying.
- Reminder generation must not block doctor report creation.

## 24.2 Availability

A future production target may be 99.9% service availability, with appropriately defined exclusions and measured infrastructure support.

The hackathon prototype has no such guaranteed service-level agreement.

## 24.3 Reliability

- Retries for temporary job failures.
- Deduplication of background tasks.
- Backup restoration tests.
- Monitoring of stalled extraction jobs.
- Monitoring of failed notifications.
- Consistency between report versions and task schedules.

## 24.4 Scalability

The architecture should grow from one clinic to multiple subscribed organizations without needing a complete rewrite.

Start with a modular backend rather than unnecessary microservices.

## 24.5 Accessibility

- Keyboard-accessible web interface.
- Clear form errors.
- Sufficient contrast.
- Screen-reader labels.
- Large mobile touch targets.
- Local language support.

## 24.6 Disaster Recovery

Define recovery objectives before production deployment.

Proposed initial planning targets:

- Recovery point objective: 24 hours or better.
- Recovery time objective: 4 hours or better.

These are targets for infrastructure design and testing, not guaranteed current capabilities.

---

# 25. Edge Cases and Failure Handling

## Case 1: Patient Does Not Have WhatsApp

Offer permitted email or appropriate alternative onboarding.

Printed documents remain available.

## Case 2: Patient Does Not Have a Smartphone

The hospital can still print the report.

The absence of app access must not block clinical care.

## Case 3: Incorrect Phone Number

Do not expose medical records to the unintended recipient.

Allow correction and invitation revocation.

## Case 4: Doctor Updates a Prescription

Supersede the affected old schedule and publish the new verified instructions.

## Case 5: AI Cannot Read the Prescription

Display a clarification state.

Do not generate unverified reminders.

## Case 6: Doctor Types Ambiguous Shorthand

Ask for clarification before making the affected item actionable.

## Case 7: Patient Doesn't Open the App

Keep the approved plan available through the hospital's agreed channels.

Do not claim an unacknowledged notification means the patient followed the instruction.

## Case 8: Shared Family Phone

Require an appropriate account and caregiver access model.

Avoid granting access based solely on possession of the device.

## Case 9: Patient Changes Hospitals

Maintain the correct source organization and authorized record relationship.

Do not automatically expose one hospital's records to another.

## Case 10: Subscription Expires

Apply contracted access, export, retention and transition policies without uncontrolled deletion of clinical records.

## Case 11: Messaging Provider Is Down

Queue permitted retries and display an accurate delivery state.

Do not silently mark an undelivered invitation as successful.

## Case 12: A Medication Is Stopped Early

Cancel affected future reminders after the authorized change is recorded.

Preserve the earlier history.

---

# 26. Hackathon MVP Scope

The real product vision is large, so the hackathon version should demonstrate the core business loop.

## Priority P0 — Must Build

### Public Website
- WithYou branding.
- B2B and B2C explanation.
- Functional navigation.
- Entry to enterprise demo.

### Enterprise Workspace
- Demo hospital account.
- Role-based receptionist and doctor experiences.
- Patient registration.
- Encounter creation.
- Digital report editor.
- Structured medicine entry.
- AI interpretation of typed free-text.
- Clinical verification.
- Final report generation.
- Print-ready PDF.

### Patient Connection
- Simulated invitation.
- Patient verification demo.
- Patient-linked medical record.

### Flutter Application
- Demo patient account.
- Medical report viewer.
- Approved task schedule.
- Follow-up reminder.
- Task completion.

## Priority P1 — Strong Enhancements

- Real push notification on test device.
- Controlled WhatsApp API integration.
- Secure document storage.
- Hospital admin interface.
- Revisions and superseded schedules.
- Hindi patient interface.
- Simple caregiver view.

## Priority P2 — Post-Hackathon

- Full enterprise billing.
- Real hospital onboarding.
- Advanced clinical templates.
- Handwriting recognition.
- ABDM integrations.
- Multi-hospital patient record linking.
- Independent consumer subscriptions.
- Production regulatory validation.
- Production-grade monitoring and operations.

---

# 27. Hackathon Demo Script

The judges should see one uninterrupted story.

## Scene 1 — Hospital Buys WithYou

Show the WithYou website.

Open the enterprise offering and demonstrate how a hospital would request or activate its workspace.

For the prototype, use an already provisioned sample hospital account.

## Scene 2 — Receptionist Registers Kamla Devi

Log in as a receptionist.

Enter the patient information and create a consultation or discharge-related encounter.

Assign it to a sample doctor.

## Scene 3 — Doctor Creates a Digital Report

Switch to the doctor dashboard.

Open Kamla Devi's encounter.

Enter the medical report using structured medicine fields and a sample free-text follow-up instruction.

## Scene 4 — AI Understands the Instructions

Run the extraction.

Show:

- Identified medicine information.
- Frequency.
- Follow-up.
- Suggested task definitions.
- Source text.
- Ambiguity warning.

## Scene 5 — Doctor Approves the Tasks

Correct the deliberately ambiguous field.

Approve the resulting plan.

Demonstrate that the ambiguous item cannot bypass approval.

## Scene 6 — Print the Report

Generate the finalized PDF.

Display the hospital-branded report with the correct doctor and document information.

## Scene 7 — Send Patient Invitation

Show the invitation queue and simulated WhatsApp or email delivery.

If an actual messaging sandbox is integrated, display the real test result rather than a fabricated delivery status.

## Scene 8 — Patient Opens WithYou Care

Open the Flutter app.

Sign in as the sample patient.

Show:

- The new report.
- Medicine schedule.
- Follow-up appointment.
- Today's tasks.

## Scene 9 — Demonstrate a Reminder

Use an authorized sample task scheduled for the demo.

Show the reminder and task completion.

## Scene 10 — Explain the SaaS Model

Return to the enterprise dashboard and demonstrate how the same organization can manage multiple patients and staff accounts.

Close by explaining how the model can scale from one clinic to multiple hospitals.

---

# 28. Test and Acceptance Criteria

## 28.1 Core Workflow Tests

| ID | Test scenario | Expected result |
|---|---|---|
| T01 | Hospital administrator activates workspace | Authorized workspace created |
| T02 | Receptionist registers a patient | Correct patient record created |
| T03 | Receptionist creates report shell | Doctor receives assigned encounter |
| T04 | Doctor enters structured prescription | Structured fields are preserved |
| T05 | Doctor enters ambiguous free text | AI marks affected field for review |
| T06 | AI proposes task schedule | Original source remains traceable |
| T07 | Unauthorized role attempts approval | Access denied |
| T08 | Doctor approves complete plan | Approved version published |
| T09 | Final document is printed | PDF matches finalized report |
| T10 | Invitation is generated | Secure, expiring invitation created |
| T11 | Correct patient activates app | Authorized records become accessible |
| T12 | Wrong account opens invitation | Medical record access denied |
| T13 | Reminder becomes due | Task appears in schedule |
| T14 | Patient completes task | Completion saved as self-reported |
| T15 | Doctor changes prescription | Old applicable reminders superseded |
| T16 | Different hospital requests record | Access denied without authorization |
| T17 | Notification is blocked or fails | Accurate delivery state displayed |
| T18 | Patient changes notification settings | Clinical instructions remain unchanged |

## 28.2 Security Tests

- Cross-tenant access attempts.
- Patient ID manipulation.
- Unauthorized doctor approvals.
- Expired invitations.
- Reused invitation tokens.
- Incorrect caregiver relationships.
- Session revocation.
- Sensitive API response leakage.
- Insecure object storage access.
- Accidental disclosure in logs.
- Cross-provider patient matching.
- Unauthorized report version replacement.

## 28.3 AI Safety Tests

Use an appropriately annotated synthetic test set containing:

- Clear prescription fields.
- Missing doses.
- Conflicting frequencies.
- Missing treatment duration.
- Ambiguous shorthand.
- Unreadable images.
- As-needed medicines.
- Duplicate medicines.
- Changed prescriptions.
- Invalid follow-up dates.

Measure unsupported inference errors explicitly.

---

# 29. Product Success Metrics

## 29.1 Activation

- Percentage of subscribed organizations that finish setup.
- Time from organization activation to first completed report.
- Percentage of invited doctors who activate accounts.

## 29.2 Clinical Workflow

- Reports created digitally.
- Reports finalized.
- AI extraction completion.
- Ambiguities detected.
- Average time to clinician approval.
- Percentage of published plans linked to finalized source documents.

## 29.3 Patient Experience

- Invitation activation rate.
- Percentage of patients accessing their first report.
- Notification opt-in rate.
- Reminder acknowledgement rate.
- Follow-up task completion reporting.
- Patient and caregiver comprehension test results.

## 29.4 Business

- Trial-to-paid conversion.
- Active subscribing organizations.
- Monthly recurring revenue.
- Retention.
- Support volume.
- Cost per active patient.

## 29.5 Safety

- Unsupported instruction generation rate.
- Approval bypass rate.
- Cross-tenant access failures.
- Outdated reminder incidents.
- Incorrect patient linkage incidents.
- Clinical correction turnaround.

All metrics require actual instrumentation. No numerical product performance claims should be fabricated for the pitch.

---

# 30. Product Roadmap

## Phase 1 — Hackathon Prototype

Goal: Demonstrate the complete hospital-to-patient journey.

Deliver:
- Marketing site.
- Receptionist dashboard.
- Doctor report editor.
- AI extraction and review.
- Printed report.
- Patient onboarding demo.
- Flutter task timeline.

## Phase 2 — Controlled Clinic Pilot

Goal: Validate the operational workflow with clinical stakeholders.

Deliver:
- Robust permissions.
- Real staff onboarding.
- Validated report workflows.
- Secure hosted storage.
- Proper consent and communication management.
- Real app notifications.
- Operational monitoring.
- Clinical safety testing.

No real patient pilot should proceed before appropriate approvals, contracts and security controls.

## Phase 3 — Commercial B2B SaaS

Goal: Sell to multiple clinics and hospitals.

Deliver:
- Subscription billing.
- Organization management.
- Support workflows.
- Data export.
- Stronger auditing.
- Integration options.
- Security and reliability testing.
- Enterprise onboarding.

## Phase 4 — Expanded Consumer Platform

Goal: Enable direct consumer adoption.

Deliver:
- Independent B2C accounts.
- User-managed reminders.
- Family coordination.
- Personal document organization.
- Optional paid features.

## Phase 5 — Interoperable Care Ecosystem

Goal: Connect authorized patient records and care workflows across providers.

Explore:
- ABDM integrations.
- FHIR-based interoperability.
- Hospital information system connectors.
- Advanced care coordination.

---

# 31. Critical Product Decisions

The following decisions are recommended for the initial version.

| Question | Decision |
|---|---|
| Who pays initially? | Hospitals and clinics |
| Who uses the enterprise platform? | Receptionists, doctors, authorized staff and administrators |
| Who uses the mobile app? | Patients and authorized caregivers |
| Who creates prescriptions? | Authorized medical professionals |
| Who interprets typed free-text instructions? | AI-assisted extraction service |
| Who approves actionable clinical tasks? | Authorized clinician |
| Who schedules reminders? | Deterministic task engine using approved instructions |
| When is the final report printed? | After finalization, matching the digital approved version |
| What is sent by WhatsApp/email? | Minimal secure invitation and permitted communications |
| Where are medical records viewed? | Authenticated WithYou application |
| Is ABHA mandatory? | No, not for the initial product |
| Can patients create their own tasks? | Planned for the independent B2C offering, clearly distinguished |
| Can one hospital see another's records? | Only through an appropriate authorized workflow |
| Can AI prescribe or change medicine? | No |
| What is the first hackathon demonstration? | Complete clinician-to-patient task delivery |

---

# 32. Open Decisions Before Production

These items require explicit decisions with healthcare stakeholders and relevant specialists:

1. Which medical specialties and document types will be supported first?
2. Will the first commercial customer be an individual clinic or a multispecialty hospital?
3. How will authorized prescriptions be legally authenticated?
4. Which clinical fields are mandatory for each report type?
5. Who can approve particular types of care instructions?
6. How will patients and caregivers be safely verified?
7. What are the precise legal roles of the hospital and WithYou regarding personal data?
8. Which cloud and AI vendors satisfy the privacy and contractual requirements?
9. What is the applicable medical-record retention schedule?
10. What happens when a patient cannot access the digital application?
11. What is the procedure when a doctor cancels or changes a previously published instruction?
12. What service-level and support obligations will enterprise subscriptions include?
13. Which message categories and communication templates will be permitted?
14. What clinical safety tests are required before using real patient data?
15. Which ABDM features, if any, belong in the first commercial release?

These are discovery and compliance tasks, not reasons to block the synthetic-data hackathon prototype.

---

# 33. Definition of Done — Hackathon MVP

The hackathon MVP is considered complete when:

- WithYou has a coherent public brand and functioning website.
- A sample hospital can access its operational workspace.
- A receptionist can register a sample patient.
- A receptionist can create and route an encounter.
- A doctor can create a digital medical report.
- The doctor can enter medicines and follow-up instructions.
- AI can interpret supported free-text fields.
- Ambiguous instructions are identified without guessing.
- The doctor can verify and approve the derived care plan.
- A finalized PDF can be generated and printed.
- An invitation can be demonstrated through the intended delivery workflow.
- A sample patient can access the authorized report in Flutter.
- The Flutter application displays the approved task schedule.
- A task reminder and completion flow works.
- Role restrictions and patient access permissions are demonstrated.
- Test data and simulated services are clearly identified.
- The team can explain the enterprise business model and patient value proposition.

---

# 34. Reference Research and Standards

The following sources informed this PRD. Their inclusion does not mean WithYou is currently certified or compliant.

**Privacy and Indian health-data governance**

- Digital Personal Data Protection Act and Rules — Ministry of Electronics and Information Technology: https://www.meity.gov.in/documents/act-and-policies
- DPDP commencement notification: https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- Ayushman Bharat Digital Mission: https://abdm.gov.in/
- ABDM Health Data Management Policy: https://abdm.gov.in/static/media/health_management_policy_bac9429a79.80f74bc3e039c00acd4f.pdf
- EHR Standards for India, 2016: https://www.mohfw.gov.in/sites/default/files/EMR-EHR_Standards_for_India_as_notified_by_MOHFW_2016_0.pdf
- National Medical Commission regulations: https://www.nmc.org.in/rules-regulations-nmc/1000/

**Health interoperability**

- ABDM FHIR Implementation Guide: https://nrces.in/ndhm/fhir/r4/6.0.0/
- HL7 FHIR MedicationRequest: https://hl7.org/fhir/R4/medicationrequest.html
- HL7 FHIR CarePlan: https://hl7.org/fhir/R4/careplan.html
- HL7 FHIR DocumentReference: https://hl7.org/fhir/R4/documentreference.html
- HL7 FHIR Provenance: https://hl7.org/fhir/R4/provenance.html

**Technical infrastructure and communication**

- WhatsApp Business Messaging Policy: https://business.whatsapp.com/policy
- Firebase Cloud Messaging for Flutter: https://firebase.google.com/docs/cloud-messaging/flutter/receive-messages
- PostgreSQL Row-Level Security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- OWASP API Security Top 10: https://api-security.owasp.org/editions/2023/en/0x00-header/
- AWS Regions: https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html

---

# 35. Final Product Definition

**WithYou is a B2B-first healthcare SaaS platform that connects doctors' digital medical documentation with patients' everyday care tasks.**

Hospitals and clinics subscribe to WithYou Enterprise to manage patient onboarding, generate digital reports, verify medical instructions and securely publish patient-facing care plans.

Patients use WithYou Care, a Flutter application, to access those authorized records and receive personalized reminders for medicine schedules, appointments and care tasks.

The platform preserves familiar clinical workflows, including printed reports, while extending care beyond the hospital through secure digital access and reliable task organization.

Its long-term vision is to connect provider-managed and independently managed healthcare tasks in one coherent patient experience.

**Brand promise:** Your health journey. We're with you.
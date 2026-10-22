# Patient prescription review and appointment requests

Implemented from the supplied workflow diagram on 13 October 2026. The diagram expands the PRD: section 7 describes clinician uploads, whereas this new flow permits an authenticated, linked patient to submit their own document. Original clinician-authorized care plans remain separate from patient-submitted documents.

## Connected screens and states

Mobile **Requests** is the fifth navigation destination. It contains upload selection, patient-identity attestation, review consent, submission status, clinician clarification, patient response, appointment preference and confirmed appointment details. Doctor/receptionist **Prescription requests** in the web portal uses the same records.

1. Patient chooses JPEG/PNG/PDF, confirms ownership and clinic review consent, then submits. Native file selection survives lifecycle/resume refresh. Cancelled selection makes no upload.
2. Server authenticates membership and linked patient, checks real file signatures/decoded content, caps multipart input and files at 8 MB, rejects tiny images, limits PDFs to ten pages and rejects encrypted/active PDFs. Images are decoded and rewritten without EXIF. Objects have generated private paths, with no public download token. Raw-file SHA-256 gives a patient-scoped duplicate key; repeated submission returns the existing request.
3. State is `awaiting_review`. File validity is not a blur detector or proof of correct patient/dose. The assigned clinician downloads the original and may request a proposed Gemini transcription. Patient/receptionist list responses omit unreviewed AI text. The AI cannot approve, diagnose, validate interactions or create medication tasks.
4. Clinician checks patient identity and every source page, then writes a patient-readable reading or clarification. `awaiting_patient` requests confirmation; `clarification_requested` keeps booking blocked. Unclear text stays unresolved, rather than cancelling a potentially valid prescription automatically.
5. Patient confirms the reading or supplies a correction. Corrections return to clinician review. A clearer upload can replace a clarification request through an explicit link; original and revision history are retained, and the old request becomes `replaced`.
6. `ready_to_book` permits a preferred future appointment time within sixty days, with contact confirmation. The request becomes `booking_requested`; this does not reserve or confirm the preferred time.
7. Reception staff allocate a future thirty-minute clinician slot and enter the visit location. A transaction checks current access, assignment, state, revision and existing slot, preventing double booking. `confirmed` saves the actual time, location, confirmer and in-app confirmation channel.
8. Patient/receptionist cancellation releases a matching confirmed slot and retains review history. Replayed/stale changes are rejected. Activity revisions notify foreground mobile refreshes of clinician/booking changes; the selected upload and consent survive ordinary refreshes.

Prescription-reading confirmation never verifies medicine safety or changes the approved prescription. Any new clinical instructions require the existing doctor report/review/publication flow.

## Research and operational limits

[OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) informs size caps, generated paths, content validation, restricted downloads and malware-scanning requirements. [Firebase private-storage guidance](https://firebase.google.com/docs/storage/security) informs keeping direct client storage closed. Server-side authorization applies to every file download; receptionists receive booking metadata without document contents.

[WHO health-AI governance](https://www.who.int/publications/i/item/9789240029200) informs clinician oversight and avoiding autonomous clinical approval. [Gemini multimodal input documentation](https://ai.google.dev/api/interactions-api) informs the proposed document transcription adapter, storage disabled and explicit timeout. The existing approved-data-processing gate remains off: unpaid patient-document processing is not enabled. A fictional live PDF request returned provider HTTP 503/high demand and another timed out; live OCR accuracy/success is not claimed. Manual review remains operational.

[File picker 13.1 API](https://pub.dev/documentation/file_picker/latest/file_picker/FilePicker/pickFile.html) informs native/browser selection without a broad storage-access permission. File bytes are read only after size selection checks and are not saved as an application medical cache.

Cloud uploads remain blocked until an approved malware-scanning pipeline is configured and validated. PDF active-content checks alone are not antivirus certification. Local tests use synthetic documents and private emulator storage. Full handwriting/blur benchmarks, licensed medication/interaction databases, professional/legal prescribing validation, clinic-hours/holiday availability policy, reminder/background notifications for appointments, confirmation-email delivery/retries and record-retention decisions remain separate requirements. App confirmation is available in-app; no email or WhatsApp delivery is implied.

## Cost and verification

One upload reads membership/organization/patient, performs bounded validation, writes one private object and one request/audit/activity transaction. Images are limited to twenty million decoded pixels. List results are capped at one hundred; clinic-scale pagination is not claimed. Duplicate uploads skip new object/request creation. Manual review uses no AI quota; clinician-triggered assisted reading is throttled to ten attempts per hour and times out after 25 seconds, without model fallback.

Tests cover forged/active/oversized-page documents, metadata removal, consent/access boundaries, duplicate handling, clarification loops, revision conflicts, booking prerequisites, reception clinical-data denial, confirmed in-app details, conflicting clinician slots and cancellation. Native screen and file-picker results are recorded in `validation.md`.

# Generated landing-page images

Seven coordinated assets were created with the built-in GPT image generation tool on 13 October 2026. No API credentials were needed. Final assets are saved in `apps/website/public/images/generated/`; the full prompt set and provenance are recorded in `docs/generated-images.json`.

| Placement | Asset | Art direction |
|---|---|---|
| Hero | hero-connected-care.png | Laptop report and patient phone, calm teal healthcare product photography |
| Enterprise product card | enterprise-clinician.png | Indian clinician reviewing a digital care plan |
| Patient product card | care-at-home.png | Older Indian patient and daughter using a phone at home |
| Approved-plan workflow stage | report-to-daily-care-v2.png | Reviewed report connected to a daily timeline |
| Doctors showcase / documentation stage | showcase-doctor.png | Source report and proposed-task review on a desktop display |
| Hospitals showcase / registration stage | showcase-hospital.png | Receptionist and clinician collaborating around a patient queue |
| Patients showcase / delivery stage | showcase-patient.png | Patient holding a daily care timeline at home |

The workflow controls reuse the appropriate images from the same set. Showcase tabs select different image assets and maintain live HTML headings and calls to action. Provider/patient informational pages use the matching generated artwork.

The original WithYou logo remains unchanged. An invented leaf mark in the first workflow image was removed with a targeted image-model edit; only the corrected `-v2` asset is used. Generated people and screen content are illustrative, with no real patient data, dosing instructions, customer claims or certifications.

The old drawn phone, browser dashboard, placeholder document bars, floating approval card and associated mockup styles were removed from the web components. Navigation, forms, pricing, workflow selection, tabs and the actual clinical/patient applications remain functional code.

Next.js serves responsive optimized images. The hero is preloaded; secondary assets load lazily with local blur placeholders. All images have descriptive alternatives and reserved aspect ratios to avoid layout shifts. No image is served directly from the generation cache.

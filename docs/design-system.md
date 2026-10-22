# WithYou design system

Canonical token source: `packages/design-tokens/tokens.json`. `npm run tokens` generates CSS variables and Flutter theme definitions. Inspect the live component gallery at `/design-system`.

## Identity

The original supplied WithYou raster is retained, including its transparency, colors and proportions. No substitute mark, tracing or regenerated logo was introduced. Navigation pairs the complete original asset with a readable Manrope wordmark. Blue supports focus treatment; teal and mint establish the main interface identity. The hero headline follows the companion design specification: “From your doctor's desk to your day.”

## Tokens

| Purpose | Value |
|---|---|
| Primary | #0D6E68 |
| Deep | #0B3438 |
| Mint | #DDF4EA |
| Page | #F8FBF9 |
| Surface / alternate | #FFFFFF / #EFF7F3 |
| Primary / secondary text | #142C30 / #52676A |
| Border | #D9E7E2 |
| Success / warning / danger | #157A55 / #945A0F / #B43C42 |
| Warm decorative accent | #F5B28C |
| Supporting blue | #0564C9 |

Manrope is the shared typeface. Web headings use fluid sizing; primary operational reading and Flutter body text are 16px. Small product mockups are illustrations, not the patient application's instructional text. The common spacing scale is 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96 and 120px.

Control radius: 12px. Card radius: 20px. Feature radius: 28px. Visual composition radius: 32px. Pills use a full radius. Borders and tonal surfaces establish separation, with restrained shadows for product compositions.

## Components

- Brand, primary/secondary button links, status badges, text actions and avatars.
- Headers, role-filtered portal sidebar, semantic tabs, form fields, checkboxes, progress steps, banners and table/empty/loading states.
- Source comparison, candidate review, correction form, report card, task timeline and approved-state confirmation.
- GPT-generated device, clinician and patient imagery across marketing sections; placements and complete prompt set are documented in `docs/marketing-images.md` and `docs/generated-images.json`.
- Flutter Material 3 cards, navigation bar, report bottom sheet, input fields, task actions and neutral reminder dialog.

## State semantics

| State | Treatment | Meaning |
|---|---|---|
| Draft / extracted | Neutral or amber with text | Not authorized patient instructions |
| Needs clarification | Amber reason | Missing or unsupported fields block verification |
| Verified | Green with label | Clinician reviewed a candidate; plan is not yet published |
| Approved / published | Green with label and author/time | Authorized version available to the patient |
| Rejected | Neutral explicit label | Excluded from published tasks |
| Superseded | Neutral version label | Historical report replaced by a newer approved plan |
| Invitation created | Neutral explicit label | Local preview generated; no message sent |
| Completed | Explicit label/check | Patient self-report; no claim of clinical verification |

Color is never the only status indicator. The approval transaction records author, encounter, organization, version and timestamp. Corrections retain before/after sources in the local audit collection.

## Motion and responsive behavior

Hero entries and selected product/story views use short, purposeful movement. The scroll story keeps the report visible on desktop and uses a straightforward stacked layout on mobile. Native scrolling is preserved. Reduced-motion settings disable CSS animation and transitions; clinical instructions are always accessible without waiting for an animation.

Validated landing widths: 360, 390, 768, 1024 and 1440px. The mobile layout presents the headline before the product composition, collapses navigation to a button, stacks content and keeps task controls large. The portal tables intentionally use their own scroll container when needed rather than causing page overflow.

## Accessibility limits

Automated checks are evidence for tested pages and states, not a blanket conformance certification. Additional manual screen-reader, zoom, older-device and native Android testing remains necessary. Performance targets are measured separately and must not be inferred from a successful build.

## Connected mobile screens

Today puts outstanding care ahead of secondary report/appointment cards, with explicit completion state and source links. Schedule offers Today/Upcoming/History with calendar ordering; Reports uses authorized clinician-approved versions; Profile shows actual provider/timezone, account linking and optional Android reminder permission. All four use the shared API and original logo/Manrope/teal tokens. Error states mark records stale and disable activity controls until refresh; revoked access clears records. Foreground checks use a small revision response rather than reloading every scheduled task each minute.

Native screenshots were inspected on the Android 36 emulator. Flutter's two-times text-scale welcome test passed; TalkBack, VoiceOver, older/physical device and full localized clinical acceptance remain separate validation work.

The mobile bottom bar now has a fifth destination, Requests. Its source-review/confirmation/booking states use explicit text and separate requested versus confirmed appointments. The pending file remains in memory across refresh/resume; clearer replacements link to the prior clarification without deleting source history. Native Android file selection, consent and private submission have passed emulator checks.

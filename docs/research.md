# Research and implementation decisions

Reviewed 13 October 2026. Sources below are primary guidance from standards bodies, framework owners and original UX research authors. They inform the implementation; none establishes clinical safety or legal compliance.

| Source | Relevant guidance | Applied decision |
|---|---|---|
| [W3C WCAG 2.2](https://www.w3.org/TR/wcag/) and [Understanding documents](https://www.w3.org/WAI/WCAG22/Understanding/) | Keyboard access, meaningful structure, visible focus and access without dependence on visual color | Skip link, landmarks, labeled controls, focus outlines, semantic tabs, text status labels and accessible expanders |
| [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) | Normal text needs 4.5:1; qualifying large text needs 3:1 | Deep teal/neutral reading colors; darker warning text; non-selected workflow text stays opaque |
| [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Minimum 24×24 CSS pixels or specified exceptions; larger targets can help users | Primary web actions approximately 44–48px+, Flutter Material controls at least 48px |
| [NN/g: ten usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Visible system status, error prevention, recognition rather than recall | Save/publish states, actionable errors, explicit approval gate, meaningful empty states and consistent navigation |
| [NN/g: recognition and recall](https://www.nngroup.com/articles/recognition-and-recall/) | Keep needed information visible during an action | Original instruction and proposed task appear together; reviewer does not have to remember the source |
| [Next.js fonts](https://nextjs.org/docs/app/api-reference/components/font) | Self-host optimized fonts through next/font | Manrope uses Next.js optimization; Flutter bundles the same font with its OFL license |
| [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers) | Server HTTP handlers and explicit request processing | Server-side role/tenant checks and transactional clinical mutations, rather than client-only restrictions |
| [Firebase emulator overview](https://firebase.google.com/docs/emulator-suite) | Local service integration using emulated infrastructure | One shared `demo-withyou` environment across all clients; loopback-only services |
| [Firestore emulator connections](https://firebase.google.com/docs/emulator-suite/connect_firestore) | Admin SDK emulator configuration and client connection behavior | Central environment configuration; no unrelated browser storage as a clinical database |
| [Authentication emulator](https://firebase.google.com/docs/emulator-suite/connect_auth) | Development identities and token verification; emulator tokens are not production authentication | Synthetic accounts, checked API membership and clearly separated development configuration |
| [Flutter themes](https://docs.flutter.dev/cookbook/design/themes) | Shared ThemeData for consistent colors and typography | Generated Material 3 theme from the web design token source |

## Product-specific synthesis

The central interaction is a handoff, not a generic analytics dashboard. The public page therefore shows a report becoming an approved task schedule. The portal keeps source text and candidate instructions visible together. The patient app presents a calm timeline rather than shrinking the hospital table onto a phone.

AI output is a proposal. Structured fields bypass extraction, while unsupported notes stay in clarification. A configured extraction adapter checks its schema and verbatim source; no provider can supply an approval state. Publication requires explicit clinician action after all included candidates are verified.

Invitation status is separate from delivery. Completion is separate from clinical verification. Reminder preview is separate from device notification. These distinctions appear in copy and in stored states.

No testimonials, clinical outcome statistics, hospital partnerships, compliance badges or commercial prices are invented. Provider-specific pricing, healthcare legal obligations and real operational readiness remain open as directed by the original PRD.

## Research boundaries

This implementation does not make medical or legal recommendations. The prototype does not claim compliance with India's privacy framework or ABDM. Those are explicit production discovery items in PRD §§17 and 32, and require current legal/vendor review before real data is used. The dated email-provider quotas in the source document were not repeated as product claims or relied on in this build.

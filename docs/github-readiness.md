# GitHub readiness — 22 October 2026

The source is prepared for a hackathon/development repository. Full production clinical readiness is not claimed.

## Completed preparation

- Initialized a dedicated Git repository at the project folder, isolating it from the pre-existing Desktop repository. No parent repository history or unrelated personal files are included.
- Ignored APK/AAB binaries, logs, build/type caches, test outputs, environment files, credentials, local medical data/outbox files and signing material. Existing local files are preserved.
- Added `npm run check:repository` for root/path/size/selected-secret checks. Configured provider secret values are checked locally without printing them. This is a limited source check, not a full vulnerability/history audit.
- Replaced unconditional emulator import with a launcher that imports only when emulator export metadata exists. First clones can start without private database exports; later starts can resume an exported database.
- Documented Node 24.14.0, Flutter 3.47.2/Dart 3.13.2, Java 17 and Android SDK 36. Replaced the generic mobile README and hardcoded adb location.
- Added read-only GitHub Actions checks for repository hygiene, Node tests/types/build, Flutter analysis, normal/private-network tests and web compilation. No cloud keys or deployment permission are required. First hosted execution remains pending upload.

## Local validation

19 server tests passed, including first-start/restoration cases. Website type checking and production compilation passed. Flutter analysis is clean; 9 default tests and 10 private-network-flag tests passed. Workflow YAML parsed successfully. Repository checks report no candidate-path/size/selected-secret findings. Full browser/native workflows were not rerun for this repository-preparation change; earlier results are in `validation.md`.

The dependency vulnerability audit attempted on 22 October timed out at the package registry. A successful current audit is still required; earlier results do not establish today's vulnerability status. A clean source clone is checked before handoff; installing dependencies and running every remote CI job on another machine remains separate evidence.

## Upload handoff

Create an empty private repository in the intended GitHub account, without generating README/license/ignore files. Supply its exact URL before configuring the remote or pushing. Then run the first GitHub Actions checks and inspect their results. APKs belong in separately reviewed Release assets, with instructions that these development builds require a local server; they are not store releases.

No project reuse license has been selected. Private storage can proceed; choose an appropriate license before inviting public reuse. Upstream font licenses are already preserved.

## Product work still remaining

Cloud Firebase/staging validation, public HTTPS service, verified external sender/delivery callbacks, approved AI data arrangement and OCR evaluation, production upload malware scanning, signing/physical-device testing, secure persistent mobile sessions, remote/background updates, offline/privacy design, broader PRD clinical templates/schedules and organizational clinical/operational acceptance remain incomplete. Paid billing remains deferred as requested. See the detailed workflow audit for per-step limits.

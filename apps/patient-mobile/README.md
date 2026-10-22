# WithYou Care

Flutter patient app connected to the same authorized API as the provider website. Today, Schedule, Reports, Profile and Requests show approved care, self-reported activity, optional Android reminders, private prescription submission and appointment status.

## Toolchain

Validated with Flutter **3.47.2**, Dart **3.13.2**, Android SDK 36 and Java 17. The SDK constraint is recorded in `pubspec.yaml`; keep `pubspec.lock` committed. GitHub checks use the same Flutter version. Android is the validated native target; this repository does not include an iOS project or claim iOS validation.

## Local preview

Start the website and seeded Firebase emulators using the [root instructions](../../README.md), then from this folder:

```sh
flutter pub get --enforce-lockfile
flutter build web --base-href /care-app/
```

From the repository root, run `node scripts/prepare-mobile-preview.mjs`, then open `http://127.0.0.1:3000/care-app/index.html`. Tokens and records stay in memory; the optional development server address is a saved connection preference. The seeded patient account is `patient@withyou.test`, password `WithYouDemo2026!`; it exists only in the local emulator.

## Android development

For the Android emulator:

```sh
flutter run --dart-define=API_BASE=http://10.0.2.2:3000
```

For a USB-connected phone, run `adb reverse tcp:3000 tcp:3000`, then:

```sh
flutter run --dart-define=API_BASE=http://127.0.0.1:3000
```

The private Wi-Fi bridge in `scripts/mobile-wifi-server.mjs` is for synthetic development data only and requires `--dart-define=ALLOW_LOCAL_DEMO_HTTP=true`. Public addresses require HTTPS. Release builds disable the private-HTTP option. Production needs the public HTTPS API, organization signing key and physical-device validation. Never publish signing keys or private environment files.

## Checks

```sh
flutter analyze
flutter test
flutter test --dart-define=ALLOW_LOCAL_DEMO_HTTP=true
```

The Windows native smoke helper locates adb through PATH/ANDROID_HOME, or accepts `-AdbPath` and `-Serial`. It requires a running debug app, local seeded backend and synthetic fixtures; it is not a production-device test.

## Remaining release work

Secure persistent authentication, remote/background care-plan updates, encrypted offline behavior, app links, production upload scanning, external confirmation delivery and full clinical/device acceptance remain incomplete. Notification timing is subject to Android restrictions. Gemini-assisted reading cannot approve a prescription and remains data-processing gated. See the [workflow audit](../../docs/workflow-production-audit.md) and [prescription flow](../../docs/prescription-appointment-flow.md).

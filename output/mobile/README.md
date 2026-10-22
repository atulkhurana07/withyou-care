# WithYou Care APK for a phone on the same Wi-Fi

Install the updated `withyou-care-wifi.apk` (version 1.0.1, build 2) over the old APK. This universal Android debug APK currently connects to `http://192.168.1.82:3100` on this computer and uses synthetic local demo data.

On your phone, connect to the same Wi-Fi and open:

http://192.168.1.82:3101/withyou-care-wifi.apk

Download and open the APK. Allow installation from your browser if Android requests it. Sign in using:

- Email: `patient@withyou.test`
- Password: `WithYouDemo2026!`

Keep this computer awake, with the website, Firebase emulators and Wi-Fi bridge running. To restart them, open terminals at the project root:

1. `npm run emulators`
2. Once emulators are ready, `npm run dev`
3. `node scripts/mobile-wifi-server.mjs` (or double-click `start-wifi-bridge.cmd` in this folder)

If the account is missing after a fresh emulator start, run `npm run seed`. If the phone cannot connect, open `http://192.168.1.82:3101/health` in the phone browser. `ready: true` confirms it can reach the computer's server. The download page at `http://192.168.1.82:3101/` displays the current app server address. Allow Node.js through Windows Firewall for your trusted network. Guest Wi-Fi and some hotspots may block device-to-device access.

The old APK failed when the computer moved from `192.168.1.82` to `10.170.57.76`; during troubleshooting it moved back to `192.168.1.82`. The updated app has **Connection settings** on its sign-in screen. If the computer address changes again, enter the new address shown by the bridge, ending in `:3100`, then choose **Save & check connection**. The address is saved across app restarts. Passwords and session tokens are still not saved. The bridge logs new addresses automatically when the network changes.

The bridge listens on port 3100 across network changes and forwards to the local website at `127.0.0.1:3000`. Only private-network peers are accepted. Firebase ports remain on loopback. Port 3101 serves the APK and `/health` connection diagnostic.

## Verification on 13 October 2026

- Flutter analysis: no issues.
- Updated build: Flutter analysis has no issues; 10 automated tests pass with Wi-Fi support enabled, and nine pass without it.
- Android regression test reproduces the old server address, changes it through Connection settings, checks connectivity, saves it, recreates the app, confirms the saved address, and successfully signs in before exercising the care tabs.
- Android emulator test: rejected bad password; successful login; shared patient workspace; task completion, skip and undo with original state restored; notification enable/schedule/cancel; all five tabs; approved report details; upload consent gate; care updates; sign-out.
- All 17 backend unit tests pass.
- End-to-end prescription upload, duplicate detection, clinician clarification, patient confirmation, appointment allocation, role restrictions and cancellation pass using a separate synthetic test patient. An initial run against the shared demo patient reached its existing hourly upload limit.

This is a debug demo build. Physical-phone behavior has not been checked because no phone is connected. Login is needed after app restart. Reminders cover the next 24 hours and Android may delay them; reconnect to receive care-plan changes. Public hosting, release signing, remote push and offline access remain outside this local APK.

Rebuild from `apps/patient-mobile`:

`flutter build apk --debug --dart-define=API_BASE=http://192.168.1.82:3100 --dart-define=ALLOW_LOCAL_DEMO_HTTP=true`

Copy `build/app/outputs/flutter-apk/app-debug.apk` to `output/mobile/withyou-care-wifi.apk`. The older `withyou-care-development.apk` targets an emulator and is not the phone Wi-Fi build.

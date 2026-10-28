# Fluito mobile (Flutter / Android)

Flutter client for the Fluito Christian Pentecostal dating API. This is the
first Android slice toward a Google Play upload. It is **not** published.

There is **no native iOS app** in this repository. The “Liquid Glass” look is
ported from the web glassmorphism in `frontend/src/index.css` (`.glass-card`,
`.glass-nav`, orb background), not from SwiftUI/UIKit.

| Item | Value |
| --- | --- |
| Application id (Play / prod) | `co.iotready.fluito` |
| Application id (dev flavor) | `co.iotready.fluito.dev` |
| Version | `1.0.0+1` (`versionName` 1.0.0, `versionCode` 1) |
| Default API (dev) | `https://api.fluito.veritas.org.in` |
| Production API | **TBD.** Pass `--dart-define=API_BASE_URL=…` when you have a prod host. |

## Dev server API wiring

Android **debug** and **release-candidate** builds are meant to talk to a
**development** backend, not a production host.

Compile-time knobs (never a baked-in prod URL):

| Define | Default | Meaning |
| --- | --- | --- |
| `FLAVOR` | `dev` | `dev` or `prod` |
| `API_BASE_URL` | `https://api.fluito.veritas.org.in` when `FLAVOR=dev`; **empty** when `FLAVOR=prod` | Origin of the API. `/api` is appended automatically. |

`config/dev.json` is the checked-in hosted-dev default:

```json
{ "FLAVOR": "dev", "API_BASE_URL": "https://api.fluito.veritas.org.in" }
```

### Point a build at a local or remote **dev** API

```bash
cd mobile

# 1. Hosted development API (default)
./tool/run_android_dev.sh

# 2. Emulator + Bun on the same machine
#    In the repo root: bun run dev   (listens on :4000)
API_BASE_URL=http://10.0.2.2:4000 ./tool/run_android_dev.sh

# Equivalent without the helper script
flutter run --flavor dev --dart-define-from-file=config/dev.json
flutter run --flavor dev \
  --dart-define=FLAVOR=dev \
  --dart-define=API_BASE_URL=https://api.fluito.veritas.org.in
```

`--flavor dev` is required: the Android Gradle project has `dev` and `prod`
product flavors. The `dev` flavor allows HTTP cleartext (emulator / LAN) and
installs as `co.iotready.fluito.dev`.

A **DEV · &lt;host&gt;** chip is drawn on screen so testers can see which API
the binary is compiled against. Profile → Developer / API shows the same.

### Production URL

Do **not** invent a production host. `config/prod.json.example` leaves
`API_BASE_URL` empty. A `prod` flavor build without an explicit URL fails at
startup (`MissingProdApiUrlException`). Copy the example and fill it in only
when a real production API exists.

## Screens (skeleton wired to documented API shapes)

- Auth — login / register, JWT in `flutter_secure_storage`, auto-restore
- Discover — card + like / pass → `POST /api/matches/swipe`
- Matches — list + unmatch
- Messages — conversation list + polling chat
- Profile — photo upload, Christian fields (denomination, church), preferences

## Glass UI

Shared widgets in `lib/widgets/glass.dart` / tokens in `lib/theme/tokens.dart`
mirror `frontend/src/index.css`:

- Translucent white fills, hairline borders, and highlight gradients
  matching `--glass-bg` / `--glass-border` (no live `BackdropFilter` —
  that janked Android and blocked the keyboard)
- Static radial orbs (the CSS blobs) painted once, not animated
- Blue (default) and pink (female profile) palettes

## Build a release AAB

See [PLAY_STORE.md](PLAY_STORE.md). Short version for a **dev** API
release-candidate:

```bash
API_BASE_URL=https://your-dev-host ./tool/build_dev_appbundle.sh
# output: build/app/outputs/bundle/devRelease/app-dev-release.aab
```

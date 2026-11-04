# Google Play readiness (Android)

This document is scaffolding only. **Do not publish** until the blockers at
the bottom are resolved. The first binary should talk to a **dev** API.

## Identifiers

| Field | Value |
| --- | --- |
| Application id / package | `co.iotready.fluito` (prod flavor) |
| Dev application id | `co.iotready.fluito.dev` |
| App name | Fluito (`Fluito Dev` on the dev flavor) |
| `versionName` | `1.0.0` (from `pubspec.yaml`) |
| `versionCode` | `1` |
| `compileSdk` / `targetSdk` | **36** (Play requirement for new apps as of 2026-08-31) |
| `minSdk` | Flutter default (API 24) |

Change `version:` in `pubspec.yaml` (`1.0.1+2` → name `1.0.1`, code `2`) for
each Play upload.

## Produce a release AAB

### 1. Signing (required for Play; optional for local smoke)

```bash
cd mobile/android
cp key.properties.example key.properties
# Generate once; back up offline. Never commit the JKS or key.properties.
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias upload
```

Fill `storePassword`, `keyPassword`, `keyAlias`, `storeFile` in
`android/key.properties`. That file and `*.jks` / `*.keystore` are gitignored.

Without `key.properties`, release builds still compile using the **debug**
keystore so `flutter build appbundle` can be verified in CI. Play will reject
that signature.

### 2. Dev-server release-candidate (recommended until prod API exists)

Android debug / internal-testing builds should target a **development**
backend. Production URL is TBD and must not be invented.

```bash
cd mobile
# Hosted development API is the default (https://api.fluito.veritas.org.in)
API_BASE_URL=https://your-dev-api.example \
  flutter build appbundle --flavor dev --release \
  --dart-define=FLAVOR=dev \
  --dart-define=API_BASE_URL=https://your-dev-api.example
```

Output: `build/app/outputs/bundle/devRelease/app-dev-release.aab`

Or `API_BASE_URL=… ./tool/build_dev_appbundle.sh`.

### 3. Prod flavor (blocked on a real API URL)

```bash
flutter build appbundle --flavor prod --release \
  --dart-define=FLAVOR=prod \
  --dart-define=API_BASE_URL=https://REPLACE-ME-WHEN-YOU-HAVE-A-HOST
```

Output: `build/app/outputs/bundle/prodRelease/app-prod-release.aab`

A prod build with an empty `API_BASE_URL` throws `MissingProdApiUrlException`
at startup on purpose.

R8 / minify is on for `release` (`isMinifyEnabled` + `isShrinkResources`) with
`android/app/proguard-rules.pro`.

## Permissions (minimal)

Declared in `android/app/src/main/AndroidManifest.xml`:

| Permission | Why |
| --- | --- |
| `INTERNET` | REST API + profile images |
| `ACCESS_NETWORK_STATE` | Offline error handling |
| `CAMERA` (optional hardware) | Profile photo capture; `required=false` |

Storage / media-read permissions are **not** declared. `image_picker` uses the
Android Photo Picker on API 33+. Location is not requested (matching is not
geo-based yet).

Dev flavor only: HTTP cleartext is allowed so the emulator can reach
`http://10.0.2.2:4000`. Prod flavor forbids cleartext.

Google Sign-In needs Android OAuth clients (package + SHA-1) and a Web client
(`GOOGLE_WEB_CLIENT_ID` / `serverClientId`) in the **manasshe2@gmail.com** GCP
project. See [README.md](README.md#google-sign-in--sign-up).

## Play Console listing (placeholders)

Fill these in Console before the first production upload. None are hosted yet.

| Listing field | Placeholder / notes |
| --- | --- |
| Privacy policy URL | `https://api.fluito.veritas.org.in/privacy` (served by the Bun API). Companion terms: `https://api.fluito.veritas.org.in/terms`. Do not invent a `fluito.app` host until DNS exists. |
| App category | Dating |
| Content rating | Complete the IARC questionnaire. Expect **Mature 17+** / similar: the app is a dating service for adults (18+). Do **not** claim “everyone”. |
| Target audience | 18+ only. Registration, Google onboarding, and profile DOB updates reject under-18. |
| Ads | None in this skeleton. |
| News / COVID / government | No. |
| Data safety | See below. |

### Data safety (draft — map to Console form)

Collected by the existing backend (SQLite on the API host):

- **Account**: email, password hash (not the password), name, date of birth, gender
- **User content**: bio, denomination, church name, location city/state, profile photo, messages
- **App activity**: likes / passes / matches
- **Identifiers**: JWT on device (`flutter_secure_storage` / Android Keystore-backed prefs)
- **Photos**: uploaded to the API `uploads/` directory (not a third-party CDN yet)

Not collected in this slice: precise location, contacts, SMS, advertising ID,
financial info.

Encryption in transit: HTTPS **once a production host exists**. Dev HTTP is
emulator/LAN only.

User requests to delete: **implemented** — Profile → Delete account (type
`DELETE`) calls `DELETE /api/auth/account`, which removes the user and
cascaded data, then clears the on-device JWT.

## Content rating / policy notes for a Christian dating app

- 18+; no sexual/explicit imagery in the client (respectful glass UI).
- User-generated photos and chat: in-app **Block** and **Report** are on
  Discover, Matches, and chat (reason picker; report also blocks).
- Store listing copy should match the product: faith-based matching, not a
  hookup app. Avoid implying church endorsement unless you have it.

## Icon and splash

Placeholders live in `assets/branding/`. Regenerated with:

```bash
cd mobile
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

Replace `assets/branding/app_icon.png` with a final 1024×1024 brand mark
before Play.

## Still blocked before a Play production upload

1. **Production API URL** — not chosen. Keep using a **dev** host.
2. **Real upload keystore** — generate, store offline, put Play “App signing”
   certificate in Console.
3. **Play Console developer account** — $25 one-time, identity verification.
4. **Hosted privacy policy** — use `https://api.fluito.veritas.org.in/privacy`
   (and `/terms`) once that API deploy includes these pages. Still blocked on
   a production domain if you want a `fluito.app` URL in Console.
5. **Account deletion + reporting/blocking** — implemented in this app/API
   slice; still confirm they are on the hosted API before a production upload.
6. **Store assets** — 1080×1920 phone screenshots, short description, feature
   graphic 1024×500.
7. **Backend production hardening** — strong `JWT_SECRET`, HTTPS, backups,
   CORS for the mobile origin, image storage beyond local disk.
8. **Signed AAB with prod flavor + real `API_BASE_URL`**.

## Next concrete step toward upload

Stand up a reachable **dev** API (even the existing Bun server on a machine
or a staging host), then:

```bash
cd mobile
API_BASE_URL=https://<that-dev-host> ./tool/build_dev_appbundle.sh
```

Upload the resulting `app-dev-release.aab` to a Play **internal testing**
track (not production) once the Console account and an upload keystore exist.
Do not ship the `prod` flavor until a production URL is real.

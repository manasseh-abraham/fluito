# Fluito Mobile App Setup Guide

## Current Status

✅ **Backend API (BunJS) - MVP Complete**
- User authentication (register/login with JWT, plus Google Sign-In / Sign-Up)
- User profiles with Christian-specific fields
- Matching system (swipe functionality)
- Messaging between matched users
- Discovery based on preferences
- All endpoints tested and working

✅ **Flutter Android app (`mobile/`) — first slice**
- Screens: auth, discover/swipe, matches, messaging, profile
- JWT in secure storage; API shapes from `API_DOCUMENTATION.md`
- Glassmorphism ported from `frontend/src/index.css` (no native iOS app in-repo)
- Dev API via `--dart-define=API_BASE_URL` (default `https://api.fluito.veritas.org.in`)
- Play scaffolding: applicationId `co.iotready.fluito`, targetSdk 36, signing placeholders, R8
- See `mobile/README.md` and `mobile/PLAY_STORE.md`

## Next Steps for Mobile Development

### 1. **API Documentation & Testing**
- [ ] Create OpenAPI/Swagger documentation
- [ ] Set up API testing suite
- [ ] Add rate limiting for production
- [ ] Set up environment variables for production

### 2. **Flutter App Setup**

The Android client now lives in `mobile/` (Dart package `fluito`, application
id `co.iotready.fluito`). Default API host is the **dev** server
`https://api.fluito.veritas.org.in`. Override with
`--dart-define=API_BASE_URL=...` (e.g. `http://10.0.2.2:4000` for local Bun).
See `mobile/README.md`.

```bash
cd mobile
# dependencies already listed in pubspec.yaml; to recreate from scratch:
# flutter create --org co.iotready --project-name fluito --platforms android,ios mobile

# Add dependencies to pubspec.yaml
dependencies:
  http: ^1.1.0
  provider: ^6.1.1
  shared_preferences: ^2.2.2
  image_picker: ^1.0.4
  cached_network_image: ^3.3.0
  flutter_secure_storage: ^9.0.0
  intl: ^0.18.1
```

### 3. **Core Flutter Features to Build**

#### Authentication Screen
- Login/Register forms
- JWT token storage (secure storage)
- Auto-login on app start

#### Profile Management
- Create/Edit profile
- Photo upload
- Christian-specific fields (denomination, church name)
- Preferences settings

#### Discovery/Matching Screen
- Swipeable card stack
- Show potential matches
- Swipe left (reject) / right (like)
- Match animation when mutual like

#### Matches Screen
- List of matched users
- Profile previews
- Navigate to chat

#### Messaging Screen
- Chat interface
- Real-time messaging (consider WebSocket for future)
- Message history
- Read receipts

### 4. **API Integration Structure**

```dart
// lib/services/api_service.dart
class ApiService {
  static const String baseUrl = 'http://your-api-url.com/api';
  
  // Auth endpoints
  Future<AuthResponse> register(RegisterRequest request);
  Future<AuthResponse> login(LoginRequest request);
  
  // Profile endpoints
  Future<Profile> getProfile();
  Future<Profile> updateProfile(UpdateProfileRequest request);
  
  // Matching endpoints
  Future<List<Match>> discoverMatches();
  Future<SwipeResponse> swipe(int targetUserId, String action);
  Future<List<Match>> getMatches();
  
  // Messaging endpoints
  Future<List<Message>> getMessages(int matchId);
  Future<Message> sendMessage(int matchId, String content);
}
```

### 5. **State Management**
- Use Provider or Riverpod for state management
- Auth state (logged in/out)
- User profile state
- Matches state
- Messages state

### 6. **UI/UX Considerations for Christian Dating App**
- Clean, respectful design
- Privacy-focused (no explicit content)
- Church/denomination verification badges
- Faith-based profile sections
- Safe messaging features

### 7. **Mobile-Specific Features to Add**
- Push notifications (for matches and messages)
- Photo verification
- Location-based matching (with privacy controls)
- Video chat integration (future)
- In-app reporting/safety features

### 8. **Backend Enhancements for Mobile**
- [ ] Add image upload endpoint (for profile pictures)
- [ ] Add push notification service integration
- [ ] Add file storage (S3 or similar)
- [ ] Add rate limiting
- [ ] Add analytics endpoints
- [ ] Add reporting/blocking features

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/google` - Google Sign-In / Sign-Up (ID token → same JWT as `/login`)

### Profiles
- `GET /api/profiles/me` - Get current user's profile
- `PATCH /api/profiles/me` - Update profile
- `GET /api/profiles/me/preferences` - Get preferences
- `PATCH /api/profiles/me/preferences` - Update preferences
- `GET /api/profiles/:userId` - Get another user's profile

### Matches
- `GET /api/matches/discover` - Discover potential matches
- `POST /api/matches/swipe` - Swipe (like/reject)
- `GET /api/matches/matches` - Get all matched users

### Messages
- `GET /api/messages/match/:matchId` - Get messages
- `POST /api/messages/match/:matchId` - Send message

## Environment Setup

### Development
```env
PORT=4000
JWT_SECRET=dev-secret-key
DATABASE_PATH=./fluito.db
NODE_ENV=development
GOOGLE_CLIENT_IDS=619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com,619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com,619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com
GOOGLE_ANDROID_DEV_CLIENT_ID=619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com
GOOGLE_ANDROID_PROD_CLIENT_ID=619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com
```

### Production
```env
PORT=4000
JWT_SECRET=your-strong-production-secret
DATABASE_PATH=/var/lib/fluito/fluito.db
NODE_ENV=production
CORS_ORIGIN=https://your-mobile-app-domain.com
GOOGLE_CLIENT_IDS=619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com,619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com,619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com
GOOGLE_WEB_CLIENT_ID=619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com
GOOGLE_ANDROID_DEV_CLIENT_ID=619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com
GOOGLE_ANDROID_PROD_CLIENT_ID=619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com
```

## Google Cloud / Drive account

All Fluito Google Cloud OAuth clients **and** Drive uploads must live under
**manasshe2@gmail.com** going forward (not `manasseh@iotready.co`).

OAuth clients already created in GCP project `fluito` (public IDs only —
never a `client_secret`):

1. **Web** `619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com` → Flutter `serverClientId` / `GOOGLE_WEB_CLIENT_ID`
2. **Android debug** `619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com` — package `co.iotready.fluito.dev` + debug SHA-1
3. **Android prod** `619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com` — package `co.iotready.fluito` + upload/release SHA-1
4. API `GOOGLE_CLIENT_IDS` = those three, comma-separated (parent deploys to the VPS)

Print debug SHA-1:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Existing databases: `bun run db:migrate` (or just start the API) adds
`users.auth_provider`, `users.google_sub`, and makes `users.password_hash`,
`profiles.date_of_birth`, and `profiles.gender` nullable so Google-created
users can log in before they finish profile fields.

## Demo seed data

`src/db/seed.ts` upserts **only** these `@example.com` accounts. It never
deletes or overwrites a Google / real user.

```bash
# Local (./fluito.db or DATABASE_PATH)
bun run db:seed

# Recreate demo rows only (safe on a live DB that also has Google users)
bun run db:seed:force
# same as: bun run src/db/seed.ts -- --force

# Deployed SQLite on the VPS (parent runs this after pull)
DATABASE_PATH=/var/lib/fluito/fluito.db bun run db:migrate
DATABASE_PATH=/var/lib/fluito/fluito.db bun run db:seed
```

Password for every demo account: **`password123`**

| Email | Gender | City | Notes |
| --- | --- | --- | --- |
| `john.doe@example.com` | male | New York | Matched + chat with Jane |
| `michael.smith@example.com` | male | Los Angeles | Matched + chat with Sarah |
| `david.johnson@example.com` | male | Chicago | Matched + chat with Emily |
| `james.williams@example.com` | male | Houston | Pending like on Jane (Discover) |
| `robert.brown@example.com` | male | Phoenix | Unmatched — on Discover |
| `jane.smith@example.com` | female | New York | Matched + chat with John |
| `sarah.johnson@example.com` | female | Los Angeles | Matched + chat with Michael |
| `emily.davis@example.com` | female | Chicago | Matched + chat with David |
| `jessica.miller@example.com` | female | Houston | Unmatched — on Discover |
| `amanda.wilson@example.com` | female | Phoenix | Unmatched — on Discover |

Profiles include HTTPS placeholder photos (`randomuser.me` portraits), bios
with interests, ages, churches, and locations. There is no separate interests
column — interests live in `bio`.

Log in as Jane to see men on Discover plus John's thread; log in as John to
see women plus Jane's thread. Google Sign-In accounts stay in the DB.

## Deployment Options

### Backend
1. **Railway** - Easy deployment for BunJS
2. **Render** - Good for Node.js-like runtimes
3. **Fly.io** - Great for global distribution
4. **AWS/GCP** - For scale

### Mobile App
1. **App Store (iOS)** - Apple App Store
2. **Google Play (Android)** - Google Play Store
3. **TestFlight/Internal Testing** - For beta testing

## Testing Checklist

- [ ] User registration flow
- [ ] Login/logout flow
- [ ] Profile creation/editing
- [ ] Match discovery
- [ ] Swipe functionality
- [ ] Mutual matching
- [ ] Messaging
- [ ] Error handling
- [ ] Offline handling
- [ ] Token refresh

## Security Considerations

- [ ] Implement token refresh mechanism
- [ ] Add input validation on backend
- [ ] Sanitize user inputs
- [ ] Add rate limiting
- [ ] Implement proper error handling
- [ ] Add logging and monitoring
- [ ] SSL/TLS for API
- [ ] Secure storage for tokens in mobile app


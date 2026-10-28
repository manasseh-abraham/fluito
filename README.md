# Fluito - Christian Pentecostal Dating App

A dating app specifically designed for Christian Pentecostals, built with BunJS for the backend MVP, Vite + React for the web frontend, and Flutter for Android.

## Features

- 🔐 User authentication (register/login with JWT)
- 👤 User profiles with Christian-specific fields (denomination, church name)
- 💑 Matching system with swipe functionality
- 💬 Messaging between matched users
- 🎯 Discovery based on preferences (age, gender, denomination, location)
- ⚙️ User preferences for match filtering

## Tech Stack

### Backend
- **Runtime**: BunJS
- **Framework**: Hono (lightweight web framework)
- **Database**: SQLite (bun:sqlite)
- **Authentication**: JWT tokens
- **Validation**: Zod
- **Password Hashing**: bcryptjs

### Frontend (web)
- **Build Tool**: Vite
- **Framework**: React 19 with TypeScript
- **Routing**: React Router
- **HTTP Client**: Axios
- **Styling**: CSS with Glassmorphism design (source of the in-repo “Liquid Glass” look)

### Mobile (Android)
- **Framework**: Flutter (`mobile/`)
- **Application id**: `co.iotready.fluito` (dev flavor: `co.iotready.fluito.dev`)
- **API host**: compile-time `--dart-define=API_BASE_URL` (defaults to the **dev** server `http://10.0.2.2:4000` for the Android emulator). Production URL is TBD.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd fluito
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your `JWT_SECRET` and other configuration values.

4. Initialize the database:
The database will be automatically created when you start the server.

5. Install frontend dependencies:
```bash
cd frontend && npm install && cd ..
```

6. Start the development server:
```bash
bun run dev
```

This will:
- Build the Vite frontend
- Start the BunJS backend server
- Serve both the API and the frontend UI

The app will be available at `http://localhost:4000`

**Note:** The frontend is built and served from the BunJS server. For frontend-only development with hot reload, you can run `cd frontend && npm run dev` separately (this will run on port 5173).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Profiles

- `GET /api/profiles/me` - Get current user's profile
- `PATCH /api/profiles/me` - Update current user's profile
- `GET /api/profiles/me/preferences` - Get user preferences
- `PATCH /api/profiles/me/preferences` - Update user preferences
- `GET /api/profiles/:userId` - Get another user's profile

### Matches

- `GET /api/matches/discover` - Discover potential matches
- `POST /api/matches/swipe` - Swipe right (like) or left (reject)
- `GET /api/matches/matches` - Get all matched users

### Messages

- `GET /api/messages/match/:matchId` - Get messages for a match
- `POST /api/messages/match/:matchId` - Send a message

## API Usage Examples

### Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Update Profile

```bash
curl -X PATCH http://localhost:4000/api/profiles/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "denomination": "Pentecostal",
    "church_name": "First Pentecostal Church",
    "location_city": "New York",
    "location_state": "NY",
    "bio": "Looking for a God-fearing partner"
  }'
```

### Discover Matches

```bash
curl -X GET http://localhost:4000/api/matches/discover \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Swipe

```bash
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "target_user_id": 2,
    "action": "like"
  }'
```

## Database Schema

The app uses SQLite with the following main tables:

- `users` - User accounts
- `profiles` - User profiles with Christian-specific fields
- `preferences` - User matching preferences
- `matches` - Match records (pending, matched, rejected, blocked)
- `messages` - Messages between matched users

## Android (Flutter)

The first mobile slice lives in [`mobile/`](mobile/). It ports the web
glassmorphism from `frontend/src/index.css` (there is no native iOS app in this
repo) and talks to the same `/api` shapes.

Android builds default to a **dev** API (`http://10.0.2.2:4000` on the
emulator). Do not invent a production host.

```bash
cd mobile
flutter run --flavor dev --dart-define-from-file=config/dev.json
```

Play Store scaffolding, AAB instructions, and remaining blockers:
[`mobile/PLAY_STORE.md`](mobile/PLAY_STORE.md).

## Future Plans

- Host a production API and fill `API_BASE_URL` for the `prod` flavor
- Implement push notifications
- Add video chat capabilities
- Enhanced matching algorithm
- Church verification system

## License

MIT


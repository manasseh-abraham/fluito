# Fluito - Christian Pentecostal Dating App

A dating app specifically designed for Christian Pentecostals, built with BunJS for the MVP.

## Features

- 🔐 User authentication (register/login with JWT)
- 👤 User profiles with Christian-specific fields (denomination, church name)
- 💑 Matching system with swipe functionality
- 💬 Messaging between matched users
- 🎯 Discovery based on preferences (age, gender, denomination, location)
- ⚙️ User preferences for match filtering

## Tech Stack

- **Runtime**: BunJS
- **Framework**: Hono (lightweight web framework)
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT tokens
- **Validation**: Zod
- **Password Hashing**: bcryptjs

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

5. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

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
curl -X POST http://localhost:3000/api/auth/register \
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
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Update Profile

```bash
curl -X PATCH http://localhost:3000/api/profiles/me \
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
curl -X GET http://localhost:3000/api/matches/discover \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Swipe

```bash
curl -X POST http://localhost:3000/api/matches/swipe \
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

## Future Plans

- Move to Flutter for mobile app development
- Add photo upload functionality
- Implement push notifications
- Add video chat capabilities
- Enhanced matching algorithm
- Church verification system

## License

MIT


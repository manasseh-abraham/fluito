# Fluito API Documentation

Base URL: `http://localhost:4000/api`

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication

### Register
**POST** `/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Google Sign-In / Sign-Up
**POST** `/auth/google`

Sign-in and sign-up share this path. The API verifies the Google ID token
with Google's tokeninfo endpoint (`https://oauth2.googleapis.com/tokeninfo`;
Google checks the cert signature) and accepts `aud` values listed in
`GOOGLE_CLIENT_IDS` (comma-separated Web + Android client IDs from GCP
project `fluito` / manasshe2@gmail.com):

```
619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com
619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com
619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com
```

`GOOGLE_WEB_CLIENT_ID`, `GOOGLE_ANDROID_CLIENT_ID`,
`GOOGLE_ANDROID_DEV_CLIENT_ID`, and `GOOGLE_ANDROID_PROD_CLIENT_ID` are also
merged into that allow-list. If none are set, the API falls back to the three
IDs above. Do not deploy a `client_secret`.

Missing Google profile fields are not invented: first/last name may be empty;
`date_of_birth` and `gender` stay `null` until the user fills them on
`PATCH /profiles/me`.

Request body:
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client_id": "optional-web-or-android-client-id.apps.googleusercontent.com"
}
```

Response (same shape as `/auth/login`):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com"
  }
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

## Profiles

### Get Current Profile
**GET** `/profiles/me`

Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "denomination": "Pentecostal",
  "church_name": "First Pentecostal Church",
  "location_city": "New York",
  "location_state": "NY",
  "bio": "Looking for a God-fearing partner",
  "age": 35,
  "email": "user@example.com"
}
```

### Update Profile
**PATCH** `/profiles/me`

Headers: `Authorization: Bearer TOKEN`

Request body (all fields optional):
```json
{
  "denomination": "Pentecostal",
  "church_name": "First Pentecostal Church",
  "location_city": "New York",
  "location_state": "NY",
  "location_country": "USA",
  "bio": "Updated bio",
  "profile_picture_url": "https://example.com/photo.jpg"
}
```

### Get Preferences
**GET** `/profiles/me/preferences`

Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "id": 1,
  "user_id": 1,
  "min_age": 25,
  "max_age": 35,
  "preferred_gender": "female",
  "max_distance": null,
  "denomination_preference": "Pentecostal"
}
```

### Update Preferences
**PATCH** `/profiles/me/preferences`

Headers: `Authorization: Bearer TOKEN`

Request body (all fields optional):
```json
{
  "min_age": 25,
  "max_age": 35,
  "preferred_gender": "female",
  "max_distance": 50,
  "denomination_preference": "Pentecostal"
}
```

### Get Other User's Profile
**GET** `/profiles/:userId`

Headers: `Authorization: Bearer TOKEN`

## Matches

### Discover Matches
**GET** `/matches/discover`

Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "matches": [
    {
      "id": 2,
      "user_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "age": 33,
      "gender": "female",
      "denomination": "Pentecostal",
      "church_name": "Second Pentecostal Church",
      "location_city": "New York",
      "bio": "Seeking a faithful Christian partner"
    }
  ],
  "count": 1
}
```

### Swipe
**POST** `/matches/swipe`

Headers: `Authorization: Bearer TOKEN`

Request body:
```json
{
  "target_user_id": 2,
  "action": "like"
}
```

Response (if match):
```json
{
  "message": "It's a match!",
  "matched": true
}
```

Response (if no match yet):
```json
{
  "message": "Like recorded",
  "matched": false
}
```

### Get Matches
**GET** `/matches/matches`

Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "matches": [
    {
      "match_id": 1,
      "status": "matched",
      "created_at": "2025-11-06 08:20:00",
      "other_user_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "profile_picture_url": null,
      "bio": "Seeking a faithful Christian partner",
      "location_city": "New York",
      "location_state": "NY"
    }
  ],
  "count": 1
}
```

## Messages

### Get Messages
**GET** `/messages/match/:matchId`

Headers: `Authorization: Bearer TOKEN`

Response:
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "sender_name": "John",
      "content": "Hello! Great to match with you!",
      "is_read": true,
      "created_at": "2025-11-06 08:25:00"
    }
  ],
  "count": 1
}
```

### Send Message
**POST** `/messages/match/:matchId`

Headers: `Authorization: Bearer TOKEN`

Request body:
```json
{
  "content": "Hello! Great to match with you!"
}
```

Response:
```json
{
  "message": {
    "id": 1,
    "sender_id": 1,
    "sender_name": "John",
    "content": "Hello! Great to match with you!",
    "is_read": false,
    "created_at": "2025-11-06 08:25:00"
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

Validation errors include details:
```json
{
  "error": "Validation error",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    }
  ]
}
```


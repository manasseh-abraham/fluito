# Fluito API Documentation

Base URL: `http://localhost:3000/api`

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


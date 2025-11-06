# Fluito API - CURL Test Commands

Base URL: `http://localhost:4000/api`

## Health Check

```bash
# Test API is running
curl -X GET http://localhost:4000/api
```

Expected response:
```json
{
  "message": "Fluito API - Christian Pentecostal Dating App",
  "version": "0.1.0",
  "status": "running"
}
```

---

## Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

**Save the token for subsequent requests:**
```bash
export TOKEN="your-token-here"
```

### 2. Register a Female User (for testing matches)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "date_of_birth": "1992-05-15",
    "gender": "female"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com"
  }
}
```

### 4. Login with Wrong Password (Error Test)

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "wrongpassword"
  }'
```

Expected response (401):
```json
{
  "error": "Invalid email or password"
}
```

### 5. Register with Invalid Data (Validation Test)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "short",
    "first_name": "",
    "last_name": "",
    "date_of_birth": "invalid",
    "gender": "unknown"
  }'
```

Expected response (400):
```json
{
  "error": "Validation error",
  "details": [...]
}
```

---

## Profiles

### 6. Get Current User's Profile

```bash
curl -X GET http://localhost:4000/api/profiles/me \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "id": 1,
  "user_id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "denomination": null,
  "church_name": null,
  "location_city": null,
  "location_state": null,
  "location_country": null,
  "bio": null,
  "profile_picture_url": null,
  "is_active": 1,
  "created_at": "2025-11-06 08:00:00",
  "updated_at": "2025-11-06 08:00:00",
  "email": "john@example.com",
  "age": 35
}
```

### 7. Update Profile

```bash
curl -X PATCH http://localhost:4000/api/profiles/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "denomination": "Pentecostal",
    "church_name": "First Pentecostal Church",
    "location_city": "New York",
    "location_state": "NY",
    "location_country": "USA",
    "bio": "Looking for a God-fearing partner who shares my faith and values."
  }'
```

Expected response:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": 1,
    "user_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "denomination": "Pentecostal",
    "church_name": "First Pentecostal Church",
    "location_city": "New York",
    "location_state": "NY",
    "bio": "Looking for a God-fearing partner who shares my faith and values.",
    ...
  }
}
```

### 8. Get User Preferences

```bash
curl -X GET http://localhost:4000/api/profiles/me/preferences \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "user_id": 1,
  "min_age": 18,
  "max_age": 100,
  "preferred_gender": "both",
  "max_distance": null,
  "denomination_preference": null
}
```

### 9. Update User Preferences

```bash
curl -X PATCH http://localhost:4000/api/profiles/me/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "min_age": 25,
    "max_age": 35,
    "preferred_gender": "female",
    "max_distance": 50,
    "denomination_preference": "Pentecostal"
  }'
```

Expected response:
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "id": 1,
    "user_id": 1,
    "min_age": 25,
    "max_age": 35,
    "preferred_gender": "female",
    "max_distance": 50,
    "denomination_preference": "Pentecostal",
    ...
  }
}
```

### 10. Get Another User's Profile

```bash
# First, get another user's ID (e.g., user ID 2)
curl -X GET http://localhost:4000/api/profiles/2 \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "id": 2,
  "first_name": "Jane",
  "last_name": "Smith",
  "date_of_birth": "1992-05-15",
  "gender": "female",
  "denomination": "Pentecostal",
  "church_name": "Second Pentecostal Church",
  "location_city": "New York",
  "location_state": "NY",
  "bio": "Seeking a faithful Christian partner",
  "age": 33
}
```

---

## Matches

### 11. Discover Potential Matches

```bash
curl -X GET http://localhost:4000/api/matches/discover \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "matches": [
    {
      "id": 2,
      "user_id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "date_of_birth": "1992-05-15",
      "gender": "female",
      "denomination": "Pentecostal",
      "church_name": "Second Pentecostal Church",
      "location_city": "New York",
      "location_state": "NY",
      "bio": "Seeking a faithful Christian partner",
      "age": 33
    }
  ],
  "count": 1
}
```

### 12. Swipe Right (Like)

```bash
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "target_user_id": 2,
    "action": "like"
  }'
```

Expected response (if no mutual like yet):
```json
{
  "message": "Like recorded",
  "matched": false
}
```

Expected response (if mutual like - It's a match!):
```json
{
  "message": "It's a match!",
  "matched": true
}
```

### 13. Swipe Left (Reject)

```bash
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "target_user_id": 3,
    "action": "reject"
  }'
```

Expected response:
```json
{
  "message": "Rejection recorded",
  "matched": false
}
```

### 14. Get All Matches

```bash
curl -X GET http://localhost:4000/api/matches/matches \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "matches": [
    {
      "match_id": 1,
      "status": "matched",
      "created_at": "2025-11-06 08:30:00",
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

### 15. Swipe on Yourself (Error Test)

```bash
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "target_user_id": 1,
    "action": "like"
  }'
```

Expected response (400):
```json
{
  "error": "Cannot swipe on yourself"
}
```

---

## Messages

### 16. Get Messages for a Match

```bash
# First, get a match ID from the matches endpoint
export MATCH_ID=1

curl -X GET http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "sender_name": "John",
      "content": "Hello! Great to match with you!",
      "is_read": true,
      "created_at": "2025-11-06 08:35:00"
    }
  ],
  "count": 1
}
```

### 17. Send a Message

```bash
curl -X POST http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "content": "Hello! Great to match with you!"
  }'
```

Expected response (201):
```json
{
  "message": {
    "id": 1,
    "sender_id": 1,
    "sender_name": "John",
    "content": "Hello! Great to match with you!",
    "is_read": false,
    "created_at": "2025-11-06 08:35:00"
  }
}
```

### 18. Send Multiple Messages (Conversation)

```bash
# Message 1
curl -X POST http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "Hello! How are you?"}'

# Message 2
curl -X POST http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content": "I hope we can get to know each other better!"}'
```

### 19. Get Messages from Non-Match (Error Test)

```bash
curl -X GET http://localhost:4000/api/messages/match/999 \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (404):
```json
{
  "error": "Match not found"
}
```

---

## Error Handling Tests

### 20. Access Protected Route Without Token

```bash
curl -X GET http://localhost:4000/api/profiles/me
```

Expected response (401):
```json
{
  "error": "Unauthorized - No token provided"
}
```

### 21. Access Protected Route with Invalid Token

```bash
curl -X GET http://localhost:4000/api/profiles/me \
  -H "Authorization: Bearer invalid-token-here"
```

Expected response (401):
```json
{
  "error": "Unauthorized - Invalid token"
}
```

### 22. Access Non-Existent Route

```bash
curl -X GET http://localhost:4000/api/nonexistent
```

Expected response (404):
```json
{
  "error": "Route not found"
}
```

---

## Complete Test Flow

### Full User Journey Test

```bash
# 1. Register User 1 (Male)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User1",
    "date_of_birth": "1990-01-01",
    "gender": "male"
  }' | jq -r '.token' > token1.txt

export TOKEN1=$(cat token1.txt)

# 2. Update User 1 Profile
curl -X PATCH http://localhost:4000/api/profiles/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "denomination": "Pentecostal",
    "church_name": "Test Church",
    "location_city": "New York",
    "location_state": "NY",
    "bio": "Test bio"
  }'

# 3. Set User 1 Preferences
curl -X PATCH http://localhost:4000/api/profiles/me/preferences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "min_age": 25,
    "max_age": 35,
    "preferred_gender": "female"
  }'

# 4. Register User 2 (Female)
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser2@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User2",
    "date_of_birth": "1992-05-15",
    "gender": "female"
  }' | jq -r '.token' > token2.txt

export TOKEN2=$(cat token2.txt)

# 5. Update User 2 Profile
curl -X PATCH http://localhost:4000/api/profiles/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "denomination": "Pentecostal",
    "church_name": "Test Church 2",
    "location_city": "New York",
    "location_state": "NY",
    "bio": "Test bio 2"
  }'

# 6. User 1 Discovers Matches
curl -X GET http://localhost:4000/api/matches/discover \
  -H "Authorization: Bearer $TOKEN1"

# 7. User 1 Likes User 2
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{
    "target_user_id": 2,
    "action": "like"
  }'

# 8. User 2 Likes User 1 (Creates Match)
curl -X POST http://localhost:4000/api/matches/swipe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{
    "target_user_id": 1,
    "action": "like"
  }'

# 9. User 1 Gets Matches
curl -X GET http://localhost:4000/api/matches/matches \
  -H "Authorization: Bearer $TOKEN1" | jq -r '.matches[0].match_id' > match_id.txt

export MATCH_ID=$(cat match_id.txt)

# 10. User 1 Sends Message
curl -X POST http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN1" \
  -d '{"content": "Hello! Great to match with you!"}'

# 11. User 2 Gets Messages
curl -X GET http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Authorization: Bearer $TOKEN2"

# 12. User 2 Replies
curl -X POST http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN2" \
  -d '{"content": "Hi! Nice to meet you too!"}'

# 13. User 1 Gets Updated Messages
curl -X GET http://localhost:4000/api/messages/match/$MATCH_ID \
  -H "Authorization: Bearer $TOKEN1"
```

---

## Notes

- Replace `$TOKEN` with your actual JWT token
- Replace `$MATCH_ID` with an actual match ID from your matches
- All timestamps are in UTC
- Age is calculated automatically from date_of_birth
- Messages are automatically marked as read when fetched by the recipient
- The API uses JWT tokens that expire after 7 days

## Testing Tips

1. **Use jq for pretty JSON output:**
   ```bash
   curl ... | jq .
   ```

2. **Save tokens to variables:**
   ```bash
   export TOKEN="your-token-here"
   ```

3. **Test error cases:**
   - Invalid tokens
   - Missing required fields
   - Invalid data types
   - Non-existent resources

4. **Test authentication flow:**
   - Register → Login → Use token → Logout

5. **Test matching flow:**
   - Discover → Swipe → Match → Message


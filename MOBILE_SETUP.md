# Fluito Mobile App Setup Guide

## Current Status

✅ **Backend API (BunJS) - MVP Complete**
- User authentication (register/login with JWT)
- User profiles with Christian-specific fields
- Matching system (swipe functionality)
- Messaging between matched users
- Discovery based on preferences
- All endpoints tested and working

## Next Steps for Mobile Development

### 1. **API Documentation & Testing**
- [ ] Create OpenAPI/Swagger documentation
- [ ] Set up API testing suite
- [ ] Add rate limiting for production
- [ ] Set up environment variables for production

### 2. **Flutter App Setup**
```bash
# Create Flutter project
flutter create fluito_mobile
cd fluito_mobile

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
PORT=3000
JWT_SECRET=dev-secret-key
DATABASE_PATH=./fluito.db
NODE_ENV=development
```

### Production
```env
PORT=3000
JWT_SECRET=your-strong-production-secret
DATABASE_PATH=/var/lib/fluito/fluito.db
NODE_ENV=production
CORS_ORIGIN=https://your-mobile-app-domain.com
```

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


class AuthUser {
  const AuthUser({required this.id, required this.email});

  final int id;
  final String email;

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: (json['id'] as num).toInt(),
      email: json['email'] as String? ?? '',
    );
  }
}

class AuthResponse {
  const AuthResponse({
    required this.message,
    required this.token,
    required this.user,
  });

  final String message;
  final String token;
  final AuthUser user;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      message: json['message'] as String? ?? '',
      token: json['token'] as String? ?? '',
      user: AuthUser.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class Profile {
  const Profile({
    required this.id,
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.gender,
    required this.email,
    required this.age,
    this.denomination,
    this.churchName,
    this.locationCity,
    this.locationState,
    this.locationCountry,
    this.bio,
    this.profilePictureUrl,
  });

  final int id;
  final int userId;
  final String firstName;
  final String lastName;
  final String dateOfBirth;
  final String gender;
  final String email;
  final int age;
  final String? denomination;
  final String? churchName;
  final String? locationCity;
  final String? locationState;
  final String? locationCountry;
  final String? bio;
  final String? profilePictureUrl;

  String get displayName => '$firstName $lastName'.trim();

  String get locationLabel {
    final parts = [
      if (locationCity != null && locationCity!.isNotEmpty) locationCity,
      if (locationState != null && locationState!.isNotEmpty) locationState,
    ];
    return parts.join(', ');
  }

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['user_id'] as num?)?.toInt() ?? 0,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      dateOfBirth: json['date_of_birth'] as String? ?? '',
      gender: json['gender'] as String? ?? '',
      email: json['email'] as String? ?? '',
      age: (json['age'] as num?)?.toInt() ?? 0,
      denomination: json['denomination'] as String?,
      churchName: json['church_name'] as String?,
      locationCity: json['location_city'] as String?,
      locationState: json['location_state'] as String?,
      locationCountry: json['location_country'] as String?,
      bio: json['bio'] as String?,
      profilePictureUrl: json['profile_picture_url'] as String?,
    );
  }

  Map<String, dynamic> toUpdateBody() {
    return {
      'first_name': firstName,
      'last_name': lastName,
      if (denomination != null) 'denomination': denomination,
      if (churchName != null) 'church_name': churchName,
      if (locationCity != null) 'location_city': locationCity,
      if (locationState != null) 'location_state': locationState,
      if (locationCountry != null) 'location_country': locationCountry,
      if (bio != null) 'bio': bio,
    };
  }

  Profile copyWith({
    String? firstName,
    String? lastName,
    String? denomination,
    String? churchName,
    String? locationCity,
    String? locationState,
    String? locationCountry,
    String? bio,
    String? profilePictureUrl,
  }) {
    return Profile(
      id: id,
      userId: userId,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      dateOfBirth: dateOfBirth,
      gender: gender,
      email: email,
      age: age,
      denomination: denomination ?? this.denomination,
      churchName: churchName ?? this.churchName,
      locationCity: locationCity ?? this.locationCity,
      locationState: locationState ?? this.locationState,
      locationCountry: locationCountry ?? this.locationCountry,
      bio: bio ?? this.bio,
      profilePictureUrl: profilePictureUrl ?? this.profilePictureUrl,
    );
  }
}

class Preferences {
  const Preferences({
    this.id,
    this.userId,
    this.minAge,
    this.maxAge,
    this.preferredGender,
    this.maxDistance,
    this.denominationPreference,
  });

  final int? id;
  final int? userId;
  final int? minAge;
  final int? maxAge;
  final String? preferredGender;
  final int? maxDistance;
  final String? denominationPreference;

  factory Preferences.fromJson(Map<String, dynamic> json) {
    return Preferences(
      id: (json['id'] as num?)?.toInt(),
      userId: (json['user_id'] as num?)?.toInt(),
      minAge: (json['min_age'] as num?)?.toInt(),
      maxAge: (json['max_age'] as num?)?.toInt(),
      preferredGender: json['preferred_gender'] as String?,
      maxDistance: (json['max_distance'] as num?)?.toInt(),
      denominationPreference: json['denomination_preference'] as String?,
    );
  }

  Map<String, dynamic> toUpdateBody() {
    return {
      if (minAge != null) 'min_age': minAge,
      if (maxAge != null) 'max_age': maxAge,
      if (preferredGender != null) 'preferred_gender': preferredGender,
      if (maxDistance != null) 'max_distance': maxDistance,
      if (denominationPreference != null)
        'denomination_preference': denominationPreference,
    };
  }

  Preferences copyWith({
    int? minAge,
    int? maxAge,
    String? preferredGender,
    int? maxDistance,
    String? denominationPreference,
  }) {
    return Preferences(
      id: id,
      userId: userId,
      minAge: minAge ?? this.minAge,
      maxAge: maxAge ?? this.maxAge,
      preferredGender: preferredGender ?? this.preferredGender,
      maxDistance: maxDistance ?? this.maxDistance,
      denominationPreference:
          denominationPreference ?? this.denominationPreference,
    );
  }
}

/// A profile returned by `GET /api/matches/discover`.
class DiscoverProfile {
  const DiscoverProfile({
    required this.id,
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.age,
    required this.gender,
    this.denomination,
    this.churchName,
    this.locationCity,
    this.locationState,
    this.bio,
    this.profilePictureUrl,
  });

  final int id;
  final int userId;
  final String firstName;
  final String lastName;
  final int age;
  final String gender;
  final String? denomination;
  final String? churchName;
  final String? locationCity;
  final String? locationState;
  final String? bio;
  final String? profilePictureUrl;

  String get displayName => '$firstName $lastName'.trim();

  factory DiscoverProfile.fromJson(Map<String, dynamic> json) {
    int age = (json['age'] as num?)?.toInt() ?? 0;
    if (age == 0 && json['date_of_birth'] is String) {
      age = _ageFromDob(json['date_of_birth'] as String);
    }
    return DiscoverProfile(
      id: (json['id'] as num?)?.toInt() ?? 0,
      userId: (json['user_id'] as num?)?.toInt() ?? 0,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      age: age,
      gender: json['gender'] as String? ?? '',
      denomination: json['denomination'] as String?,
      churchName: json['church_name'] as String?,
      locationCity: json['location_city'] as String?,
      locationState: json['location_state'] as String?,
      bio: json['bio'] as String?,
      profilePictureUrl: json['profile_picture_url'] as String?,
    );
  }
}

class MatchListItem {
  const MatchListItem({
    required this.matchId,
    required this.status,
    required this.createdAt,
    required this.otherUserId,
    required this.firstName,
    required this.lastName,
    this.profilePictureUrl,
    this.bio,
    this.locationCity,
    this.locationState,
  });

  final int matchId;
  final String status;
  final String createdAt;
  final int otherUserId;
  final String firstName;
  final String lastName;
  final String? profilePictureUrl;
  final String? bio;
  final String? locationCity;
  final String? locationState;

  String get displayName => '$firstName $lastName'.trim();

  String get locationLabel {
    final parts = [
      if (locationCity != null && locationCity!.isNotEmpty) locationCity,
      if (locationState != null && locationState!.isNotEmpty) locationState,
    ];
    return parts.join(', ');
  }

  factory MatchListItem.fromJson(Map<String, dynamic> json) {
    return MatchListItem(
      matchId: (json['match_id'] as num?)?.toInt() ?? 0,
      status: json['status'] as String? ?? '',
      createdAt: json['created_at'] as String? ?? '',
      otherUserId: (json['other_user_id'] as num?)?.toInt() ?? 0,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      profilePictureUrl: json['profile_picture_url'] as String?,
      bio: json['bio'] as String?,
      locationCity: json['location_city'] as String?,
      locationState: json['location_state'] as String?,
    );
  }
}

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.content,
    required this.isRead,
    required this.createdAt,
  });

  final int id;
  final int senderId;
  final String senderName;
  final String content;
  final bool isRead;
  final String createdAt;

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: (json['id'] as num?)?.toInt() ?? 0,
      senderId: (json['sender_id'] as num?)?.toInt() ?? 0,
      senderName: json['sender_name'] as String? ?? '',
      content: json['content'] as String? ?? '',
      isRead: json['is_read'] == true || json['is_read'] == 1,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}

class SwipeResult {
  const SwipeResult({required this.message, required this.matched});

  final String message;
  final bool matched;

  factory SwipeResult.fromJson(Map<String, dynamic> json) {
    return SwipeResult(
      message: json['message'] as String? ?? '',
      matched: json['matched'] == true,
    );
  }
}

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.details});

  final String message;
  final int? statusCode;
  final List<String>? details;

  @override
  String toString() => message;
}

int _ageFromDob(String dob) {
  final parsed = DateTime.tryParse(dob);
  if (parsed == null) return 0;
  final now = DateTime.now();
  var age = now.year - parsed.year;
  if (now.month < parsed.month ||
      (now.month == parsed.month && now.day < parsed.day)) {
    age--;
  }
  return age;
}

import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/models/models.dart';

void main() {
  test('AuthResponse parses the documented login/register payload', () {
    final parsed = AuthResponse.fromJson({
      'message': 'Login successful',
      'token': 'abc.def.ghi',
      'user': {'id': 1, 'email': 'user@example.com'},
    });
    expect(parsed.token, 'abc.def.ghi');
    expect(parsed.user.id, 1);
    expect(parsed.user.email, 'user@example.com');
  });

  test('DiscoverProfile parses swipe-card JSON from /matches/discover', () {
    final card = DiscoverProfile.fromJson({
      'id': 2,
      'user_id': 2,
      'first_name': 'Jane',
      'last_name': 'Smith',
      'age': 33,
      'gender': 'female',
      'denomination': 'Pentecostal',
      'church_name': 'Second Pentecostal Church',
      'location_city': 'New York',
      'bio': 'Seeking a faithful Christian partner',
    });
    expect(card.userId, 2);
    expect(card.displayName, 'Jane Smith');
    expect(card.denomination, 'Pentecostal');
  });

  test('MatchListItem and ChatMessage parse documented list payloads', () {
    final match = MatchListItem.fromJson({
      'match_id': 1,
      'status': 'matched',
      'created_at': '2025-11-06 08:20:00',
      'other_user_id': 2,
      'first_name': 'Jane',
      'last_name': 'Smith',
      'profile_picture_url': null,
      'bio': 'Seeking a faithful Christian partner',
      'location_city': 'New York',
      'location_state': 'NY',
    });
    expect(match.matchId, 1);
    expect(match.locationLabel, 'New York, NY');

    final message = ChatMessage.fromJson({
      'id': 1,
      'sender_id': 1,
      'sender_name': 'John',
      'content': 'Hello! Great to match with you!',
      'is_read': true,
      'created_at': '2025-11-06 08:25:00',
    });
    expect(message.isRead, isTrue);
    expect(message.content, contains('Great to match'));
  });

  test('Profile needs onboarding when Google left DOB/gender empty', () {
    final incomplete = Profile.fromJson({
      'id': 1,
      'user_id': 1,
      'first_name': 'New',
      'last_name': 'Member',
      'date_of_birth': null,
      'gender': null,
      'email': 'new@gmail.com',
      'age': null,
      'profile_complete': false,
      'missing_required_fields': ['date_of_birth', 'gender'],
    });
    expect(incomplete.needsOnboarding, isTrue);
    expect(incomplete.profileComplete, isFalse);
    expect(incomplete.missingRequiredFields, contains('date_of_birth'));

    final complete = Profile.fromJson({
      'id': 1,
      'user_id': 1,
      'first_name': 'Jane',
      'last_name': 'Smith',
      'date_of_birth': '1992-05-15',
      'gender': 'female',
      'email': 'jane@example.com',
      'age': 34,
      'profile_complete': true,
      'missing_required_fields': <String>[],
    });
    expect(complete.needsOnboarding, isFalse);
  });

  test('SwipeResult reads matched flag', () {
    expect(
      SwipeResult.fromJson({'message': "It's a match!", 'matched': true})
          .matched,
      isTrue,
    );
    expect(
      SwipeResult.fromJson({'message': 'Like recorded', 'matched': false})
          .matched,
      isFalse,
    );
  });
}

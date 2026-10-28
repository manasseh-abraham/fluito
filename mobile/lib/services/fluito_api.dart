import 'dart:convert';
import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/models.dart';

/// HTTP client for the Fluito REST API documented in API_DOCUMENTATION.md.
///
/// The host comes from [AppConfig] (dev default `http://10.0.2.2:4000`,
/// production URL must be supplied at build time and is otherwise empty).
class FluitoApi {
  FluitoApi({
    required this.config,
    FlutterSecureStorage? storage,
    http.Client? httpClient,
  }) : _storage = storage ?? const FlutterSecureStorage(),
       _http = httpClient ?? http.Client();

  static const _tokenKey = 'fluito_jwt';

  final AppConfig config;
  final FlutterSecureStorage _storage;
  final http.Client _http;

  String? _token;
  int? currentUserId;

  bool get hasToken => _token != null && _token!.isNotEmpty;

  Uri get _api {
    if (config.apiRoot.isEmpty) {
      throw const MissingProdApiUrlException();
    }
    return Uri.parse(config.apiBase);
  }

  Future<void> restoreSession() async {
    _token = await _storage.read(key: _tokenKey);
  }

  Future<void> _persistToken(String token) async {
    _token = token;
    await _storage.write(key: _tokenKey, value: token);
  }

  Future<void> clearSession() async {
    _token = null;
    currentUserId = null;
    await _storage.delete(key: _tokenKey);
  }

  Map<String, String> _headers({bool jsonBody = true}) {
    return {
      if (jsonBody) 'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (_token != null) 'Authorization': 'Bearer $_token',
    };
  }

  Future<dynamic> _send(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final uri = _api.replace(path: '${_api.path}$path');
    final http.Response response;
    switch (method) {
      case 'GET':
        response = await _http.get(uri, headers: _headers(jsonBody: false));
      case 'POST':
        response = await _http.post(
          uri,
          headers: _headers(),
          body: body == null ? null : jsonEncode(body),
        );
      case 'PATCH':
        response = await _http.patch(
          uri,
          headers: _headers(),
          body: body == null ? null : jsonEncode(body),
        );
      default:
        throw ApiException('Unsupported method $method');
    }
    return _decode(response);
  }

  dynamic _decode(http.Response response) {
    dynamic parsed;
    if (response.body.isNotEmpty) {
      try {
        parsed = jsonDecode(response.body);
      } catch (_) {
        parsed = {'error': response.body};
      }
    }
    if (response.statusCode == 401) {
      throw ApiException(
        _errorMessage(parsed, fallback: 'Unauthorized'),
        statusCode: 401,
      );
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(
        _errorMessage(parsed, fallback: 'Request failed (${response.statusCode})'),
        statusCode: response.statusCode,
        details: _errorDetails(parsed),
      );
    }
    return parsed;
  }

  String _errorMessage(dynamic parsed, {required String fallback}) {
    if (parsed is Map && parsed['error'] is String) {
      return parsed['error'] as String;
    }
    return fallback;
  }

  List<String>? _errorDetails(dynamic parsed) {
    if (parsed is Map && parsed['details'] is List) {
      return (parsed['details'] as List)
          .map((item) {
            if (item is Map && item['message'] != null) {
              return item['message'].toString();
            }
            return item.toString();
          })
          .toList();
    }
    return null;
  }

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String dateOfBirth,
    required String gender,
  }) async {
    final json = await _send(
      'POST',
      '/auth/register',
      body: {
        'email': email,
        'password': password,
        'first_name': firstName,
        'last_name': lastName,
        'date_of_birth': dateOfBirth,
        'gender': gender,
      },
    );
    final result = AuthResponse.fromJson(json as Map<String, dynamic>);
    await _persistToken(result.token);
    currentUserId = result.user.id;
    return result;
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final json = await _send(
      'POST',
      '/auth/login',
      body: {'email': email, 'password': password},
    );
    final result = AuthResponse.fromJson(json as Map<String, dynamic>);
    await _persistToken(result.token);
    currentUserId = result.user.id;
    return result;
  }

  Future<Profile> getProfile() async {
    final json = await _send('GET', '/profiles/me');
    final profile = Profile.fromJson(json as Map<String, dynamic>);
    currentUserId = profile.userId;
    return profile;
  }

  Future<Profile> updateProfile(Map<String, dynamic> body) async {
    final json = await _send('PATCH', '/profiles/me', body: body);
    if (json is Map && json['profile'] is Map) {
      return Profile.fromJson(json['profile'] as Map<String, dynamic>);
    }
    return Profile.fromJson(json as Map<String, dynamic>);
  }

  Future<Preferences> getPreferences() async {
    final json = await _send('GET', '/profiles/me/preferences');
    return Preferences.fromJson(json as Map<String, dynamic>);
  }

  Future<Preferences> updatePreferences(Map<String, dynamic> body) async {
    final json = await _send('PATCH', '/profiles/me/preferences', body: body);
    if (json is Map && json['preferences'] is Map) {
      return Preferences.fromJson(json['preferences'] as Map<String, dynamic>);
    }
    return Preferences.fromJson(json as Map<String, dynamic>);
  }

  Future<Profile> uploadPhoto(File file) async {
    final uri = _api.replace(path: '${_api.path}/profiles/me/upload-photo');
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $_token'
      ..headers['Accept'] = 'application/json'
      ..files.add(await http.MultipartFile.fromPath('photo', file.path));
    final streamed = await _http.send(request);
    final response = await http.Response.fromStream(streamed);
    final json = _decode(response);
    if (json is Map && json['profile'] is Map) {
      return Profile.fromJson(json['profile'] as Map<String, dynamic>);
    }
    return getProfile();
  }

  Future<List<DiscoverProfile>> discover() async {
    final json = await _send('GET', '/matches/discover');
    final list = (json as Map)['matches'] as List? ?? const [];
    return list
        .whereType<Map>()
        .map((item) => DiscoverProfile.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<SwipeResult> swipe({
    required int targetUserId,
    required String action,
  }) async {
    final json = await _send(
      'POST',
      '/matches/swipe',
      body: {'target_user_id': targetUserId, 'action': action},
    );
    return SwipeResult.fromJson(json as Map<String, dynamic>);
  }

  Future<List<MatchListItem>> getMatches() async {
    final json = await _send('GET', '/matches/matches');
    final list = (json as Map)['matches'] as List? ?? const [];
    return list
        .whereType<Map>()
        .map((item) => MatchListItem.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<void> unmatch(int matchId) async {
    await _send('POST', '/matches/unmatch', body: {'match_id': matchId});
  }

  Future<List<ChatMessage>> getMessages(int matchId) async {
    final json = await _send('GET', '/messages/match/$matchId');
    final list = (json as Map)['messages'] as List? ?? const [];
    return list
        .whereType<Map>()
        .map((item) => ChatMessage.fromJson(Map<String, dynamic>.from(item)))
        .toList();
  }

  Future<ChatMessage> sendMessage(int matchId, String content) async {
    final json = await _send(
      'POST',
      '/messages/match/$matchId',
      body: {'content': content},
    );
    if (json is Map && json['message'] is Map) {
      return ChatMessage.fromJson(json['message'] as Map<String, dynamic>);
    }
    return ChatMessage.fromJson(json as Map<String, dynamic>);
  }
}

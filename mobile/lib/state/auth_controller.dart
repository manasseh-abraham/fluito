import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';
import '../services/google_auth.dart';
import '../theme/tokens.dart';

class AuthController extends ChangeNotifier {
  AuthController({required this.api, this.googleAuth});

  final FluitoApi api;
  final GoogleAuthGateway? googleAuth;

  bool get googleEnabled => googleAuth?.isAvailable ?? false;

  /// True only while restoring a stored session on launch.
  /// Must not be used for login submit — that unmounted the login form
  /// (and killed the IME) in the first Android build.
  bool booting = true;

  /// In-flight login / register. The auth form stays mounted.
  bool busy = false;
  Profile? profile;
  String? error;

  bool get isAuthenticated => api.hasToken && profile != null;

  FluitoPalette get palette =>
      profile?.gender == 'female' ? FluitoPalette.pink : FluitoPalette.blue;

  Future<void> restore() async {
    booting = true;
    error = null;
    notifyListeners();
    try {
      await api.restoreSession();
      if (api.hasToken) {
        profile = await api.getProfile();
      }
    } on TimeoutException {
      error = 'The server took too long. You can still sign in.';
      await api.clearSession();
      profile = null;
    } on ApiException catch (e) {
      if (e.statusCode == 401) {
        await api.clearSession();
        profile = null;
      } else {
        error = e.message;
      }
    } catch (e) {
      error = e.toString();
    } finally {
      booting = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    return _authAction(() => api.login(email: email, password: password));
  }

  Future<bool> continueWithGoogle() async {
    final gateway = googleAuth;
    if (gateway == null || !gateway.isAvailable) {
      error =
          'Google Sign-In is not configured. Set GOOGLE_WEB_CLIENT_ID via --dart-define.';
      notifyListeners();
      return false;
    }
    busy = true;
    error = null;
    notifyListeners();
    try {
      final idToken = await gateway.getIdToken();
      await api.loginWithGoogle(idToken: idToken);
      profile = await api.getProfile();
      return true;
    } on GoogleSignInCanceled {
      return false;
    } on GoogleAuthException catch (e) {
      error = e.message;
      return false;
    } on ApiException catch (e) {
      error = [
        e.message,
        if (e.details != null) e.details!.join(', '),
      ].where((s) => s.isNotEmpty).join(' — ');
      return false;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  Future<bool> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String dateOfBirth,
    required String gender,
  }) async {
    return _authAction(
      () => api.register(
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        dateOfBirth: dateOfBirth,
        gender: gender,
      ),
    );
  }

  Future<bool> _authAction(Future<AuthResponse> Function() action) async {
    busy = true;
    error = null;
    notifyListeners();
    try {
      await action();
      profile = await api.getProfile();
      return true;
    } on ApiException catch (e) {
      error = [
        e.message,
        if (e.details != null) e.details!.join(', '),
      ].where((s) => s.isNotEmpty).join(' — ');
      return false;
    } catch (e) {
      error = e.toString();
      return false;
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    try {
      profile = await api.getProfile();
      notifyListeners();
    } on ApiException catch (e) {
      if (e.statusCode == 401) {
        await logout();
      }
    }
  }

  Future<void> logout() async {
    await api.clearSession();
    profile = null;
    error = null;
    notifyListeners();
  }
}

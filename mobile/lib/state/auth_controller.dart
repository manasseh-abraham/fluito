import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';
import '../theme/tokens.dart';

class AuthController extends ChangeNotifier {
  AuthController({required this.api});

  final FluitoApi api;

  bool loading = true;
  Profile? profile;
  String? error;

  bool get isAuthenticated => api.hasToken && profile != null;

  FluitoPalette get palette =>
      profile?.gender == 'female' ? FluitoPalette.pink : FluitoPalette.blue;

  Future<void> restore() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      await api.restoreSession();
      if (api.hasToken) {
        profile = await api.getProfile();
      }
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
      loading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    return _authAction(() => api.login(email: email, password: password));
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
    loading = true;
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
      loading = false;
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

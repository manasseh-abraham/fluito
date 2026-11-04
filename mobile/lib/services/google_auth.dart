import 'package:google_sign_in/google_sign_in.dart';

/// Obtains a Google ID token for `POST /api/auth/google`.
///
/// [serverClientId] must be the **Web** OAuth client ID so the ID token
/// audience matches `GOOGLE_CLIENT_IDS` / `GOOGLE_WEB_CLIENT_ID` on the API.
abstract class GoogleAuthGateway {
  bool get isAvailable;

  /// Returns a Google ID token, or throws [GoogleSignInCanceled] / [GoogleAuthException].
  Future<String> getIdToken();
}

class GoogleSignInCanceled implements Exception {
  const GoogleSignInCanceled();

  @override
  String toString() => 'Google sign-in was canceled';
}

class GoogleAuthException implements Exception {
  const GoogleAuthException(this.message);

  final String message;

  @override
  String toString() => message;
}

class GoogleSignInGateway implements GoogleAuthGateway {
  GoogleSignInGateway({required this.serverClientId});

  /// Web client ID passed as `GoogleSignIn.serverClientId`.
  final String serverClientId;

  @override
  bool get isAvailable => serverClientId.trim().isNotEmpty;

  @override
  Future<String> getIdToken() async {
    if (!isAvailable) {
      throw const GoogleAuthException(
        'Google Sign-In is not configured. Pass '
        '--dart-define=GOOGLE_WEB_CLIENT_ID=<Web client ID>.',
      );
    }

    final client = GoogleSignIn(
      serverClientId: serverClientId,
      scopes: const ['email', 'profile', 'openid'],
    );

    final account = await client.signIn();
    if (account == null) {
      throw const GoogleSignInCanceled();
    }

    final auth = await account.authentication;
    final token = auth.idToken;
    if (token == null || token.isEmpty) {
      throw const GoogleAuthException(
        'Google did not return an ID token. Confirm GOOGLE_WEB_CLIENT_ID is '
        'the Web client ID (serverClientId), and that Android OAuth clients '
        'use package co.iotready.fluito / co.iotready.fluito.dev plus SHA-1.',
      );
    }
    return token;
  }
}

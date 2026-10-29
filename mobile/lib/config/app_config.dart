/// Compile-time app configuration.
///
/// API host is **never** hard-coded for production. Defaults target a **dev**
/// backend so Android emulator / debug / release-candidate builds can talk to
/// the local Bun API (or a remote dev host) via `--dart-define` or
/// `--dart-define-from-file`.
///
/// ```sh
/// # Hosted development API (default)
/// flutter run --flavor dev --dart-define-from-file=config/dev.json
///
/// # Android emulator → Bun on the host machine
/// flutter run --flavor dev \
///   --dart-define=FLAVOR=dev \
///   --dart-define=API_BASE_URL=http://10.0.2.2:4000
///
/// # Production host is TBD — do not invent one.
/// flutter build appbundle --flavor prod \
///   --dart-define=FLAVOR=prod \
///   --dart-define=API_BASE_URL=https://REPLACE-ME \
///   --dart-define=GOOGLE_WEB_CLIENT_ID=619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com
/// ```
class AppConfig {
  const AppConfig({
    required this.flavor,
    required this.apiRoot,
    this.googleWebClientId = defaultGoogleWebClientId,
    this.googleAndroidClientId = defaultGoogleAndroidDevClientId,
  });

  final AppFlavor flavor;

  /// Origin of the backend, without a trailing slash or `/api` suffix.
  /// Example: `https://api.fluito.veritas.org.in`
  final String apiRoot;

  /// Web OAuth client ID (`serverClientId`). ID token `aud` on the API.
  /// GCP project `fluito` / manasshe2@gmail.com.
  final String googleWebClientId;

  /// Android OAuth client ID for this flavor (package + SHA-1).
  /// The plugin uses [googleWebClientId] as `serverClientId`.
  final String googleAndroidClientId;

  /// REST prefix matching API_DOCUMENTATION.md (`/api`).
  String get apiBase => '$apiRoot/api';

  bool get isDev => flavor == AppFlavor.dev;
  bool get isProd => flavor == AppFlavor.prod;
  bool get hasApiRoot => apiRoot.isNotEmpty;
  bool get hasGoogleSignIn => googleWebClientId.trim().isNotEmpty;

  /// Default used when [FLAVOR] is `dev` and [API_BASE_URL] is omitted.
  /// Hosted Fluito development API. Override with `--dart-define=API_BASE_URL`
  /// (e.g. `http://10.0.2.2:4000` for an emulator hitting local Bun).
  static const defaultDevApiRoot = 'https://api.fluito.veritas.org.in';

  /// Intentionally empty. A production URL has not been chosen; passing
  /// `--dart-define=FLAVOR=prod` without `API_BASE_URL` is a configuration error.
  static const defaultProdApiRoot = '';

  /// Web client (`serverClientId` / ID token audience). Public client ID, not a secret.
  static const defaultGoogleWebClientId =
      '619885353175-l00am55pa3j7rc1a5h3pcmqhhhldh3um.apps.googleusercontent.com';

  /// Android debug client — package `co.iotready.fluito.dev`.
  static const defaultGoogleAndroidDevClientId =
      '619885353175-gokhfp6tmp623b2r0s796dhnq5l6jk1f.apps.googleusercontent.com';

  /// Android prod client — package `co.iotready.fluito`.
  static const defaultGoogleAndroidProdClientId =
      '619885353175-4u1nq6ibb3iee4b70mllfh343o71qmnj.apps.googleusercontent.com';

  /// Reads `--dart-define` values injected at compile time.
  factory AppConfig.fromEnvironment() {
    const flavorRaw = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
    const override = String.fromEnvironment('API_BASE_URL');
    const googleWeb = String.fromEnvironment(
      'GOOGLE_WEB_CLIENT_ID',
      defaultValue: defaultGoogleWebClientId,
    );
    const googleAndroid = String.fromEnvironment('GOOGLE_ANDROID_CLIENT_ID');
    const googleAndroidDev = String.fromEnvironment(
      'GOOGLE_ANDROID_DEV_CLIENT_ID',
      defaultValue: defaultGoogleAndroidDevClientId,
    );
    const googleAndroidProd = String.fromEnvironment(
      'GOOGLE_ANDROID_PROD_CLIENT_ID',
      defaultValue: defaultGoogleAndroidProdClientId,
    );
    final flavor = AppFlavor.parse(flavorRaw);

    final raw = override.trim().isNotEmpty
        ? override
        : (flavor == AppFlavor.prod ? defaultProdApiRoot : defaultDevApiRoot);

    final androidId = googleAndroid.trim().isNotEmpty
        ? googleAndroid.trim()
        : (flavor == AppFlavor.prod
            ? googleAndroidProd.trim()
            : googleAndroidDev.trim());

    return AppConfig(
      flavor: flavor,
      apiRoot: normalizeApiRoot(raw),
      googleWebClientId: googleWeb.trim(),
      googleAndroidClientId: androidId,
    );
  }

  /// Strips trailing slashes and a trailing `/api` so callers can pass either
  /// `http://host:4000` or `http://host:4000/api`.
  static String normalizeApiRoot(String raw) {
    var url = raw.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    if (url.toLowerCase().endsWith('/api')) {
      url = url.substring(0, url.length - 4);
      while (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
    }
    return url;
  }

  Uri resolveMedia(String? path) {
    if (path == null || path.isEmpty) {
      return Uri.parse(apiRoot);
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return Uri.parse(path);
    }
    if (path.startsWith('/')) {
      return Uri.parse('$apiRoot$path');
    }
    return Uri.parse('$apiRoot/$path');
  }
}

enum AppFlavor {
  dev,
  prod;

  static AppFlavor parse(String raw) {
    switch (raw.trim().toLowerCase()) {
      case 'prod':
      case 'production':
        return AppFlavor.prod;
      default:
        return AppFlavor.dev;
    }
  }
}

class MissingProdApiUrlException implements Exception {
  const MissingProdApiUrlException();

  @override
  String toString() =>
      'Production API URL is not configured. Pass '
      '--dart-define=API_BASE_URL=https://your-api-host (do not invent a host).';
}

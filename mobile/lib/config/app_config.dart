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
///   --dart-define=API_BASE_URL=https://REPLACE-ME
/// ```
class AppConfig {
  const AppConfig({
    required this.flavor,
    required this.apiRoot,
  });

  final AppFlavor flavor;

  /// Origin of the backend, without a trailing slash or `/api` suffix.
  /// Example: `https://api.fluito.veritas.org.in`
  final String apiRoot;

  /// REST prefix matching API_DOCUMENTATION.md (`/api`).
  String get apiBase => '$apiRoot/api';

  bool get isDev => flavor == AppFlavor.dev;
  bool get isProd => flavor == AppFlavor.prod;
  bool get hasApiRoot => apiRoot.isNotEmpty;

  /// Default used when [FLAVOR] is `dev` and [API_BASE_URL] is omitted.
  /// Hosted Fluito development API. Override with `--dart-define=API_BASE_URL`
  /// (e.g. `http://10.0.2.2:4000` for an emulator hitting local Bun).
  static const defaultDevApiRoot = 'https://api.fluito.veritas.org.in';

  /// Intentionally empty. A production URL has not been chosen; passing
  /// `--dart-define=FLAVOR=prod` without `API_BASE_URL` is a configuration error.
  static const defaultProdApiRoot = '';

  /// Reads `--dart-define` values injected at compile time.
  factory AppConfig.fromEnvironment() {
    const flavorRaw = String.fromEnvironment('FLAVOR', defaultValue: 'dev');
    const override = String.fromEnvironment('API_BASE_URL');
    final flavor = AppFlavor.parse(flavorRaw);

    final raw = override.trim().isNotEmpty
        ? override
        : (flavor == AppFlavor.prod ? defaultProdApiRoot : defaultDevApiRoot);

    return AppConfig(
      flavor: flavor,
      apiRoot: normalizeApiRoot(raw),
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

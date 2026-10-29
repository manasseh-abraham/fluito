import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/config/app_config.dart';

void main() {
  group('AppConfig.normalizeApiRoot', () {
    test('strips trailing slash and /api', () {
      expect(
        AppConfig.normalizeApiRoot('http://10.0.2.2:4000/api/'),
        'http://10.0.2.2:4000',
      );
      expect(
        AppConfig.normalizeApiRoot('http://10.0.2.2:4000'),
        'http://10.0.2.2:4000',
      );
    });
  });

  group('AppConfig.fromEnvironment defaults', () {
    test('dev flavor is the default and points at the hosted dev API', () {
      final config = AppConfig.fromEnvironment();
      expect(config.flavor, AppFlavor.dev);
      expect(config.isDev, isTrue);
      expect(config.apiRoot, AppConfig.defaultDevApiRoot);
      expect(config.apiBase, 'https://api.fluito.veritas.org.in/api');
    });

    test('production default host is empty (TBD, not invented)', () {
      expect(AppConfig.defaultProdApiRoot, isEmpty);
    });

    test('Google client IDs default to the Fluito GCP project clients', () {
      final config = AppConfig.fromEnvironment();
      expect(config.googleWebClientId, AppConfig.defaultGoogleWebClientId);
      expect(
        config.googleAndroidClientId,
        AppConfig.defaultGoogleAndroidDevClientId,
      );
      expect(config.hasGoogleSignIn, isTrue);
    });
  });

  group('AppFlavor.parse', () {
    test('maps production aliases to prod, everything else to dev', () {
      expect(AppFlavor.parse('prod'), AppFlavor.prod);
      expect(AppFlavor.parse('production'), AppFlavor.prod);
      expect(AppFlavor.parse('dev'), AppFlavor.dev);
      expect(AppFlavor.parse(''), AppFlavor.dev);
    });
  });

  test('resolveMedia prefixes relative upload paths with the API origin', () {
    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'http://10.0.2.2:4000',
    );
    expect(
      config.resolveMedia('/uploads/profiles/1.jpg').toString(),
      'http://10.0.2.2:4000/uploads/profiles/1.jpg',
    );
    expect(
      config.resolveMedia('https://cdn.example/p.jpg').toString(),
      'https://cdn.example/p.jpg',
    );
  });
}

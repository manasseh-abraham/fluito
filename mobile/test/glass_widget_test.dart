import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/config/app_config.dart';
import 'package:fluito/screens/auth_screen.dart';
import 'package:fluito/services/fluito_api.dart';
import 'package:fluito/services/google_auth.dart';
import 'package:fluito/state/auth_controller.dart';
import 'package:fluito/theme/tokens.dart';
import 'package:fluito/widgets/glass.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('GlassCard paints without BackdropFilter', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: GlassBackground(
          palette: FluitoPalette.blue,
          child: Center(
            child: GlassCard(child: Text('glass-card')),
          ),
        ),
      ),
    );

    expect(find.byType(BackdropFilter), findsNothing);
    expect(find.text('glass-card'), findsOneWidget);
  });

  testWidgets('Auth screen wordmark, fields accept input, no backdrop blur', (
    tester,
  ) async {
    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'https://api.fluito.veritas.org.in',
    );
    final api = FluitoApi(config: config);
    final auth = AuthController(api: api);
    auth.booting = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider.value(
            value: auth,
            child: const AuthScreen(),
          ),
        ),
      ),
    );

    expect(find.text('Fluito'), findsOneWidget);
    expect(find.text('Find your God-fearing partner'), findsOneWidget);
    expect(find.text('Sign In'), findsWidgets);
    expect(find.text('Continue with Google'), findsNothing);
    expect(find.byType(BackdropFilter), findsNothing);
    expect(find.byType(TextField), findsNWidgets(2));

    await tester.enterText(find.byType(TextField).first, 'user@example.com');
    expect(find.text('user@example.com'), findsOneWidget);

    await tester.tap(find.byType(TextField).first);
    await tester.pump();
    expect(
      tester.takeException(),
      isNull,
      reason: 'Focusing the email field must not throw',
    );
  });

  testWidgets('DevApiBanner shows the compiled-in API host', (tester) async {
    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'https://api.fluito.veritas.org.in',
    );
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: DevApiBanner(config: config))),
    );
    expect(find.textContaining('DEV'), findsOneWidget);
    expect(find.textContaining('api.fluito.veritas.org.in'), findsOneWidget);
  });

  testWidgets('Continue with Google shows on login and register views', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'https://api.fluito.veritas.org.in',
      googleWebClientId: '123-web.apps.googleusercontent.com',
    );
    final api = FluitoApi(config: config);
    final google = _FakeGoogleAuth();
    final auth = AuthController(api: api, googleAuth: google);
    auth.booting = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ChangeNotifierProvider.value(
            value: auth,
            child: const AuthScreen(),
          ),
        ),
      ),
    );

    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.byType(BackdropFilter), findsNothing);

    await tester.tap(find.text('Sign Up'));
    await tester.pump();
    expect(find.text('Create account'), findsOneWidget);
    expect(find.text('Continue with Google'), findsOneWidget);
  });
}

class _FakeGoogleAuth implements GoogleAuthGateway {
  @override
  bool get isAvailable => true;

  @override
  Future<String> getIdToken() async => 'fake-id-token';
}

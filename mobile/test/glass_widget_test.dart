import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/config/app_config.dart';
import 'package:fluito/screens/auth_screen.dart';
import 'package:fluito/services/fluito_api.dart';
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
}

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
  testWidgets('GlassCard uses BackdropFilter for the CSS glass blur', (tester) async {
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

    expect(find.byType(BackdropFilter), findsWidgets);
    expect(find.text('glass-card'), findsOneWidget);
  });

  testWidgets('Auth screen ports the web wordmark and subtitle', (tester) async {
    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'http://10.0.2.2:4000',
    );
    final api = FluitoApi(config: config);
    final auth = AuthController(api: api);
    auth.loading = false;

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
  });

  testWidgets('DevApiBanner shows the compiled-in API host', (tester) async {
    const config = AppConfig(
      flavor: AppFlavor.dev,
      apiRoot: 'http://10.0.2.2:4000',
    );
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: DevApiBanner(config: config))),
    );
    expect(find.textContaining('DEV'), findsOneWidget);
    expect(find.textContaining('10.0.2.2:4000'), findsOneWidget);
  });
}

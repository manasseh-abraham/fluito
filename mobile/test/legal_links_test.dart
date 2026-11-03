import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/config/app_config.dart';
import 'package:fluito/widgets/legal_links.dart';
import 'package:provider/provider.dart';

void main() {
  testWidgets('auth/profile legal links are visible', (tester) async {
    await tester.pumpWidget(
      Provider<AppConfig>.value(
        value: const AppConfig(
          flavor: AppFlavor.dev,
          apiRoot: 'https://api.fluito.veritas.org.in',
        ),
        child: const MaterialApp(home: Scaffold(body: LegalLinks())),
      ),
    );
    expect(find.text('Privacy Policy'), findsOneWidget);
    expect(find.text('Terms of Service'), findsOneWidget);
  });
}

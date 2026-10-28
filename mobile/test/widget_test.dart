import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/theme/tokens.dart';
import 'package:fluito/widgets/glass.dart';

void main() {
  testWidgets('glass nav renders Discover / Matches / Messages / Profile', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          bottomNavigationBar: GlassNavBar(
            currentIndex: 0,
            onSelect: (_) {},
            primary: FluitoTokens.primary,
          ),
        ),
      ),
    );

    expect(find.text('Discover'), findsOneWidget);
    expect(find.text('Matches'), findsOneWidget);
    expect(find.text('Messages'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
    expect(find.byType(BackdropFilter), findsNothing);
  });
}

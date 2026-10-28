import 'package:flutter/material.dart';

/// Design tokens ported from the web glassmorphism in
/// `frontend/src/index.css`.
///
/// There is no native iOS app in this repo. The in-repo “Liquid Glass”
/// reference is that CSS (`.glass-card`, `.glass-nav`, orb background), not
/// SwiftUI/UIKit Liquid Glass.
///
/// Android cannot cheaply run CSS `backdrop-filter`. Cards use a translucent
/// white fill + highlight gradient + hairline border to *read* as glass
/// without live `BackdropFilter` (which janked the login page and blocked
/// the IME on mid-range devices).
class FluitoTokens {
  FluitoTokens._();

  static const Color primary = Color(0xFF007AFF);
  static const Color primaryLight = Color(0xFF5AC8FA);
  static const Color primaryDark = Color(0xFF0051D5);
  static const Color accent = Color(0xFF00D4FF);

  static const Color pinkPrimary = Color(0xFFFF2D92);
  static const Color pinkPrimaryLight = Color(0xFFFF6BB5);
  static const Color pinkPrimaryDark = Color(0xFFD1005F);
  static const Color pinkAccent = Color(0xFFFF9EC5);

  static const Color textPrimary = Color(0xFF1D1D1F);
  static const Color textSecondary = Color(0xFF86868B);

  /// CSS `--glass-bg` is 10% white over a true backdrop blur. Without a live
  /// blur we paint a stronger frosted fill so content stays readable.
  static const Color glassFillTop = Color.fromRGBO(255, 255, 255, 0.78);
  static const Color glassFillBottom = Color.fromRGBO(255, 255, 255, 0.52);
  static const Color glassBorder = Color.fromRGBO(255, 255, 255, 0.65);
  static const Color glassInputFill = Color.fromRGBO(255, 255, 255, 0.88);
  static const Color glassActive = Color.fromRGBO(255, 255, 255, 0.55);

  static const Color danger = Color(0xFFFF3B30);
  static const Color success = Color(0xFF34C759);
  static const Color pageWash = Color(0xFFDCECFF);
  static const Color pinkPageWash = Color(0xFFFFE8F2);

  static const double cardRadius = 24;
  static const double navRadius = 22;
  static const double fieldRadius = 14;

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color.fromRGBO(31, 38, 135, 0.16),
      blurRadius: 24,
      offset: Offset(0, 10),
    ),
  ];
}

class FluitoPalette {
  const FluitoPalette({
    required this.primary,
    required this.primaryLight,
    required this.primaryDark,
    required this.accent,
    required this.pageWash,
    required this.gradientStart,
    required this.gradientEnd,
    required this.orbA,
    required this.orbB,
    required this.orbC,
  });

  final Color primary;
  final Color primaryLight;
  final Color primaryDark;
  final Color accent;
  final Color pageWash;
  final Color gradientStart;
  final Color gradientEnd;
  final Color orbA;
  final Color orbB;
  final Color orbC;

  static const FluitoPalette blue = FluitoPalette(
    primary: FluitoTokens.primary,
    primaryLight: FluitoTokens.primaryLight,
    primaryDark: FluitoTokens.primaryDark,
    accent: FluitoTokens.accent,
    pageWash: FluitoTokens.pageWash,
    gradientStart: Color.fromRGBO(0, 122, 255, 0.22),
    gradientEnd: Color.fromRGBO(90, 200, 250, 0.28),
    orbA: Color(0xFF7EC8FF),
    orbB: Color(0xFFB4E4FF),
    orbC: Color(0xFF5AD4FF),
  );

  static const FluitoPalette pink = FluitoPalette(
    primary: FluitoTokens.pinkPrimary,
    primaryLight: FluitoTokens.pinkPrimaryLight,
    primaryDark: FluitoTokens.pinkPrimaryDark,
    accent: FluitoTokens.pinkAccent,
    pageWash: FluitoTokens.pinkPageWash,
    gradientStart: Color.fromRGBO(255, 45, 146, 0.20),
    gradientEnd: Color.fromRGBO(255, 107, 181, 0.26),
    orbA: Color(0xFFFF9EC5),
    orbB: Color(0xFFFFC1DC),
    orbC: Color(0xFFFF6BB5),
  );
}

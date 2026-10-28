import 'dart:ui';

import 'package:flutter/material.dart';

/// Design tokens ported from the web glassmorphism in
/// `frontend/src/index.css`.
///
/// There is no native iOS app in this repo. The in-repo “Liquid Glass”
/// reference is that CSS (`.glass-card`, `.glass-nav`, orb background), not
/// SwiftUI/UIKit Liquid Glass.
class FluitoTokens {
  FluitoTokens._();

  // Blue theme (default / male) — :root in index.css
  static const Color primary = Color(0xFF007AFF);
  static const Color primaryLight = Color(0xFF5AC8FA);
  static const Color primaryDark = Color(0xFF0051D5);
  static const Color accent = Color(0xFF00D4FF);

  // Pink theme (female) — body.theme-pink
  static const Color pinkPrimary = Color(0xFFFF2D92);
  static const Color pinkPrimaryLight = Color(0xFFFF6BB5);
  static const Color pinkPrimaryDark = Color(0xFFD1005F);
  static const Color pinkAccent = Color(0xFFFF9EC5);

  static const Color textPrimary = Color(0xFF1D1D1F);
  static const Color textSecondary = Color(0xFF86868B);

  /// `--glass-bg: rgba(255, 255, 255, 0.1)`
  static const Color glassBg = Color.fromRGBO(255, 255, 255, 0.10);

  /// `--glass-border: rgba(255, 255, 255, 0.2)`
  static const Color glassBorder = Color.fromRGBO(255, 255, 255, 0.20);

  /// Input fill: `rgba(255, 255, 255, 0.15)`
  static const Color glassInputFill = Color.fromRGBO(255, 255, 255, 0.15);

  /// Active nav / selected row: `rgba(255, 255, 255, 0.15)`
  static const Color glassActive = Color.fromRGBO(255, 255, 255, 0.15);

  static const Color danger = Color(0xFFFF3B30);
  static const Color success = Color(0xFF34C759);
  static const Color pageWash = Color(0xFFE8F4FF);
  static const Color pinkPageWash = Color(0xFFFFF0F6);

  static const double cardRadius = 24;
  static const double navRadius = 16;
  static const double fieldRadius = 12;
  static const double cardBlurSigma = 20;
  static const double inputBlurSigma = 10;
  static const double orbBlurSigma = 80;
  static const double backdropSaturate = 1.8;

  static const List<BoxShadow> cardShadow = [
    BoxShadow(
      color: Color.fromRGBO(31, 38, 135, 0.37),
      blurRadius: 32,
      offset: Offset(0, 8),
    ),
  ];

  /// `backdrop-filter: blur(20px) saturate(180%)`
  static final ImageFilter cardBackdropFilter = ImageFilter.compose(
    inner: ImageFilter.blur(
      sigmaX: cardBlurSigma,
      sigmaY: cardBlurSigma,
      tileMode: TileMode.clamp,
    ),
    outer: const ColorFilter.matrix(_saturationMatrix180),
  );

  /// Softer blur on inputs (`blur(10px)`).
  static final ImageFilter inputBackdropFilter = ImageFilter.blur(
    sigmaX: inputBlurSigma,
    sigmaY: inputBlurSigma,
    tileMode: TileMode.clamp,
  );

  /// Rec. 601 saturation matrix at 180% (s = 1.8).
  /// luma = (0.2126, 0.7152, 0.0722); inv = 1 - s.
  static const List<double> _saturationMatrix180 = <double>[
    1.62992, -0.57216, -0.05776, 0, 0,
    -0.17008, 1.22784, -0.05776, 0, 0,
    -0.17008, -0.57216, 1.74224, 0, 0,
    0, 0, 0, 1, 0,
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
  });

  final Color primary;
  final Color primaryLight;
  final Color primaryDark;
  final Color accent;
  final Color pageWash;
  final Color gradientStart;
  final Color gradientEnd;

  static const FluitoPalette blue = FluitoPalette(
    primary: FluitoTokens.primary,
    primaryLight: FluitoTokens.primaryLight,
    primaryDark: FluitoTokens.primaryDark,
    accent: FluitoTokens.accent,
    pageWash: FluitoTokens.pageWash,
    gradientStart: Color.fromRGBO(0, 122, 255, 0.30),
    gradientEnd: Color.fromRGBO(90, 200, 250, 0.30),
  );

  static const FluitoPalette pink = FluitoPalette(
    primary: FluitoTokens.pinkPrimary,
    primaryLight: FluitoTokens.pinkPrimaryLight,
    primaryDark: FluitoTokens.pinkPrimaryDark,
    accent: FluitoTokens.pinkAccent,
    pageWash: FluitoTokens.pinkPageWash,
    gradientStart: Color.fromRGBO(255, 45, 146, 0.30),
    gradientEnd: Color.fromRGBO(255, 107, 181, 0.30),
  );
}

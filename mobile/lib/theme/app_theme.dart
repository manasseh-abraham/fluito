import 'package:flutter/material.dart';

import 'tokens.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData of(FluitoPalette palette) {
    final scheme = ColorScheme.fromSeed(
      seedColor: palette.primary,
      brightness: Brightness.light,
      primary: palette.primary,
      secondary: palette.primaryLight,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: 'Inter',
      scaffoldBackgroundColor: Colors.transparent,
      canvasColor: Colors.transparent,
      splashColor: palette.primary.withValues(alpha: 0.12),
      highlightColor: palette.primary.withValues(alpha: 0.08),
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          fontWeight: FontWeight.w700,
          color: FluitoTokens.textPrimary,
        ),
        headlineMedium: TextStyle(
          fontWeight: FontWeight.w700,
          color: FluitoTokens.textPrimary,
        ),
        titleLarge: TextStyle(
          fontWeight: FontWeight.w600,
          color: FluitoTokens.textPrimary,
        ),
        bodyLarge: TextStyle(color: FluitoTokens.textPrimary, height: 1.4),
        bodyMedium: TextStyle(color: FluitoTokens.textPrimary, height: 1.4),
        bodySmall: TextStyle(color: FluitoTokens.textSecondary),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: FluitoTokens.textPrimary,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: FluitoTokens.glassInputFill,
        hintStyle: const TextStyle(color: FluitoTokens.textSecondary),
        labelStyle: const TextStyle(color: FluitoTokens.textPrimary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          borderSide: const BorderSide(color: FluitoTokens.glassBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          borderSide: const BorderSide(color: FluitoTokens.glassBorder),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          borderSide: BorderSide(color: palette.primary, width: 1.4),
        ),
      ),
    );
  }
}

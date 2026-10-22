// Generated from packages/design-tokens/tokens.json. Run npm run tokens.
import 'package:flutter/material.dart';

class WithYouColors {
  static const primary = Color(0xFF0D6E68);
  static const deep = Color(0xFF0B3438);
  static const mint = Color(0xFFDDF4EA);
  static const background = Color(0xFFF8FBF9);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceAlt = Color(0xFFEFF7F3);
  static const text = Color(0xFF142C30);
  static const secondary = Color(0xFF52676A);
  static const border = Color(0xFFD9E7E2);
  static const warm = Color(0xFFF5B28C);
  static const success = Color(0xFF157A55);
  static const warning = Color(0xFF945A0F);
  static const danger = Color(0xFFB43C42);
  static const blue = Color(0xFF0564C9);
}

ThemeData withYouTheme() => ThemeData(
  useMaterial3: true,
  fontFamily: 'Manrope',
  scaffoldBackgroundColor: WithYouColors.background,
  colorScheme: ColorScheme.fromSeed(
    seedColor: WithYouColors.primary,
    primary: WithYouColors.primary,
    surface: WithYouColors.surface,
  ),
  appBarTheme: const AppBarTheme(
    backgroundColor: WithYouColors.background,
    foregroundColor: WithYouColors.deep,
  ),
  textTheme: const TextTheme(
    bodyLarge: TextStyle(fontSize: 16, height: 1.6, color: WithYouColors.text),
    bodyMedium: TextStyle(
      fontSize: 16,
      height: 1.6,
      color: WithYouColors.secondary,
    ),
    headlineLarge: TextStyle(
      fontSize: 40,
      height: 1.15,
      fontWeight: FontWeight.w600,
      color: WithYouColors.deep,
    ),
    headlineMedium: TextStyle(
      fontSize: 30,
      height: 1.2,
      fontWeight: FontWeight.w600,
      color: WithYouColors.deep,
    ),
  ),
  cardTheme: CardThemeData(
    color: WithYouColors.surface,
    elevation: 0,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(20),
      side: const BorderSide(color: WithYouColors.border),
    ),
  ),
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: WithYouColors.surface,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
  ),
  filledButtonTheme: FilledButtonThemeData(
    style: FilledButton.styleFrom(
      minimumSize: const Size(48, 48),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
  ),
);

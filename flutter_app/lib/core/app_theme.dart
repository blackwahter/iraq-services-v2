import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: AppColors.primaryNavy,
      scaffoldBackgroundColor: AppColors.bgLight,
      cardColor: AppColors.cardLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.primaryNavy),
        titleTextStyle: TextStyle(
          color: AppColors.primaryNavy,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        color: AppColors.cardLight,
        elevation: 0, // We will use custom BoxShadow for 0.04 opacity
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      textTheme: GoogleFonts.cairoTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.cairo(color: AppColors.textLightPrimary, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.cairo(color: AppColors.textLightPrimary),
        bodyMedium: GoogleFonts.cairo(color: AppColors.textLightSecondary),
      ),
      colorScheme: const ColorScheme.light(
        primary: AppColors.primaryNavy,
        secondary: AppColors.emerald,
        surface: AppColors.cardLight,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: AppColors.primaryNavy,
      scaffoldBackgroundColor: AppColors.bgDark,
      cardColor: AppColors.cardDark,
      cardTheme: CardTheme(
        color: AppColors.cardDark,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      textTheme: GoogleFonts.cairoTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.cairo(color: AppColors.textDarkPrimary, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.cairo(color: AppColors.textDarkPrimary),
        bodyMedium: GoogleFonts.cairo(color: AppColors.textDarkSecondary),
      ),
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primaryNavy,
        secondary: AppColors.emerald,
        surface: AppColors.cardDark,
      ),
    );
  }
}

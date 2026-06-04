import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: AppColors.primaryBlue,
      scaffoldBackgroundColor: AppColors.bgLight,
      cardColor: AppColors.cardLight,
      textTheme: GoogleFonts.cairoTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.cairo(color: AppColors.textLightPrimary, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.cairo(color: AppColors.textLightPrimary),
        bodyMedium: GoogleFonts.cairo(color: AppColors.textLightSecondary),
      ),
      colorScheme: ColorScheme.light(
        primary: AppColors.primaryBlue,
        secondary: AppColors.emerald,
        surface: AppColors.cardLight,
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: AppColors.primaryBlue,
      scaffoldBackgroundColor: AppColors.bgDark,
      cardColor: AppColors.cardDark,
      textTheme: GoogleFonts.cairoTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.cairo(color: AppColors.textDarkPrimary, fontWeight: FontWeight.bold),
        bodyLarge: GoogleFonts.cairo(color: AppColors.textDarkPrimary),
        bodyMedium: GoogleFonts.cairo(color: AppColors.textDarkSecondary),
      ),
      colorScheme: ColorScheme.dark(
        primary: AppColors.primaryBlue,
        secondary: AppColors.emerald,
        surface: AppColors.cardDark,
      ),
    );
  }
}

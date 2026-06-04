import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'core/app_theme.dart';
import 'core/app_colors.dart';
import 'providers/app_provider.dart';
import 'screens/home_screen.dart';
import 'screens/salaries_screen.dart';
import 'screens/markets_screen.dart';
import 'screens/metals_oil_screen.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
      ],
      child: const IraqServicesApp(),
    ),
  );
}

class IraqServicesApp extends StatelessWidget {
  const IraqServicesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'بوابة العراق المالية',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      builder: (context, child) {
        return Directionality(
          textDirection: TextDirection.rtl,
          child: child!,
        );
      },
      home: const MainNavigator(),
    );
  }
}

class MainNavigator extends StatefulWidget {
  const MainNavigator({super.key});

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const SalariesScreen(),
    const MarketsScreen(), // Contains Bourse & Converter
    const MetalsOilScreen(), // Screen D: Gold & Oil Segmented
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true, // For glassmorphism effect
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(130),
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              color: Colors.white.withOpacity(0.85),
              padding: const EdgeInsets.only(top: 50, left: 16, right: 16, bottom: 16),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Right side empty or back button if needed, but we use rtl so right is left natively.
                      // Wait, in RTL: MainAxisAlignment.spaceBetween -> start is Right, end is Left.
                      // Center Title:
                      const Expanded(
                        child: Text(
                          'بوابة العراق المالية',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.primaryNavy,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      // Left (End in RTL) Bell:
                      Stack(
                        children: [
                          IconButton(
                            icon: const Icon(LucideIcons.bell, color: AppColors.primaryNavy),
                            onPressed: () {},
                          ),
                          Positioned(
                            top: 10,
                            left: 12,
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Colors.redAccent,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Search Bar
                  Container(
                    height: 45,
                    decoration: BoxDecoration(
                      color: AppColors.searchBarBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.search, color: AppColors.textLightSecondary, size: 20),
                        const SizedBox(width: 12),
                        Text(
                          'بحث عن راتب، وزارة، عملة...',
                          style: TextStyle(
                            color: AppColors.textLightSecondary.withOpacity(0.7),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: _screens[_selectedIndex],
      bottomNavigationBar: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.75),
              border: const Border(
                top: BorderSide(color: Colors.black12, width: 0.5),
              ),
            ),
            child: BottomNavigationBar(
              currentIndex: _selectedIndex,
              onTap: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
              backgroundColor: Colors.transparent,
              elevation: 0,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppColors.primaryNavy,
              unselectedItemColor: AppColors.textLightSecondary,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 12),
              items: [
                BottomNavigationBarItem(
                  icon: const Icon(LucideIcons.layoutDashboard),
                  activeIcon: Column(
                    children: [
                      const Icon(LucideIcons.layoutDashboard),
                      const SizedBox(height: 4),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.primaryNavy, shape: BoxShape.circle))
                    ],
                  ),
                  label: 'الرئيسية',
                ),
                BottomNavigationBarItem(
                  icon: const Icon(LucideIcons.wallet),
                  activeIcon: Column(
                    children: [
                      const Icon(LucideIcons.wallet),
                      const SizedBox(height: 4),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.primaryNavy, shape: BoxShape.circle))
                    ],
                  ),
                  label: 'الرواتب',
                ),
                BottomNavigationBarItem(
                  icon: const Icon(LucideIcons.building2),
                  activeIcon: Column(
                    children: [
                      const Icon(LucideIcons.building2),
                      const SizedBox(height: 4),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.primaryNavy, shape: BoxShape.circle))
                    ],
                  ),
                  label: 'البورصة',
                ),
                BottomNavigationBarItem(
                  icon: const Icon(LucideIcons.gem),
                  activeIcon: Column(
                    children: [
                      const Icon(LucideIcons.gem),
                      const SizedBox(height: 4),
                      Container(width: 4, height: 4, decoration: const BoxDecoration(color: AppColors.primaryNavy, shape: BoxShape.circle))
                    ],
                  ),
                  label: 'المعادن',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

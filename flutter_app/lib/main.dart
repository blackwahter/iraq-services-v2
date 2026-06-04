import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'core/app_theme.dart';
import 'core/app_colors.dart';
import 'providers/app_provider.dart';
import 'screens/home_screen.dart';
import 'screens/salaries_screen.dart';
import 'screens/markets_screen.dart';
import 'screens/converter_screen.dart';

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
    const ConverterScreen(),
    const SalariesScreen(),
    const MarketsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: isDark ? Colors.white10 : Colors.black12,
              width: 1,
            ),
          ),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: isDark ? AppColors.bgDark : AppColors.cardLight,
          indicatorColor: AppColors.primaryBlue.withOpacity(0.2),
          destinations: const [
            NavigationDestination(
              icon: Icon(LucideIcons.layoutDashboard),
              label: 'الرئيسية',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.calculator),
              label: 'المحول',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.wallet),
              label: 'الرواتب',
            ),
            NavigationDestination(
              icon: Icon(LucideIcons.building2),
              label: 'الأسواق',
            ),
          ],
        ),
      ),
    );
  }
}

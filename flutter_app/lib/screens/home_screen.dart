import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/app_provider.dart';
import '../core/app_colors.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('لوحة التحكم الذكية'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.bell),
            onPressed: () {},
          ),
        ],
      ),
      body: Consumer<AppProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.bourses == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final bourses = provider.bourses;
          final kifahPrice = bourses?['kifah']?['price']?.toString() ?? '---';
          
          final metals = provider.metals;
          final goldPrice = metals?['gold']?['price']?.toString() ?? '---';

          return RefreshIndicator(
            onRefresh: () => provider.fetchData(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildMainCard(
                  context: context,
                  title: 'بورصة الكفاح',
                  price: kifahPrice,
                  subtitle: 'دينار',
                  color1: Colors.blue.shade700,
                  color2: Colors.indigo.shade900,
                  icon: LucideIcons.building,
                ),
                const SizedBox(height: 16),
                _buildMainCard(
                  context: context,
                  title: 'الذهب العالمي',
                  price: goldPrice != '---' ? '\$$goldPrice' : '---',
                  subtitle: 'للأونصة',
                  color1: Colors.amber.shade700,
                  color2: Colors.orange.shade900,
                  icon: LucideIcons.coins,
                ),
                const SizedBox(height: 16),
                _buildSalariesCard(context, provider.updates),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMainCard({
    required BuildContext context,
    required String title,
    required String price,
    required String subtitle,
    required Color color1,
    required Color color2,
    required IconData icon,
  }) {
    return Container(
      height: 180,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          colors: [color1, color2],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: color1.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: Colors.white),
              ),
              const Icon(LucideIcons.arrowUpRight, color: Colors.white54),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    price,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(width: 8),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Text(
                      subtitle,
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSalariesCard(BuildContext context, List<dynamic> updates) {
    final salaries = updates.where((u) => u['category'] == 'رواتب').take(3).toList();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        color: isDark ? AppColors.cardDarkElevated : AppColors.cardLight,
        border: Border.all(
          color: isDark ? Colors.white10 : Colors.black12,
        ),
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.emerald.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.wallet, color: AppColors.emerald),
              ),
              const SizedBox(width: 12),
              const Text(
                'إشعارات الرواتب',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (salaries.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Text('جاري المراقبة...', style: TextStyle(color: Colors.grey)),
              ),
            )
          else
            ...salaries.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? Colors.black12 : Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      s['content'],
                      style: const TextStyle(fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                )),
        ],
      ),
    );
  }
}

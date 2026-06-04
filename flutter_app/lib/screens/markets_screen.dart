import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/app_provider.dart';

class MarketsScreen extends StatelessWidget {
  const MarketsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('البورصات المحلية')),
      body: Consumer<AppProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.bourses == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final bourses = provider.bourses;
          if (bourses == null) return const Center(child: Text('لا توجد بيانات للبورصة'));

          return RefreshIndicator(
            onRefresh: () => provider.fetchData(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildMarketCard(context, 'بورصة الكفاح (بغداد)', bourses['kifah']?['price']?.toString(), Colors.blue),
                const SizedBox(height: 12),
                _buildMarketCard(context, 'بورصة الحارثية (بغداد)', bourses['harthiya']?['price']?.toString(), Colors.indigo),
                const SizedBox(height: 12),
                _buildMarketCard(context, 'بورصة أربيل (الشمال)', bourses['erbil']?['price']?.toString(), Colors.emerald),
                const SizedBox(height: 12),
                _buildMarketCard(context, 'بورصة البصرة (الجنوب)', bourses['basra']?['price']?.toString(), Colors.amber),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildMarketCard(BuildContext context, String name, String? price, MaterialColor color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: color.shade50.withOpacity(0.5),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(LucideIcons.building, color: color.shade700),
              const SizedBox(width: 12),
              Text(
                name,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color.shade900,
                ),
              ),
            ],
          ),
          Text(
            price ?? '---',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w900,
              fontFamily: 'monospace',
              color: color.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

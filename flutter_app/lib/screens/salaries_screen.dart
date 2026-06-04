import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_colors.dart';
import '../providers/app_provider.dart';

class SalariesScreen extends StatelessWidget {
  const SalariesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    return RefreshIndicator(
      onRefresh: () async => provider.fetchData(),
      child: ListView(
        padding: const EdgeInsets.only(top: 150, left: 16, right: 16, bottom: 100),
        children: [
          const Text(
            'سجل رواتب الموظفين',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.primaryNavy,
            ),
          ),
          const SizedBox(height: 24),
          if (provider.isLoading)
            const Center(child: CircularProgressIndicator())
          else if (provider.updates == null || provider.updates!.isEmpty)
            const Center(child: Text('لا توجد بيانات حالياً'))
          else
            ...provider.updates!.map((update) => _buildSalaryCard(update)).toList(),
        ],
      ),
    );
  }

  Widget _buildSalaryCard(Map<String, dynamic> update) {
    final text = update['description']?.toString() ?? '';
    final time = update['time']?.toString() ?? '';

    // Logic for dynamic badges based on text content
    bool isDone = text.contains('تم') || text.contains('صرف') || text.contains('مباشرة');
    bool isPending = text.contains('قيد') || text.contains('تنتظر') || text.contains('قريباً');

    String badgeText = 'متابعة';
    Color badgeColor = AppColors.primaryNavy;

    if (isDone) {
      badgeText = 'تم الإطلاق';
      badgeColor = AppColors.emerald;
    } else if (isPending) {
      badgeText = 'قيد التدقيق';
      badgeColor = AppColors.amber;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.cardLight,
        borderRadius: BorderRadius.circular(20),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            offset: Offset(0, 8),
            blurRadius: 30,
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.primaryNavy.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.account_balance, color: AppColors.primaryNavy),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: badgeColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      color: badgeColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  text,
                  style: const TextStyle(
                    color: AppColors.textLightPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  time,
                  style: const TextStyle(
                    color: AppColors.textLightSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

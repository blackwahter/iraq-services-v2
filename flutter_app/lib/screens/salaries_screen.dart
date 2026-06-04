import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/app_provider.dart';
import '../core/app_colors.dart';
import 'package:intl/intl.dart';

class SalariesScreen extends StatelessWidget {
  const SalariesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('أخبار الرواتب')),
      body: Consumer<AppProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading && provider.updates.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          final salaries = provider.updates.where((u) => u['category'] == 'رواتب').toList();
          
          if (salaries.isEmpty) {
            return const Center(child: Text('لا توجد أخبار رواتب حالياً'));
          }

          return RefreshIndicator(
            onRefresh: () => provider.fetchData(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: salaries.length,
              itemBuilder: (context, index) {
                final update = salaries[index];
                final date = DateTime.tryParse(update['created_at'].toString()) ?? DateTime.now();
                final formattedTime = DateFormat('hh:mm a').format(date);

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(16),
                    leading: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.emerald.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(LucideIcons.wallet, color: AppColors.emerald),
                    ),
                    title: Text(
                      update['content'],
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        formattedTime,
                        style: const TextStyle(fontFamily: 'monospace', color: Colors.grey),
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

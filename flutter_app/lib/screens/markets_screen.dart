import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_colors.dart';
import '../providers/app_provider.dart';

class MarketsScreen extends StatefulWidget {
  const MarketsScreen({super.key});

  @override
  State<MarketsScreen> createState() => _MarketsScreenState();
}

class _MarketsScreenState extends State<MarketsScreen> {
  final TextEditingController _usdController = TextEditingController(text: '100');
  final TextEditingController _iqdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _usdController.addListener(_calculateIqd);
    _iqdController.addListener(_calculateUsd);
  }

  @override
  void dispose() {
    _usdController.dispose();
    _iqdController.dispose();
    super.dispose();
  }

  void _calculateIqd() {
    if (_usdController.text.isEmpty) {
      if (_iqdController.text.isNotEmpty) _iqdController.text = '';
      return;
    }
    final provider = context.read<AppProvider>();
    final rate = provider.bourses?['kifah']?['price'];
    if (rate != null && _usdController.text.isNotEmpty) {
      final usd = double.tryParse(_usdController.text);
      if (usd != null) {
        final iqd = (usd * rate) / 100;
        if (_iqdController.text != iqd.toStringAsFixed(0)) {
          _iqdController.text = iqd.toStringAsFixed(0);
        }
      }
    }
  }

  void _calculateUsd() {
    if (_iqdController.text.isEmpty) {
      if (_usdController.text.isNotEmpty) _usdController.text = '';
      return;
    }
    final provider = context.read<AppProvider>();
    final rate = provider.bourses?['kifah']?['price'];
    if (rate != null && _iqdController.text.isNotEmpty) {
      final iqd = double.tryParse(_iqdController.text);
      if (iqd != null) {
        final usd = (iqd / rate) * 100;
        if (_usdController.text != usd.toStringAsFixed(2)) {
          _usdController.text = usd.toStringAsFixed(2);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();
    
    // Initial calculation if data loaded and fields are empty
    if (provider.bourses != null && _iqdController.text.isEmpty && _usdController.text.isNotEmpty) {
      Future.microtask(() => _calculateIqd());
    }

    return RefreshIndicator(
      onRefresh: () async => provider.fetchData(),
      child: ListView(
        padding: const EdgeInsets.only(top: 150, left: 16, right: 16, bottom: 100),
        children: [
          // Smart Converter
          const Text(
            'المحول المالي الذكي',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.primaryNavy),
          ),
          const SizedBox(height: 16),
          Container(
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
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildConverterField('دولار أمريكي (USD)', _usdController, '🇺🇸'),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 8.0),
                  child: Icon(Icons.swap_vert, color: AppColors.textLightSecondary),
                ),
                _buildConverterField('دينار عراقي (IQD)', _iqdController, '🇮🇶'),
              ],
            ),
          ),

          const SizedBox(height: 32),
          const Text(
            'مؤشر بغداد (الكفاح)',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryNavy),
          ),
          const SizedBox(height: 16),

          // Main Bourse Card
          Container(
            decoration: BoxDecoration(
              color: AppColors.primaryNavy,
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x0A000000),
                  offset: Offset(0, 8),
                  blurRadius: 30,
                ),
              ],
            ),
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('السعر الحالي', style: TextStyle(color: Colors.white70, fontSize: 14)),
                    Icon(Icons.trending_up, color: AppColors.emerald.withOpacity(0.8)),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  provider.bourses?['kifah']?['price']?.toString() ?? '...',
                  style: const TextStyle(color: Colors.white, fontSize: 40, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),
          const Text(
            'المحافظات الأخرى',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primaryNavy),
          ),
          const SizedBox(height: 16),

          // Other Cities List View
          if (provider.bourses != null)
            ...['erbil', 'basra', 'harthiya'].map((cityId) {
              final cityData = provider.bourses![cityId];
              if (cityData == null) return const SizedBox.shrink();
              
              String cityName = cityId == 'erbil' ? 'أربيل' : cityId == 'basra' ? 'البصرة' : 'الحارثية';
              
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: AppColors.cardLight,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0A000000),
                      offset: Offset(0, 4),
                      blurRadius: 20,
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(cityName, style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primaryNavy, fontSize: 16)),
                    Row(
                      children: [
                        Text(
                          cityData['price']?.toString() ?? '...',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, fontFamily: 'monospace', color: AppColors.primaryNavy),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.arrow_upward, color: AppColors.emerald, size: 16),
                      ],
                    ),
                  ],
                ),
              );
            }).toList(),
        ],
      ),
    );
  }

  Widget _buildConverterField(String label, TextEditingController controller, String emoji) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.searchBarBg.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textLightSecondary, fontWeight: FontWeight.bold)),
                TextField(
                  controller: controller,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.primaryNavy, fontFamily: 'monospace'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

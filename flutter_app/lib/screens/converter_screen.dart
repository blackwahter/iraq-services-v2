import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/app_provider.dart';
import '../core/app_colors.dart';

class ConverterScreen extends StatefulWidget {
  const ConverterScreen({super.key});

  @override
  State<ConverterScreen> createState() => _ConverterScreenState();
}

class _ConverterScreenState extends State<ConverterScreen> {
  final TextEditingController _amountController = TextEditingController(text: '100');
  String _fromAsset = 'usd';
  String _toAsset = 'iqd';

  final List<Map<String, dynamic>> _assets = [
    {'id': 'iqd', 'name': 'دينار عراقي', 'icon': LucideIcons.wallet},
    {'id': 'usd', 'name': 'دولار أمريكي', 'icon': LucideIcons.dollarSign},
    {'id': 'mithqal24k', 'name': 'مثقال 24', 'icon': LucideIcons.sparkles},
    {'id': 'mithqal21k', 'name': 'مثقال 21', 'icon': LucideIcons.sparkles},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('المحول المالي')),
      body: Consumer<AppProvider>(
        builder: (context, provider, child) {
          if (provider.bourses == null || provider.metals == null) {
            return const Center(child: CircularProgressIndicator());
          }

          final dollarRate = (provider.bourses?['kifah']?['price'] ?? 146500) / 100;
          final goldOzUsd = provider.metals?['gold']?['price'] ?? 2350.0;
          final goldGram24KIqd = (goldOzUsd / 31.1034768) * dollarRate;

          final rates = {
            'iqd': 1.0,
            'usd': dollarRate,
            'mithqal24k': goldGram24KIqd * 5,
            'mithqal21k': (goldGram24KIqd * (21 / 24)) * 5,
          };

          double inputAmount = double.tryParse(_amountController.text) ?? 0;
          double amountInBase = inputAmount * rates[_fromAsset]!;
          double finalResult = amountInBase / rates[_toAsset]!;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                _buildInputBox('من', _fromAsset, true, (val) => setState(() => _fromAsset = val!)),
                const SizedBox(height: 16),
                IconButton(
                  onPressed: () {
                    setState(() {
                      final temp = _fromAsset;
                      _fromAsset = _toAsset;
                      _toAsset = temp;
                    });
                  },
                  icon: const Icon(LucideIcons.arrowDownUp, color: AppColors.primaryBlue),
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primaryBlue.withOpacity(0.1),
                    padding: const EdgeInsets.all(16),
                  ),
                ),
                const SizedBox(height: 16),
                _buildInputBox('إلى', _toAsset, false, (val) => setState(() => _toAsset = val!), result: finalResult),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputBox(String label, String selectedValue, bool isInput, Function(String?) onChanged, {double? result}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDarkElevated : AppColors.cardLight,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isDark ? Colors.white10 : Colors.black12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: selectedValue,
                    isExpanded: true,
                    icon: const Icon(LucideIcons.chevronDown),
                    items: _assets.map((asset) {
                      return DropdownMenuItem<String>(
                        value: asset['id'],
                        child: Row(
                          children: [
                            Icon(asset['icon'], size: 18, color: AppColors.primaryBlue),
                            const SizedBox(width: 8),
                            Text(asset['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      );
                    }).toList(),
                    onChanged: onChanged,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 3,
                child: isInput
                    ? TextField(
                        controller: _amountController,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.left,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, fontFamily: 'monospace'),
                        decoration: const InputDecoration(border: InputBorder.none),
                        onChanged: (val) => setState(() {}),
                      )
                    : Text(
                        result?.toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '') ?? '0',
                        textAlign: TextAlign.left,
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: AppColors.primaryBlue),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

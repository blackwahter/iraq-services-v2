import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/app_colors.dart';
import '../providers/app_provider.dart';

class MetalsOilScreen extends StatefulWidget {
  const MetalsOilScreen({super.key});

  @override
  State<MetalsOilScreen> createState() => _MetalsOilScreenState();
}

class _MetalsOilScreenState extends State<MetalsOilScreen> {
  int _selectedSegment = 0; // 0 for Gold, 1 for Oil

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<AppProvider>();

    return RefreshIndicator(
      onRefresh: () async => provider.fetchData(),
      child: ListView(
        padding: const EdgeInsets.only(top: 150, left: 16, right: 16, bottom: 100),
        children: [
          // Segmented Control
          Container(
            height: 50,
            decoration: BoxDecoration(
              color: AppColors.searchBarBg,
              borderRadius: BorderRadius.circular(25),
            ),
            padding: const EdgeInsets.all(4),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedSegment = 0),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _selectedSegment == 0 ? AppColors.cardLight : Colors.transparent,
                        borderRadius: BorderRadius.circular(21),
                        boxShadow: _selectedSegment == 0
                            ? [const BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))]
                            : [],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'الذهب',
                        style: TextStyle(
                          color: _selectedSegment == 0 ? AppColors.primaryNavy : AppColors.textLightSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _selectedSegment = 1),
                    child: Container(
                      decoration: BoxDecoration(
                        color: _selectedSegment == 1 ? AppColors.cardLight : Colors.transparent,
                        borderRadius: BorderRadius.circular(21),
                        boxShadow: _selectedSegment == 1
                            ? [const BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2))]
                            : [],
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        'النفط',
                        style: TextStyle(
                          color: _selectedSegment == 1 ? AppColors.primaryNavy : AppColors.textLightSecondary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 32),

          if (provider.isLoading)
            const Center(child: CircularProgressIndicator())
          else if (_selectedSegment == 0)
            _buildGoldGrid(provider)
          else
            _buildOilGrid(provider),
        ],
      ),
    );
  }

  Widget _buildGoldGrid(AppProvider provider) {
    final goldPrice = provider.metals?['gold']?['price']?.toDouble() ?? 2350.0;
    // Calculate approximate grams based on ounce price
    final ounceToGram = goldPrice / 31.103;
    final k24 = ounceToGram;
    final k21 = ounceToGram * (21 / 24);
    final k18 = ounceToGram * (18 / 24);

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildGridCard('أونصة الذهب', '\$${goldPrice.toStringAsFixed(1)}', Icons.monetization_on, AppColors.amber),
        _buildGridCard('غرام 24K', '\$${k24.toStringAsFixed(2)}', Icons.diamond, AppColors.amber),
        _buildGridCard('غرام 21K', '\$${k21.toStringAsFixed(2)}', Icons.diamond_outlined, AppColors.amber),
        _buildGridCard('غرام 18K', '\$${k18.toStringAsFixed(2)}', Icons.stars, AppColors.amber),
      ],
    );
  }

  Widget _buildOilGrid(AppProvider provider) {
    final brent = provider.oil?['brent']?.toDouble() ?? 0.0;
    final wti = provider.oil?['wti']?.toDouble() ?? 0.0;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildGridCard('خام برنت', '\$$brent', Icons.water_drop, AppColors.primaryNavy),
        _buildGridCard('الخام الأمريكي', '\$$wti', Icons.water_drop_outlined, AppColors.primaryNavy),
      ],
    );
  }

  Widget _buildGridCard(String title, String price, IconData icon, Color iconColor) {
    return Container(
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
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.textLightSecondary,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                price,
                style: const TextStyle(
                  color: AppColors.primaryNavy,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  fontFamily: 'monospace',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'dart:async';
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AppProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  Map<String, dynamic>? bourses;
  Map<String, dynamic>? oil;
  Map<String, dynamic>? metals;
  List<dynamic> updates = [];
  
  bool isLoading = false;
  Timer? _timer;

  AppProvider() {
    fetchData();
    // Auto-refresh every 30 seconds
    _timer = Timer.periodic(const Duration(seconds: 30), (timer) {
      fetchData(isSilent: true);
    });
  }

  Future<void> fetchData({bool isSilent = false}) async {
    if (!isSilent) {
      isLoading = true;
      notifyListeners();
    }

    try {
      final results = await Future.wait([
        _apiService.getBourses(),
        _apiService.getOilPrices(),
        _apiService.getMetalsPrices(),
        _apiService.getUpdates(),
      ]);

      bourses = results[0] as Map<String, dynamic>?;
      oil = results[1] as Map<String, dynamic>?;
      metals = results[2] as Map<String, dynamic>?;
      updates = results[3] as List<dynamic>;

    } catch (e) {
      print("Error in AppProvider: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // baseUrl should point to the live Render server to get real data
  static const String baseUrl = 'https://iraq-services-v2.onrender.com/api';

  Future<Map<String, dynamic>?> getBourses() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bourses'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) return data['data'];
      }
    } catch (e) {
      print('Error fetching bourses: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getOilPrices() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/oil'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) return data;
      }
    } catch (e) {
      print('Error fetching oil prices: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>?> getMetalsPrices() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/metals'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) return data;
      }
    } catch (e) {
      print('Error fetching metals prices: $e');
    }
    return null;
  }

  Future<List<dynamic>> getUpdates() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/updates'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data is List) return data;
      }
    } catch (e) {
      print('Error fetching updates: $e');
    }
    return [];
  }
}

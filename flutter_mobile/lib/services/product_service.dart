import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class ProductService {
  static const String baseUrl = 'http://192.168.100.50:5000';

  late final http.Client _client = createHttpClient();

  Future<Map<String, dynamic>> getProducts() async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (!kIsWeb && SessionCookieStore.cookie != null) {
        headers['Cookie'] = SessionCookieStore.cookie!;
      }

      final response = await _client.get(
        Uri.parse('$baseUrl/api/products'),
        headers: headers,
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'products': List<Map<String, dynamic>>.from(
            (data['products'] as List).map(
              (product) => Map<String, dynamic>.from(product),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve products.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the product server.',
      };
    }
  }

  void dispose() {
    _client.close();
  }
}
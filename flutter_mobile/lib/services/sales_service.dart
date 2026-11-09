
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class SalesService {
  static const String baseUrl = 'http://192.168.100.50:5000';

  late final http.Client _client = createHttpClient();

  Map<String, String> get _headers {
    final headers = <String, String>{
      'Content-Type': 'application/json',
    };

    if (!kIsWeb && SessionCookieStore.cookie != null) {
      headers['Cookie'] = SessionCookieStore.cookie!;
    }

    return headers;
  }

  Future<Map<String, dynamic>> createSale({
    required String paymentMethod,
    required List<Map<String, dynamic>> items,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/api/sales'),
        headers: _headers,
        body: jsonEncode({
          'payment_method': paymentMethod,
          'items': items,
        }),
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 201 && data['success'] == true) {
        return data;
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to complete sale.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the sales server.',
      };
    }
  }

  Future<Map<String, dynamic>> getSales() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/sales'),
        headers: _headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'sales': List<Map<String, dynamic>>.from(
            (data['sales'] as List).map(
              (sale) => Map<String, dynamic>.from(sale),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve transactions.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the transaction server.',
      };
    }
  }

  Future<Map<String, dynamic>> getSaleDetails(int saleId) async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/sales/$saleId'),
        headers: _headers,
      );

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'sale': Map<String, dynamic>.from(data['sale']),
          'items': List<Map<String, dynamic>>.from(
            (data['items'] as List).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve transaction details.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the transaction server.',
      };
    }
  }

  void dispose() {
    _client.close();
  }
}

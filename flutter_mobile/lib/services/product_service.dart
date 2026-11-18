import 'dart:convert';
import '../config/api_config.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class ProductService {
  static String get baseUrl => ApiConfig.baseUrl;

  late final http.Client _client = createHttpClient();

  Map<String, String> get _headers {
    final headers = {'Content-Type': 'application/json'};

    if (!kIsWeb && SessionCookieStore.cookie != null) {
      headers['Cookie'] = SessionCookieStore.cookie!;
    }

    return headers;
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final decoded = jsonDecode(response.body);

    if (decoded is Map<String, dynamic>) {
      return decoded;
    }

    return {'success': false, 'message': 'Invalid server response.'};
  }

  Future<Map<String, dynamic>> getProducts() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/products'),
        headers: _headers,
      );

      final data = _decodeResponse(response);

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

  Future<Map<String, dynamic>> lookupBarcode(String barcode) async {
    try {
      final uri = Uri.parse(
        '$baseUrl/api/barcode/lookup',
      ).replace(queryParameters: {'barcode': barcode.trim()});

      final response = await _client.get(uri, headers: _headers);

      final data = _decodeResponse(response);

      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }

      return {
        ...data,
        'success': false,
        'message': data['message'] ?? 'Unable to look up this barcode.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the barcode lookup service.',
      };
    }
  }

  Future<Map<String, dynamic>> addProduct({
    required String barcode,
    required String productName,
    required String brand,
    required String category,
    required String unit,
    required double sellingPrice,
    String? imageUrl,
    String? apiSource,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/api/products'),
        headers: _headers,
        body: jsonEncode({
          'barcode': barcode.trim(),
          'product_name': productName.trim(),
          'brand': brand.trim(),
          'category': category.trim(),
          'unit': unit.trim(),
          'selling_price': sellingPrice,
          'image_url': imageUrl,
          'api_source': apiSource,
        }),
      );

      final data = _decodeResponse(response);

      if (response.statusCode == 201 && data['success'] == true) {
        return data;
      }

      return {
        ...data,
        'success': false,
        'message': data['message'] ?? 'Unable to register product.',
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

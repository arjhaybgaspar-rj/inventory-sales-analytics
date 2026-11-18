import 'dart:convert';
import '../config/api_config.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class OwnerInventoryService {
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

  Future<Map<String, dynamic>> getInventory() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/inventory'),
        headers: _headers,
      );

      final data = _decodeResponse(response);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'inventory': List<Map<String, dynamic>>.from(
            (data['inventory'] as List).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve inventory.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the inventory server.',
      };
    }
  }

  Future<Map<String, dynamic>> stockIn({
    required int productId,
    required String batchNumber,
    required int quantity,
    required double acquisitionCost,
    String? expiryDate,
    required String receivedDate,
    required int reorderLevel,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/api/inventory/stock-in'),
        headers: _headers,
        body: jsonEncode({
          'product_id': productId,
          'batch_number': batchNumber,
          'quantity': quantity,
          'acquisition_cost': acquisitionCost,
          'expiry_date': expiryDate,
          'received_date': receivedDate,
          'reorder_level': reorderLevel,
        }),
      );

      final data = _decodeResponse(response);

      if (response.statusCode == 201 && data['success'] == true) {
        return data;
      }

      return {
        ...data,
        'success': false,
        'message': data['message'] ?? 'Unable to process stock-in.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the inventory server.',
      };
    }
  }

  Future<Map<String, dynamic>> getAlerts() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/inventory/alerts'),
        headers: _headers,
      );

      final data = _decodeResponse(response);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'alerts': List<Map<String, dynamic>>.from(
            (data['alerts'] as List).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve inventory alerts.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the inventory server.',
      };
    }
  }

  Future<Map<String, dynamic>> getMovements() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/inventory/movements'),
        headers: _headers,
      );

      final data = _decodeResponse(response);

      if (response.statusCode == 200 && data['success'] == true) {
        return {
          'success': true,
          'movements': List<Map<String, dynamic>>.from(
            (data['movements'] as List).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          ),
        };
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Unable to retrieve inventory movements.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the inventory server.',
      };
    }
  }

  void dispose() {
    _client.close();
  }
}

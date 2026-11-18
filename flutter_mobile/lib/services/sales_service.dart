import 'dart:convert';
import '../config/api_config.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class SalesOverviewSummary {
  final double totalSales;
  final int transactionCount;

  const SalesOverviewSummary({
    required this.totalSales,
    required this.transactionCount,
  });

  factory SalesOverviewSummary.forDate(
    List<Map<String, dynamic>> sales,
    DateTime date,
  ) {
    final localDate = date.toLocal();
    var totalSales = 0.0;
    var transactionCount = 0;

    for (final sale in sales) {
      final saleDate = DateTime.tryParse(sale['sale_date']?.toString() ?? '');
      if (saleDate == null) continue;

      final localSaleDate = saleDate.toLocal();
      if (localSaleDate.year != localDate.year ||
          localSaleDate.month != localDate.month ||
          localSaleDate.day != localDate.day) {
        continue;
      }

      totalSales +=
          double.tryParse(sale['total_amount']?.toString() ?? '') ?? 0;
      transactionCount++;
    }

    return SalesOverviewSummary(
      totalSales: totalSales,
      transactionCount: transactionCount,
    );
  }
}

class SalesService {
  static String get baseUrl => ApiConfig.baseUrl;

  late final http.Client _client = createHttpClient();

  Map<String, String> get _headers {
    final headers = <String, String>{'Content-Type': 'application/json'};

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
        body: jsonEncode({'payment_method': paymentMethod, 'items': items}),
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

  Future<Map<String, dynamic>> getSharedCart() async {
    try {
      final response = await _client.get(
        Uri.parse('$baseUrl/api/sales/cart'),
        headers: _headers,
      );
      final data = jsonDecode(response.body);
      if (response.statusCode == 200 &&
          data is Map &&
          data['success'] == true) {
        return {
          'success': true,
          'items': List<Map<String, dynamic>>.from(
            (data['items'] as List? ?? []).map(
              (item) => Map<String, dynamic>.from(item),
            ),
          ),
        };
      }
      return {
        'success': false,
        'message': data is Map
            ? data['message']
            : 'Unable to load shared cart.',
      };
    } catch (_) {
      return {'success': false, 'message': 'Unable to load the shared cart.'};
    }
  }

  Future<Map<String, dynamic>> addSharedCartItem(int productId) async {
    return _sendCartRequest(
      'POST',
      '/api/sales/cart/items',
      body: {'product_id': productId, 'quantity': 1},
    );
  }

  Future<Map<String, dynamic>> updateSharedCartItem({
    required int productId,
    required int quantity,
    int? selectedBatchId,
    String? batchOverrideReason,
  }) async {
    final body = <String, dynamic>{'quantity': quantity};
    if (selectedBatchId != null || batchOverrideReason != null) {
      body['selected_batch_id'] = selectedBatchId;
      body['batch_override_reason'] = batchOverrideReason ?? '';
    }
    return _sendCartRequest(
      'PUT',
      '/api/sales/cart/items/$productId',
      body: body,
    );
  }

  Future<Map<String, dynamic>> removeSharedCartItem(int productId) async {
    return _sendCartRequest('DELETE', '/api/sales/cart/items/$productId');
  }

  Future<Map<String, dynamic>> clearSharedCart() async {
    return _sendCartRequest('DELETE', '/api/sales/cart');
  }

  Future<Map<String, dynamic>> _sendCartRequest(
    String method,
    String path, {
    Map<String, dynamic>? body,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl$path');
      final request = http.Request(method, uri)..headers.addAll(_headers);
      if (body != null) request.body = jsonEncode(body);
      final streamed = await _client.send(request);
      final response = await http.Response.fromStream(streamed);
      final decoded = jsonDecode(response.body);
      if (response.statusCode >= 200 &&
          response.statusCode < 300 &&
          decoded is Map &&
          decoded['success'] == true) {
        return Map<String, dynamic>.from(decoded);
      }
      return {
        'success': false,
        'message': decoded is Map
            ? decoded['message'] ?? 'Unable to update the shared cart.'
            : 'Unable to update the shared cart.',
      };
    } catch (_) {
      return {'success': false, 'message': 'Unable to reach the shared cart.'};
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

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'http_client_factory.dart';
import 'session_cookie_store.dart';

class AuthService {
  static const String baseUrl = kIsWeb
    ? 'http://localhost:5000'
    : 'http://192.168.100.108:5000';

  late final http.Client _client = createHttpClient();

  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse('$baseUrl/mobile/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (!kIsWeb) {
        SessionCookieStore.save(response.headers['set-cookie']);
      }

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        return data;
      }

      return {
        'success': false,
        'message': data['message'] ?? 'Login failed.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Unable to connect to the server. Please check your backend.',
      };
    }
  }

  Future<void> logout() async {
    try {
      final headers = {
        'Content-Type': 'application/json',
      };

      if (!kIsWeb && SessionCookieStore.cookie != null) {
        headers['Cookie'] = SessionCookieStore.cookie!;
      }

      await _client.post(
        Uri.parse('$baseUrl/logout'),
        headers: headers,
      );

      SessionCookieStore.clear();
    } catch (e) {
      throw Exception('Unable to logout.');
    }
  }

  void dispose() {
    _client.close();
  }
}
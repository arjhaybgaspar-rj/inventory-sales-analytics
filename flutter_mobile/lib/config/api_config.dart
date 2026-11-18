import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String _webBaseUrl = 'http://localhost:5000';
  static const String _mobileBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.70.11.136:5000',
  );

  static String get baseUrl => kIsWeb ? _webBaseUrl : _mobileBaseUrl;
}


class SessionCookieStore {
  static String? _cookie;

  static void save(String? setCookie) {
    if (setCookie == null || setCookie.isEmpty) return;

    _cookie = setCookie.split(';').first.trim();
  }

  static String? get cookie => _cookie;

  static void clear() {
    _cookie = null;
  }
}

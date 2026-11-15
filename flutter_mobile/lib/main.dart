import 'screens/owner/owner_dashboard.dart';
import 'screens/transaction_history_screen.dart';
import 'package:flutter/material.dart';
import 'screens/scanner_screen.dart';
import 'screens/payment_screen.dart';
import 'services/auth_service.dart';
import 'services/product_service.dart';

void main() {
  runApp(const MyApp());
}

const Color primaryColor = Color(0xFF2E8B72);
const Color backgroundColor = Color(0xFFF3F8F5);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Inventory Sales Analytics',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: primaryColor),
        scaffoldBackgroundColor: backgroundColor,
        appBarTheme: const AppBarTheme(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
        ),
      ),
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;

  Future<void> _login() async {
    if (_usernameController.text.trim().isEmpty ||
        _passwordController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your username and password.'),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final result = await _authService.login(
      username: _usernameController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      final user = Map<String, dynamic>.from(result['user']);

      final role = user['role']?.toString().toLowerCase();

if (role == 'owner') {
  Navigator.pushReplacement(
    context,
    MaterialPageRoute(
      builder: (_) => OwnerDashboard(user: user),
    ),
  );
} else if (role == 'cashier') {
  Navigator.pushReplacement(
    context,
    MaterialPageRoute(
      builder: (_) => CashierDashboard(user: user),
    ),
  );
} else {
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(
      content: Text('This account is not allowed to use the mobile app.'),
    ),
  );
}
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Login failed.'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _authService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(30),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const CircleAvatar(
                      radius: 38,
                      backgroundColor: Color(0xFFE1F2E9),
                      child: Icon(
                        Icons.storefront_rounded,
                        size: 40,
                        color: primaryColor,
                      ),
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      'Inventory Sales Analytics',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 23,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF244B3D),
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Owner & Cashier Mobile Application',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.grey),
                    ),
                    const SizedBox(height: 32),
                    const Text(
                      'Username',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _usernameController,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        hintText: 'Enter your username',
                        prefixIcon: Icon(Icons.person_outline),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Password',
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      onSubmitted: (_) => _login(),
                      decoration: InputDecoration(
                        hintText: 'Enter your password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    SizedBox(
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _login,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: Colors.white,
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : const Text(
                                'LOGIN',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Authorized owner and cashier accounts only.',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CashierDashboard extends StatefulWidget {
  final Map<String, dynamic> user;

  const CashierDashboard({
    super.key,
    required this.user,
  });

  @override
  State<CashierDashboard> createState() => _CashierDashboardState();
}

class _CashierDashboardState extends State<CashierDashboard> {
  int _selectedIndex = 0;
  bool _isLoggingOut = false;

  final List<Map<String, dynamic>> _cart = [];

  Future<void> _logout() async {
    setState(() => _isLoggingOut = true);

    final authService = AuthService();

    try {
      await authService.logout();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Unable to contact the server.'),
          ),
        );
      }
    } finally {
      authService.dispose();
    }

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(
        builder: (_) => const LoginScreen(),
      ),
      (route) => false,
    );
  }

  Future<void> _checkout() async {
    if (_cart.isEmpty) return;

    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          cart: _cart
              .map((item) => Map<String, dynamic>.from(item))
              .toList(),
          totalAmount: _totalAmount,
        ),
      ),
    );

    if (!mounted) return;

    if (result == true) {
      setState(() {
        _cart.clear();
        _selectedIndex = 1;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sale completed successfully.'),
          backgroundColor: primaryColor,
        ),
      );
    }
  }

  void _addToCart(Map<String, dynamic> product) {
    final productId = int.tryParse(
          product['product_id']?.toString() ?? '',
        ) ??
        0;

    if (productId <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Invalid product.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final index = _cart.indexWhere(
      (item) => item['product_id'] == productId,
    );

    setState(() {
      if (index >= 0) {
        _cart[index]['quantity']++;
      } else {
        _cart.add({
          'product_id': productId,
          'product_name':
              product['product_name']?.toString() ?? 'Unknown Product',
          'selling_price': double.tryParse(
                product['selling_price']?.toString() ?? '0',
              ) ??
              0.0,
          'quantity': 1,
        });
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          '${product['product_name']} added to cart.',
        ),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void _updateQuantity(int index, int change) {
    if (index < 0 || index >= _cart.length) return;

    setState(() {
      _cart[index]['quantity'] += change;

      if (_cart[index]['quantity'] <= 0) {
        _cart.removeAt(index);
      }
    });
  }

  void _clearCart() {
    setState(() {
      _cart.clear();
    });
  }

  double get _totalAmount {
    return _cart.fold(
      0.0,
      (total, item) =>
          total +
          (item['selling_price'] as double) *
              (item['quantity'] as int),
    );
  }

  int get _cartItemCount {
    return _cart.fold(
      0,
      (total, item) => total + (item['quantity'] as int),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardHome(
        user: widget.user,
        onNavigate: (index) {
          setState(() => _selectedIndex = index);
        },
      ),
      NewSaleScreen(onAddToCart: _addToCart),
      CartScreen(
        cart: _cart,
        totalAmount: _totalAmount,
        onUpdateQuantity: _updateQuantity,
        onClearCart: _clearCart,
        onCheckout: _checkout,
      ),
      const TransactionHistoryScreen(),
      ProfileScreen(user: widget.user),
    ];

    final titles = [
      'Cashier Dashboard',
      'New Sale',
      'Shopping Cart',
      'Transaction History',
      'My Profile',
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(titles[_selectedIndex]),
        actions: [
          if (_selectedIndex == 1)
            IconButton(
              onPressed: () {
                setState(() {});
                _selectedIndex = 2;
              },
              tooltip: 'Shopping Cart',
              icon: Badge(
                label: Text('$_cartItemCount'),
                isLabelVisible: _cartItemCount > 0,
                child: const Icon(Icons.shopping_cart),
              ),
            ),
          IconButton(
            onPressed: _isLoggingOut ? null : _logout,
            tooltip: 'Logout',
            icon: _isLoggingOut
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.logout),
          ),
        ],
      ),
      body: IndexedStack(
        index: _selectedIndex,
        children: pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          const NavigationDestination(
            icon: Icon(Icons.add_shopping_cart),
            label: 'New Sale',
          ),
          NavigationDestination(
            icon: Badge(
              label: Text('$_cartItemCount'),
              isLabelVisible: _cartItemCount > 0,
              child: const Icon(Icons.shopping_cart_outlined),
            ),
            selectedIcon: const Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          const NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            label: 'History',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class DashboardHome extends StatelessWidget {
  final Map<String, dynamic> user;
  final ValueChanged<int> onNavigate;

  const DashboardHome({
    super.key,
    required this.user,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final fullName = user['full_name'] ?? 'Cashier';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Welcome back,',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  fullName.toString(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Ready to serve your customers?',
                  style: TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 20),
                const Row(
                  children: [
                    Icon(Icons.point_of_sale, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      'Cashier Account',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 25),
          const Text(
            'Sales Overview',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OverviewCard(
                  title: "Today's Sales",
                  value: '--',
                  icon: Icons.payments_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OverviewCard(
                  title: 'Transactions',
                  value: '--',
                  icon: Icons.receipt_long_outlined,
                ),
              ),
            ],
          ),
          const SizedBox(height: 25),
          const Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 19,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          ActionCard(
            title: 'Create New Sale',
            subtitle: 'Scan or search for products',
            icon: Icons.add_shopping_cart,
            onTap: () => onNavigate(1),
          ),
          ActionCard(
            title: 'View Shopping Cart',
            subtitle: 'Review items before checkout',
            icon: Icons.shopping_cart_outlined,
            onTap: () => onNavigate(2),
          ),
          ActionCard(
            title: 'Transaction History',
            subtitle: 'View previous transactions',
            icon: Icons.history,
            onTap: () => onNavigate(3),
          ),
          const SizedBox(height: 20),
          const Text(
            'Sales figures will appear here once connected to the sales API.',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class OverviewCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const OverviewCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: primaryColor, size: 28),
            const SizedBox(height: 15),
            Text(
              value,
              style: const TextStyle(
                fontSize: 25,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 5),
            Text(
              title,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const ActionCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 8,
        ),
        leading: CircleAvatar(
          backgroundColor: const Color(0xFFE1F2E9),
          child: Icon(icon, color: primaryColor),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}

class NewSaleScreen extends StatefulWidget {
  final ValueChanged<Map<String, dynamic>> onAddToCart;

  const NewSaleScreen({
    super.key,
    required this.onAddToCart,
  });

  @override
  State<NewSaleScreen> createState() => _NewSaleScreenState();
}

class _NewSaleScreenState extends State<NewSaleScreen> {
  final ProductService _productService = ProductService();
  final TextEditingController _searchController = TextEditingController();

  List<Map<String, dynamic>> _products = [];
  bool _isLoading = true;
  bool _isScanning = false;
  String? _errorMessage;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _productService.getProducts();

    if (!mounted) return;

    setState(() {
      _isLoading = false;

      if (result['success'] == true) {
        _products = List<Map<String, dynamic>>.from(
          result['products'],
        );
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  Future<void> _scanBarcode() async {
    if (_isScanning) return;

    setState(() => _isScanning = true);

    try {
      final barcode = await Navigator.push<String>(
        context,
        MaterialPageRoute(
          builder: (_) => const ScannerScreen(),
        ),
      );

      if (!mounted) return;

      if (barcode == null || barcode.isEmpty) return;

      final matchingProducts = _products.where((product) {
        final productBarcode =
            product['barcode']?.toString().trim() ?? '';

        return productBarcode == barcode.trim();
      }).toList();

      if (matchingProducts.isNotEmpty) {
        widget.onAddToCart(matchingProducts.first);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Product not found. Barcode: $barcode',
            ),
            backgroundColor: Colors.red.shade700,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to scan barcode. Please try again.'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isScanning = false);
      }
    }
  }

  List<Map<String, dynamic>> get _filteredProducts {
    final query = _searchQuery.trim().toLowerCase();

    if (query.isEmpty) return _products;

    return _products.where((product) {
      final name =
          (product['product_name'] ?? '').toString().toLowerCase();
      final barcode =
          (product['barcode'] ?? '').toString().toLowerCase();
      final brand =
          (product['brand'] ?? '').toString().toLowerCase();

      return name.contains(query) ||
          barcode.contains(query) ||
          brand.contains(query);
    }).toList();
  }

  String _formatPrice(dynamic value) {
    final price = double.tryParse(value?.toString() ?? '0') ?? 0;
    return '₱${price.toStringAsFixed(2)}';
  }

  @override
  void dispose() {
    _searchController.dispose();
    _productService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final filteredProducts = _filteredProducts;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _isScanning ? null : _scanBarcode,
              icon: const Icon(Icons.qr_code_scanner),
              label: const Text(
                'SCAN BARCODE',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16),
          child: TextField(
            controller: _searchController,
            onChanged: (value) {
              setState(() {
                _searchQuery = value;
              });
            },
            decoration: InputDecoration(
              hintText: 'Search product name or barcode',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: IconButton(
                onPressed: () {
                  _searchController.clear();
                  setState(() {
                    _searchQuery = '';
                  });
                },
                icon: const Icon(Icons.close),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Text(
                'Available Products (${_products.length})',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: _isLoading ? null : _loadProducts,
                icon: const Icon(Icons.refresh),
              ),
            ],
          ),
        ),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(
                    color: primaryColor,
                  ),
                )
              : _errorMessage != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.cloud_off,
                              size: 55,
                              color: Colors.grey,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _loadProducts,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Try Again'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : filteredProducts.isEmpty
                      ? Center(
                          child: Text(
                            _products.isEmpty
                                ? 'No active products found.'
                                : 'No matching products found.',
                            style: const TextStyle(color: Colors.grey),
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadProducts,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(
                              16,
                              4,
                              16,
                              20,
                            ),
                            itemCount: filteredProducts.length,
                            itemBuilder: (context, index) {
                              final product = filteredProducts[index];

                              return Card(
                                color: Colors.white,
                                margin: const EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(14),
                                  leading: const CircleAvatar(
                                    backgroundColor: Color(0xFFE1F2E9),
                                    child: Icon(
                                      Icons.inventory_2_outlined,
                                      color: primaryColor,
                                    ),
                                  ),
                                  title: Text(
                                    product['product_name']?.toString() ??
                                        'Unnamed Product',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 6),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Barcode: ${product['barcode'] ?? 'N/A'}',
                                        ),
                                        Text(
                                          'Brand: ${product['brand'] ?? 'N/A'}',
                                        ),
                                        Text(
                                          'Unit: ${product['unit'] ?? 'N/A'}',
                                        ),
                                        const SizedBox(height: 5),
                                        Text(
                                          _formatPrice(
                                            product['selling_price'],
                                          ),
                                          style: const TextStyle(
                                            color: primaryColor,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  trailing: IconButton(
                                    tooltip: 'Add to Cart',
                                    icon: const Icon(
                                      Icons.add_shopping_cart,
                                      color: primaryColor,
                                      size: 28,
                                    ),
                                    onPressed: () {
                                      widget.onAddToCart(product);
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
        ),
      ],
    );
  }
}

class CartScreen extends StatelessWidget {
  final List<Map<String, dynamic>> cart;
  final double totalAmount;
  final Function(int, int) onUpdateQuantity;
  final VoidCallback onClearCart;
  final VoidCallback onCheckout;

  const CartScreen({
    super.key,
    required this.cart,
    required this.totalAmount,
    required this.onUpdateQuantity,
    required this.onClearCart,
    required this.onCheckout,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Text(
                'Cart Items',
                style: TextStyle(
                  fontSize: 19,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              if (cart.isNotEmpty)
                TextButton.icon(
                  onPressed: onClearCart,
                  icon: const Icon(Icons.delete_outline),
                  label: const Text('Clear Cart'),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.red,
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: cart.isEmpty
              ? const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.shopping_cart_outlined,
                        size: 65,
                        color: Colors.grey,
                      ),
                      SizedBox(height: 15),
                      Text(
                        'Your cart is empty.',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Add products from the New Sale screen.',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: cart.length,
                  itemBuilder: (context, index) {
                    final item = cart[index];
                    final price = item['selling_price'] as double;
                    final quantity = item['quantity'] as int;

                    return Card(
                      color: Colors.white,
                      margin: const EdgeInsets.only(bottom: 10),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: Color(0xFFE1F2E9),
                              child: Icon(
                                Icons.shopping_bag_outlined,
                                color: primaryColor,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['product_name'].toString(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    '₱${price.toStringAsFixed(2)} each',
                                    style: const TextStyle(
                                      color: Colors.grey,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    'Subtotal: ₱${(price * quantity).toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      color: primaryColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () =>
                                      onUpdateQuantity(index, -1),
                                  icon: const Icon(
                                    Icons.remove_circle_outline,
                                  ),
                                ),
                                Text(
                                  '$quantity',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                IconButton(
                                  visualDensity: VisualDensity.compact,
                                  onPressed: () =>
                                      onUpdateQuantity(index, 1),
                                  icon: const Icon(
                                    Icons.add_circle_outline,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              top: BorderSide(color: Color(0xFFE0E0E0)),
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Amount',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '₱${totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 22,
                      color: primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 15),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: cart.isEmpty ? null : onCheckout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text(
                    'Proceed to Checkout',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}



class ProfileScreen extends StatelessWidget {
  final Map<String, dynamic> user;

  const ProfileScreen({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Card(
        color: Colors.white,
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            children: [
              const CircleAvatar(
                radius: 42,
                backgroundColor: Color(0xFFE1F2E9),
                child: Icon(
                  Icons.person,
                  color: primaryColor,
                  size: 45,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                user['full_name']?.toString() ?? 'Cashier',
                style: const TextStyle(
                  fontSize: 21,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 25),
              ProfileInfo(
                label: 'Username',
                value: user['username']?.toString() ?? '',
              ),
              ProfileInfo(
                label: 'Role',
                value: user['role']?.toString() ?? 'cashier',
              ),
              ProfileInfo(
                label: 'Account Status',
                value: user['status']?.toString() ?? 'active',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileInfo extends StatelessWidget {
  final String label;
  final String value;

  const ProfileInfo({
    super.key,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(
        label,
        style: const TextStyle(color: Colors.grey),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          color: Colors.black87,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class FeaturePlaceholder extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const FeaturePlaceholder({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(30),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              radius: 45,
              backgroundColor: const Color(0xFFE1F2E9),
              child: Icon(
                icon,
                size: 48,
                color: primaryColor,
              ),
            ),
            const SizedBox(height: 22),
            Text(
              title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.grey,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

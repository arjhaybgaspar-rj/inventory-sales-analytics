import 'dart:async';

import 'screens/owner/owner_dashboard.dart';
import 'screens/transaction_history_screen.dart';
import 'package:flutter/material.dart';
import 'screens/scanner_screen.dart';
import 'screens/payment_screen.dart';
import 'services/auth_service.dart';
import 'services/product_service.dart';
import 'services/sales_service.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const MyApp());
}

const Color primaryColor = AppColors.primary;
const Color backgroundColor = AppColors.canvas;

abstract final class _LoginPalette {
  static const forest = AppColors.forest;
  static const deepSage = AppColors.deepGreen;
  static const sage = AppColors.secondary;
  static const softSage = AppColors.sage;
  static const paleSage = AppColors.sageLight;
  static const sand = AppColors.border;
  static const cream = AppColors.canvas;
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Inventory Sales Analytics',
      theme: AppTheme.light,
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

      if (role == 'manager') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => ManagerDashboard(user: user)),
        );
      } else if (role == 'cashier') {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => CashierDashboard(user: user)),
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
          backgroundColor: AppColors.error,
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
      backgroundColor: _LoginPalette.cream,
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [_LoginPalette.cream, _LoginPalette.sand],
          ),
        ),
        child: Stack(
          children: [
            Positioned(
              top: -72,
              right: -54,
              child: Container(
                width: 210,
                height: 210,
                decoration: const BoxDecoration(
                  color: Color(0x3392AA97),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            Positioned(
              bottom: -88,
              left: -60,
              child: Container(
                width: 240,
                height: 240,
                decoration: const BoxDecoration(
                  color: Color(0x22BDC9B8),
                  shape: BoxShape.circle,
                ),
              ),
            ),
            SafeArea(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final compact = constraints.maxHeight < 720;

                  return Center(
                    child: SingleChildScrollView(
                      padding: EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: compact ? 16 : 28,
                      ),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 430),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Container(
                              padding: EdgeInsets.all(compact ? 21 : 24),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    _LoginPalette.forest,
                                    _LoginPalette.deepSage,
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(24),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x26314C3B),
                                    blurRadius: 24,
                                    offset: Offset(0, 12),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 46,
                                        height: 46,
                                        decoration: BoxDecoration(
                                          color: const Color(0x22F7F3EA),
                                          borderRadius: BorderRadius.circular(
                                            15,
                                          ),
                                          border: Border.all(
                                            color: const Color(0x33F7F3EA),
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.storefront_rounded,
                                          color: _LoginPalette.cream,
                                          size: 24,
                                        ),
                                      ),
                                      const SizedBox(width: 13),
                                      const Expanded(
                                        child: Text(
                                          'INVENTORY & SALES',
                                          style: TextStyle(
                                            color: _LoginPalette.paleSage,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            letterSpacing: 1.25,
                                          ),
                                        ),
                                      ),
                                      const Icon(
                                        Icons.auto_graph_rounded,
                                        color: _LoginPalette.softSage,
                                        size: 21,
                                      ),
                                    ],
                                  ),
                                  SizedBox(height: compact ? 20 : 25),
                                  const Text(
                                    'Welcome back',
                                    style: TextStyle(
                                      color: _LoginPalette.cream,
                                      fontSize: 27,
                                      height: 1.12,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'Sign in to manage your store with confidence.',
                                    style: TextStyle(
                                      color: _LoginPalette.paleSage,
                                      fontSize: 14,
                                      height: 1.45,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),
                            Container(
                              padding: EdgeInsets.fromLTRB(
                                22,
                                compact ? 20 : 24,
                                22,
                                20,
                              ),
                              decoration: BoxDecoration(
                                color: _LoginPalette.cream,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: _LoginPalette.paleSage,
                                ),
                                boxShadow: const [
                                  BoxShadow(
                                    color: Color(0x18314C3B),
                                    blurRadius: 28,
                                    offset: Offset(0, 12),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  const Text(
                                    'Account access',
                                    style: TextStyle(
                                      color: _LoginPalette.forest,
                                      fontSize: 18,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  const SizedBox(height: 5),
                                  const Text(
                                    'Enter your credentials to continue.',
                                    style: TextStyle(
                                      color: _LoginPalette.deepSage,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  TextField(
                                    controller: _usernameController,
                                    textInputAction: TextInputAction.next,
                                    autocorrect: false,
                                    enableSuggestions: false,
                                    decoration: _loginInputDecoration(
                                      label: 'Username',
                                      hint: 'Enter your username',
                                      icon: Icons.person_outline_rounded,
                                    ),
                                  ),
                                  const SizedBox(height: 14),
                                  TextField(
                                    controller: _passwordController,
                                    obscureText: _obscurePassword,
                                    textInputAction: TextInputAction.done,
                                    onSubmitted: (_) => _login(),
                                    decoration: _loginInputDecoration(
                                      label: 'Password',
                                      hint: 'Enter your password',
                                      icon: Icons.lock_outline_rounded,
                                      suffixIcon: IconButton(
                                        onPressed: () => setState(() {
                                          _obscurePassword = !_obscurePassword;
                                        }),
                                        tooltip: _obscurePassword
                                            ? 'Show password'
                                            : 'Hide password',
                                        icon: Icon(
                                          _obscurePassword
                                              ? Icons.visibility_off_outlined
                                              : Icons.visibility_outlined,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 20),
                                  SizedBox(
                                    height: 54,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: _LoginPalette.forest,
                                        foregroundColor: _LoginPalette.cream,
                                        disabledBackgroundColor:
                                            _LoginPalette.paleSage,
                                        disabledForegroundColor:
                                            _LoginPalette.deepSage,
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(
                                            15,
                                          ),
                                        ),
                                      ),
                                      onPressed: _isLoading ? null : _login,
                                      child: _isLoading
                                          ? const SizedBox(
                                              width: 22,
                                              height: 22,
                                              child: CircularProgressIndicator(
                                                color: _LoginPalette.cream,
                                                strokeWidth: 2.4,
                                              ),
                                            )
                                          : const Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  'Sign in',
                                                  style: TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                Icon(
                                                  Icons.arrow_forward_rounded,
                                                  size: 20,
                                                ),
                                              ],
                                            ),
                                    ),
                                  ),
                                  const SizedBox(height: 17),
                                  const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.verified_user_outlined,
                                        size: 15,
                                        color: _LoginPalette.sage,
                                      ),
                                      SizedBox(width: 7),
                                      Flexible(
                                        child: Text(
                                          'For authorized manager and cashier accounts',
                                          textAlign: TextAlign.center,
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: _LoginPalette.deepSage,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _loginInputDecoration({
    required String label,
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
  }) {
    final border = OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: _LoginPalette.sand),
    );

    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: Icon(icon, color: _LoginPalette.deepSage),
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: _LoginPalette.cream,
      contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 17),
      border: border,
      enabledBorder: border,
      focusedBorder: border.copyWith(
        borderSide: const BorderSide(color: _LoginPalette.sage, width: 1.5),
      ),
    );
  }
}

class ManagerDashboard extends StatelessWidget {
  final Map<String, dynamic> user;

  const ManagerDashboard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final name = user['full_name']?.toString() ?? 'Manager';

    return Scaffold(
      appBar: AppBar(title: const Text('Manager workspace')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
        children: [
          Container(
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.forest, AppColors.deepGreen],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.dashboard_customize_outlined,
                  color: AppColors.sage,
                  size: 25,
                ),
                const SizedBox(height: 20),
                const Text(
                  'Welcome back,',
                  style: TextStyle(color: AppColors.sageLight, fontSize: 14),
                ),
                const SizedBox(height: 4),
                Text(
                  name,
                  style: const TextStyle(
                    color: AppColors.canvas,
                    fontSize: 24,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Choose a workspace to continue.',
                  style: TextStyle(color: AppColors.sageLight, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Workspaces',
            style: TextStyle(
              color: AppColors.forest,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.sageLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.inventory_2_outlined,
                  color: AppColors.forest,
                ),
              ),
              title: const Text('Products & inventory'),
              subtitle: const Text('Manage products, stock, and alerts'),
              trailing: const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 16,
                color: AppColors.secondary,
              ),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => OwnerDashboard(user: user)),
              ),
            ),
          ),
          Card(
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              leading: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.sageLight,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.point_of_sale_outlined,
                  color: AppColors.forest,
                ),
              ),
              title: const Text('Sales & POS'),
              subtitle: const Text('Create sales and view transactions'),
              trailing: const Icon(
                Icons.arrow_forward_ios_rounded,
                size: 16,
                color: AppColors.secondary,
              ),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => CashierDashboard(user: user)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CashierDashboard extends StatefulWidget {
  final Map<String, dynamic> user;

  const CashierDashboard({super.key, required this.user});

  @override
  State<CashierDashboard> createState() => _CashierDashboardState();
}

class _CashierDashboardState extends State<CashierDashboard> {
  int _selectedIndex = 0;
  int _dashboardRefreshToken = 0;
  bool _isLoggingOut = false;

  final List<Map<String, dynamic>> _cart = [];
  final SalesService _salesService = SalesService();
  Timer? _sharedCartTimer;

  void _navigateTo(int index) {
    setState(() {
      _selectedIndex = index;
      if (index == 0) _dashboardRefreshToken++;
    });
  }

  @override
  void initState() {
    super.initState();
    _refreshSharedCart(reportError: true);
    _sharedCartTimer = Timer.periodic(
      const Duration(seconds: 2),
      (_) => _refreshSharedCart(),
    );
  }

  @override
  void dispose() {
    _sharedCartTimer?.cancel();
    _salesService.dispose();
    super.dispose();
  }

  Future<void> _refreshSharedCart({bool reportError = false}) async {
    final result = await _salesService.getSharedCart();
    if (!mounted) return;
    if (result['success'] == true) {
      final items = List<Map<String, dynamic>>.from(result['items'] ?? []);
      final nextCart = items.map((item) {
        return {
          ...item,
          'quantity': int.tryParse(item['quantity']?.toString() ?? '') ?? 0,
          'selling_price':
              double.tryParse(item['selling_price']?.toString() ?? '') ?? 0.0,
          'selected_batch_id': item['selected_batch_id'],
          'batch_override_reason': item['batch_override_reason'] ?? '',
        };
      }).toList();
      final unchanged =
          _cart.length == nextCart.length &&
          List.generate(_cart.length, (index) {
            return _cart[index]['product_id'] ==
                    nextCart[index]['product_id'] &&
                _cart[index]['quantity'] == nextCart[index]['quantity'] &&
                _cart[index]['selected_batch_id'] ==
                    nextCart[index]['selected_batch_id'] &&
                _cart[index]['batch_override_reason'] ==
                    nextCart[index]['batch_override_reason'];
          }).every((same) => same);
      if (!unchanged) {
        setState(() {
          _cart
            ..clear()
            ..addAll(nextCart);
        });
      }
    } else if (reportError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Unable to load shared cart.'),
        ),
      );
    }
  }

  Future<void> _logout() async {
    setState(() => _isLoggingOut = true);

    final authService = AuthService();

    try {
      await authService.logout();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to contact the server.')),
        );
      }
    } finally {
      authService.dispose();
    }

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Future<void> _checkout() async {
    if (_cart.isEmpty) return;

    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => PaymentScreen(
          cart: _cart.map((item) => Map<String, dynamic>.from(item)).toList(),
          totalAmount: _totalAmount,
        ),
      ),
    );

    if (!mounted) return;

    if (result == true) {
      setState(() {
        _cart.clear();
        _selectedIndex = 1;
        _dashboardRefreshToken++;
      });
      await _refreshSharedCart();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Sale completed successfully.'),
          backgroundColor: primaryColor,
        ),
      );
    }
  }

  Future<String> _addToCart(Map<String, dynamic> product) async {
    final productId =
        int.tryParse(product['product_id']?.toString() ?? '') ?? 0;

    if (productId <= 0) {
      return 'Invalid product.';
    }

    final result = await _salesService.addSharedCartItem(productId);
    if (result['success'] != true) {
      return result['message']?.toString() ?? 'Unable to add product to cart.';
    }
    await _refreshSharedCart();
    return '${product['product_name'] ?? 'Product'} added to shared cart.';
  }

  Future<void> _updateQuantity(int index, int change) async {
    if (index < 0 || index >= _cart.length) return;
    final item = Map<String, dynamic>.from(_cart[index]);
    final productId = int.tryParse(item['product_id']?.toString() ?? '') ?? 0;
    final quantity =
        (int.tryParse(item['quantity']?.toString() ?? '0') ?? 0) + change;
    final result = quantity <= 0
        ? await _salesService.removeSharedCartItem(productId)
        : await _salesService.updateSharedCartItem(
            productId: productId,
            quantity: quantity,
            selectedBatchId: int.tryParse(
              item['selected_batch_id']?.toString() ?? '',
            ),
            batchOverrideReason:
                item['batch_override_reason']?.toString() ?? '',
          );
    if (!mounted) return;
    if (result['success'] == true) {
      await _refreshSharedCart();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Unable to update cart.')),
      );
    }
  }

  Future<void> _clearCart() async {
    final result = await _salesService.clearSharedCart();
    if (!mounted) return;
    if (result['success'] == true) {
      setState(_cart.clear);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Unable to clear cart.')),
      );
    }
  }

  double get _totalAmount {
    return _cart.fold(
      0.0,
      (total, item) =>
          total + (item['selling_price'] as double) * (item['quantity'] as int),
    );
  }

  int get _cartItemCount {
    return _cart.fold(0, (total, item) => total + (item['quantity'] as int));
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardHome(
        key: ValueKey(_dashboardRefreshToken),
        user: widget.user,
        onNavigate: _navigateTo,
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
                      color: AppColors.forest,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.logout),
          ),
        ],
      ),
      body: IndexedStack(index: _selectedIndex, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: _navigateTo,
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

class DashboardHome extends StatefulWidget {
  final Map<String, dynamic> user;
  final ValueChanged<int> onNavigate;
  final Future<Map<String, dynamic>> Function()? salesLoader;

  const DashboardHome({
    super.key,
    required this.user,
    required this.onNavigate,
    this.salesLoader,
  });

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome> {
  final SalesService _salesService = SalesService();

  bool _isLoading = true;
  String? _errorMessage;
  SalesOverviewSummary? _summary;

  @override
  void initState() {
    super.initState();
    _loadOverview();
  }

  Future<void> _loadOverview() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = widget.salesLoader == null
        ? await _salesService.getSales()
        : await widget.salesLoader!();

    if (!mounted) return;

    if (result['success'] == true) {
      final sales = List<Map<String, dynamic>>.from(result['sales'] ?? []);
      setState(() {
        _summary = SalesOverviewSummary.forDate(sales, DateTime.now());
        _isLoading = false;
        _errorMessage = null;
      });
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage =
            result['message']?.toString() ?? 'Unable to load sales overview.';
      });
    }
  }

  @override
  void dispose() {
    _salesService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fullName = widget.user['full_name'] ?? 'Cashier';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.forest, AppColors.deepGreen],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x26314C3B),
                  blurRadius: 22,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: const Color(0x22F7F3EA),
                        borderRadius: BorderRadius.circular(13),
                      ),
                      child: const Icon(
                        Icons.point_of_sale_rounded,
                        color: AppColors.canvas,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 11),
                    const Expanded(
                      child: Text(
                        'CASHIER WORKSPACE',
                        style: TextStyle(
                          color: AppColors.sageLight,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.storefront_outlined,
                      color: AppColors.sage,
                      size: 21,
                    ),
                  ],
                ),
                const SizedBox(height: 23),
                const Text(
                  'Welcome back,',
                  style: TextStyle(
                    color: AppColors.sageLight,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  fullName.toString(),
                  style: const TextStyle(
                    color: AppColors.canvas,
                    fontSize: 26,
                    height: 1.15,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Ready to serve your customers?',
                  style: TextStyle(color: AppColors.sageLight, fontSize: 14),
                ),
              ],
            ),
          ),
          const SizedBox(height: 26),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Sales overview',
                  style: TextStyle(
                    color: AppColors.forest,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.sageLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'TODAY',
                  style: TextStyle(
                    color: AppColors.forest,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.7,
                  ),
                ),
              ),
              IconButton(
                onPressed: _isLoading ? null : _loadOverview,
                tooltip: 'Refresh sales overview',
                icon: _isLoading
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: AppColors.secondary,
                        ),
                      )
                    : const Icon(
                        Icons.refresh_rounded,
                        color: AppColors.secondary,
                      ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OverviewCard(
                  title: "Today's sales",
                  value: _isLoading
                      ? '...'
                      : _summary == null
                      ? '--'
                      : '₱${_summary!.totalSales.toStringAsFixed(2)}',
                  icon: Icons.payments_outlined,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OverviewCard(
                  title: 'Transactions',
                  value: _isLoading
                      ? '...'
                      : _summary?.transactionCount.toString() ?? '--',
                  icon: Icons.receipt_long_outlined,
                ),
              ),
            ],
          ),
          if (_errorMessage != null) const SizedBox(height: 8),
          if (_errorMessage != null)
            Text(
              'Unable to load sales overview: $_errorMessage',
              style: const TextStyle(color: AppColors.error, fontSize: 12),
            ),
          const SizedBox(height: 26),
          const Text(
            'Quick actions',
            style: TextStyle(
              color: AppColors.forest,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          ActionCard(
            title: 'Create New Sale',
            subtitle: 'Scan or search for items',
            icon: Icons.add_shopping_cart_rounded,
            onTap: () => widget.onNavigate(1),
          ),
          ActionCard(
            title: 'View Shopping Cart',
            subtitle: 'Review items and checkout',
            icon: Icons.shopping_cart_outlined,
            onTap: () => widget.onNavigate(2),
          ),
          ActionCard(
            title: 'Transaction History',
            subtitle: 'Review completed sales',
            icon: Icons.receipt_long_outlined,
            onTap: () => widget.onNavigate(3),
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
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.sageLight,
                borderRadius: BorderRadius.circular(13),
              ),
              child: Icon(icon, color: AppColors.forest, size: 22),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  value,
                  style: const TextStyle(
                    color: AppColors.forest,
                    fontSize: 25,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 5),
            Text(
              title,
              style: const TextStyle(
                color: AppColors.muted,
                fontSize: 12,
                fontWeight: FontWeight.w500,
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
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
        leading: Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: AppColors.sageLight,
            borderRadius: BorderRadius.circular(15),
          ),
          child: Icon(icon, color: AppColors.forest, size: 22),
        ),
        title: Text(
          title,
          style: const TextStyle(
            color: AppColors.ink,
            fontWeight: FontWeight.w700,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(color: AppColors.muted, fontSize: 12),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios_rounded,
          color: AppColors.secondary,
          size: 16,
        ),
        onTap: onTap,
      ),
    );
  }
}

class NewSaleScreen extends StatefulWidget {
  final Future<String> Function(Map<String, dynamic> product) onAddToCart;

  const NewSaleScreen({super.key, required this.onAddToCart});

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
        _products = List<Map<String, dynamic>>.from(result['products']);
      } else {
        _errorMessage = result['message'];
      }
    });
  }

  Future<void> _scanBarcode() async {
    if (_isScanning) return;

    setState(() => _isScanning = true);

    try {
      await Navigator.push<void>(
        context,
        MaterialPageRoute(
          builder: (_) => ScannerScreen(onBarcode: _handleScannedBarcode),
        ),
      );
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Unable to scan barcode. Please try again.'),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) {
        setState(() => _isScanning = false);
      }
    }
  }

  Future<String> _handleScannedBarcode(String barcode) async {
    final match = _products.where((product) {
      return (product['barcode']?.toString().trim() ?? '') == barcode.trim();
    });
    if (match.isEmpty) return 'Product not found. Barcode: $barcode';
    return widget.onAddToCart(match.first);
  }

  List<Map<String, dynamic>> get _filteredProducts {
    final query = _searchQuery.trim().toLowerCase();

    if (query.isEmpty) return _products;

    return _products.where((product) {
      final name = (product['product_name'] ?? '').toString().toLowerCase();
      final barcode = (product['barcode'] ?? '').toString().toLowerCase();
      final brand = (product['brand'] ?? '').toString().toLowerCase();

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
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: AppColors.sageLight,
                        borderRadius: BorderRadius.circular(13),
                      ),
                      child: const Icon(
                        Icons.inventory_2_outlined,
                        color: AppColors.forest,
                        size: 21,
                      ),
                    ),
                    const SizedBox(width: 11),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Find products',
                            style: TextStyle(
                              color: AppColors.forest,
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          SizedBox(height: 3),
                          Text(
                            'Search or scan an item',
                            style: TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: _isLoading ? null : _loadProducts,
                      tooltip: 'Refresh products',
                      icon: const Icon(Icons.refresh_rounded),
                    ),
                  ],
                ),
                const SizedBox(height: 13),
                TextField(
                  controller: _searchController,
                  textInputAction: TextInputAction.search,
                  onChanged: (value) {
                    setState(() {
                      _searchQuery = value;
                    });
                  },
                  decoration: InputDecoration(
                    hintText: 'Product name or barcode',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _searchQuery.isEmpty
                        ? null
                        : IconButton(
                            onPressed: () {
                              _searchController.clear();
                              setState(() {
                                _searchQuery = '';
                              });
                            },
                            tooltip: 'Clear search',
                            icon: const Icon(Icons.close_rounded),
                          ),
                  ),
                ),
                const SizedBox(height: 11),
                SizedBox(
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: _isScanning ? null : _scanBarcode,
                    icon: const Icon(Icons.qr_code_scanner_rounded, size: 19),
                    label: const Text('Scan barcode'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forest,
                      foregroundColor: AppColors.canvas,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 8, 18, 6),
          child: Row(
            children: [
              const Expanded(
                child: Text(
                  'Available products',
                  style: TextStyle(
                    color: AppColors.forest,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: AppColors.sageLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  '${filteredProducts.length}',
                  style: const TextStyle(
                    color: AppColors.forest,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: primaryColor),
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
                          color: AppColors.secondary,
                        ),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center),
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
                    style: const TextStyle(color: AppColors.muted),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadProducts,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                    itemCount: filteredProducts.length,
                    itemBuilder: (context, index) {
                      final product = filteredProducts[index];
                      final metadata = <String>[
                        product['brand']?.toString() ?? '',
                        product['barcode']?.toString() ?? '',
                      ].where((value) => value.isNotEmpty).join(' · ');

                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 7,
                          ),
                          leading: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: AppColors.sageLight,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(
                              Icons.inventory_2_outlined,
                              color: AppColors.forest,
                              size: 21,
                            ),
                          ),
                          title: Text(
                            product['product_name']?.toString() ??
                                'Unnamed Product',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              color: AppColors.forest,
                            ),
                          ),
                          subtitle: Text(
                            metadata.isEmpty ? 'Product' : metadata,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              color: AppColors.muted,
                              fontSize: 12,
                            ),
                          ),
                          trailing: SizedBox(
                            width: 82,
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  _formatPrice(product['selling_price']),
                                  style: const TextStyle(
                                    color: AppColors.forest,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                  ),
                                ),
                                IconButton.filledTonal(
                                  visualDensity: VisualDensity.compact,
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints.tightFor(
                                    width: 34,
                                    height: 34,
                                  ),
                                  tooltip: 'Add to cart',
                                  icon: const Icon(Icons.add_rounded, size: 19),
                                  onPressed: () async {
                                    final message = await widget.onAddToCart(
                                      product,
                                    );
                                    if (!mounted) return;
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(message)),
                                    );
                                  },
                                ),
                              ],
                            ),
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
    final totalUnits = cart.fold<int>(
      0,
      (total, item) => total + (item['quantity'] as int),
    );

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(18, 18, 18, 12),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Your cart',
                      style: TextStyle(
                        color: AppColors.forest,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Review your items before checkout',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              if (cart.isNotEmpty)
                TextButton.icon(
                  onPressed: onClearCart,
                  icon: const Icon(Icons.delete_outline_rounded, size: 18),
                  label: const Text('Clear'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.secondary,
                  ),
                ),
            ],
          ),
        ),
        Expanded(
          child: cart.isEmpty
              ? const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 34,
                          backgroundColor: AppColors.sageLight,
                          child: Icon(
                            Icons.shopping_bag_outlined,
                            size: 32,
                            color: AppColors.forest,
                          ),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Your cart is empty',
                          style: TextStyle(
                            color: AppColors.forest,
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(height: 6),
                        Text(
                          'Add products from New Sale to get started.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: AppColors.muted),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 2, 16, 16),
                  itemCount: cart.length,
                  itemBuilder: (context, index) {
                    final item = cart[index];
                    final price = item['selling_price'] as double;
                    final quantity = item['quantity'] as int;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 10),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.sageLight,
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: const Icon(
                                    Icons.shopping_bag_outlined,
                                    color: AppColors.forest,
                                    size: 21,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item['product_name'].toString(),
                                        maxLines: 2,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          color: AppColors.forest,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '₱${price.toStringAsFixed(2)} each',
                                        style: const TextStyle(
                                          color: AppColors.muted,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '₱${(price * quantity).toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: AppColors.forest,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                            const Divider(height: 24),
                            Row(
                              children: [
                                Text(
                                  '$quantity ${quantity == 1 ? 'item' : 'items'}',
                                  style: const TextStyle(
                                    color: AppColors.muted,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const Spacer(),
                                IconButton.filledTonal(
                                  visualDensity: VisualDensity.compact,
                                  constraints: const BoxConstraints.tightFor(
                                    width: 36,
                                    height: 36,
                                  ),
                                  onPressed: () => onUpdateQuantity(index, -1),
                                  tooltip: 'Decrease quantity',
                                  icon: const Icon(Icons.remove_rounded),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                  ),
                                  child: Text(
                                    '$quantity',
                                    style: const TextStyle(
                                      color: AppColors.forest,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                IconButton.filledTonal(
                                  visualDensity: VisualDensity.compact,
                                  constraints: const BoxConstraints.tightFor(
                                    width: 36,
                                    height: 36,
                                  ),
                                  onPressed: () => onUpdateQuantity(index, 1),
                                  tooltip: 'Increase quantity',
                                  icon: const Icon(Icons.add_rounded),
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
          margin: const EdgeInsets.fromLTRB(14, 8, 14, 12),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Order total',
                      style: TextStyle(
                        color: AppColors.forest,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Text(
                    '₱${totalAmount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: AppColors.forest,
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 5),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '$totalUnits ${totalUnits == 1 ? 'item' : 'items'}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ),
              const SizedBox(height: 15),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: cart.isEmpty ? null : onCheckout,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forest,
                    foregroundColor: AppColors.canvas,
                  ),
                  child: const Text(
                    'Continue to checkout',
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

  const ProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final fullName = user['full_name']?.toString() ?? 'Cashier';
    final role = user['role']?.toString() ?? 'cashier';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 24),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(22, 24, 22, 22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.forest, AppColors.deepGreen],
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x26314C3B),
                  blurRadius: 22,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 76,
                  height: 76,
                  decoration: BoxDecoration(
                    color: AppColors.sageLight,
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(
                      color: const Color(0x66F7F3EA),
                      width: 2,
                    ),
                  ),
                  child: const Icon(
                    Icons.person_rounded,
                    color: AppColors.forest,
                    size: 42,
                  ),
                ),
                const SizedBox(height: 14),
                Text(
                  fullName,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.canvas,
                    fontSize: 21,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 9),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0x22F7F3EA),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0x33F7F3EA)),
                  ),
                  child: Text(
                    role.toUpperCase(),
                    style: const TextStyle(
                      color: AppColors.sageLight,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.9,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Card(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Padding(
                  padding: EdgeInsets.fromLTRB(18, 18, 18, 10),
                  child: Text(
                    'Account details',
                    style: TextStyle(
                      color: AppColors.forest,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                ProfileInfo(
                  label: 'Username',
                  value: user['username']?.toString() ?? '',
                ),
                const Divider(height: 1, indent: 18, endIndent: 18),
                ProfileInfo(label: 'Role', value: role),
                const Divider(height: 1, indent: 18, endIndent: 18),
                ProfileInfo(
                  label: 'Account status',
                  value: user['status']?.toString() ?? 'active',
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileInfo extends StatelessWidget {
  final String label;
  final String value;

  const ProfileInfo({super.key, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 3),
      title: Text(
        label,
        style: const TextStyle(color: AppColors.muted, fontSize: 12),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          color: AppColors.forest,
          fontWeight: FontWeight.w700,
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
              backgroundColor: AppColors.sageLight,
              child: Icon(icon, size: 48, color: AppColors.forest),
            ),
            const SizedBox(height: 22),
            Text(
              title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(
              description,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.muted, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

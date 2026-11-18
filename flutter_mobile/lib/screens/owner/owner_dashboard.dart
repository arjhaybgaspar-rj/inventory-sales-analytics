import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../services/product_service.dart';
import '../../services/owner_inventory_service.dart';
import '../../theme/app_theme.dart';
import '../scanner_screen.dart';

const Color ownerPrimaryColor = AppColors.primary;
const Color ownerBackgroundColor = AppColors.canvas;

class OwnerDashboard extends StatefulWidget {
  final Map<String, dynamic> user;

  const OwnerDashboard({super.key, required this.user});

  @override
  State<OwnerDashboard> createState() => _OwnerDashboardState();
}

class _OwnerDashboardState extends State<OwnerDashboard> {
  int _selectedIndex = 0;
  bool _isLoggingOut = false;

  Future<void> _logout() async {
    setState(() => _isLoggingOut = true);

    final service = AuthService();

    try {
      await service.logout();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to contact the server.')),
        );
      }
    } finally {
      service.dispose();
    }

    if (!mounted) return;

    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const _OwnerLoginRedirect()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final roleLabel = widget.user['role']?.toString().toLowerCase() == 'manager'
        ? 'Manager'
        : 'Owner';
    final pages = [
      OwnerHomeScreen(
        user: widget.user,
        onNavigate: (index) => setState(() => _selectedIndex = index),
      ),
      const OwnerProductScreen(),
      const OwnerInventoryScreen(),
      const OwnerAlertsScreen(),
      const OwnerMovementsScreen(),
      OwnerProfileScreen(user: widget.user),
    ];

    const titles = [
      'Dashboard',
      'Product Registration',
      'Inventory',
      'Inventory Alerts',
      'Inventory Movements',
      'My Profile',
    ];
    final pageTitle = _selectedIndex == 0
        ? '$roleLabel ${titles[_selectedIndex]}'
        : titles[_selectedIndex];

    return Scaffold(
      backgroundColor: ownerBackgroundColor,
      appBar: AppBar(
        title: Text(pageTitle),
        actions: [
          IconButton(
            onPressed: _isLoggingOut ? null : _logout,
            tooltip: 'Logout',
            icon: _isLoggingOut
                ? const SizedBox(
                    height: 20,
                    width: 20,
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
        onDestinationSelected: (index) {
          setState(() => _selectedIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.qr_code_scanner),
            label: 'Products',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            label: 'Inventory',
          ),
          NavigationDestination(
            icon: Icon(Icons.notifications_active_outlined),
            label: 'Alerts',
          ),
          NavigationDestination(
            icon: Icon(Icons.swap_horiz),
            label: 'Movements',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _OwnerLoginRedirect extends StatelessWidget {
  const _OwnerLoginRedirect();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Please log in again.')));
  }
}

class OwnerHomeScreen extends StatelessWidget {
  final Map<String, dynamic> user;
  final ValueChanged<int> onNavigate;

  const OwnerHomeScreen({
    super.key,
    required this.user,
    required this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final roleLabel = user['role']?.toString().toLowerCase() == 'manager'
        ? 'Manager'
        : 'Owner';
    final name = user['full_name']?.toString() ?? roleLabel;

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
                        Icons.storefront_rounded,
                        color: AppColors.canvas,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: Text(
                        '$roleLabel WORKSPACE',
                        style: const TextStyle(
                          color: AppColors.sageLight,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                    ),
                    const Icon(
                      Icons.inventory_2_outlined,
                      color: AppColors.sage,
                      size: 21,
                    ),
                  ],
                ),
                const SizedBox(height: 22),
                const Text(
                  'Welcome back,',
                  style: TextStyle(color: AppColors.sageLight, fontSize: 14),
                ),
                const SizedBox(height: 6),
                Text(
                  name,
                  style: const TextStyle(
                    color: AppColors.canvas,
                    fontSize: 26,
                    fontWeight: FontWeight.w700,
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Your store operations at a glance.',
                  style: TextStyle(color: AppColors.sageLight, fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 26),
          const Text(
            'Inventory management',
            style: TextStyle(
              color: AppColors.forest,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          _OwnerActionCard(
            title: 'Register New Product',
            subtitle: 'Scan a barcode and add a product',
            icon: Icons.qr_code_scanner,
            onTap: () => onNavigate(1),
          ),
          _OwnerActionCard(
            title: 'View Inventory',
            subtitle: 'Check current product stock',
            icon: Icons.inventory_2_outlined,
            onTap: () => onNavigate(2),
          ),
          _OwnerActionCard(
            title: 'Inventory Alerts',
            subtitle: 'Check low stock and expiring products',
            icon: Icons.notifications_active_outlined,
            onTap: () => onNavigate(3),
          ),
          _OwnerActionCard(
            title: 'Inventory Movements',
            subtitle: 'Review stock movement history',
            icon: Icons.swap_horiz,
            onTap: () => onNavigate(4),
          ),
        ],
      ),
    );
  }
}

class _OwnerActionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _OwnerActionCard({
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

class OwnerProductScreen extends StatefulWidget {
  const OwnerProductScreen({super.key});

  @override
  State<OwnerProductScreen> createState() => _OwnerProductScreenState();
}

class _OwnerProductScreenState extends State<OwnerProductScreen> {
  final ProductService _service = ProductService();
  final TextEditingController _barcodeController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _brandController = TextEditingController();
  final TextEditingController _categoryController = TextEditingController();
  final TextEditingController _unitController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  bool _isLoading = false;
  bool _isSaving = false;
  bool _productReady = false;
  bool _loadingProducts = true;

  String? _apiSource;
  String? _imageUrl;
  String? _productsError;

  List<Map<String, dynamic>> _products = [];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    if (!mounted) return;

    setState(() {
      _loadingProducts = true;
      _productsError = null;
    });

    final result = await _service.getProducts();

    if (!mounted) return;

    setState(() {
      _loadingProducts = false;

      if (result['success'] == true) {
        _products = List<Map<String, dynamic>>.from(result['products'] ?? []);
      } else {
        _productsError =
            result['message']?.toString() ?? 'Unable to load products.';
      }
    });
  }

  List<Map<String, dynamic>> get _filteredProducts {
    final query = _searchController.text.trim().toLowerCase();

    if (query.isEmpty) return _products;

    return _products.where((product) {
      final name = product['product_name']?.toString().toLowerCase() ?? '';
      final barcode = product['barcode']?.toString().toLowerCase() ?? '';
      final brand = product['brand']?.toString().toLowerCase() ?? '';
      final category = product['category']?.toString().toLowerCase() ?? '';

      return name.contains(query) ||
          barcode.contains(query) ||
          brand.contains(query) ||
          category.contains(query);
    }).toList();
  }

  Future<void> _scanBarcode() async {
    final barcode = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const ScannerScreen()),
    );

    if (!mounted || barcode == null || barcode.isEmpty) return;

    _barcodeController.text = barcode;
    await _lookupBarcode();
  }

  Future<void> _lookupBarcode() async {
    final barcode = _barcodeController.text.trim();

    if (barcode.isEmpty) {
      _showMessage('Please enter or scan a barcode.');
      return;
    }

    setState(() {
      _isLoading = true;
      _productReady = false;
    });

    final result = await _service.lookupBarcode(barcode);

    if (!mounted) return;

    setState(() => _isLoading = false);

    if (result['success'] != true) {
      _showMessage(result['message'] ?? 'Barcode lookup failed.');
      return;
    }

    if (result['exists'] == true) {
      _clearProductFields();
      _showMessage('This product is already in your product list.');
      return;
    }

    if (result['found_in_api'] != true) {
      _clearProductFields();
      _showMessage(
        'Product information was not found for this barcode. Try another barcode.',
      );
      return;
    }

    final product = Map<String, dynamic>.from(result['product'] ?? {});

    _nameController.text = product['product_name']?.toString() ?? '';
    _brandController.text = product['brand']?.toString() ?? '';
    _categoryController.text = product['category']?.toString() ?? '';
    _unitController.text = product['unit']?.toString() ?? '';
    _priceController.clear();

    _apiSource = product['api_source']?.toString();
    _imageUrl = product['image_url']?.toString();

    setState(() => _productReady = true);
    _showMessage('Product found. Enter its selling price.');
  }

  void _clearProductFields() {
    _nameController.clear();
    _brandController.clear();
    _categoryController.clear();
    _unitController.clear();
    _priceController.clear();
    _apiSource = null;
    _imageUrl = null;
    _productReady = false;
  }

  Future<void> _saveProduct() async {
    if (_barcodeController.text.trim().isEmpty ||
        _nameController.text.trim().isEmpty ||
        _priceController.text.trim().isEmpty) {
      _showMessage('Barcode, product name, and selling price are required.');
      return;
    }

    final price = double.tryParse(_priceController.text.trim());

    if (price == null || price <= 0) {
      _showMessage('Enter a valid selling price greater than zero.');
      return;
    }

    setState(() => _isSaving = true);

    final result = await _service.addProduct(
      barcode: _barcodeController.text.trim(),
      productName: _nameController.text.trim(),
      brand: _brandController.text.trim(),
      category: _categoryController.text.trim(),
      unit: _unitController.text.trim(),
      sellingPrice: price,
      imageUrl: _imageUrl,
      apiSource: _apiSource,
    );

    if (!mounted) return;

    setState(() => _isSaving = false);

    if (result['success'] == true) {
      _barcodeController.clear();
      _clearProductFields();
      _showMessage('Product registered successfully.');
      await _loadProducts();
    } else {
      _showMessage(result['message'] ?? 'Unable to register product.');
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  Widget _field(
    String label,
    TextEditingController controller, {
    TextInputType keyboardType = TextInputType.text,
    bool readOnly = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextField(
        controller: controller,
        keyboardType: keyboardType,
        readOnly: readOnly,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          filled: true,
          fillColor: AppColors.white,
        ),
      ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> product) {
    final name = product['product_name']?.toString() ?? 'Unnamed Product';
    final barcode = product['barcode']?.toString() ?? 'N/A';
    final brand = product['brand']?.toString() ?? '';
    final category = product['category']?.toString() ?? '';
    final unit = product['unit']?.toString() ?? '';
    final price = product['selling_price']?.toString() ?? '0.00';
    final imageUrl = product['image_url']?.toString();

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(18),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: 82,
                height: 90,
                color: AppColors.sageLight,
                child: imageUrl != null && imageUrl.isNotEmpty
                    ? Image.network(
                        imageUrl,
                        fit: BoxFit.contain,
                        errorBuilder: (context, error, stackTrace) {
                          return const Icon(
                            Icons.inventory_2_outlined,
                            color: ownerPrimaryColor,
                            size: 38,
                          );
                        },
                      )
                    : const Icon(
                        Icons.inventory_2_outlined,
                        color: ownerPrimaryColor,
                        size: 38,
                      ),
              ),
            ),
            const SizedBox(width: 13),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                    ),
                  ),
                  if (brand.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      brand,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                  const SizedBox(height: 5),
                  Text(
                    'Barcode: $barcode',
                    style: const TextStyle(
                      color: AppColors.muted,
                      fontSize: 11,
                    ),
                  ),
                  if (category.isNotEmpty)
                    Text(
                      category,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                      ),
                    ),
                  if (unit.isNotEmpty)
                    Text(
                      unit,
                      style: const TextStyle(
                        color: AppColors.muted,
                        fontSize: 11,
                      ),
                    ),
                  const SizedBox(height: 7),
                  Text(
                    '₱$price',
                    style: const TextStyle(
                      color: ownerPrimaryColor,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductList() {
    if (_loadingProducts) {
      return const Padding(
        padding: EdgeInsets.all(35),
        child: Center(child: CircularProgressIndicator()),
      );
    }

    if (_productsError != null) {
      return Column(
        children: [
          const Icon(
            Icons.cloud_off_outlined,
            size: 42,
            color: AppColors.secondary,
          ),
          const SizedBox(height: 8),
          Text(_productsError!, textAlign: TextAlign.center),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: _loadProducts,
            icon: const Icon(Icons.refresh),
            label: const Text('Retry'),
          ),
        ],
      );
    }

    final products = _filteredProducts;

    if (products.isEmpty) {
      return Padding(
        padding: const EdgeInsets.all(30),
        child: Center(
          child: Column(
            children: [
              const Icon(
                Icons.inventory_2_outlined,
                size: 48,
                color: AppColors.secondary,
              ),
              const SizedBox(height: 10),
              Text(
                _products.isEmpty
                    ? 'No registered products yet.'
                    : 'No products match your search.',
                style: const TextStyle(color: AppColors.muted),
              ),
            ],
          ),
        ),
      );
    }

    return Column(children: products.map(_buildProductCard).toList());
  }

  @override
  void dispose() {
    _barcodeController.dispose();
    _nameController.dispose();
    _brandController.dispose();
    _categoryController.dispose();
    _unitController.dispose();
    _priceController.dispose();
    _searchController.dispose();
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadProducts,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(
                        Icons.qr_code_scanner,
                        color: AppColors.forest,
                        size: 25,
                      ),
                      SizedBox(width: 9),
                      Text(
                        'Add New Product',
                        style: TextStyle(
                          color: AppColors.forest,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Scan a barcode or enter it manually to register a product.',
                    style: TextStyle(color: AppColors.muted),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _barcodeController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            labelText: 'Product Barcode',
                            prefixIcon: Icon(Icons.qr_code),
                            border: OutlineInputBorder(),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _isLoading ? null : _scanBarcode,
                        icon: const Icon(Icons.qr_code_scanner),
                        style: IconButton.styleFrom(
                          backgroundColor: ownerPrimaryColor,
                          foregroundColor: AppColors.canvas,
                          minimumSize: const Size(52, 52),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _lookupBarcode,
                    icon: _isLoading
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.white,
                            ),
                          )
                        : const Icon(Icons.search),
                    label: const Text('Look up barcode'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: ownerPrimaryColor,
                      foregroundColor: AppColors.canvas,
                      minimumSize: const Size.fromHeight(48),
                    ),
                  ),
                ],
              ),
            ),
            if (_productReady) ...[
              const SizedBox(height: 16),
              Card(
                color: AppColors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'Product Details',
                        style: TextStyle(
                          color: AppColors.forest,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      if (_imageUrl != null && _imageUrl!.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        Center(
                          child: Image.network(
                            _imageUrl!,
                            height: 120,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.inventory_2_outlined,
                                size: 65,
                                color: AppColors.secondary,
                              );
                            },
                          ),
                        ),
                      ],
                      const SizedBox(height: 14),
                      _field('Product Name', _nameController, readOnly: true),
                      _field('Brand', _brandController, readOnly: true),
                      _field('Category', _categoryController, readOnly: true),
                      _field('Unit / Size', _unitController, readOnly: true),
                      _field(
                        'Selling Price (₱)',
                        _priceController,
                        keyboardType: const TextInputType.numberWithOptions(
                          decimal: true,
                        ),
                      ),
                      if (_apiSource != null && _apiSource!.isNotEmpty)
                        Text(
                          'Source: $_apiSource',
                          style: const TextStyle(color: AppColors.muted),
                        ),
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: _isSaving ? null : _saveProduct,
                        icon: _isSaving
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(
                                  color: AppColors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.save),
                        label: const Text('Save product'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: ownerPrimaryColor,
                          foregroundColor: AppColors.canvas,
                          minimumSize: const Size.fromHeight(48),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
            const SizedBox(height: 25),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Registered Products',
                  style: TextStyle(
                    color: AppColors.forest,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.sageLight,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_products.length} Products',
                    style: const TextStyle(
                      color: AppColors.forest,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search product name, barcode, brand...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isEmpty
                    ? null
                    : IconButton(
                        onPressed: () {
                          _searchController.clear();
                          setState(() {});
                        },
                        icon: const Icon(Icons.close),
                      ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: AppColors.white,
              ),
            ),
            const SizedBox(height: 14),
            _buildProductList(),
            const SizedBox(height: 25),
          ],
        ),
      ),
    );
  }
}

class OwnerInventoryScreen extends StatefulWidget {
  const OwnerInventoryScreen({super.key});

  @override
  State<OwnerInventoryScreen> createState() => _OwnerInventoryScreenState();
}

class _OwnerInventoryScreenState extends State<OwnerInventoryScreen> {
  final OwnerInventoryService _service = OwnerInventoryService();

  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _inventory = [];

  @override
  void initState() {
    super.initState();
    _loadInventory();
  }

  Future<void> _loadInventory() async {
    if (!mounted) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    final result = await _service.getInventory();

    if (!mounted) return;

    setState(() {
      _loading = false;

      if (result['success'] == true) {
        _inventory = List<Map<String, dynamic>>.from(result['inventory'] ?? []);
      } else {
        _error = result['message']?.toString() ?? 'Unable to load inventory.';
      }
    });
  }

  Future<void> _openStockIn(Map<String, dynamic> product) async {
    final productId = int.tryParse(product['product_id'].toString());

    if (productId == null) return;

    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => OwnerStockInScreen(
          productId: productId,
          productName: product['product_name']?.toString() ?? 'Product',
        ),
      ),
    );

    if (result == true) {
      await _loadInventory();
    }
  }

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return _ErrorView(message: _error!, onRetry: _loadInventory);
    }

    return RefreshIndicator(
      onRefresh: _loadInventory,
      child: _inventory.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(24),
              children: const [
                SizedBox(height: 120),
                Icon(
                  Icons.inventory_2_outlined,
                  size: 48,
                  color: AppColors.secondary,
                ),
                SizedBox(height: 14),
                Center(
                  child: Text(
                    'No inventory records found.',
                    style: TextStyle(color: AppColors.muted),
                  ),
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              itemCount: _inventory.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: Row(
                      children: [
                        const Expanded(
                          child: Text(
                            'Inventory overview',
                            style: TextStyle(
                              color: AppColors.forest,
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 7,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.sageLight,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '${_inventory.length} items',
                            style: const TextStyle(
                              color: AppColors.forest,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final item = _inventory[index - 1];

                final name = item['product_name']?.toString() ?? 'Product';
                final quantity = item['quantity']?.toString() ?? '0';
                final unit = item['unit']?.toString() ?? '';
                final batch = item['batch_number']?.toString() ?? 'N/A';
                final expiry = item['expiry_date']?.toString() ?? 'N/A';
                final reorderLevel =
                    int.tryParse(item['reorder_level']?.toString() ?? '') ?? 0;
                final currentQuantity = int.tryParse(quantity) ?? 0;

                final isLow = currentQuantity <= reorderLevel;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                    side: const BorderSide(color: AppColors.border),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const CircleAvatar(
                              backgroundColor: AppColors.sageLight,
                              child: Icon(
                                Icons.inventory_2_outlined,
                                color: AppColors.forest,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                name,
                                style: const TextStyle(
                                  color: AppColors.forest,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 9,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                color: isLow
                                    ? AppColors.cream
                                    : AppColors.sageLight,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                isLow ? 'Low Stock' : 'In Stock',
                                style: TextStyle(
                                  color: isLow
                                      ? AppColors.error
                                      : AppColors.forest,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          '$quantity $unit in stock',
                          style: const TextStyle(
                            color: AppColors.forest,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _InventoryDetail(label: 'Batch', value: batch),
                            _InventoryDetail(label: 'Expiry', value: expiry),
                            _InventoryDetail(
                              label: 'Reorder at',
                              value: '$reorderLevel',
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: () => _openStockIn(item),
                            icon: const Icon(Icons.add_box_outlined),
                            label: const Text('Stock in'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.forest,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class OwnerStockInScreen extends StatefulWidget {
  final int productId;
  final String productName;

  const OwnerStockInScreen({
    super.key,
    required this.productId,
    required this.productName,
  });

  @override
  State<OwnerStockInScreen> createState() => _OwnerStockInScreenState();
}

class _OwnerStockInScreenState extends State<OwnerStockInScreen> {
  final OwnerInventoryService _service = OwnerInventoryService();
  final _formKey = GlobalKey<FormState>();

  final _batchController = TextEditingController();
  final _quantityController = TextEditingController();
  final _costController = TextEditingController();
  final _reorderController = TextEditingController(text: '10');

  DateTime _receivedDate = DateTime.now();
  DateTime? _expiryDate;
  bool _saving = false;

  String _date(DateTime value) {
    return '${value.year.toString().padLeft(4, '0')}-'
        '${value.month.toString().padLeft(2, '0')}-'
        '${value.day.toString().padLeft(2, '0')}';
  }

  Future<void> _pickDate({required bool expiry}) async {
    final selected = await showDatePicker(
      context: context,
      initialDate: expiry ? (_expiryDate ?? DateTime.now()) : _receivedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );

    if (selected == null) return;

    setState(() {
      if (expiry) {
        _expiryDate = selected;
      } else {
        _receivedDate = selected;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    final result = await _service.stockIn(
      productId: widget.productId,
      batchNumber: _batchController.text.trim(),
      quantity: int.parse(_quantityController.text.trim()),
      acquisitionCost: double.parse(_costController.text.trim()),
      expiryDate: _expiryDate == null ? null : _date(_expiryDate!),
      receivedDate: _date(_receivedDate),
      reorderLevel: int.parse(_reorderController.text.trim()),
    );

    if (!mounted) return;

    setState(() => _saving = false);

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Stock-in completed successfully.')),
      );
      Navigator.pop(context, true);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'Stock-in failed.')),
      );
    }
  }

  Widget _input(
    String label,
    TextEditingController controller, {
    bool decimal = false,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        keyboardType: TextInputType.numberWithOptions(decimal: decimal),
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: AppColors.border),
          ),
          filled: true,
          fillColor: AppColors.white,
        ),
        validator: (value) {
          if (value == null || value.trim().isEmpty) {
            return 'This field is required.';
          }

          final parsed = decimal ? double.tryParse(value) : int.tryParse(value);

          if (parsed == null || parsed <= 0) {
            return 'Enter a valid value greater than zero.';
          }

          return null;
        },
      ),
    );
  }

  @override
  void dispose() {
    _batchController.dispose();
    _quantityController.dispose();
    _costController.dispose();
    _reorderController.dispose();
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Stock In')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text(
              widget.productName,
              style: const TextStyle(
                color: AppColors.forest,
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 20),
            _input('Batch Number', _batchController),
            _input('Quantity', _quantityController),
            _input('Acquisition Cost (₱)', _costController, decimal: true),
            _input('Reorder Level', _reorderController),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.border),
              ),
              child: ListTile(
                title: const Text('Received Date'),
                subtitle: Text(_date(_receivedDate)),
                trailing: const Icon(
                  Icons.calendar_month_outlined,
                  color: AppColors.secondary,
                ),
                onTap: () => _pickDate(expiry: false),
              ),
            ),
            const SizedBox(height: 10),
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.border),
              ),
              child: ListTile(
                title: const Text('Expiry Date'),
                subtitle: Text(
                  _expiryDate == null ? 'Not set' : _date(_expiryDate!),
                ),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (_expiryDate != null)
                      IconButton(
                        onPressed: () => setState(() => _expiryDate = null),
                        icon: const Icon(Icons.close),
                      ),
                    const Icon(
                      Icons.calendar_month_outlined,
                      color: AppColors.secondary,
                    ),
                  ],
                ),
                onTap: () => _pickDate(expiry: true),
              ),
            ),
            const SizedBox(height: 22),
            ElevatedButton(
              onPressed: _saving ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: AppColors.white,
                minimumSize: const Size.fromHeight(50),
              ),
              child: _saving
                  ? const CircularProgressIndicator(color: AppColors.white)
                  : const Text('Confirm stock in'),
            ),
          ],
        ),
      ),
    );
  }
}

class OwnerAlertsScreen extends StatefulWidget {
  const OwnerAlertsScreen({super.key});

  @override
  State<OwnerAlertsScreen> createState() => _OwnerAlertsScreenState();
}

class _OwnerAlertsScreenState extends State<OwnerAlertsScreen> {
  final OwnerInventoryService _service = OwnerInventoryService();

  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _alerts = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final result = await _service.getAlerts();

    if (!mounted) return;

    setState(() {
      _loading = false;

      if (result['success'] == true) {
        _alerts = List<Map<String, dynamic>>.from(result['alerts'] ?? []);
      } else {
        _error = result['message']?.toString() ?? 'Unable to load alerts.';
      }
    });
  }

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return _ErrorView(message: _error!, onRetry: _load);
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: _alerts.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(20),
              children: const [
                SizedBox(height: 110),
                _OwnerEmptyState(
                  icon: Icons.notifications_none_outlined,
                  title: 'No inventory alerts',
                  message: 'New stock warnings will appear here.',
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              itemCount: _alerts.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _OwnerSectionHeader(
                    title: 'Needs attention',
                    count: _alerts.length,
                  );
                }

                final alert = _alerts[index - 1];

                final name =
                    alert['product_name']?.toString() ??
                    alert['name']?.toString() ??
                    'Product';

                final type =
                    alert['alert_type']?.toString() ??
                    alert['type']?.toString() ??
                    alert['status']?.toString() ??
                    'Inventory Alert';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        backgroundColor: AppColors.cream,
                        child: Icon(
                          Icons.warning_amber_rounded,
                          color: AppColors.error,
                        ),
                      ),
                      title: Text(
                        name,
                        style: const TextStyle(
                          color: AppColors.forest,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      subtitle: Text(
                        '$type\n'
                        'Quantity: ${alert['quantity'] ?? alert['current_stock'] ?? 'N/A'}\n'
                        'Expiry: ${alert['expiry_date'] ?? 'N/A'}',
                        style: const TextStyle(
                          color: AppColors.muted,
                          height: 1.5,
                        ),
                      ),
                      isThreeLine: true,
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class OwnerMovementsScreen extends StatefulWidget {
  const OwnerMovementsScreen({super.key});

  @override
  State<OwnerMovementsScreen> createState() => _OwnerMovementsScreenState();
}

class _OwnerMovementsScreenState extends State<OwnerMovementsScreen> {
  final OwnerInventoryService _service = OwnerInventoryService();

  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _movements = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    final result = await _service.getMovements();

    if (!mounted) return;

    setState(() {
      _loading = false;

      if (result['success'] == true) {
        _movements = List<Map<String, dynamic>>.from(result['movements'] ?? []);
      } else {
        _error =
            result['message']?.toString() ??
            'Unable to load inventory movements.';
      }
    });
  }

  @override
  void dispose() {
    _service.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return _ErrorView(message: _error!, onRetry: _load);
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: _movements.isEmpty
          ? ListView(
              padding: const EdgeInsets.all(20),
              children: const [
                SizedBox(height: 110),
                _OwnerEmptyState(
                  icon: Icons.swap_horiz_rounded,
                  title: 'No inventory movements',
                  message: 'Stock activity will be recorded here.',
                ),
              ],
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 20),
              itemCount: _movements.length + 1,
              itemBuilder: (context, index) {
                if (index == 0) {
                  return _OwnerSectionHeader(
                    title: 'Recent activity',
                    count: _movements.length,
                  );
                }

                final movement = _movements[index - 1];

                final name =
                    movement['product_name']?.toString() ??
                    movement['name']?.toString() ??
                    'Product';

                final type =
                    movement['movement_type']?.toString() ??
                    movement['movement']?.toString() ??
                    movement['type']?.toString() ??
                    'Movement';

                final quantity =
                    movement['quantity']?.toString() ??
                    movement['quantity_changed']?.toString() ??
                    'N/A';

                final date =
                    movement['created_at']?.toString() ??
                    movement['movement_date']?.toString() ??
                    movement['date']?.toString() ??
                    'N/A';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const CircleAvatar(
                        backgroundColor: AppColors.sageLight,
                        child: Icon(
                          Icons.swap_horiz_rounded,
                          color: AppColors.forest,
                        ),
                      ),
                      title: Text(
                        name,
                        style: const TextStyle(
                          color: AppColors.forest,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      subtitle: Padding(
                        padding: const EdgeInsets.only(top: 5),
                        child: Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _InventoryDetail(label: 'Type', value: type),
                            _InventoryDetail(
                              label: 'Quantity',
                              value: quantity,
                            ),
                            _InventoryDetail(label: 'Date', value: date),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class OwnerProfileScreen extends StatelessWidget {
  final Map<String, dynamic> user;

  const OwnerProfileScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final roleLabel = user['role']?.toString().toLowerCase() == 'manager'
        ? 'Manager'
        : 'Owner';
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Card(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 22),
              decoration: const BoxDecoration(
                color: AppColors.sageLight,
                borderRadius: BorderRadius.vertical(top: Radius.circular(18)),
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 40,
                    backgroundColor: AppColors.white,
                    child: Icon(
                      Icons.person_outline_rounded,
                      size: 42,
                      color: AppColors.forest,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    user['full_name']?.toString() ?? roleLabel,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: AppColors.forest,
                      fontSize: 21,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 13,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      roleLabel,
                      style: const TextStyle(
                        color: AppColors.forest,
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 12, 8, 8),
              child: Column(
                children: [
                  _OwnerProfileInfo(
                    icon: Icons.alternate_email_rounded,
                    label: 'Username',
                    value: user['username']?.toString() ?? '',
                  ),
                  _OwnerProfileInfo(
                    icon: Icons.badge_outlined,
                    label: 'Role',
                    value: user['role']?.toString() ?? roleLabel.toLowerCase(),
                  ),
                  _OwnerProfileInfo(
                    icon: Icons.verified_user_outlined,
                    label: 'Account Status',
                    value: user['status']?.toString() ?? 'active',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OwnerProfileInfo extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _OwnerProfileInfo({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.secondary),
      title: Text(label, style: const TextStyle(color: AppColors.muted)),
      subtitle: Text(
        value,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _OwnerSectionHeader extends StatelessWidget {
  final String title;
  final int count;

  const _OwnerSectionHeader({required this.title, required this.count});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                color: AppColors.forest,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: BoxDecoration(
              color: AppColors.sageLight,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '$count ${count == 1 ? 'item' : 'items'}',
              style: const TextStyle(
                color: AppColors.forest,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OwnerEmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;

  const _OwnerEmptyState({
    required this.icon,
    required this.title,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 48, color: AppColors.secondary),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: const TextStyle(
            color: AppColors.forest,
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.muted),
        ),
      ],
    );
  }
}

class _InventoryDetail extends StatelessWidget {
  final String label;
  final String value;

  const _InventoryDetail({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(maxWidth: 250),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.canvas,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        '$label: $value',
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
        style: const TextStyle(color: AppColors.muted, fontSize: 12),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.cloud_off_outlined,
              size: 50,
              color: AppColors.secondary,
            ),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }
}

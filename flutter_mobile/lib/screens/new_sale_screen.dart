
import 'package:flutter/material.dart';
import '../services/product_service.dart';

class NewSaleScreen extends StatefulWidget {
  const NewSaleScreen({super.key});

  @override
  State<NewSaleScreen> createState() => _NewSaleScreenState();
}

class _NewSaleScreenState extends State<NewSaleScreen> {
  final ProductService _productService = ProductService();

  List<Map<String, dynamic>> products = [];
  List<Map<String, dynamic>> cart = [];

  bool isLoading = true;
  String errorMessage = '';
  String searchQuery = '';

  @override
  void initState() {
    super.initState();
    loadProducts();
  }

  Future<void> loadProducts() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    final result = await _productService.getProducts();

    if (!mounted) return;

    setState(() {
      if (result['success'] == true) {
        products = List<Map<String, dynamic>>.from(
          result['products'],
        );
      } else {
        errorMessage = result['message'] ?? 'Unable to load products.';
      }

      isLoading = false;
    });
  }

  String getProductName(Map<String, dynamic> product) {
    return product['product_name']?.toString() ?? 'Unknown Product';
  }

  double getProductPrice(Map<String, dynamic> product) {
    return double.tryParse(
          product['selling_price']?.toString() ?? '0',
        ) ??
        0;
  }

  int getProductId(Map<String, dynamic> product) {
    return int.tryParse(product['product_id']?.toString() ?? '') ?? 0;
  }

  void addToCart(Map<String, dynamic> product) {
    final productId = getProductId(product);

    setState(() {
      final index = cart.indexWhere(
        (item) => item['product_id'] == productId,
      );

      if (index != -1) {
        cart[index]['quantity']++;
      } else {
        cart.add({
          'product_id': productId,
          'product_name': getProductName(product),
          'selling_price': getProductPrice(product),
          'quantity': 1,
        });
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${getProductName(product)} added to cart.'),
        duration: const Duration(seconds: 1),
      ),
    );
  }

  void updateQuantity(int index, int change) {
    setState(() {
      cart[index]['quantity'] += change;

      if (cart[index]['quantity'] <= 0) {
        cart.removeAt(index);
      }
    });
  }

  double get totalAmount {
    return cart.fold(
      0.0,
      (total, item) =>
          total +
          (item['selling_price'] as double) *
              (item['quantity'] as int),
    );
  }

  List<Map<String, dynamic>> get filteredProducts {
    return products.where((product) {
      return getProductName(product)
          .toLowerCase()
          .contains(searchQuery.toLowerCase());
    }).toList();
  }

  @override
  void dispose() {
    _productService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('New Sale'),
        actions: [
          IconButton(
            onPressed: loadProducts,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: 'Search products...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : errorMessage.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(errorMessage),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: loadProducts,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : filteredProducts.isEmpty
                        ? const Center(
                            child: Text('No products found.'),
                          )
                        : ListView.builder(
                            itemCount: filteredProducts.length,
                            itemBuilder: (context, index) {
                              final product = filteredProducts[index];

                              return Card(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 5,
                                ),
                                child: ListTile(
                                  title: Text(
                                    getProductName(product),
                                  ),
                                  subtitle: Text(
                                    '₱${getProductPrice(product).toStringAsFixed(2)}',
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(
                                      Icons.add_shopping_cart,
                                    ),
                                    onPressed: () => addToCart(product),
                                  ),
                                ),
                              );
                            },
                          ),
          ),
          const Divider(height: 1),
          Expanded(
            flex: 2,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(12),
                  child: Text(
                    'Shopping Cart',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Expanded(
                  child: cart.isEmpty
                      ? const Center(
                          child: Text('Cart is empty.'),
                        )
                      : ListView.builder(
                          itemCount: cart.length,
                          itemBuilder: (context, index) {
                            final item = cart[index];

                            return ListTile(
                              title: Text(item['product_name']),
                              subtitle: Text(
                                '₱${(item['selling_price'] as double).toStringAsFixed(2)}',
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    onPressed: () =>
                                        updateQuantity(index, -1),
                                    icon: const Icon(Icons.remove_circle_outline),
                                  ),
                                  Text('${item['quantity']}'),
                                  IconButton(
                                    onPressed: () =>
                                        updateQuantity(index, 1),
                                    icon: const Icon(Icons.add_circle_outline),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
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
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

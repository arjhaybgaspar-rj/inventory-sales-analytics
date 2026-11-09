
import 'package:flutter/material.dart';
import '../services/sales_service.dart';

const Color primaryColor = Color(0xFF2E8B72);

class PaymentScreen extends StatefulWidget {
  final List<Map<String, dynamic>> cart;
  final double totalAmount;

  const PaymentScreen({
    super.key,
    required this.cart,
    required this.totalAmount,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final SalesService _salesService = SalesService();

  String _paymentMethod = 'cash';
  bool _isProcessing = false;

  String _formatAmount(dynamic value) {
    final amount = double.tryParse(value.toString()) ?? 0;
    return '₱${amount.toStringAsFixed(2)}';
  }

  Future<void> _confirmPayment() async {
    if (_isProcessing || widget.cart.isEmpty) return;

    setState(() => _isProcessing = true);

    final items = widget.cart.map((item) {
      return {
        'product_id': item['product_id'],
        'quantity': item['quantity'],
      };
    }).toList();

    final result = await _salesService.createSale(
      paymentMethod: _paymentMethod,
      items: items,
    );

    if (!mounted) return;

    setState(() => _isProcessing = false);

    if (result['success'] != true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result['message'] ?? 'Unable to complete payment.',
          ),
          backgroundColor: Colors.red.shade700,
        ),
      );
      return;
    }

    await _showReceipt(result);
  }

  Future<void> _showReceipt(Map<String, dynamic> sale) async {
    final items = List<Map<String, dynamic>>.from(
      (sale['items'] as List? ?? []).map(
        (item) => Map<String, dynamic>.from(item),
      ),
    );

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Column(
            children: [
              CircleAvatar(
                radius: 28,
                backgroundColor: Color(0xFFE1F2E9),
                child: Icon(
                  Icons.check_circle,
                  color: primaryColor,
                  size: 38,
                ),
              ),
              SizedBox(height: 12),
              Text(
                'Payment Successful!',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          content: SizedBox(
            width: 400,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Divider(),
                  _receiptRow(
                    'Sale ID',
                    '#${sale['sale_id'] ?? 'N/A'}',
                  ),
                  _receiptRow(
                    'Cashier',
                    sale['cashier']?.toString() ?? 'Cashier',
                  ),
                  _receiptRow(
                    'Payment',
                    (sale['payment_method'] ?? _paymentMethod)
                        .toString()
                        .toUpperCase(),
                  ),
                  const Divider(),
                  const Text(
                    'Purchased Items',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...items.map((item) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['product_name']?.toString() ??
                                'Unknown Product',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          Text(
                            '${item['quantity']} × ${_formatAmount(item['unit_price'])}',
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            _formatAmount(item['subtotal']),
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                  const Divider(),
                  _receiptRow(
                    'TOTAL',
                    _formatAmount(sale['total_amount']),
                    bold: true,
                  ),
                  const SizedBox(height: 12),
                  const Center(
                    child: Text(
                      'Thank you for your purchase!',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(dialogContext);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  foregroundColor: Colors.white,
                ),
                child: const Text('DONE'),
              ),
            ),
          ],
        );
      },
    );

    if (!mounted) return;

    Navigator.pop(context, true);
  }

  Widget _receiptRow(
    String label,
    String value, {
    bool bold = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontWeight: bold ? FontWeight.bold : FontWeight.normal,
                color: bold ? primaryColor : Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _salesService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Order Summary',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Card(
                      color: Colors.white,
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          children: [
                            ...widget.cart.map((item) {
                              final name =
                                  item['product_name']?.toString() ??
                                      'Unknown Product';
                              final quantity =
                                  int.tryParse(
                                    item['quantity'].toString(),
                                  ) ??
                                  0;
                              final price =
                                  double.tryParse(
                                    item['selling_price'].toString(),
                                  ) ??
                                  0;
                              final subtotal = quantity * price;

                              return Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            name,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          Text(
                                            '$quantity × ${_formatAmount(price)}',
                                            style: const TextStyle(
                                              color: Colors.grey,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Text(
                                      _formatAmount(subtotal),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const Divider(),
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Total Amount',
                                  style: TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  _formatAmount(widget.totalAmount),
                                  style: const TextStyle(
                                    color: primaryColor,
                                    fontSize: 21,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),
                    const Text(
                      'Select Payment Method',
                      style: TextStyle(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    RadioGroup<String>(
                      groupValue: _paymentMethod,
                      onChanged: (newValue) {
                        if (_isProcessing || newValue == null) return;
                        setState(() => _paymentMethod = newValue);
                      },
                      child: Column(
                        children: [
                          _paymentOption(
                            value: 'cash',
                            title: 'Cash',
                            subtitle: 'Customer pays using cash',
                            icon: Icons.payments_outlined,
                          ),
                          _paymentOption(
                            value: 'gcash',
                            title: 'GCash',
                            subtitle: 'Customer pays through GCash',
                            icon: Icons.account_balance_wallet_outlined,
                          ),
                          _paymentOption(
                            value: 'card',
                            title: 'Card',
                            subtitle: 'Customer pays using a card',
                            icon: Icons.credit_card_outlined,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
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
              child: SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _confirmPayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    foregroundColor: Colors.white,
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          height: 23,
                          width: 23,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'CONFIRM PAYMENT',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _paymentOption({
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final selected = _paymentMethod == value;

    return Card(
      color: selected ? const Color(0xFFE8F4EE) : Colors.white,
      elevation: selected ? 2 : 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: selected ? primaryColor : Colors.grey.shade300,
        ),
      ),
      child: RadioListTile<String>(
        value: value,
        activeColor: primaryColor,
        secondary: Icon(icon, color: primaryColor, size: 28),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(subtitle),
      ),
    );
  }
}

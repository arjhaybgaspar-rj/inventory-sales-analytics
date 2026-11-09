
import 'package:flutter/material.dart';
import '../services/sales_service.dart';

const Color primaryColor = Color(0xFF2E8B72);

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState
    extends State<TransactionHistoryScreen> {
  final SalesService _salesService = SalesService();

  List<Map<String, dynamic>> _sales = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadSales();
  }

  Future<void> _loadSales() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _salesService.getSales();

    if (!mounted) return;

    setState(() {
      _isLoading = false;

      if (result['success'] == true) {
        _sales = List<Map<String, dynamic>>.from(result['sales']);
      } else {
        _errorMessage = result['message'] ?? 'Unable to load transactions.';
      }
    });
  }

  String _formatDate(dynamic value) {
    if (value == null) return 'Date unavailable';

    final date = DateTime.tryParse(value.toString());

    if (date == null) return value.toString();

    final localDate = date.toLocal();

    return '${localDate.day.toString().padLeft(2, '0')}/'
        '${localDate.month.toString().padLeft(2, '0')}/'
        '${localDate.year} '
        '${localDate.hour.toString().padLeft(2, '0')}:'
        '${localDate.minute.toString().padLeft(2, '0')}';
  }

  String _formatAmount(dynamic value) {
    final amount = double.tryParse(value?.toString() ?? '0') ?? 0;
    return '₱${amount.toStringAsFixed(2)}';
  }

  Future<void> _openDetails(Map<String, dynamic> sale) async {
    final saleId = int.tryParse(sale['sale_id'].toString());

    if (saleId == null) return;

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => TransactionDetailsScreen(saleId: saleId),
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
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              const Expanded(
                child: Text(
                  'Completed Transactions',
                  style: TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              IconButton(
                onPressed: _isLoading ? null : _loadSales,
                icon: const Icon(Icons.refresh),
                tooltip: 'Refresh',
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
                              onPressed: _loadSales,
                              icon: const Icon(Icons.refresh),
                              label: const Text('Try Again'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _sales.isEmpty
                      ? const Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.receipt_long_outlined,
                                size: 65,
                                color: Colors.grey,
                              ),
                              SizedBox(height: 15),
                              Text(
                                'No transactions found.',
                                style: TextStyle(
                                  color: Colors.grey,
                                  fontSize: 16,
                                ),
                              ),
                            ],
                          ),
                        )
                      : RefreshIndicator(
                          onRefresh: _loadSales,
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(
                              16,
                              4,
                              16,
                              20,
                            ),
                            itemCount: _sales.length,
                            itemBuilder: (context, index) {
                              final sale = _sales[index];

                              final saleId = sale['sale_id'];
                              final cashier =
                                  sale['full_name'] ?? 'Unknown Cashier';
                              final paymentMethod =
                                  sale['payment_method'] ?? 'N/A';

                              return Card(
                                color: Colors.white,
                                margin: const EdgeInsets.only(bottom: 12),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(16),
                                  leading: const CircleAvatar(
                                    backgroundColor: Color(0xFFE1F2E9),
                                    child: Icon(
                                      Icons.receipt_long,
                                      color: primaryColor,
                                    ),
                                  ),
                                  title: Text(
                                    'Transaction #$saleId',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text('Cashier: $cashier'),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Date: ${_formatDate(sale['sale_date'])}',
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Payment: ${paymentMethod.toString().toUpperCase()}',
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          _formatAmount(sale['total_amount']),
                                          style: const TextStyle(
                                            color: primaryColor,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 17,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  trailing: const Icon(
                                    Icons.chevron_right,
                                    color: primaryColor,
                                  ),
                                  onTap: () => _openDetails(sale),
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

class TransactionDetailsScreen extends StatefulWidget {
  final int saleId;

  const TransactionDetailsScreen({
    super.key,
    required this.saleId,
  });

  @override
  State<TransactionDetailsScreen> createState() =>
      _TransactionDetailsScreenState();
}

class _TransactionDetailsScreenState
    extends State<TransactionDetailsScreen> {
  final SalesService _salesService = SalesService();

  Map<String, dynamic>? _sale;
  List<Map<String, dynamic>> _items = [];

  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDetails();
  }

  Future<void> _loadDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await _salesService.getSaleDetails(widget.saleId);

    if (!mounted) return;

    setState(() {
      _isLoading = false;

      if (result['success'] == true) {
        _sale = Map<String, dynamic>.from(result['sale']);
        _items = List<Map<String, dynamic>>.from(result['items']);
      } else {
        _errorMessage =
            result['message'] ?? 'Unable to retrieve transaction details.';
      }
    });
  }

  String _formatAmount(dynamic value) {
    final amount = double.tryParse(value?.toString() ?? '0') ?? 0;
    return '₱${amount.toStringAsFixed(2)}';
  }

  String _formatDate(dynamic value) {
    if (value == null) return 'Date unavailable';

    final date = DateTime.tryParse(value.toString());

    if (date == null) return value.toString();

    final localDate = date.toLocal();

    return '${localDate.day.toString().padLeft(2, '0')}/'
        '${localDate.month.toString().padLeft(2, '0')}/'
        '${localDate.year} '
        '${localDate.hour.toString().padLeft(2, '0')}:'
        '${localDate.minute.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _salesService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F8F5),
      appBar: AppBar(
        title: Text('Transaction #${widget.saleId}'),
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      body: _isLoading
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
                          Icons.error_outline,
                          size: 55,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _loadDetails,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Try Again'),
                        ),
                      ],
                    ),
                  ),
                )
              : _sale == null
                  ? const Center(
                      child: Text('Transaction not found.'),
                    )
                  : _buildReceipt(),
    );
  }

  Widget _buildReceipt() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Card(
            color: Colors.white,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 35,
                    backgroundColor: Color(0xFFE1F2E9),
                    child: Icon(
                      Icons.check_circle,
                      size: 42,
                      color: primaryColor,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'TRANSACTION RECEIPT',
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Sale ID: ${_sale!['sale_id']}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                  const Divider(height: 30),
                  _receiptInfo('Cashier', _sale!['cashier']?.toString() ?? ''),
                  _receiptInfo(
                    'Date',
                    _formatDate(_sale!['sale_date']),
                  ),
                  _receiptInfo(
                    'Payment Method',
                    (_sale!['payment_method'] ?? 'N/A')
                        .toString()
                        .toUpperCase(),
                  ),
                  const Divider(height: 30),
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Purchased Products',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ..._items.map((item) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item['product_name']?.toString() ??
                                'Unknown Product',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            '${item['quantity']} × ${_formatAmount(item['unit_price'])}',
                            style: const TextStyle(color: Colors.grey),
                          ),
                          if (item['batch_number'] != null)
                            Text(
                              'Batch: ${item['batch_number']}',
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                              ),
                            ),
                          const SizedBox(height: 4),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              _formatAmount(item['subtotal']),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const Divider(),
                        ],
                      ),
                    );
                  }),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TOTAL',
                        style: TextStyle(
                          fontSize: 19,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _formatAmount(_sale!['total_amount']),
                        style: const TextStyle(
                          color: primaryColor,
                          fontSize: 21,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                  const Text(
                    'Thank you for your purchase!',
                    style: TextStyle(
                      color: primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.arrow_back),
              label: const Text('Back to History'),
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _receiptInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

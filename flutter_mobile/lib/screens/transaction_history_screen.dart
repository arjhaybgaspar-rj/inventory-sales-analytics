import 'package:flutter/material.dart';
import '../services/sales_service.dart';
import '../theme/app_theme.dart';

const Color primaryColor = AppColors.primary;

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
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
          padding: const EdgeInsets.fromLTRB(18, 18, 12, 10),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Completed transactions',
                      style: TextStyle(
                        color: AppColors.forest,
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Select a sale to view its receipt',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  ],
                ),
              ),
              IconButton.filledTonal(
                onPressed: _isLoading ? null : _loadSales,
                icon: const Icon(Icons.refresh_rounded),
                tooltip: 'Refresh transactions',
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
                          Icons.cloud_off_outlined,
                          size: 52,
                          color: AppColors.secondary,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          _errorMessage!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppColors.muted),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: _loadSales,
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Try again'),
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
                        size: 58,
                        color: AppColors.secondary,
                      ),
                      SizedBox(height: 15),
                      Text(
                        'No transactions yet',
                        style: TextStyle(
                          color: AppColors.forest,
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      SizedBox(height: 6),
                      Text(
                        'Completed sales will appear here.',
                        style: TextStyle(color: AppColors.muted),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadSales,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                    itemCount: _sales.length,
                    itemBuilder: (context, index) {
                      final sale = _sales[index];

                      final saleId = sale['sale_id'];
                      final cashier = sale['full_name'] ?? 'Unknown Cashier';
                      final paymentMethod = sale['payment_method'] ?? 'N/A';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(18),
                          onTap: () => _openDetails(sale),
                          child: Padding(
                            padding: const EdgeInsets.all(15),
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
                                        Icons.receipt_long_rounded,
                                        color: AppColors.forest,
                                        size: 21,
                                      ),
                                    ),
                                    const SizedBox(width: 11),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'Transaction #$saleId',
                                            style: const TextStyle(
                                              color: AppColors.forest,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                          const SizedBox(height: 3),
                                          Text(
                                            cashier.toString(),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
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
                                      _formatAmount(sale['total_amount']),
                                      style: const TextStyle(
                                        color: AppColors.forest,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ],
                                ),
                                const Divider(height: 22),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.schedule_rounded,
                                      size: 15,
                                      color: AppColors.secondary,
                                    ),
                                    const SizedBox(width: 5),
                                    Expanded(
                                      child: Text(
                                        _formatDate(sale['sale_date']),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          color: AppColors.muted,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 10),
                                    const Icon(
                                      Icons.payments_outlined,
                                      size: 15,
                                      color: AppColors.secondary,
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      paymentMethod.toString().toUpperCase(),
                                      style: const TextStyle(
                                        color: AppColors.deepGreen,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
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

class TransactionDetailsScreen extends StatefulWidget {
  final int saleId;

  const TransactionDetailsScreen({super.key, required this.saleId});

  @override
  State<TransactionDetailsScreen> createState() =>
      _TransactionDetailsScreenState();
}

class _TransactionDetailsScreenState extends State<TransactionDetailsScreen> {
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
      backgroundColor: AppColors.canvas,
      appBar: AppBar(title: Text('Transaction #${widget.saleId}')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: primaryColor))
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
                      color: AppColors.error,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      _errorMessage!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.muted),
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
              child: Text(
                'Transaction not found.',
                style: TextStyle(color: AppColors.muted),
              ),
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
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 35,
                    backgroundColor: AppColors.sageLight,
                    child: Icon(
                      Icons.check_circle_rounded,
                      size: 42,
                      color: AppColors.forest,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'TRANSACTION RECEIPT',
                    style: TextStyle(
                      color: AppColors.forest,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Sale ID: ${_sale!['sale_id']}',
                    style: const TextStyle(color: AppColors.muted),
                  ),
                  const Divider(height: 30),
                  _receiptInfo('Cashier', _sale!['cashier']?.toString() ?? ''),
                  _receiptInfo('Date', _formatDate(_sale!['sale_date'])),
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
                        color: AppColors.forest,
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
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
                              color: AppColors.forest,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 5),
                          Text(
                            '${item['quantity']} × ${_formatAmount(item['unit_price'])}',
                            style: const TextStyle(color: AppColors.muted),
                          ),
                          if (item['batch_number'] != null)
                            Text(
                              'Batch: ${item['batch_number']}',
                              style: const TextStyle(
                                color: AppColors.muted,
                                fontSize: 12,
                              ),
                            ),
                          const SizedBox(height: 4),
                          Align(
                            alignment: Alignment.centerRight,
                            child: Text(
                              _formatAmount(item['subtotal']),
                              style: const TextStyle(
                                color: AppColors.deepGreen,
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
                          color: AppColors.forest,
                          fontSize: 19,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      Text(
                        _formatAmount(_sale!['total_amount']),
                        style: const TextStyle(
                          color: AppColors.forest,
                          fontSize: 21,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 25),
                  const Text(
                    'Thank you for your purchase!',
                    style: TextStyle(
                      color: AppColors.deepGreen,
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
              icon: const Icon(Icons.arrow_back_rounded),
              label: const Text('Back to history'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forest,
                foregroundColor: AppColors.canvas,
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
            child: Text(label, style: const TextStyle(color: AppColors.muted)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.forest,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

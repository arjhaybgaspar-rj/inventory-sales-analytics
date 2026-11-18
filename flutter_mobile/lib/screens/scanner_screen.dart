import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

const Color scannerPrimaryColor = Color(0xFF163832);

class ScannerScreen extends StatefulWidget {
  final Future<String> Function(String barcode)? onBarcode;

  const ScannerScreen({super.key, this.onBarcode});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  bool _isProcessing = false;
  bool _isCoolingDown = false;
  bool _showFlash = false;
  bool _feedbackIsSuccess = false;
  String? _feedback;

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_isProcessing || _isCoolingDown) return;

    String? value;
    for (final barcode in capture.barcodes) {
      final candidate = barcode.rawValue?.trim();
      if (candidate != null && candidate.isNotEmpty) {
        value = candidate;
        break;
      }
    }
    if (value == null) return;

    if (widget.onBarcode == null) {
      Navigator.pop(context, value);
      return;
    }

    setState(() {
      _isProcessing = true;
      _showFlash = true;
      _feedbackIsSuccess = false;
      _feedback = 'Barcode detected · adding to cart';
    });
    HapticFeedback.lightImpact();
    SystemSound.play(SystemSoundType.alert);

    try {
      final message = await widget.onBarcode!(value);
      if (!mounted) return;
      setState(() {
        _feedback = message;
        _feedbackIsSuccess = message.toLowerCase().contains(
          'added to shared cart',
        );
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _feedback = 'Could not add this product. Try again.';
        _feedbackIsSuccess = false;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _isCoolingDown = true;
          _showFlash = false;
        });
        await Future<void>.delayed(const Duration(milliseconds: 1500));
        if (!mounted) return;
        setState(() => _isCoolingDown = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final continuous = widget.onBarcode != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(continuous ? 'Scan Products' : 'Scan Product Barcode'),
        backgroundColor: scannerPrimaryColor,
        foregroundColor: Colors.white,
        actions: [
          if (continuous)
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'CANCEL',
                style: TextStyle(color: Colors.white),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                MobileScanner(onDetect: _onDetect),
                Center(
                  child: Container(
                    width: 280,
                    height: 170,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: _showFlash
                            ? const Color(0xFF8EE3B0)
                            : const Color(0xFF8EB69B),
                        width: _showFlash ? 5 : 3,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: _showFlash
                          ? [
                              BoxShadow(
                                color: const Color(
                                  0xFF8EE3B0,
                                ).withOpacity(0.45),
                                blurRadius: 24,
                              ),
                            ]
                          : null,
                    ),
                  ),
                ),
                if (_showFlash)
                  IgnorePointer(
                    child: ColoredBox(color: const Color(0x338EE3B0)),
                  ),
                if (_feedback != null)
                  Positioned(
                    left: 18,
                    right: 18,
                    bottom: 22,
                    child: Material(
                      color: scannerPrimaryColor,
                      borderRadius: BorderRadius.circular(14),
                      elevation: 5,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 13,
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _feedbackIsSuccess
                                  ? Icons.check_circle
                                  : Icons.info_outline,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _feedback!,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            color: Colors.white,
            child: Column(
              children: [
                Icon(
                  Icons.qr_code_scanner,
                  color: scannerPrimaryColor,
                  size: 35,
                ),
                const SizedBox(height: 10),
                Text(
                  continuous
                      ? _isCoolingDown
                            ? 'Pause briefly before scanning the next product.'
                            : 'Scan each product to add it to the shared cart.'
                      : 'Position the product barcode inside the frame.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  continuous
                      ? _isCoolingDown
                            ? 'Ready for the next scan in a moment.'
                            : 'Scanner beep confirms each successful read.'
                      : 'The barcode will be detected automatically.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

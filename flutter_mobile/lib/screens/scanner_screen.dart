
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

const Color scannerPrimaryColor = Color(0xFF2E8B72);

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  bool _hasScanned = false;

  void _onDetect(BarcodeCapture capture) {
    if (_hasScanned) return;

    for (final barcode in capture.barcodes) {
      final value = barcode.rawValue?.trim();

      if (value != null && value.isNotEmpty) {
        _hasScanned = true;
        Navigator.pop(context, value);
        return;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Product Barcode'),
        backgroundColor: scannerPrimaryColor,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: [
                MobileScanner(
                  onDetect: _onDetect,
                ),
                Center(
                  child: Container(
                    width: 280,
                    height: 170,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: Colors.greenAccent,
                        width: 3,
                      ),
                      borderRadius: BorderRadius.circular(16),
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
            child: const Column(
              children: [
                Icon(
                  Icons.qr_code_scanner,
                  color: scannerPrimaryColor,
                  size: 35,
                ),
                SizedBox(height: 10),
                Text(
                  'Position the product barcode inside the frame.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  'The barcode will be detected automatically.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

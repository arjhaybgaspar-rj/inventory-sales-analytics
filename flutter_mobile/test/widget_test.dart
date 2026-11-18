import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flutter_mobile/main.dart';
import 'package:flutter_mobile/screens/owner/owner_dashboard.dart';
import 'package:flutter_mobile/theme/app_theme.dart';

void main() {
  testWidgets('mobile login fits and password visibility can be toggled', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const MyApp());

    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Account access'), findsOneWidget);
    expect(find.byType(TextField), findsNWidgets(2));
    expect(tester.takeException(), isNull);

    final passwordField = find.byType(TextField).last;
    expect(tester.widget<TextField>(passwordField).obscureText, isTrue);

    await tester.tap(find.byTooltip('Show password'));
    await tester.pump();

    expect(tester.widget<TextField>(passwordField).obscureText, isFalse);
    expect(tester.takeException(), isNull);
  });

  testWidgets('cashier dashboard, cart, and profile fit a phone screen', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final today = DateTime.now();
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: DashboardHome(
            user: const {'full_name': 'Store Cashier'},
            onNavigate: (_) {},
            salesLoader: () async => {
              'success': true,
              'sales': [
                {'sale_date': today.toIso8601String(), 'total_amount': 120.50},
                {'sale_date': today.toIso8601String(), 'total_amount': 9.99},
                {
                  'sale_date': today
                      .subtract(const Duration(days: 1))
                      .toIso8601String(),
                  'total_amount': 1000.00,
                },
              ],
            },
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sales overview'), findsOneWidget);
    expect(find.text('₱130.49'), findsOneWidget);
    expect(find.text('2'), findsOneWidget);
    expect(find.text('Create New Sale'), findsOneWidget);
    expect(tester.takeException(), isNull);

    var quantityChanges = 0;
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: CartScreen(
            cart: const [
              {
                'product_name': 'Sample Product',
                'selling_price': 25.0,
                'quantity': 2,
              },
            ],
            totalAmount: 50,
            onUpdateQuantity: (_, _) => quantityChanges++,
            onClearCart: () {},
            onCheckout: () {},
          ),
        ),
      ),
    );

    expect(find.text('Sample Product'), findsOneWidget);
    expect(find.text('Order total'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byTooltip('Increase quantity'));
    expect(quantityChanges, 1);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: ProfileScreen(
            user: const {
              'full_name': 'Store Cashier',
              'username': 'cashier',
              'role': 'cashier',
              'status': 'active',
            },
          ),
        ),
      ),
    );

    expect(find.text('Account details'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('owner home and profile fit a phone screen', (tester) async {
    tester.view.physicalSize = const Size(360, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: OwnerHomeScreen(
            user: const {'full_name': 'Store Owner', 'role': 'owner'},
            onNavigate: (_) {},
          ),
        ),
      ),
    );

    expect(find.text('Welcome back,'), findsOneWidget);
    expect(find.text('Inventory management'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: Scaffold(
          body: OwnerProfileScreen(
            user: const {
              'full_name': 'Store Owner',
              'username': 'owner',
              'role': 'owner',
              'status': 'active',
            },
          ),
        ),
      ),
    );

    expect(find.text('Store Owner'), findsOneWidget);
    expect(find.text('Username'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

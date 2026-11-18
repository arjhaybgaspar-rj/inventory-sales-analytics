# flutter_mobile

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Connecting to the backend

Start the Flask backend on the computer with `python app.py` from `python-backend`.
It listens on port `5000` and must remain running while the mobile app is in use.

For a physical phone, connect the phone and computer to the same Wi-Fi network.
The app's default API address uses the computer's current Wi-Fi IPv4 address;
if that address changes, run the app with
`--dart-define=API_BASE_URL=http://<computer-wi-fi-ip>:5000`.
For an Android emulator, use
`--dart-define=API_BASE_URL=http://10.0.2.2:5000` instead.

If the phone still cannot connect, open `http://<computer-wi-fi-ip>:5000/` in
the phone's browser. If it does not display the API running message, check that
the backend is running and allow inbound TCP port `5000` through Windows
Firewall on the computer's private network.

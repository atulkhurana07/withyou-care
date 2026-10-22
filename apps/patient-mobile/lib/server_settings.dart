import 'package:shared_preferences/shared_preferences.dart';

import 'api_client.dart';

String normalizeCareServer(String input) {
  var text = input.trim();
  if (!text.contains('://')) text = 'http://$text';
  final uri = Uri.tryParse(text);
  if (uri == null ||
      uri.host.isEmpty ||
      uri.userInfo.isNotEmpty ||
      uri.hasQuery ||
      uri.hasFragment ||
      (uri.path.isNotEmpty && uri.path != '/') ||
      !isAllowedCareEndpoint(uri)) {
    throw CareApiException(
      'Enter your care server address, such as https://care.example.com.',
    );
  }
  final normalized = uri.replace(
    port: uri.scheme == 'http' && !uri.hasPort ? 3100 : null,
    path: '',
  );
  return normalized.toString();
}

class CareServerSettings {
  late final preferences = SharedPreferencesAsync();
  Future<String?> load() async {
    final saved = await preferences.getString('demo_server_address');
    return saved == null ? null : normalizeCareServer(saved);
  }

  Future<void> save(String address) => preferences.setString(
    'demo_server_address',
    normalizeCareServer(address),
  );
}

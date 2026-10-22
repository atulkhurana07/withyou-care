import 'package:flutter_test/flutter_test.dart';
import 'package:withyou_care/api_client.dart';

void main() {
  test('public plaintext and non-HTTP schemes are rejected', () {
    for (final endpoint in [
      'http://example.com',
      'http://8.8.8.8',
      'ftp://localhost',
    ]) {
      expect(isAllowedCareEndpoint(Uri.parse(endpoint)), isFalse);
    }
    expect(isAllowedCareEndpoint(Uri.parse('https://example.com')), isTrue);
    expect(isAllowedCareEndpoint(Uri.parse('http://127.0.0.1:3000')), isTrue);
  });
  test('private demo HTTP requires the explicit build flag', () {
    const enabled = bool.fromEnvironment('ALLOW_LOCAL_DEMO_HTTP');
    for (final host in [
      '192.168.1.82',
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.255',
    ]) {
      expect(isAllowedCareEndpoint(Uri.parse('http://$host:3000')), enabled);
    }
    for (final host in ['172.32.0.1', '192.169.1.1', '192.168.1.999']) {
      expect(isAllowedCareEndpoint(Uri.parse('http://$host:3000')), isFalse);
    }
  });
}

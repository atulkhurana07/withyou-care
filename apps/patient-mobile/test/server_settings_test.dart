import 'package:flutter_test/flutter_test.dart';
import 'package:withyou_care/server_settings.dart';

void main() {
  test(
    'connection address keeps an explicit port and removes a trailing slash',
    () {
      expect(
        normalizeCareServer('https://care.example.com/'),
        'https://care.example.com',
      );
      expect(
        normalizeCareServer('http://127.0.0.1:3000/'),
        'http://127.0.0.1:3000',
      );
    },
  );
  test(
    'paths, credentials and unsupported protocols cannot become a server',
    () {
      for (final value in [
        'http://user:pass@localhost',
        'http://localhost/api',
        'http://localhost?q=x',
        'ftp://localhost',
        '',
      ]) {
        expect(() => normalizeCareServer(value), throwsException);
      }
    },
  );
  if (const bool.fromEnvironment('ALLOW_LOCAL_DEMO_HTTP')) {
    test('a Wi-Fi address without a port uses the stable bridge port', () {
      expect(normalizeCareServer('10.170.57.76'), 'http://10.170.57.76:3100');
      expect(
        normalizeCareServer('192.168.1.82:3100'),
        'http://192.168.1.82:3100',
      );
    });
  }
}

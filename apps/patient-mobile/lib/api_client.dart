import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

// Private Wi-Fi HTTP is an explicit synthetic-demo option, disabled in release.
bool isAllowedCareEndpoint(Uri uri) {
  if (uri.scheme == 'https') return true;
  if (uri.scheme != 'http') return false;
  if (['127.0.0.1', 'localhost', '10.0.2.2'].contains(uri.host)) return true;
  if (kReleaseMode || !const bool.fromEnvironment('ALLOW_LOCAL_DEMO_HTTP')) {
    return false;
  }
  final parts = uri.host.split('.').map(int.tryParse).toList();
  if (parts.length != 4 ||
      parts.any((part) => part == null || part < 0 || part > 255)) {
    return false;
  }
  return parts[0] == 10 ||
      (parts[0] == 192 && parts[1] == 168) ||
      (parts[0] == 172 && parts[1]! >= 16 && parts[1]! <= 31);
}

class CareApiException implements Exception {
  final String message;
  final int? status;
  CareApiException(this.message, [this.status]);
  @override
  String toString() => message;
}

class CareApiClient {
  String base;
  String? token;
  CareApiClient(this.base);
  Future<dynamic> uploadPrescription(
    Uint8List bytes,
    String filename, {
    String? replacementId,
  }) async {
    final uri = Uri.parse('$base/api/intake/upload');
    if (!isAllowedCareEndpoint(uri)) {
      throw CareApiException('A secure connection is required.');
    }
    final request = http.MultipartRequest('POST', uri)
      ..headers.addAll({
        'Origin': base,
        if (token != null) 'Authorization': 'Bearer $token',
      })
      ..fields.addAll({
        'consent': 'true',
        'belongsToMe': 'true',
        'replacementId': ?replacementId,
      })
      ..files.add(
        http.MultipartFile.fromBytes('file', bytes, filename: filename),
      );
    try {
      final response = await http.Response.fromStream(
        await request.send().timeout(const Duration(seconds: 45)),
      );
      final result = jsonDecode(response.body);
      if (response.statusCode >= 400) {
        throw CareApiException(
          result['error'] ?? 'Upload could not be completed.',
          response.statusCode,
        );
      }
      return result;
    } on CareApiException {
      rethrow;
    } catch (_) {
      throw CareApiException(
        'Upload could not finish. Reconnect and try again; duplicate files reuse the existing request.',
      );
    }
  }

  Future<dynamic> request(String path, [Map<String, dynamic>? body]) async {
    final uri = Uri.parse('$base/api/$path');
    if (!isAllowedCareEndpoint(uri)) {
      throw CareApiException('A secure connection is required.');
    }
    final headers = {
      'Content-Type': 'application/json',
      'Origin': base,
      if (token != null) 'Authorization': 'Bearer $token',
    };
    try {
      final response = body == null
          ? await http
                .get(uri, headers: headers)
                .timeout(const Duration(seconds: 20))
          : await http
                .post(uri, headers: headers, body: jsonEncode(body))
                .timeout(const Duration(seconds: 20));
      dynamic result;
      try {
        result = jsonDecode(response.body);
      } catch (_) {
        throw CareApiException(
          'The care service is unavailable. Please retry.',
        );
      }
      if (response.statusCode >= 400) {
        throw CareApiException(
          result['error'] ?? 'This action could not be completed.',
          response.statusCode,
        );
      }
      return result;
    } on CareApiException {
      rethrow;
    } catch (_) {
      throw CareApiException(
        'Could not connect. Check your connection and refresh.',
      );
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:withyou_care/care_app.dart';
import 'package:withyou_care/api_client.dart';
import 'package:withyou_care/reminders.dart';
import 'package:withyou_care/server_settings.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Android signs in, loads every care tab, and signs out', (
    tester,
  ) async {
    final api = CareApiClient(apiBase);
    await expectLater(
      api.request('session', {
        'email': 'patient@withyou.test',
        'password': 'wrong-password',
      }),
      throwsA(isA<CareApiException>()),
    );
    final session = await api.request('session', {
      'email': 'patient@withyou.test',
      'password': 'WithYouDemo2026!',
    });
    api.token = session['token'];
    final workspace = await api.request('workspace');
    final task = (workspace['tasks'] as List).firstWhere(
      (task) => task['status'] == 'approved',
    );
    final originalCompletion = task['completion'];
    try {
      for (final completion in ['completed', 'skipped', 'scheduled']) {
        await api.request('tasks/${task['id']}', {'completion': completion});
        final refreshed = await api.request('workspace');
        final updated = (refreshed['tasks'] as List).firstWhere(
          (item) => item['id'] == task['id'],
        );
        expect(updated['completion'], completion);
      }
    } finally {
      await api.request('tasks/${task['id']}', {
        'completion': originalCompletion,
      });
    }
    final reminders = CareReminders();
    expect(await reminders.enable(), isTrue);
    await reminders.confirmation();
    await reminders.replaceSchedule(workspace['tasks']);
    await reminders.disable();
    expect(await reminders.plugin.pendingNotificationRequests(), isEmpty);
    final settings = CareServerSettings();
    await settings.save('http://192.168.1.82:3100');
    await tester.pumpWidget(const WithYouApp());
    await tester.pumpAndSettle();
    expect(find.text('Server: http://192.168.1.82:3100'), findsOneWidget);
    await tester.ensureVisible(find.text('Connection settings'));
    await tester.tap(find.text('Connection settings'));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('server-address')),
      apiBase,
    );
    await tester.tap(find.text('Save & check connection'));
    for (
      var attempt = 0;
      attempt < 30 && find.byType(AlertDialog).evaluate().isNotEmpty;
      attempt++
    ) {
      await tester.pump(const Duration(seconds: 1));
    }
    await tester.pumpAndSettle();
    expect(find.byType(AlertDialog), findsNothing);
    expect(await settings.load(), apiBase);
    await tester.pumpWidget(const SizedBox());
    await tester.pumpAndSettle();
    await tester.pumpWidget(const WithYouApp());
    await tester.pumpAndSettle();
    expect(find.text('Server: $apiBase'), findsOneWidget);
    await tester.enterText(
      find.byType(TextField).at(0),
      'patient@withyou.test',
    );
    await tester.enterText(find.byType(TextField).at(1), 'WithYouDemo2026!');
    await tester.ensureVisible(find.text('Sign in'));
    await tester.tap(find.text('Sign in'));
    for (
      var attempt = 0;
      attempt < 60 && find.byType(NavigationBar).evaluate().isEmpty;
      attempt++
    ) {
      await tester.pump(const Duration(seconds: 1));
    }
    await tester.pumpAndSettle();
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(tester.takeException(), isNull);
    for (final label in [
      'Schedule',
      'Reports',
      'Profile',
      'Requests',
      'Today',
    ]) {
      await tester.tap(
        find.descendant(
          of: find.byType(NavigationBar),
          matching: find.text(label),
        ),
      );
      await tester.pumpAndSettle();
      if (label == 'Reports') {
        expect(find.text('Your medical reports.'), findsOneWidget);
        await tester.ensureVisible(find.text('View approved report').first);
        await tester.tap(find.text('View approved report').first);
        await tester.pumpAndSettle();
        final heading = find.textContaining('Approved report · v');
        expect(heading, findsOneWidget);
        Navigator.of(tester.element(heading)).pop();
        await tester.pumpAndSettle();
      }
      if (label == 'Profile') {
        expect(find.text('Your care profile.'), findsOneWidget);
      }
      if (label == 'Requests') {
        expect(find.text('Choose photo or PDF'), findsOneWidget);
        final submit = tester.widget<FilledButton>(
          find.widgetWithText(FilledButton, 'Submit for review'),
        );
        expect(submit.onPressed, isNull);
      }
      expect(
        tester.takeException(),
        isNull,
        reason: '$label must render without errors',
      );
    }
    await tester.tap(find.byTooltip('Care updates'));
    await tester.pumpAndSettle();
    expect(find.byType(AlertDialog), findsOneWidget);
    await tester.tap(find.text('Close'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Sign out'));
    await tester.pumpAndSettle();
    expect(find.byType(NavigationBar), findsNothing);
    expect(find.text('Your care,\nall in one place.'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}

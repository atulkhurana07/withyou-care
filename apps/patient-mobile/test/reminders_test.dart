import 'package:flutter_test/flutter_test.dart';
import 'package:timezone/data/latest.dart' as database;
import 'package:timezone/timezone.dart' as tz;
import 'package:withyou_care/reminders.dart';

void main() {
  database.initializeTimeZones();
  final zone = tz.getLocation('Asia/Kolkata');
  final now = tz.TZDateTime(zone, 2026, 10, 13, 12);
  Map<String, dynamic> task(
    String date,
    List<String> times, {
    String completion = 'scheduled',
    String status = 'approved',
  }) => {
    'start': date,
    'times': times,
    'completion': completion,
    'status': status,
  };
  test(
    'Only approved, outstanding times in the next 24 hours are scheduled',
    () {
      final result = upcomingReminderTimes([
        task('2026-10-13', ['10:00', '12:00', '20:00']),
        task('2026-10-14', ['08:00', '12:00', '12:01']),
        task('2026-10-13', ['14:00'], completion: 'completed'),
        task('2026-10-13', ['15:00'], status: 'superseded'),
      ], now);
      expect(result.map((date) => date.hour), [20, 8, 12]);
      expect(
        result.every((date) => date.location.name == 'Asia/Kolkata'),
        isTrue,
      );
    },
  );
  test('Malformed dates and times cannot roll into another day', () {
    expect(
      upcomingReminderTimes([
        task('2026-02-30', ['14:00']),
        task('2026-10-13', ['24:00', '13:60', '1:30', 'abc']),
        {'start': null, 'times': null},
        null,
      ], now),
      isEmpty,
    );
  });
  test('Scheduling stays bounded even for oversized responses', () {
    expect(
      upcomingReminderTimes(
        List.generate(250, (_) => task('2026-10-13', ['14:00'])),
        now,
      ),
      hasLength(200),
    );
  });
}

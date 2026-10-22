import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as database;
import 'package:timezone/timezone.dart' as tz;

List<tz.TZDateTime> upcomingReminderTimes(
  List<dynamic> tasks,
  tz.TZDateTime now,
) {
  final horizon = now.add(const Duration(hours: 24));
  final upcoming = <tz.TZDateTime>[];
  for (final task in tasks) {
    if (task is! Map ||
        task['completion'] != 'scheduled' ||
        task['status'] != 'approved') {
      continue;
    }
    final dateText = task['start'];
    if (dateText is! String ||
        !RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(dateText)) {
      continue;
    }
    final date = DateTime.tryParse(dateText);
    if (date == null || date.toIso8601String().substring(0, 10) != dateText) {
      continue;
    }
    for (final time
        in (task['times'] is List ? task['times'] as List : const [])) {
      final match = RegExp(r'^(\d{2}):(\d{2})$').firstMatch(time.toString());
      if (match == null) continue;
      final hour = int.parse(match[1]!);
      final minute = int.parse(match[2]!);
      if (hour > 23 || minute > 59) continue;
      final due = tz.TZDateTime(
        now.location,
        date.year,
        date.month,
        date.day,
        hour,
        minute,
      );
      if (due.isAfter(now) && !due.isAfter(horizon)) upcoming.add(due);
    }
  }
  upcoming.sort();
  return upcoming.take(200).toList();
}

class CareReminders {
  final plugin = FlutterLocalNotificationsPlugin();
  bool enabled = false;
  bool initialized = false;
  bool get supported =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
  static const details = NotificationDetails(
    android: AndroidNotificationDetails(
      'withyou_care',
      'Care reminders',
      channelDescription:
          'Private reminders to open your current approved care plan',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      visibility: NotificationVisibility.private,
      icon: 'ic_care_notification',
    ),
  );
  Future<void> initialize() async {
    if (!supported || initialized) return;
    database.initializeTimeZones();
    await plugin.initialize(
      settings: const InitializationSettings(
        android: AndroidInitializationSettings('ic_care_notification'),
      ),
    );
    initialized = true;
  }

  Future<bool> enable() async {
    if (!supported) return false;
    await initialize();
    enabled =
        await plugin
            .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin
            >()
            ?.requestNotificationsPermission() ??
        false;
    return enabled;
  }

  Future<void> disable() async {
    enabled = false;
    if (supported && initialized) await plugin.cancelAll();
  }

  Future<int> replaceSchedule(List<dynamic> tasks) async {
    if (!supported || !enabled) return 0;
    await initialize();
    await plugin.cancelAllPendingNotifications();
    final zone = tz.getLocation('Asia/Kolkata');
    final now = tz.TZDateTime.now(zone);
    final upcoming = upcomingReminderTimes(tasks, now);
    for (var index = 0; index < upcoming.length && index < 200; index++) {
      await plugin.zonedSchedule(
        id: index + 1,
        title: 'WithYou',
        body: 'Open WithYou to view your latest care plan.',
        scheduledDate: upcoming[index],
        notificationDetails: details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
      );
    }
    return upcoming.length;
  }

  Future<void> confirmation() async {
    if (enabled) {
      await plugin.show(
        id: 0,
        title: 'WithYou',
        body:
            'Care reminders enabled. Open the app to check your current plan.',
        notificationDetails: details,
      );
    }
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:withyou_care/care_app.dart';

void main() {
  testWidgets('medical information remains behind login', (tester) async {
    await tester.pumpWidget(const WithYouApp());
    expect(find.text('Your care,\nall in one place.'), findsOneWidget);
    await tester.scrollUntilVisible(
      find.text('Sign in'),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Sign in'), findsOneWidget);
    expect(find.text('Today’s care'), findsNothing);
    expect(find.byType(NavigationBar), findsNothing);
  });
  testWidgets(
    'welcome remains usable with large text and no prefilled credentials',
    (tester) async {
      tester.platformDispatcher.textScaleFactorTestValue = 2;
      addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
      await tester.pumpWidget(const WithYouApp());
      expect(tester.takeException(), isNull);
      final fields = tester.widgetList<TextField>(find.byType(TextField));
      expect(fields.every((field) => field.controller!.text.isEmpty), isTrue);
      await tester.scrollUntilVisible(
        find.text('Sign in'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Sign in'), findsOneWidget);
    },
  );
}

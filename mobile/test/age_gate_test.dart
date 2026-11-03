import 'package:flutter_test/flutter_test.dart';
import 'package:fluito/utils/age_gate.dart';

void main() {
  test('max adult birth date is today minus 18 years', () {
    final now = DateTime(2026, 11, 3);
    expect(AgeGate.maxAdultBirthDate(now), DateTime(2008, 11, 3));
    expect(AgeGate.isAtLeast18(DateTime(2008, 11, 3), now), isTrue);
    expect(AgeGate.isAtLeast18(DateTime(2008, 11, 4), now), isFalse);
  });

  test('isoDate pads months and days', () {
    expect(AgeGate.isoDate(DateTime(1990, 1, 5)), '1990-01-05');
  });
}

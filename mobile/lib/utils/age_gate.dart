/// Client-side 18+ helpers. The API also rejects underage DOBs.
class AgeGate {
  AgeGate._();

  static const underageMessage =
      'You must be at least 18 years old to use Fluito';

  static DateTime maxAdultBirthDate([DateTime? now]) {
    final n = now ?? DateTime.now();
    return DateTime(n.year - 18, n.month, n.day);
  }

  static DateTime minBirthDate([DateTime? now]) {
    final n = now ?? DateTime.now();
    return DateTime(n.year - 100, n.month, n.day);
  }

  static DateTime suggestedInitial({DateTime? current, DateTime? now}) {
    final max = maxAdultBirthDate(now);
    final min = minBirthDate(now);
    final n = now ?? DateTime.now();
    var initial = current ?? DateTime(n.year - 25, n.month, n.day);
    if (initial.isAfter(max)) initial = max;
    if (initial.isBefore(min)) initial = min;
    return initial;
  }

  static bool isAtLeast18(DateTime dob, [DateTime? now]) {
    return !dob.isAfter(maxAdultBirthDate(now));
  }

  static String isoDate(DateTime date) {
    final y = date.year.toString().padLeft(4, '0');
    final m = date.month.toString().padLeft(2, '0');
    final d = date.day.toString().padLeft(2, '0');
    return '$y-$m-$d';
  }
}

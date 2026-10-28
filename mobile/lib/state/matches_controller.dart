import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';

class MatchesController extends ChangeNotifier {
  MatchesController({required this.api});

  final FluitoApi api;

  bool loading = false;
  int? unmatchingId;
  String? error;
  List<MatchListItem> matches = [];

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      matches = await api.getMatches();
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> unmatch(int matchId) async {
    unmatchingId = matchId;
    notifyListeners();
    try {
      await api.unmatch(matchId);
      matches.removeWhere((m) => m.matchId == matchId);
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      unmatchingId = null;
      notifyListeners();
    }
  }
}

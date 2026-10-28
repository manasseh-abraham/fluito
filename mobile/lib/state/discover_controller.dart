import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';

class DiscoverController extends ChangeNotifier {
  DiscoverController({required this.api});

  final FluitoApi api;

  bool loading = false;
  bool swiping = false;
  String? error;
  String? toast;
  bool lastSwipeMatched = false;
  List<DiscoverProfile> cards = [];

  DiscoverProfile? get current => cards.isEmpty ? null : cards.first;

  Future<void> load() async {
    loading = true;
    error = null;
    toast = null;
    notifyListeners();
    try {
      cards = await api.discover();
    } on ApiException catch (e) {
      error = e.message;
    } catch (e) {
      error = e.toString();
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> swipe(String action) async {
    final card = current;
    if (card == null || swiping) return;
    swiping = true;
    lastSwipeMatched = false;
    toast = null;
    notifyListeners();
    try {
      final result = await api.swipe(
        targetUserId: card.userId,
        action: action,
      );
      lastSwipeMatched = result.matched;
      toast = result.matched
          ? "It's a match!"
          : (action == 'like' ? 'Like sent' : 'Passed');
      cards.removeAt(0);
      if (cards.isEmpty) {
        await load();
        return;
      }
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      swiping = false;
      notifyListeners();
    }
  }

  void clearToast() {
    toast = null;
    lastSwipeMatched = false;
    notifyListeners();
  }
}

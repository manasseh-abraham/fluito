import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';

class MessagesController extends ChangeNotifier {
  MessagesController({required this.api});

  final FluitoApi api;

  bool loadingMatches = false;
  bool sending = false;
  String? error;
  List<MatchListItem> conversations = [];
  List<ChatMessage> messages = [];
  int? selectedMatchId;
  Timer? _poll;

  MatchListItem? get selected {
    if (selectedMatchId == null) return null;
    for (final item in conversations) {
      if (item.matchId == selectedMatchId) return item;
    }
    return null;
  }

  Future<void> loadConversations({int? selectMatchId}) async {
    loadingMatches = true;
    error = null;
    notifyListeners();
    try {
      conversations = await api.getMatches();
      final preferred = selectMatchId ?? selectedMatchId;
      if (preferred != null &&
          conversations.any((m) => m.matchId == preferred)) {
        await openConversation(preferred);
      } else if (conversations.isNotEmpty) {
        await openConversation(conversations.first.matchId);
      }
    } on ApiException catch (e) {
      error = e.message;
    } finally {
      loadingMatches = false;
      notifyListeners();
    }
  }

  Future<void> openConversation(int matchId) async {
    selectedMatchId = matchId;
    _poll?.cancel();
    await _refreshMessages();
    _poll = Timer.periodic(const Duration(seconds: 5), (_) {
      _refreshMessages(silent: true);
    });
  }

  Future<void> _refreshMessages({bool silent = false}) async {
    final id = selectedMatchId;
    if (id == null) return;
    try {
      messages = await api.getMessages(id);
      if (!silent) notifyListeners();
      if (silent) notifyListeners();
    } on ApiException catch (e) {
      if (!silent) {
        error = e.message;
        notifyListeners();
      }
    }
  }

  Future<bool> send(String content) async {
    final id = selectedMatchId;
    final trimmed = content.trim();
    if (id == null || trimmed.isEmpty || sending) return false;
    sending = true;
    notifyListeners();
    try {
      final sent = await api.sendMessage(id, trimmed);
      messages = [...messages, sent];
      return true;
    } on ApiException catch (e) {
      error = e.message;
      return false;
    } finally {
      sending = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }
}

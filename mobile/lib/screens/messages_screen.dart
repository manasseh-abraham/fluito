import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../state/auth_controller.dart';
import '../state/messages_controller.dart';
import '../theme/tokens.dart';
import '../widgets/glass.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key, this.initialMatchId});

  final int? initialMatchId;

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final _composer = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MessagesController>().loadConversations(
        selectMatchId: widget.initialMatchId,
      );
    });
  }

  @override
  void dispose() {
    _composer.dispose();
    super.dispose();
  }

  String _formatTime(String raw) {
    final date = DateTime.tryParse(raw);
    if (date == null) return raw;
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return DateFormat.MMMd().format(date);
  }

  @override
  Widget build(BuildContext context) {
    final messages = context.watch<MessagesController>();
    final auth = context.watch<AuthController>();
    final config = context.watch<AppConfig>();
    final palette = auth.palette;
    final me = auth.api.currentUserId ?? auth.profile?.userId;

    return Column(
      children: [
        const PageHeader(title: 'Messages'),
        SizedBox(
          height: 96,
          child: messages.loadingMatches
              ? const Center(child: CircularProgressIndicator())
              : messages.conversations.isEmpty
                  ? const Center(
                      child: Text(
                        'No matches yet',
                        style: TextStyle(color: FluitoTokens.textSecondary),
                      ),
                    )
                  : ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: messages.conversations.length,
                      separatorBuilder: (_, _) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final item = messages.conversations[index];
                        final selected =
                            item.matchId == messages.selectedMatchId;
                        return GestureDetector(
                          onTap: () =>
                              messages.openConversation(item.matchId),
                          child: GlassSurface(
                            borderRadius: 16,
                            padding: const EdgeInsets.all(10),
                            highlighted: selected,
                            shadows: const [],
                            child: SizedBox(
                              width: 88,
                              child: Column(
                                children: [
                                  ProfilePhoto(
                                    url: (item.profilePictureUrl == null ||
                                            item.profilePictureUrl!.isEmpty)
                                        ? null
                                        : config.resolveMedia(
                                            item.profilePictureUrl,
                                          ),
                                    size: 44,
                                    palette: palette,
                                    fallback: const Text('💑'),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    item.firstName,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: GlassCard(
              padding: EdgeInsets.zero,
              child: messages.selectedMatchId == null
                  ? const Center(
                      child: Text(
                        'Select a match to start chatting',
                        style: TextStyle(color: FluitoTokens.textSecondary),
                      ),
                    )
                  : Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
                          child: Text(
                            messages.selected?.displayName ?? 'Chat',
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        const Divider(height: 1, color: FluitoTokens.glassBorder),
                        Expanded(
                          child: messages.messages.isEmpty
                              ? const Center(
                                  child: Text(
                                    'No messages yet\nStart the conversation!',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: FluitoTokens.textSecondary,
                                    ),
                                  ),
                                )
                              : ListView.builder(
                                  padding: const EdgeInsets.all(16),
                                  itemCount: messages.messages.length,
                                  itemBuilder: (context, index) {
                                    final msg = messages.messages[index];
                                    final mine = msg.senderId == me;
                                    final showTime = index == 0 ||
                                        _gap(messages.messages[index - 1].createdAt, msg.createdAt);
                                    return Column(
                                      children: [
                                        if (showTime)
                                          Padding(
                                            padding: const EdgeInsets.symmetric(
                                              vertical: 8,
                                            ),
                                            child: Text(
                                              _formatTime(msg.createdAt),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color:
                                                    FluitoTokens.textSecondary,
                                              ),
                                            ),
                                          ),
                                        Align(
                                          alignment: mine
                                              ? Alignment.centerRight
                                              : Alignment.centerLeft,
                                          child: Container(
                                            constraints: BoxConstraints(
                                              maxWidth:
                                                  MediaQuery.sizeOf(context)
                                                          .width *
                                                      0.7,
                                            ),
                                            margin: const EdgeInsets.only(
                                              bottom: 8,
                                            ),
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 16,
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              borderRadius:
                                                  BorderRadius.circular(16),
                                              gradient: mine
                                                  ? LinearGradient(
                                                      colors: [
                                                        palette.primary,
                                                        palette.primaryLight,
                                                      ],
                                                    )
                                                  : null,
                                              color: mine
                                                  ? null
                                                  : FluitoTokens.glassInputFill,
                                            ),
                                            child: Text(
                                              msg.content,
                                              style: TextStyle(
                                                color: mine
                                                    ? Colors.white
                                                    : FluitoTokens.textPrimary,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    );
                                  },
                                ),
                        ),
                        const Divider(height: 1, color: FluitoTokens.glassBorder),
                        Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Expanded(
                                child: GlassField(
                                  controller: _composer,
                                  hint: 'Type a message…',
                                  textInputAction: TextInputAction.send,
                                  textCapitalization:
                                      TextCapitalization.sentences,
                                  onSubmitted: (value) async {
                                    final ok = await messages.send(value);
                                    if (ok) _composer.clear();
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              GlassButton(
                                label: messages.sending ? '…' : 'Send',
                                expand: false,
                                busy: messages.sending,
                                palette: palette,
                                onPressed: messages.sending
                                    ? null
                                    : () async {
                                        final ok = await messages.send(
                                          _composer.text,
                                        );
                                        if (ok) _composer.clear();
                                      },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  bool _gap(String previous, String current) {
    final a = DateTime.tryParse(previous);
    final b = DateTime.tryParse(current);
    if (a == null || b == null) return false;
    return b.difference(a).inMinutes > 5;
  }
}

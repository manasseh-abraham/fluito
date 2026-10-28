import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../state/auth_controller.dart';
import '../state/matches_controller.dart';
import '../theme/tokens.dart';
import '../widgets/glass.dart';

class MatchesScreen extends StatefulWidget {
  const MatchesScreen({super.key, required this.onOpenChat});

  final ValueChanged<int> onOpenChat;

  @override
  State<MatchesScreen> createState() => _MatchesScreenState();
}

class _MatchesScreenState extends State<MatchesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MatchesController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final matches = context.watch<MatchesController>();
    final config = context.watch<AppConfig>();
    final palette = context.watch<AuthController>().palette;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Text(
            'Your Matches',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          ),
        ),
        Expanded(
          child: matches.loading
              ? const Center(child: CircularProgressIndicator())
              : matches.matches.isEmpty
                  ? const Padding(
                      padding: EdgeInsets.all(16),
                      child: EmptyState(
                        icon: Icons.favorite_outline,
                        message: 'No matches yet. Start swiping to find your match!',
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      itemCount: matches.matches.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 16),
                      itemBuilder: (context, index) {
                        final item = matches.matches[index];
                        return GlassCard(
                          onTap: () => widget.onOpenChat(item.matchId),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  ProfilePhoto(
                                    url: (item.profilePictureUrl == null ||
                                            item.profilePictureUrl!.isEmpty)
                                        ? null
                                        : config.resolveMedia(
                                            item.profilePictureUrl,
                                          ),
                                    width: double.infinity,
                                    height: 200,
                                    borderRadius: BorderRadius.circular(16),
                                    palette: palette,
                                    fallback: const Text(
                                      '💑',
                                      style: TextStyle(fontSize: 64),
                                    ),
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: Material(
                                      color: const Color.fromRGBO(
                                        255,
                                        59,
                                        48,
                                        0.2,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        side: const BorderSide(
                                          color: Color.fromRGBO(
                                            255,
                                            59,
                                            48,
                                            0.4,
                                          ),
                                        ),
                                      ),
                                      child: InkWell(
                                        onTap: matches.unmatchingId ==
                                                item.matchId
                                            ? null
                                            : () => matches.unmatch(
                                                item.matchId,
                                              ),
                                        child: Padding(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          child: Text(
                                            matches.unmatchingId == item.matchId
                                                ? '…'
                                                : '✕',
                                            style: const TextStyle(
                                              color: FluitoTokens.danger,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                item.displayName,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              if (item.locationLabel.isNotEmpty)
                                Text(
                                  '📍 ${item.locationLabel}',
                                  style: const TextStyle(
                                    color: FluitoTokens.textSecondary,
                                  ),
                                ),
                              if (item.bio != null && item.bio!.isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 6),
                                  child: Text(
                                    item.bio!,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: FluitoTokens.textSecondary,
                                      fontSize: 14,
                                      height: 1.4,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}

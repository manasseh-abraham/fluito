import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../state/auth_controller.dart';
import '../state/discover_controller.dart';
import '../theme/tokens.dart';
import '../widgets/glass.dart';

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key, required this.onMatched});

  final VoidCallback onMatched;

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DiscoverController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final discover = context.watch<DiscoverController>();
    final auth = context.watch<AuthController>();
    final config = context.watch<AppConfig>();
    final palette = auth.palette;
    final card = discover.current;

    if (discover.toast != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) return;
        final text = discover.toast;
        final matched = discover.lastSwipeMatched;
        discover.clearToast();
        if (text == null) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(text),
            backgroundColor: matched
                ? FluitoTokens.success
                : palette.primary,
          ),
        );
        if (matched) {
          Future<void>.delayed(const Duration(seconds: 1), widget.onMatched);
        }
      });
    }

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              const Text(
                'Discover Matches',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
              ),
              const Spacer(),
              IconButton(
                onPressed: discover.loading ? null : discover.load,
                icon: const Icon(Icons.refresh_rounded),
              ),
            ],
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: discover.loading && card == null
                ? const Center(child: CircularProgressIndicator())
                : card == null
                    ? const EmptyState(
                        icon: Icons.favorite_outline,
                        message: 'No more matches available. Check back later!',
                      )
                    : Column(
                        children: [
                          Expanded(
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: LayoutBuilder(
                                      builder: (context, constraints) {
                                        final side = constraints.maxWidth;
                                        return ProfilePhoto(
                                          url: (card.profilePictureUrl ==
                                                      null ||
                                                  card.profilePictureUrl!
                                                      .isEmpty)
                                              ? null
                                              : config.resolveMedia(
                                                  card.profilePictureUrl,
                                                ),
                                          size: side,
                                          borderRadius:
                                              BorderRadius.circular(16),
                                          palette: palette,
                                          fallback: Text(
                                            card.gender == 'female'
                                                ? '👩'
                                                : '👨',
                                            style:
                                                const TextStyle(fontSize: 80),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    card.displayName,
                                    style: const TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                  Text(
                                    '${card.age} years old',
                                    style: const TextStyle(
                                      color: FluitoTokens.textSecondary,
                                      fontSize: 18,
                                    ),
                                  ),
                                  if (card.locationCity != null &&
                                      card.locationCity!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        '📍 ${card.locationCity}${card.locationState != null ? ', ${card.locationState}' : ''}',
                                        style: const TextStyle(
                                          color: FluitoTokens.textSecondary,
                                        ),
                                      ),
                                    ),
                                  if (card.denomination != null &&
                                      card.denomination!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 6),
                                      child: Text(
                                        '⛪ ${card.denomination}',
                                        style: const TextStyle(
                                          color: FluitoTokens.textSecondary,
                                        ),
                                      ),
                                    ),
                                  if (card.churchName != null &&
                                      card.churchName!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: Text(
                                        card.churchName!,
                                        style: const TextStyle(
                                          color: FluitoTokens.textSecondary,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  if (card.bio != null && card.bio!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 10),
                                      child: Text(
                                        card.bio!,
                                        maxLines: 4,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(height: 1.5),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _SwipeButton(
                                  label: '✕',
                                  color: FluitoTokens.danger,
                                  fill: const Color.fromRGBO(255, 59, 48, 0.2),
                                  border: const Color.fromRGBO(255, 59, 48, 0.4),
                                  onTap: discover.swiping
                                      ? null
                                      : () => discover.swipe('reject'),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: _SwipeButton(
                                  label: '❤',
                                  color: FluitoTokens.success,
                                  fill: const Color.fromRGBO(52, 199, 89, 0.2),
                                  border: const Color.fromRGBO(52, 199, 89, 0.4),
                                  onTap: discover.swiping
                                      ? null
                                      : () => discover.swipe('like'),
                                ),
                              ),
                            ],
                          ),
                          if (discover.error != null) ...[
                            const SizedBox(height: 8),
                            GlassMessage(text: discover.error!),
                          ],
                        ],
                      ),
          ),
        ),
      ],
    );
  }
}

class _SwipeButton extends StatelessWidget {
  const _SwipeButton({
    required this.label,
    required this.color,
    required this.fill,
    required this.border,
    required this.onTap,
  });

  final String label;
  final Color color;
  final Color fill;
  final Color border;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: fill,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: border, width: 2),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: SizedBox(
          height: 56,
          child: Center(
            child: Text(label, style: TextStyle(fontSize: 28, color: color)),
          ),
        ),
      ),
    );
  }
}

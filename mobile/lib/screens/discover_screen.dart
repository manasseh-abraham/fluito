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
            backgroundColor: matched ? FluitoTokens.success : palette.primary,
          ),
        );
        if (matched) {
          Future<void>.delayed(const Duration(seconds: 1), widget.onMatched);
        }
      });
    }

    return Column(
      children: [
        PageHeader(
          title: 'Discover',
          trailing: IconButton(
            onPressed: discover.loading ? null : discover.load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: discover.loading && card == null
                ? const Center(child: CircularProgressIndicator())
                : card == null
                    ? const EmptyState(
                        icon: Icons.favorite_outline,
                        message:
                            'No more matches available. Check back later!',
                      )
                    : Column(
                        children: [
                          Expanded(
                            child: GlassCard(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(18),
                                      child: Stack(
                                        fit: StackFit.expand,
                                        children: [
                                          ProfilePhoto(
                                            url: (card.profilePictureUrl ==
                                                        null ||
                                                    card.profilePictureUrl!
                                                        .isEmpty)
                                                ? null
                                                : config.resolveMedia(
                                                    card.profilePictureUrl,
                                                  ),
                                            width: double.infinity,
                                            height: double.infinity,
                                            borderRadius:
                                                BorderRadius.circular(18),
                                            palette: palette,
                                            fallback: Text(
                                              card.gender == 'female'
                                                  ? '👩'
                                                  : '👨',
                                              style:
                                                  const TextStyle(fontSize: 80),
                                            ),
                                          ),
                                          const DecoratedBox(
                                            decoration: BoxDecoration(
                                              gradient: LinearGradient(
                                                begin: Alignment.topCenter,
                                                end: Alignment.bottomCenter,
                                                colors: [
                                                  Colors.transparent,
                                                  Colors.transparent,
                                                  Color(0x99000000),
                                                ],
                                                stops: [0, 0.45, 1],
                                              ),
                                            ),
                                          ),
                                          Positioned(
                                            left: 16,
                                            right: 16,
                                            bottom: 16,
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  card.age > 0
                                                      ? '${card.displayName}, ${card.age}'
                                                      : card.displayName,
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 26,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                if (card.locationCity !=
                                                        null &&
                                                    card.locationCity!
                                                        .isNotEmpty)
                                                  Text(
                                                    '${card.locationCity}${card.locationState != null ? ', ${card.locationState}' : ''}',
                                                    style: const TextStyle(
                                                      color: Colors.white70,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  if (card.denomination != null &&
                                      card.denomination!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                        8,
                                        12,
                                        8,
                                        0,
                                      ),
                                      child: Text(
                                        '⛪ ${card.denomination}${card.churchName != null && card.churchName!.isNotEmpty ? ' · ${card.churchName}' : ''}',
                                        style: const TextStyle(
                                          color: FluitoTokens.textSecondary,
                                        ),
                                      ),
                                    ),
                                  if (card.bio != null && card.bio!.isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                        8,
                                        6,
                                        8,
                                        4,
                                      ),
                                      child: Text(
                                        card.bio!,
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(height: 1.4),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              _RoundAction(
                                icon: Icons.close_rounded,
                                color: FluitoTokens.danger,
                                fill: const Color.fromRGBO(255, 59, 48, 0.14),
                                onTap: discover.swiping
                                    ? null
                                    : () => discover.swipe('reject'),
                              ),
                              const SizedBox(width: 28),
                              _RoundAction(
                                icon: Icons.favorite_rounded,
                                color: FluitoTokens.success,
                                fill: const Color.fromRGBO(52, 199, 89, 0.16),
                                onTap: discover.swiping
                                    ? null
                                    : () => discover.swipe('like'),
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

class _RoundAction extends StatelessWidget {
  const _RoundAction({
    required this.icon,
    required this.color,
    required this.fill,
    required this.onTap,
  });

  final IconData icon;
  final Color color;
  final Color fill;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: fill,
      shape: CircleBorder(side: BorderSide(color: color.withValues(alpha: 0.4))),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onTap,
        child: SizedBox(
          width: 64,
          height: 64,
          child: Icon(icon, color: color, size: 30),
        ),
      ),
    );
  }
}

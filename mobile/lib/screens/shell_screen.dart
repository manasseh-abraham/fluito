import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_controller.dart';
import '../widgets/glass.dart';
import 'discover_screen.dart';
import 'matches_screen.dart';
import 'messages_screen.dart';
import 'profile_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key});

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int _index = 0;
  int? _chatMatchId;

  @override
  Widget build(BuildContext context) {
    final palette = context.watch<AuthController>().palette;
    return Column(
      children: [
        GlassAppBar(
          title: 'Fluito',
          actions: [
            IconButton(
              tooltip: 'Log out',
              onPressed: () => context.read<AuthController>().logout(),
              icon: const Icon(
                Icons.logout_rounded,
                color: Color(0xFFFF3B30),
                size: 20,
              ),
            ),
          ],
        ),
        Expanded(
          child: IndexedStack(
            index: _index,
            children: [
              DiscoverScreen(
                onMatched: () => setState(() => _index = 1),
              ),
              MatchesScreen(
                onOpenChat: (matchId) {
                  setState(() {
                    _chatMatchId = matchId;
                    _index = 2;
                  });
                },
              ),
              MessagesScreen(
                key: ValueKey(_chatMatchId),
                initialMatchId: _chatMatchId,
              ),
              const ProfileScreen(),
            ],
          ),
        ),
        GlassNavBar(
          currentIndex: _index,
          onSelect: (i) => setState(() => _index = i),
          primary: palette.primary,
        ),
      ],
    );
  }
}

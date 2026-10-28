import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/app_config.dart';
import 'screens/auth_screen.dart';
import 'screens/shell_screen.dart';
import 'services/fluito_api.dart';
import 'state/auth_controller.dart';
import 'state/discover_controller.dart';
import 'state/matches_controller.dart';
import 'state/messages_controller.dart';
import 'state/profile_controller.dart';
import 'theme/app_theme.dart';
import 'widgets/glass.dart';

class FluitoApp extends StatelessWidget {
  const FluitoApp({
    super.key,
    required this.config,
    required this.api,
  });

  final AppConfig config;
  final FluitoApi api;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AppConfig>.value(value: config),
        Provider<FluitoApi>.value(value: api),
        ChangeNotifierProvider(
          create: (_) => AuthController(api: api)..restore(),
        ),
        ChangeNotifierProvider(create: (_) => DiscoverController(api: api)),
        ChangeNotifierProvider(create: (_) => MatchesController(api: api)),
        ChangeNotifierProvider(create: (_) => MessagesController(api: api)),
        ChangeNotifierProvider(create: (_) => ProfileController(api: api)),
      ],
      child: const _FluitoRoot(),
    );
  }
}

class _FluitoRoot extends StatelessWidget {
  const _FluitoRoot();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final config = context.watch<AppConfig>();
    final palette = auth.palette;

    return MaterialApp(
      title: config.isDev ? 'Fluito Dev' : 'Fluito',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.of(palette),
      home: GlassBackground(
        palette: palette,
        child: Scaffold(
          backgroundColor: Colors.transparent,
          resizeToAvoidBottomInset: true,
          body: Stack(
            children: [
              Positioned.fill(
                child: auth.booting
                    ? const Center(child: CircularProgressIndicator())
                    : auth.isAuthenticated
                    ? const ShellScreen()
                    : const AuthScreen(),
              ),
              if (config.isDev)
                Positioned(
                  top: 8,
                  left: 0,
                  right: 0,
                  child: SafeArea(
                    bottom: false,
                    child: IgnorePointer(
                      child: Center(child: DevApiBanner(config: config)),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../theme/tokens.dart';
import '../utils/open_url.dart';

class LegalLinks extends StatelessWidget {
  const LegalLinks({super.key, this.alignment = WrapAlignment.center});

  final WrapAlignment alignment;

  @override
  Widget build(BuildContext context) {
    final config = context.watch<AppConfig>();
    return Wrap(
      alignment: alignment,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        _Link(
          label: 'Privacy Policy',
          onTap: () => openExternalUrl(config.privacyUrl),
        ),
        const Text(
          '  ·  ',
          style: TextStyle(color: FluitoTokens.textSecondary),
        ),
        _Link(
          label: 'Terms of Service',
          onTap: () => openExternalUrl(config.termsUrl),
        ),
      ],
    );
  }
}

class _Link extends StatelessWidget {
  const _Link({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(
        label,
        style: const TextStyle(
          color: FluitoTokens.primary,
          fontWeight: FontWeight.w600,
          fontSize: 13,
        ),
      ),
    );
  }
}

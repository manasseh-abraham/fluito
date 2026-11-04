import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import 'glass.dart';

const reportReasons = <(String, String)>[
  ('harassment', 'Harassment'),
  ('fake_profile', 'Fake profile'),
  ('inappropriate_content', 'Inappropriate content'),
  ('spam', 'Spam'),
  ('underage', 'Underage'),
  ('other', 'Other'),
];

Future<bool> confirmDestructive(
  BuildContext context, {
  required String title,
  required String body,
  String confirmLabel = 'Confirm',
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: Text(title),
        content: Text(body),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: FluitoTokens.danger),
            child: Text(confirmLabel),
          ),
        ],
      );
    },
  );
  return result == true;
}

Future<void> showSafetyActions(
  BuildContext context, {
  required String displayName,
  required Future<void> Function() onBlock,
  required Future<void> Function(String reason, String? details) onReport,
}) {
  return showModalBottomSheet<void>(
    context: context,
    backgroundColor: Colors.transparent,
    builder: (sheetContext) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        child: GlassCard(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                displayName,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.block, color: FluitoTokens.danger),
                title: const Text('Block'),
                subtitle: const Text('Hide them from Discover and messages'),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  if (!context.mounted) return;
                  final ok = await confirmDestructive(
                    context,
                    title: 'Block $displayName?',
                    body: 'They will disappear from Discover, Matches, and chat. You cannot undo this from the app besides staying blocked.',
                    confirmLabel: 'Block',
                  );
                  if (ok) await onBlock();
                },
              ),
              ListTile(
                leading: const Icon(
                  Icons.flag_outlined,
                  color: FluitoTokens.danger,
                ),
                title: const Text('Report'),
                subtitle: const Text('Tell us why — this also blocks them'),
                onTap: () async {
                  Navigator.pop(sheetContext);
                  if (!context.mounted) return;
                  final picked = await pickReportReason(context);
                  if (picked == null) return;
                  if (!context.mounted) return;
                  final ok = await confirmDestructive(
                    context,
                    title: 'Report $displayName?',
                    body: 'We will store this report and block them so they no longer appear for you.',
                    confirmLabel: 'Report & block',
                  );
                  if (ok) await onReport(picked.$1, picked.$2);
                },
              ),
            ],
          ),
        ),
      );
    },
  );
}

Future<(String, String?)?> pickReportReason(BuildContext context) {
  String selected = reportReasons.first.$1;
  final details = TextEditingController();
  return showDialog<(String, String?)>(
    context: context,
    builder: (dialogContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Why are you reporting?'),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (final reason in reportReasons)
                    ListTile(
                      dense: true,
                      title: Text(reason.$2),
                      leading: Icon(
                        selected == reason.$1
                            ? Icons.radio_button_checked
                            : Icons.radio_button_off,
                        color: FluitoTokens.primary,
                      ),
                      onTap: () => setState(() => selected = reason.$1),
                    ),
                  if (selected == 'other')
                    TextField(
                      controller: details,
                      maxLines: 3,
                      maxLength: 500,
                      decoration: const InputDecoration(
                        hintText: 'Optional details',
                      ),
                    ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(dialogContext, (
                    selected,
                    details.text.trim().isEmpty ? null : details.text.trim(),
                  ));
                },
                child: const Text('Continue'),
              ),
            ],
          );
        },
      );
    },
  );
}

import 'package:flutter/material.dart';

import '../theme/tokens.dart';
import '../utils/age_gate.dart';

class DobPickerTile extends StatelessWidget {
  const DobPickerTile({super.key, required this.value, required this.onPicked});

  final DateTime? value;
  final ValueChanged<DateTime> onPicked;

  Future<void> _pick(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: AgeGate.suggestedInitial(current: value),
      firstDate: AgeGate.minBirthDate(),
      lastDate: AgeGate.maxAdultBirthDate(),
      helpText: 'You must be 18 or older',
    );
    if (picked != null) onPicked(picked);
  }

  @override
  Widget build(BuildContext context) {
    final label = value == null ? 'Date of birth' : AgeGate.isoDate(value!);
    return Material(
      color: FluitoTokens.glassInputFill,
      borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
      child: InkWell(
        borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
        onTap: () => _pick(context),
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
            border: Border.all(color: FluitoTokens.glassBorder),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.cake_outlined,
                size: 18,
                color: FluitoTokens.textSecondary,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: value == null
                        ? FluitoTokens.textSecondary
                        : FluitoTokens.textPrimary,
                    fontSize: 15,
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

class GenderSelect extends StatelessWidget {
  const GenderSelect({super.key, required this.value, required this.onChanged});

  final String? value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: FluitoTokens.glassInputFill,
        borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
        border: Border.all(color: FluitoTokens.glassBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: value,
          borderRadius: BorderRadius.circular(12),
          hint: const Text(
            'Gender',
            style: TextStyle(color: FluitoTokens.textSecondary),
          ),
          items: const [
            DropdownMenuItem(value: 'male', child: Text('Male')),
            DropdownMenuItem(value: 'female', child: Text('Female')),
          ],
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}

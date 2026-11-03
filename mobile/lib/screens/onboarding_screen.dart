import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_controller.dart';
import '../theme/tokens.dart';
import '../utils/age_gate.dart';
import '../widgets/glass.dart';
import '../widgets/legal_links.dart';
import '../widgets/profile_fields.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  DateTime? _dob;
  String? _gender;
  String? _localError;
  bool _hydrated = false;

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    super.dispose();
  }

  void _hydrate(AuthController auth) {
    if (_hydrated) return;
    final profile = auth.profile;
    if (profile == null) return;
    _first.text = profile.firstName;
    _last.text = profile.lastName;
    _gender = profile.gender == 'male' || profile.gender == 'female'
        ? profile.gender
        : null;
    _dob = DateTime.tryParse(profile.dateOfBirth);
    _hydrated = true;
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    setState(() => _localError = null);
    if (_first.text.trim().isEmpty || _last.text.trim().isEmpty) {
      setState(() => _localError = 'Please enter your first and last name');
      return;
    }
    if (_dob == null || _gender == null) {
      setState(
        () => _localError = 'Date of birth and gender are required to continue',
      );
      return;
    }
    if (!AgeGate.isAtLeast18(_dob!)) {
      setState(() => _localError = AgeGate.underageMessage);
      return;
    }
    await context.read<AuthController>().completeOnboarding({
      'first_name': _first.text.trim(),
      'last_name': _last.text.trim(),
      'date_of_birth': AgeGate.isoDate(_dob!),
      'gender': _gender,
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    _hydrate(auth);
    final error = _localError ?? auth.error;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return SafeArea(
      child: Center(
        child: ListView(
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: EdgeInsets.fromLTRB(20, 12, 20, 24 + bottomInset),
          children: [
            const SizedBox(height: 12),
            const GradientWordmark(fontSize: 36),
            const SizedBox(height: 8),
            const Text(
              'Complete your profile',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.3,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Fluito needs your date of birth and gender before Discover. You must be 18 or older.',
              textAlign: TextAlign.center,
              style: TextStyle(color: FluitoTokens.textSecondary, fontSize: 15),
            ),
            const SizedBox(height: 24),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: GlassField(
                          controller: _first,
                          hint: 'First name',
                          prefixIcon: Icons.person_outline,
                          textCapitalization: TextCapitalization.words,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GlassField(
                          controller: _last,
                          hint: 'Last name',
                          textCapitalization: TextCapitalization.words,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: DobPickerTile(
                          value: _dob,
                          onPicked: (value) => setState(() => _dob = value),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: GenderSelect(
                          value: _gender,
                          onChanged: (value) => setState(() => _gender = value),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Must be 18+. Date of birth cannot be in the last 18 years.',
                    style: TextStyle(
                      fontSize: 12,
                      color: FluitoTokens.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 20),
                  GlassButton(
                    label: auth.busy ? 'Saving…' : 'Save and continue',
                    busy: auth.busy,
                    onPressed: auth.busy ? null : _submit,
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: auth.busy ? null : auth.logout,
                    child: const Text('Log out'),
                  ),
                  if (error != null && error.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    GlassMessage(text: error),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            const LegalLinks(),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_controller.dart';
import '../theme/tokens.dart';
import '../utils/age_gate.dart';
import '../widgets/glass.dart';
import '../widgets/legal_links.dart';
import '../widgets/profile_fields.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _login = true;
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _firstFocus = FocusNode();
  final _lastFocus = FocusNode();
  DateTime? _dob;
  String? _gender;
  String? _localError;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _first.dispose();
    _last.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _firstFocus.dispose();
    _lastFocus.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    setState(() => _localError = null);
    final auth = context.read<AuthController>();
    if (_login) {
      await auth.login(_email.text.trim(), _password.text);
      return;
    }
    if (_first.text.trim().isEmpty ||
        _last.text.trim().isEmpty ||
        _email.text.trim().isEmpty ||
        _password.text.isEmpty ||
        _dob == null ||
        _gender == null) {
      setState(() => _localError = 'Please fill in all required fields');
      return;
    }
    if (_password.text.length < 8) {
      setState(
        () => _localError = 'Password must be at least 8 characters long',
      );
      return;
    }
    if (!AgeGate.isAtLeast18(_dob!)) {
      setState(() => _localError = AgeGate.underageMessage);
      return;
    }
    final dob = AgeGate.isoDate(_dob!);
    await auth.register(
      email: _email.text.trim(),
      password: _password.text,
      firstName: _first.text.trim(),
      lastName: _last.text.trim(),
      dateOfBirth: dob,
      gender: _gender!,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final error = _localError ?? auth.error;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return SafeArea(
      child: Center(
        child: AutofillGroup(
          child: ListView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: EdgeInsets.fromLTRB(20, 12, 20, 24 + bottomInset),
            children: [
              const SizedBox(height: 12),
              Center(
                child: Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [FluitoTokens.primary, FluitoTokens.primaryLight],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: FluitoTokens.primary.withValues(alpha: 0.28),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'F',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 30,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const GradientWordmark(fontSize: 40),
              const SizedBox(height: 6),
              const Text(
                'Find your God-fearing partner',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: FluitoTokens.textSecondary,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 24),
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      _login ? 'Welcome back' : 'Create account',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    if (!_login) ...[
                      Row(
                        children: [
                          Expanded(
                            child: GlassField(
                              controller: _first,
                              focusNode: _firstFocus,
                              hint: 'First name',
                              prefixIcon: Icons.person_outline,
                              textCapitalization: TextCapitalization.words,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.givenName],
                              onSubmitted: (_) => _lastFocus.requestFocus(),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: GlassField(
                              controller: _last,
                              focusNode: _lastFocus,
                              hint: 'Last name',
                              textCapitalization: TextCapitalization.words,
                              textInputAction: TextInputAction.next,
                              autofillHints: const [AutofillHints.familyName],
                              onSubmitted: (_) => _emailFocus.requestFocus(),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                    ],
                    GlassField(
                      controller: _email,
                      focusNode: _emailFocus,
                      hint: 'Email',
                      prefixIcon: Icons.mail_outline_rounded,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      autofillHints: const [
                        AutofillHints.email,
                        AutofillHints.username,
                      ],
                      autocorrect: false,
                      enableSuggestions: false,
                      onSubmitted: (_) => _passwordFocus.requestFocus(),
                    ),
                    const SizedBox(height: 14),
                    GlassField(
                      controller: _password,
                      focusNode: _passwordFocus,
                      hint: _login ? 'Password' : 'Password (min 8 characters)',
                      prefixIcon: Icons.lock_outline_rounded,
                      obscure: true,
                      keyboardType: TextInputType.visiblePassword,
                      textInputAction: TextInputAction.done,
                      autofillHints: const [AutofillHints.password],
                      autocorrect: false,
                      enableSuggestions: false,
                      onSubmitted: (_) => _submit(),
                    ),
                    if (!_login) ...[
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: DobPickerTile(
                              value: _dob,
                              onPicked: (v) => setState(() => _dob = v),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: GenderSelect(
                              value: _gender,
                              onChanged: (v) => setState(() => _gender = v),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'You must be 18 or older.',
                        style: TextStyle(
                          fontSize: 12,
                          color: FluitoTokens.textSecondary,
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    GlassButton(
                      label: _login
                          ? (auth.busy ? 'Signing in…' : 'Sign In')
                          : (auth.busy
                                ? 'Creating account…'
                                : 'Create Account'),
                      busy: auth.busy,
                      onPressed: auth.busy ? null : _submit,
                    ),
                    if (auth.googleEnabled) ...[
                      const SizedBox(height: 14),
                      const _OrDivider(),
                      const SizedBox(height: 14),
                      GlassButton(
                        label: 'Continue with Google',
                        outlined: true,
                        busy: auth.busy,
                        icon: const _GoogleMark(),
                        onPressed: auth.busy
                            ? null
                            : () => context
                                  .read<AuthController>()
                                  .continueWithGoogle(),
                      ),
                    ],
                    const SizedBox(height: 16),
                    Wrap(
                      alignment: WrapAlignment.center,
                      children: [
                        Text(
                          _login
                              ? "Don't have an account? "
                              : 'Already have an account? ',
                          style: const TextStyle(
                            color: FluitoTokens.textSecondary,
                          ),
                        ),
                        GestureDetector(
                          onTap: () => setState(() {
                            _login = !_login;
                            _localError = null;
                          }),
                          child: Text(
                            _login ? 'Sign Up' : 'Sign In',
                            style: const TextStyle(
                              color: FluitoTokens.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    if (error != null && error.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      GlassMessage(text: error),
                    ],
                    const SizedBox(height: 16),
                    const LegalLinks(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider(color: FluitoTokens.glassBorder)),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'or',
            style: TextStyle(color: FluitoTokens.textSecondary, fontSize: 13),
          ),
        ),
        const Expanded(child: Divider(color: FluitoTokens.glassBorder)),
      ],
    );
  }
}

/// Simple Google "G" mark — no network image, no BackdropFilter.
class _GoogleMark extends StatelessWidget {
  const _GoogleMark();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 20,
      height: 20,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: const Color(0xFFDADCE0)),
      ),
      child: const Text(
        'G',
        style: TextStyle(
          color: Color(0xFF4285F4),
          fontWeight: FontWeight.w800,
          fontSize: 13,
          height: 1,
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/auth_controller.dart';
import '../theme/tokens.dart';
import '../widgets/glass.dart';

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
  DateTime? _dob;
  String? _gender;
  String? _localError;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    _first.dispose();
    _last.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
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
      setState(() => _localError = 'Password must be at least 8 characters long');
      return;
    }
    final dob =
        '${_dob!.year.toString().padLeft(4, '0')}-${_dob!.month.toString().padLeft(2, '0')}-${_dob!.day.toString().padLeft(2, '0')}';
    await auth.register(
      email: _email.text.trim(),
      password: _password.text,
      firstName: _first.text.trim(),
      lastName: _last.text.trim(),
      dateOfBirth: dob,
      gender: _gender!,
    );
  }

  Future<void> _pickDob() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 25),
      firstDate: DateTime(now.year - 100),
      lastDate: DateTime(now.year - 18),
    );
    if (picked != null) setState(() => _dob = picked);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final error = _localError ?? auth.error;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 450),
          child: GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const GradientWordmark(),
                const SizedBox(height: 8),
                const Text(
                  'Find your God-fearing partner',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: FluitoTokens.textSecondary,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 28),
                Text(
                  _login ? 'Welcome Back' : 'Create Account',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 24),
                if (!_login) ...[
                  Row(
                    children: [
                      Expanded(
                        child: GlassField(controller: _first, hint: 'First Name'),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: GlassField(controller: _last, hint: 'Last Name'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                ],
                GlassField(
                  controller: _email,
                  hint: 'Email',
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                ),
                const SizedBox(height: 16),
                GlassField(
                  controller: _password,
                  hint: _login ? 'Password' : 'Password (min 8 characters)',
                  obscure: true,
                  textInputAction: TextInputAction.done,
                ),
                if (!_login) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: _DobButton(
                          dob: _dob,
                          onTap: _pickDob,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: _GenderSelect(
                          value: _gender,
                          onChanged: (v) => setState(() => _gender = v),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 20),
                GlassButton(
                  label: _login
                      ? (auth.loading ? 'Signing in...' : 'Sign In')
                      : (auth.loading ? 'Creating account...' : 'Create Account'),
                  busy: auth.loading,
                  onPressed: auth.loading ? null : _submit,
                ),
                const SizedBox(height: 20),
                Wrap(
                  alignment: WrapAlignment.center,
                  children: [
                    Text(
                      _login
                          ? "Don't have an account? "
                          : 'Already have an account? ',
                      style: const TextStyle(color: FluitoTokens.textSecondary),
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
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                if (error != null && error.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  GlassMessage(text: error),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DobButton extends StatelessWidget {
  const _DobButton({required this.dob, required this.onTap});

  final DateTime? dob;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final label = dob == null
        ? 'Date of birth'
        : '${dob!.year}-${dob!.month.toString().padLeft(2, '0')}-${dob!.day.toString().padLeft(2, '0')}';
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: BackdropFilter(
          filter: FluitoTokens.inputBackdropFilter,
          child: Container(
            height: 52,
            padding: const EdgeInsets.symmetric(horizontal: 18),
            decoration: BoxDecoration(
              color: FluitoTokens.glassInputFill,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: FluitoTokens.glassBorder),
            ),
            alignment: Alignment.centerLeft,
            child: Text(
              label,
              style: TextStyle(
                color: dob == null
                    ? FluitoTokens.textSecondary
                    : FluitoTokens.textPrimary,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _GenderSelect extends StatelessWidget {
  const _GenderSelect({required this.value, required this.onChanged});

  final String? value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: FluitoTokens.inputBackdropFilter,
        child: Container(
          height: 52,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: FluitoTokens.glassInputFill,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: FluitoTokens.glassBorder),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: value,
              hint: const Text(
                'Select Gender',
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
        ),
      ),
    );
  }
}

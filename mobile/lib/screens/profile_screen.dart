import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../config/app_config.dart';
import '../state/auth_controller.dart';
import '../state/profile_controller.dart';
import '../theme/tokens.dart';
import '../utils/age_gate.dart';
import '../widgets/glass.dart';
import '../widgets/legal_links.dart';
import '../widgets/profile_fields.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _denomination = TextEditingController();
  final _church = TextEditingController();
  final _city = TextEditingController();
  final _state = TextEditingController();
  final _bio = TextEditingController();
  final _minAge = TextEditingController();
  final _maxAge = TextEditingController();
  final _denomPref = TextEditingController();
  String _preferredGender = 'both';
  bool _hydrated = false;
  DateTime? _dob;
  String? _gender;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProfileController>().load();
    });
  }

  @override
  void dispose() {
    _first.dispose();
    _last.dispose();
    _denomination.dispose();
    _church.dispose();
    _city.dispose();
    _state.dispose();
    _bio.dispose();
    _minAge.dispose();
    _maxAge.dispose();
    _denomPref.dispose();
    super.dispose();
  }

  void _hydrate() {
    final profile = context.read<AuthController>().profile;
    final prefs = context.read<ProfileController>().preferences;
    if (profile != null && !_hydrated) {
      _first.text = profile.firstName;
      _last.text = profile.lastName;
      _denomination.text = profile.denomination ?? '';
      _church.text = profile.churchName ?? '';
      _city.text = profile.locationCity ?? '';
      _state.text = profile.locationState ?? '';
      _bio.text = profile.bio ?? '';
      _gender = profile.gender.isEmpty ? null : profile.gender;
      final parsedDob = DateTime.tryParse(profile.dateOfBirth);
      _dob = parsedDob;
      _hydrated = true;
    }
    if (prefs.minAge != null && _minAge.text.isEmpty) {
      _minAge.text = '${prefs.minAge}';
    }
    if (prefs.maxAge != null && _maxAge.text.isEmpty) {
      _maxAge.text = '${prefs.maxAge}';
    }
    if (prefs.denominationPreference != null && _denomPref.text.isEmpty) {
      _denomPref.text = prefs.denominationPreference!;
    }
    if (prefs.preferredGender != null) {
      _preferredGender = prefs.preferredGender!;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final profileState = context.watch<ProfileController>();
    final config = context.watch<AppConfig>();
    _hydrate();
    final profile = auth.profile;
    final palette = auth.palette;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        const PageHeader(title: 'Profile'),
        const SizedBox(height: 8),
        GlassCard(
          child: Column(
            children: [
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Profile Photo',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(height: 16),
              ProfilePhoto(
                url:
                    (profile?.profilePictureUrl == null ||
                        profile!.profilePictureUrl!.isEmpty)
                    ? null
                    : config.resolveMedia(profile.profilePictureUrl),
                palette: palette,
                fallback: Text(
                  (profile?.firstName.isNotEmpty ?? false)
                      ? profile!.firstName[0].toUpperCase()
                      : '👤',
                  style: const TextStyle(fontSize: 48, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
              GlassButton(
                label: profileState.uploading ? 'Uploading...' : 'Upload Photo',
                busy: profileState.uploading,
                palette: palette,
                onPressed: profileState.uploading
                    ? null
                    : () async {
                        final updated = await profileState.pickAndUploadPhoto();
                        if (updated != null) {
                          await auth.refreshProfile();
                        }
                      },
              ),
              const SizedBox(height: 8),
              const Text(
                'JPEG, PNG, or WebP. Images are compressed before upload.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 12,
                  color: FluitoTokens.textSecondary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GlassCard(
          child: Column(
            children: [
              GlassField(controller: _first, label: 'First Name'),
              const SizedBox(height: 16),
              GlassField(controller: _last, label: 'Last Name'),
              const SizedBox(height: 16),
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
                'You must be 18 or older. Date of birth and gender are required for Discover.',
                style: TextStyle(
                  fontSize: 12,
                  color: FluitoTokens.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              GlassField(
                controller: _denomination,
                label: 'Denomination',
                hint: 'e.g., Pentecostal',
              ),
              const SizedBox(height: 16),
              GlassField(controller: _church, label: 'Church Name'),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: GlassField(controller: _city, label: 'City'),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GlassField(controller: _state, label: 'State'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              GlassField(
                controller: _bio,
                label: 'Bio',
                maxLines: 4,
                maxLength: 1000,
              ),
              const SizedBox(height: 16),
              GlassButton(
                label: profileState.loading ? 'Saving...' : 'Save Profile',
                busy: profileState.loading,
                palette: palette,
                onPressed: profileState.loading
                    ? null
                    : () async {
                        if (_dob != null && !AgeGate.isAtLeast18(_dob!)) {
                          return;
                        }
                        final updated = await profileState.saveProfile({
                          'first_name': _first.text.trim(),
                          'last_name': _last.text.trim(),
                          if (_dob != null)
                            'date_of_birth': AgeGate.isoDate(_dob!),
                          if (_gender != null) 'gender': _gender,
                          'denomination': _denomination.text.trim(),
                          'church_name': _church.text.trim(),
                          'location_city': _city.text.trim(),
                          'location_state': _state.text.trim(),
                          'bio': _bio.text.trim(),
                        });
                        if (updated != null) await auth.refreshProfile();
                      },
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Preferences',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: GlassField(
                      controller: _minAge,
                      label: 'Min Age',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GlassField(
                      controller: _maxAge,
                      label: 'Max Age',
                      keyboardType: TextInputType.number,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Text(
                'Preferred Gender',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: FluitoTokens.glassInputFill,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: FluitoTokens.glassBorder),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _preferredGender,
                    borderRadius: BorderRadius.circular(12),
                    items: const [
                      DropdownMenuItem(value: 'both', child: Text('Both')),
                      DropdownMenuItem(value: 'male', child: Text('Male')),
                      DropdownMenuItem(value: 'female', child: Text('Female')),
                    ],
                    onChanged: (v) {
                      if (v != null) {
                        setState(() => _preferredGender = v);
                      }
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),
              GlassField(
                controller: _denomPref,
                label: 'Denomination Preference',
              ),
              const SizedBox(height: 16),
              GlassButton(
                label: profileState.loading ? 'Saving...' : 'Save Preferences',
                busy: profileState.loading,
                palette: palette,
                onPressed: profileState.loading
                    ? null
                    : () => profileState.savePreferences({
                        'min_age': int.tryParse(_minAge.text),
                        'max_age': int.tryParse(_maxAge.text),
                        'preferred_gender': _preferredGender,
                        'denomination_preference': _denomPref.text.trim(),
                      }),
              ),
            ],
          ),
        ),
        if (profileState.message != null) ...[
          const SizedBox(height: 16),
          GlassMessage(
            text: profileState.message!,
            tone: profileState.messageIsError
                ? GlassMessageTone.error
                : GlassMessageTone.success,
          ),
        ],
        const SizedBox(height: 16),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Developer / API',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Text(
                'Flavor: ${config.flavor.name}',
                style: const TextStyle(color: FluitoTokens.textSecondary),
              ),
              Text(
                'API: ${config.hasApiRoot ? config.apiRoot : "(not set — production URL TBD)"}',
                style: const TextStyle(color: FluitoTokens.textSecondary),
              ),
              const SizedBox(height: 16),
              const LegalLinks(alignment: WrapAlignment.start),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: auth.logout,
                style: OutlinedButton.styleFrom(
                  foregroundColor: FluitoTokens.danger,
                  side: const BorderSide(
                    color: Color.fromRGBO(255, 59, 48, 0.4),
                  ),
                  backgroundColor: const Color.fromRGBO(255, 59, 48, 0.12),
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text('Logout'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: auth.busy
                    ? null
                    : () => _confirmDeleteAccount(context, auth),
                style: OutlinedButton.styleFrom(
                  foregroundColor: FluitoTokens.danger,
                  side: const BorderSide(
                    color: Color.fromRGBO(255, 59, 48, 0.55),
                  ),
                  minimumSize: const Size.fromHeight(48),
                ),
                child: const Text('Delete account'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

Future<void> _confirmDeleteAccount(
  BuildContext context,
  AuthController auth,
) async {
  final controller = TextEditingController();
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) {
      return AlertDialog(
        title: const Text('Delete account?'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'This permanently deletes your profile, photos, matches, and messages. Type DELETE to confirm.',
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(hintText: 'DELETE'),
              autofocus: true,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (controller.text.trim() == 'DELETE') {
                Navigator.pop(dialogContext, true);
              }
            },
            style: TextButton.styleFrom(foregroundColor: FluitoTokens.danger),
            child: const Text('Delete forever'),
          ),
        ],
      );
    },
  );
  controller.dispose();
  if (confirmed == true && context.mounted) {
    final ok = await auth.deleteAccount();
    if (!ok && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(auth.error ?? 'Could not delete account')),
      );
    }
  }
}

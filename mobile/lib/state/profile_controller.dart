import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../models/models.dart';
import '../services/fluito_api.dart';

class ProfileController extends ChangeNotifier {
  ProfileController({required this.api});

  final FluitoApi api;
  final ImagePicker _picker = ImagePicker();

  bool loading = false;
  bool uploading = false;
  String? message;
  bool messageIsError = false;
  Preferences preferences = const Preferences();

  Future<void> load() async {
    loading = true;
    notifyListeners();
    try {
      preferences = await api.getPreferences();
    } on ApiException catch (e) {
      message = e.message;
      messageIsError = true;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<Profile?> saveProfile(Map<String, dynamic> body) async {
    loading = true;
    message = null;
    notifyListeners();
    try {
      final updated = await api.updateProfile(body);
      message = 'Profile updated successfully';
      messageIsError = false;
      return updated;
    } on ApiException catch (e) {
      message = e.message;
      messageIsError = true;
      return null;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> savePreferences(Map<String, dynamic> body) async {
    loading = true;
    message = null;
    notifyListeners();
    try {
      preferences = await api.updatePreferences(body);
      message = 'Preferences updated successfully';
      messageIsError = false;
    } on ApiException catch (e) {
      message = e.message;
      messageIsError = true;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<Profile?> pickAndUploadPhoto() async {
    final picked = await _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 2000,
      maxHeight: 2000,
      imageQuality: 80,
    );
    if (picked == null) return null;
    uploading = true;
    message = 'Uploading photo…';
    messageIsError = false;
    notifyListeners();
    try {
      final profile = await api.uploadPhoto(File(picked.path));
      message = 'Photo uploaded successfully';
      messageIsError = false;
      return profile;
    } on ApiException catch (e) {
      message = e.message;
      messageIsError = true;
      return null;
    } finally {
      uploading = false;
      notifyListeners();
    }
  }
}

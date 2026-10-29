# Flutter / Dart
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-keep class io.flutter.embedding.** { *; }

# Play Core (deferred components / Flutter)
-dontwarn com.google.android.play.core.splitcompat.SplitCompatApplication
-dontwarn com.google.android.play.core.splitinstall.**
-dontwarn com.google.android.play.core.tasks.**

# Keep JNI / Flutter engine
-keep class io.flutter.embedding.engine.** { *; }
-keepclassmembers class * {
    native <methods>;
}

# Gson / JSON reflection is not used; Dart handles serialization.
# image_picker / flutter_secure_storage keep their own consumer rules.

# Google Sign-In / Play services (R8)
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**
-keep class com.google.android.libraries.identity.** { *; }

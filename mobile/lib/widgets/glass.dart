import 'dart:ui';

import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../theme/tokens.dart';

/// Shared glassmorphism primitives matching `frontend/src/index.css`.
///
/// Cards, nav, inputs, and the orb background all use [BackdropFilter]
/// (`ImageFilter.blur`) plus translucent fills and 1px glass borders.

class GlassBackground extends StatefulWidget {
  const GlassBackground({
    super.key,
    required this.palette,
    required this.child,
  });

  final FluitoPalette palette;
  final Widget child;

  @override
  State<GlassBackground> createState() => _GlassBackgroundState();
}

class _GlassBackgroundState extends State<GlassBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = widget.palette;
    return ColoredBox(
      color: palette.pageWash,
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [palette.gradientStart, palette.gradientEnd],
              ),
            ),
          ),
          AnimatedBuilder(
            animation: _controller,
            builder: (context, _) {
              return Stack(
                children: [
                  _Orb(
                    color: palette.primary,
                    size: 400,
                    alignment: const Alignment(-1.15, -1.2),
                    t: _controller.value,
                    phase: 0,
                  ),
                  _Orb(
                    color: palette.primaryLight,
                    size: 300,
                    alignment: const Alignment(1.2, 1.15),
                    t: _controller.value,
                    phase: 0.25,
                  ),
                  _Orb(
                    color: palette.accent,
                    size: 350,
                    alignment: Alignment.center,
                    t: _controller.value,
                    phase: 0.5,
                  ),
                ],
              );
            },
          ),
          widget.child,
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({
    required this.color,
    required this.size,
    required this.alignment,
    required this.t,
    required this.phase,
  });

  final Color color;
  final double size;
  final Alignment alignment;
  final double t;
  final double phase;

  @override
  Widget build(BuildContext context) {
    final cycle = (t + phase) % 1.0;
    final Offset drift;
    final double scale;
    if (cycle < 1 / 3) {
      final u = cycle * 3;
      drift = Offset(30 * u, -30 * u);
      scale = 1 + 0.1 * u;
    } else if (cycle < 2 / 3) {
      final u = (cycle - 1 / 3) * 3;
      drift = Offset(30 - 50 * u, -30 + 50 * u);
      scale = 1.1 - 0.2 * u;
    } else {
      final u = (cycle - 2 / 3) * 3;
      drift = Offset(-20 + 20 * u, 20 - 20 * u);
      scale = 0.9 + 0.1 * u;
    }

    return Align(
      alignment: alignment,
      child: Transform.translate(
        offset: drift,
        child: Transform.scale(
          scale: scale,
          child: ImageFiltered(
            imageFilter: ColorFilter.mode(
              color.withValues(alpha: 0.55),
              BlendMode.srcIn,
            ),
            child: ImageFiltered(
              imageFilter: FluitoTokens.cardBackdropFilter,
              child: Container(
                width: size,
                height: size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: color.withValues(alpha: 0.6),
                  boxShadow: [
                    BoxShadow(
                      color: color.withValues(alpha: 0.45),
                      blurRadius: FluitoTokens.orbBlurSigma,
                      spreadRadius: FluitoTokens.orbBlurSigma / 2,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class GlassSurface extends StatelessWidget {
  const GlassSurface({
    super.key,
    required this.child,
    this.borderRadius = FluitoTokens.cardRadius,
    this.padding,
    this.background = FluitoTokens.glassBg,
    this.border = FluitoTokens.glassBorder,
    this.blurFilter,
    this.shadows = FluitoTokens.cardShadow,
    this.width,
    this.height,
  });

  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final Color background;
  final Color border;
  final ImageFilter? blurFilter;
  final List<BoxShadow> shadows;
  final double? width;
  final double? height;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(borderRadius);
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        borderRadius: radius,
        boxShadow: shadows,
      ),
      child: ClipRRect(
        borderRadius: radius,
        child: BackdropFilter(
          filter: blurFilter ?? FluitoTokens.cardBackdropFilter,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: background,
              borderRadius: radius,
              border: Border.all(color: border),
            ),
            child: padding == null
                ? child
                : Padding(padding: padding!, child: child),
          ),
        ),
      ),
    );
  }
}

/// `.glass-card` — 24px radius, blur 20px + saturate 180%, translucent fill.
class GlassCard extends StatefulWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.onTap,
    this.width,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final double? width;

  @override
  State<GlassCard> createState() => _GlassCardState();
}

class _GlassCardState extends State<GlassCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final card = GlassSurface(
      width: widget.width,
      padding: widget.padding,
      child: widget.child,
    );

    return AnimatedSlide(
      offset: _pressed ? const Offset(0, -0.012) : Offset.zero,
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOut,
      child: widget.onTap == null
          ? card
          : GestureDetector(
              onTap: widget.onTap,
              onTapDown: (_) => setState(() => _pressed = true),
              onTapCancel: () => setState(() => _pressed = false),
              onTapUp: (_) => setState(() => _pressed = false),
              child: card,
            ),
    );
  }
}

/// `.glass-nav` — sticky translucent bar with blur, used as a bottom nav.
class GlassNavBar extends StatelessWidget {
  const GlassNavBar({
    super.key,
    required this.currentIndex,
    required this.onSelect,
    required this.primary,
  });

  final int currentIndex;
  final ValueChanged<int> onSelect;
  final Color primary;

  static const _items = <(IconData, String)>[
    (Icons.search_rounded, 'Discover'),
    (Icons.favorite_outline_rounded, 'Matches'),
    (Icons.chat_bubble_outline_rounded, 'Messages'),
    (Icons.person_outline_rounded, 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    return GlassSurface(
      borderRadius: 0,
      shadows: const [],
      padding: EdgeInsets.fromLTRB(8, 8, 8, 8 + bottom),
      child: Row(
        children: [
          for (var i = 0; i < _items.length; i++)
            Expanded(
              child: _NavItem(
                icon: _items[i].$1,
                label: _items[i].$2,
                selected: currentIndex == i,
                primary: primary,
                onTap: () => onSelect(i),
              ),
            ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.primary,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final Color primary;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? primary : FluitoTokens.textSecondary;
    return Material(
      color: selected ? FluitoTokens.glassActive : Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class GlassAppBar extends StatelessWidget implements PreferredSizeWidget {
  const GlassAppBar({
    super.key,
    required this.title,
    this.actions,
    this.leading,
  });

  final String title;
  final List<Widget>? actions;
  final Widget? leading;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return GlassSurface(
      borderRadius: 0,
      shadows: const [],
      padding: EdgeInsets.fromLTRB(16, top + 10, 12, 12),
      child: SizedBox(
        height: 40,
        child: Row(
          children: [
            if (leading != null) ...[
              leading!,
              const SizedBox(width: 8),
            ],
            ShaderMask(
              shaderCallback: (rect) => const LinearGradient(
                colors: [FluitoTokens.primary, FluitoTokens.primaryLight],
              ).createShader(rect),
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
            ),
            const Spacer(),
            ...?actions,
          ],
        ),
      ),
    );
  }
}

class GlassButton extends StatelessWidget {
  const GlassButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.busy = false,
    this.expand = true,
    this.palette,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool busy;
  final bool expand;
  final FluitoPalette? palette;

  @override
  Widget build(BuildContext context) {
    final p = palette ?? FluitoPalette.blue;
    final enabled = onPressed != null && !busy;
    final child = DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [p.primary, p.primaryLight],
        ),
        boxShadow: [
          BoxShadow(
            color: p.primary.withValues(alpha: 0.30),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 52),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            child: busy
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.4,
                      color: Colors.white,
                    ),
                  )
                : Text(
                    label,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
          ),
        ),
      ),
    );

    final button = Opacity(
      opacity: enabled ? 1 : 0.6,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          onTap: enabled ? onPressed : null,
          child: child,
        ),
      ),
    );

    return expand ? SizedBox(width: double.infinity, child: button) : button;
  }
}

class GlassField extends StatelessWidget {
  const GlassField({
    super.key,
    this.controller,
    this.hint,
    this.label,
    this.obscure = false,
    this.keyboardType,
    this.maxLines = 1,
    this.maxLength,
    this.onChanged,
    this.textInputAction,
    this.enabled = true,
  });

  final TextEditingController? controller;
  final String? hint;
  final String? label;
  final bool obscure;
  final TextInputType? keyboardType;
  final int maxLines;
  final int? maxLength;
  final ValueChanged<String>? onChanged;
  final TextInputAction? textInputAction;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontWeight: FontWeight.w500,
              color: FluitoTokens.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
        ],
        ClipRRect(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          child: BackdropFilter(
            filter: FluitoTokens.inputBackdropFilter,
            child: Material(
              color: Colors.transparent,
              child: TextField(
              controller: controller,
              obscureText: obscure,
              keyboardType: keyboardType,
              maxLines: obscure ? 1 : maxLines,
              maxLength: maxLength,
              onChanged: onChanged,
              enabled: enabled,
              textInputAction: textInputAction,
              style: const TextStyle(
                fontSize: 16,
                color: FluitoTokens.textPrimary,
              ),
              decoration: InputDecoration(
                hintText: hint,
                counterText: '',
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 18,
                  vertical: 14,
                ),
              ),
            ),
            ),
          ),
        ),
      ],
    );
  }
}

class GlassMessage extends StatelessWidget {
  const GlassMessage({
    super.key,
    required this.text,
    this.tone = GlassMessageTone.error,
  });

  final String text;
  final GlassMessageTone tone;

  @override
  Widget build(BuildContext context) {
    final Color fill;
    final Color border;
    final Color fg;
    switch (tone) {
      case GlassMessageTone.error:
        fill = const Color.fromRGBO(255, 59, 48, 0.15);
        border = const Color.fromRGBO(255, 59, 48, 0.40);
        fg = FluitoTokens.danger;
      case GlassMessageTone.success:
        fill = const Color.fromRGBO(52, 199, 89, 0.15);
        border = const Color.fromRGBO(52, 199, 89, 0.40);
        fg = FluitoTokens.success;
      case GlassMessageTone.info:
        fill = FluitoTokens.glassInputFill;
        border = FluitoTokens.glassBorder;
        fg = FluitoTokens.textPrimary;
    }
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: fill,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: border),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(color: fg, fontWeight: FontWeight.w500, fontSize: 14),
      ),
    );
  }
}

enum GlassMessageTone { error, success, info }

/// Visible on **dev** builds so testers can see which API host the binary uses.
class DevApiBanner extends StatelessWidget {
  const DevApiBanner({super.key, required this.config});

  final AppConfig config;

  @override
  Widget build(BuildContext context) {
    if (!config.isDev) return const SizedBox.shrink();
    return SafeArea(
      bottom: false,
      child: Align(
        alignment: Alignment.topCenter,
        child: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: GlassSurface(
            borderRadius: 20,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            shadows: const [],
            child: Text(
              'DEV · ${config.apiRoot.isEmpty ? "(no API host)" : config.apiRoot}',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: FluitoTokens.textSecondary,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.message,
    this.detail,
  });

  final IconData icon;
  final String message;
  final String? detail;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 36),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: FluitoTokens.textSecondary),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: FluitoTokens.textSecondary),
            ),
            if (detail != null) ...[
              const SizedBox(height: 8),
              Text(
                detail!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: FluitoTokens.textSecondary,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class GradientWordmark extends StatelessWidget {
  const GradientWordmark({
    super.key,
    this.fontSize = 48,
    this.text = 'Fluito',
  });

  final double fontSize;
  final String text;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      shaderCallback: (rect) => const LinearGradient(
        colors: [FluitoTokens.primary, FluitoTokens.primaryLight],
      ).createShader(rect),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}

class ProfilePhoto extends StatelessWidget {
  const ProfilePhoto({
    super.key,
    required this.url,
    this.size = 150,
    this.width,
    this.height,
    this.borderRadius,
    this.fallback,
    this.palette = FluitoPalette.blue,
  });

  final Uri? url;
  final double size;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final Widget? fallback;
  final FluitoPalette palette;

  @override
  Widget build(BuildContext context) {
    final w = width ?? size;
    final h = height ?? size;
    final radius = borderRadius ?? BorderRadius.circular(size / 2);
    return Container(
      width: w,
      height: h,
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(color: FluitoTokens.glassBorder, width: 3),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [palette.primary, palette.primaryLight],
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: url == null
          ? Center(child: fallback)
          : Image.network(
              url.toString(),
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => Center(child: fallback),
            ),
    );
  }
}

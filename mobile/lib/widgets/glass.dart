import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../theme/tokens.dart';

/// Shared glass primitives matching `frontend/src/index.css` *visually*
/// without live `BackdropFilter`.
///
/// Stacking `BackdropFilter` + 60fps `ImageFiltered` orbs under the login
/// form starved the UI isolate on Android (jank) and wrapping `TextField`s
/// in `ClipRRect`+`BackdropFilter` prevented the IME from attaching.

class GlassBackground extends StatelessWidget {
  const GlassBackground({
    super.key,
    required this.palette,
    required this.child,
  });

  final FluitoPalette palette;
  final Widget child;

  @override
  Widget build(BuildContext context) {
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
          RepaintBoundary(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _OrbPainter(palette),
                size: Size.infinite,
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

/// Soft colored blobs (the CSS orbs) painted once. No per-frame blur.
class _OrbPainter extends CustomPainter {
  const _OrbPainter(this.palette);

  final FluitoPalette palette;

  @override
  void paint(Canvas canvas, Size size) {
    void blob(Offset c, double r, Color color) {
      final paint = Paint()
        ..shader = RadialGradient(
          colors: [
            color.withValues(alpha: 0.55),
            color.withValues(alpha: 0.0),
          ],
        ).createShader(Rect.fromCircle(center: c, radius: r));
      canvas.drawCircle(c, r, paint);
    }

    blob(Offset(size.width * -0.05, size.height * -0.02), 220, palette.orbA);
    blob(Offset(size.width * 1.05, size.height * 0.95), 200, palette.orbB);
    blob(Offset(size.width * 0.55, size.height * 0.42), 180, palette.orbC);
  }

  @override
  bool shouldRepaint(_OrbPainter oldDelegate) => oldDelegate.palette != palette;
}

class GlassSurface extends StatelessWidget {
  const GlassSurface({
    super.key,
    required this.child,
    this.borderRadius = FluitoTokens.cardRadius,
    this.padding,
    this.width,
    this.height,
    this.shadows = FluitoTokens.cardShadow,
    this.highlighted = false,
  });

  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final double? width;
  final double? height;
  final List<BoxShadow> shadows;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(borderRadius);
    return Container(
      width: width,
      height: height,
      padding: padding,
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(
          color: highlighted
              ? FluitoTokens.primary
              : FluitoTokens.glassBorder,
          width: highlighted ? 1.6 : 1,
        ),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [FluitoTokens.glassFillTop, FluitoTokens.glassFillBottom],
        ),
        boxShadow: shadows,
      ),
      child: child,
    );
  }
}

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(22),
    this.onTap,
    this.width,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final card = GlassSurface(
      width: width,
      padding: padding,
      child: child,
    );
    if (onTap == null) return card;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(FluitoTokens.cardRadius),
        onTap: onTap,
        child: card,
      ),
    );
  }
}

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

  static const _items = <(IconData, IconData, String)>[
    (Icons.explore_outlined, Icons.explore_rounded, 'Discover'),
    (Icons.favorite_outline_rounded, Icons.favorite_rounded, 'Matches'),
    (Icons.chat_bubble_outline_rounded, Icons.chat_bubble_rounded, 'Messages'),
    (Icons.person_outline_rounded, Icons.person_rounded, 'Profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 0, 16, 10 + bottom),
      child: GlassSurface(
        borderRadius: FluitoTokens.navRadius,
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
        child: Row(
          children: [
            for (var i = 0; i < _items.length; i++)
              Expanded(
                child: _NavItem(
                  icon: currentIndex == i ? _items[i].$2 : _items[i].$1,
                  label: _items[i].$3,
                  selected: currentIndex == i,
                  primary: primary,
                  onTap: () => onSelect(i),
                ),
              ),
          ],
        ),
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
      color: selected ? primary.withValues(alpha: 0.12) : Colors.transparent,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 22),
              const SizedBox(height: 3),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
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

class GlassAppBar extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final top = MediaQuery.paddingOf(context).top;
    return Padding(
      padding: EdgeInsets.fromLTRB(16, top + 8, 16, 8),
      child: GlassSurface(
        borderRadius: 18,
        padding: const EdgeInsets.fromLTRB(14, 8, 8, 8),
        child: SizedBox(
          height: 40,
          child: Row(
            children: [
              if (leading != null) ...[
                leading!,
                const SizedBox(width: 8),
              ],
              GradientWordmark(fontSize: 22, text: title),
              const Spacer(),
              ...?actions,
            ],
          ),
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
    final child = AnimatedOpacity(
      duration: const Duration(milliseconds: 160),
      opacity: enabled ? 1 : 0.55,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
          onTap: enabled ? onPressed : null,
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(FluitoTokens.fieldRadius),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [p.primary, p.primaryLight],
              ),
              boxShadow: [
                BoxShadow(
                  color: p.primary.withValues(alpha: 0.28),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ConstrainedBox(
              constraints: const BoxConstraints(minHeight: 52),
              child: Center(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
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
          ),
        ),
      ),
    );

    return expand ? SizedBox(width: double.infinity, child: child) : child;
  }
}

/// Plain Material [TextField] — never wrap in BackdropFilter/ClipRRect.
class GlassField extends StatelessWidget {
  const GlassField({
    super.key,
    this.controller,
    this.focusNode,
    this.hint,
    this.label,
    this.obscure = false,
    this.keyboardType,
    this.maxLines = 1,
    this.maxLength,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.enabled = true,
    this.autofillHints,
    this.autocorrect,
    this.enableSuggestions,
    this.textCapitalization = TextCapitalization.none,
    this.prefixIcon,
  });

  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? hint;
  final String? label;
  final bool obscure;
  final TextInputType? keyboardType;
  final int maxLines;
  final int? maxLength;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final TextInputAction? textInputAction;
  final bool enabled;
  final Iterable<String>? autofillHints;
  final bool? autocorrect;
  final bool? enableSuggestions;
  final TextCapitalization textCapitalization;
  final IconData? prefixIcon;

  @override
  Widget build(BuildContext context) {
    final hideAssist = obscure ||
        keyboardType == TextInputType.emailAddress ||
        keyboardType == TextInputType.visiblePassword;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(
            label!,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              color: FluitoTokens.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextField(
          controller: controller,
          focusNode: focusNode,
          enabled: enabled,
          obscureText: obscure,
          keyboardType: keyboardType ??
              (obscure
                  ? TextInputType.visiblePassword
                  : (maxLines > 1
                      ? TextInputType.multiline
                      : TextInputType.text)),
          textInputAction: textInputAction ??
              (maxLines > 1 ? TextInputAction.newline : TextInputAction.next),
          maxLines: obscure ? 1 : maxLines,
          maxLength: maxLength,
          onChanged: onChanged,
          onSubmitted: onSubmitted,
          autofillHints: autofillHints,
          autocorrect: autocorrect ?? !hideAssist,
          enableSuggestions: enableSuggestions ?? !hideAssist,
          textCapitalization: textCapitalization,
          smartDashesType: hideAssist
              ? SmartDashesType.disabled
              : SmartDashesType.enabled,
          smartQuotesType: hideAssist
              ? SmartQuotesType.disabled
              : SmartQuotesType.enabled,
          enableIMEPersonalizedLearning: !obscure,
          showCursor: true,
          enableInteractiveSelection: true,
          keyboardAppearance: Brightness.light,
          style: const TextStyle(
            fontSize: 16,
            color: FluitoTokens.textPrimary,
            height: 1.3,
          ),
          decoration: InputDecoration(
            hintText: hint,
            counterText: '',
            filled: true,
            fillColor: FluitoTokens.glassInputFill,
            prefixIcon: prefixIcon == null ? null : Icon(prefixIcon, size: 20),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 14,
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
        fill = const Color.fromRGBO(255, 59, 48, 0.12);
        border = const Color.fromRGBO(255, 59, 48, 0.35);
        fg = FluitoTokens.danger;
      case GlassMessageTone.success:
        fill = const Color.fromRGBO(52, 199, 89, 0.12);
        border = const Color.fromRGBO(52, 199, 89, 0.35);
        fg = FluitoTokens.success;
      case GlassMessageTone.info:
        fill = FluitoTokens.glassInputFill;
        border = FluitoTokens.glassBorder;
        fg = FluitoTokens.textPrimary;
    }
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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

class DevApiBanner extends StatelessWidget {
  const DevApiBanner({super.key, required this.config});

  final AppConfig config;

  @override
  Widget build(BuildContext context) {
    if (!config.isDev) return const SizedBox.shrink();
    return Material(
      color: const Color(0xCC1D1D1F),
      borderRadius: BorderRadius.circular(20),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: Text(
          'DEV · ${config.apiRoot.isEmpty ? "(no API host)" : config.apiRoot}',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: Colors.white,
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
        padding: const EdgeInsets.symmetric(vertical: 28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: FluitoTokens.textSecondary),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: FluitoTokens.textSecondary,
                fontSize: 15,
              ),
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
          letterSpacing: -0.6,
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
        border: Border.all(color: FluitoTokens.glassBorder, width: 2),
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
              gaplessPlayback: true,
              filterQuality: FilterQuality.medium,
              errorBuilder: (_, _, _) => Center(child: fallback),
            ),
    );
  }
}

class PageHeader extends StatelessWidget {
  const PageHeader({
    super.key,
    required this.title,
    this.trailing,
  });

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 4, 12, 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.4,
              ),
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

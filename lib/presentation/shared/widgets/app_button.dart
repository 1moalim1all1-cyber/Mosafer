import 'package:flutter/material.dart';

import '../../../core/theme/app_theme.dart';

/// أنواع الأزرار المتاحة - كل نوع بلون دلالي واضح (Primary أزرق، Secondary
/// حدود، Danger أحمر للحذف/الإلغاء الخطر، Success أخضر للتأكيد الإيجابي).
enum AppButtonVariant { primary, secondary, danger, success }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool outlined; // للتوافق مع الاستخدام القديم - يكافئ variant: secondary
  final AppButtonVariant? variant;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.outlined = false,
    this.variant,
  });

  @override
  Widget build(BuildContext context) {
    final child = isLoading
        ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(strokeWidth: 2.4, color: Colors.white),
          )
        : Text(label);

    // لو حددت variant بالاسم بيبقى له الأولوية، وإلا بيرجع للسلوك القديم
    // (outlined: bool) عشان مفيش شاشة موجودة تتكسر.
    final effectiveVariant =
        variant ?? (outlined ? AppButtonVariant.secondary : AppButtonVariant.primary);

    switch (effectiveVariant) {
      case AppButtonVariant.secondary:
        return SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: isLoading ? null : onPressed,
            child: child,
          ),
        );
      case AppButtonVariant.danger:
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: AppTheme.dangerButtonStyle(),
            onPressed: isLoading ? null : onPressed,
            child: child,
          ),
        );
      case AppButtonVariant.success:
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: AppTheme.successButtonStyle(),
            onPressed: isLoading ? null : onPressed,
            child: child,
          ),
        );
      case AppButtonVariant.primary:
        return SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: isLoading ? null : onPressed,
            child: child,
          ),
        );
    }
  }
}


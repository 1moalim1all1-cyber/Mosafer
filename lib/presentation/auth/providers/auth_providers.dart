import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/user_entity.dart';
import '../../../domain/repositories/auth_repository.dart';
import '../../../data/repositories/auth_repository_impl.dart';

/// حقن طبقة الـ Repository - أي شاشة بتتعامل مع الـ Interface بس (authRepositoryProvider)
/// مش مع Firebase مباشرة، ده أساس الـ Clean Architecture.
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl();
});

/// حالة تسجيل الدخول الحية - أي تغيير (دخول/خروج) بينعكس فورًا على كل التطبيق
final authStateChangesProvider = StreamProvider<UserEntity?>((ref) {
  return ref.watch(authRepositoryProvider).authStateChanges;
});

/// المستخدم الحالي (null لو مفيش حد مسجّل دخول)
final currentUserProvider = Provider<UserEntity?>((ref) {
  return ref.watch(authStateChangesProvider).valueOrNull;
});

/// حالة تحميل عمليات المصادقة (تسجيل / دخول / إلخ) لعرض مؤشرات تحميل بالشاشات
final authLoadingProvider = StateProvider<bool>((ref) => false);

/// آخر رسالة خطأ حصلت أثناء عملية مصادقة، لعرضها في الشاشة المناسبة
final authErrorProvider = StateProvider<String?>((ref) => null);

/// الدور المختار مؤقتًا أثناء تدفق التسجيل (قبل ما يتحفظ في Firestore)
final selectedRoleProvider = StateProvider<UserRole?>((ref) => null);

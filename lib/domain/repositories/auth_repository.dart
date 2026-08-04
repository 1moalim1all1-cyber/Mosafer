import '../entities/user_entity.dart';

/// عقد المصادقة - طبقة الـ Domain مش عارفة ولا مهتمة إن التنفيذ
/// بيحصل عبر Firebase تحديدًا، ده بيسمح لاحقًا نغيّر مزوّد المصادقة
/// من غير ما نلمس شاشات الـ UI أو منطق الأعمال.
abstract class AuthRepository {
  Stream<UserEntity?> get authStateChanges;

  UserEntity? get currentUser;

  Future<UserEntity> registerWithEmail({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
    required Gender gender,
  });

  Future<UserEntity> loginWithEmail({
    required String email,
    required String password,
  });

  Future<void> sendPasswordResetEmail({required String email});

  Future<void> logout();

  Future<UserEntity?> fetchUserProfile(String uid);
}

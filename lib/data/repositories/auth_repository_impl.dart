import 'package:firebase_auth/firebase_auth.dart' as fb;
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../models/user_model.dart';

class AuthException implements Exception {
  final String message;
  AuthException(this.message);
  @override
  String toString() => message;
}

/// ترجمة أكواد أخطاء Firebase الإنجليزية لرسائل عربية مفهومة للمستخدم المصري
String _mapFirebaseError(String code) {
  switch (code) {
    case 'email-already-in-use':
      return 'البريد الإلكتروني ده مستخدم بالفعل، جرّب تسجّل الدخول';
    case 'invalid-email':
      return 'صيغة البريد الإلكتروني مش صحيحة';
    case 'weak-password':
      return 'كلمة المرور ضعيفة، لازم تكون 6 حروف على الأقل';
    case 'user-not-found':
    case 'wrong-password':
    case 'invalid-credential':
      return 'البريد الإلكتروني أو كلمة المرور غلط';
    case 'user-disabled':
      return 'الحساب ده موقوف، تواصل مع الدعم';
    case 'too-many-requests':
      return 'محاولات كتير، حاول تاني بعد شوية';
    case 'network-request-failed':
      return 'تأكد من اتصال الإنترنت وحاول تاني';
    default:
      return 'حصل خطأ غير متوقع، حاول تاني';
  }
}

class AuthRepositoryImpl implements AuthRepository {
  final fb.FirebaseAuth _auth;
  final FirebaseFirestore _firestore;

  AuthRepositoryImpl({
    fb.FirebaseAuth? auth,
    FirebaseFirestore? firestore,
  })  : _auth = auth ?? fb.FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _usersRef =>
      _firestore.collection(AppConstants.usersCollection);

  @override
  UserEntity? get currentUser => null; // بيُدار عبر authStateChanges + Provider

  @override
  Stream<UserEntity?> get authStateChanges {
    return _auth.authStateChanges().asyncMap((fbUser) async {
      if (fbUser == null) return null;
      return fetchUserProfile(fbUser.uid);
    });
  }

  @override
  Future<UserEntity> registerWithEmail({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
    required Gender gender,
    String? referralCode,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      final uid = credential.user!.uid;
      final now = DateTime.now();
      final myReferralCode = uid.substring(0, 8).toUpperCase();

      // لو المستخدم دخل كود دعوة، ندوّر على صاحب الكود ده - القراءة هنا
      // مسموحة لأن المستخدم بقى Authenticated فعليًا (Firebase بيسجّل
      // دخوله أوتوماتيك أول ما الحساب يتعمل).
      String? referredByUid;
      if (referralCode != null && referralCode.trim().isNotEmpty) {
        final code = referralCode.trim().toUpperCase();
        if (code != myReferralCode) {
          final query = await _usersRef
              .where('referralCode', isEqualTo: code)
              .limit(1)
              .get();
          if (query.docs.isNotEmpty) {
            referredByUid = query.docs.first.id;
          }
        }
      }

      final userModel = UserModel(
        uid: uid,
        role: role,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gender: gender,
        referralCode: myReferralCode,
        referredByUid: referredByUid,
        createdAt: now,
      );

      // إنشاء وثيقة المستخدم + محفظة فارغة في عملية واحدة (Batch) لضمان الاتساق.
      // الرصيد بيتحط صفر هنا دايمًا (القاعدة الأمنية بتفرض كده) - أي رصيد
      // ترحيبي أو مكافأة دعوة بيتحط بعد كده عبر Cloud Function (onUserCreated)
      // بصلاحيات سيرفر، مش من العميل مباشرة.
      final batch = _firestore.batch();
      batch.set(_usersRef.doc(uid), userModel.toMap());
      batch.set(
        _firestore.collection(AppConstants.walletsCollection).doc(uid),
        {'balance': 0.0, 'currency': 'EGP', 'createdAt': Timestamp.fromDate(now)},
      );
      await batch.commit();

      await credential.user!.updateDisplayName(fullName.trim());

      return userModel;
    } on fb.FirebaseAuthException catch (e) {
      throw AuthException(_mapFirebaseError(e.code));
    }
  }

  @override
  Future<UserEntity> loginWithEmail({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      final profile = await fetchUserProfile(credential.user!.uid);
      if (profile == null) {
        throw AuthException('تعذّر إيجاد بيانات الحساب، تواصل مع الدعم');
      }
      if (profile.status == AccountStatus.suspended) {
        throw AuthException('حسابك موقوف مؤقتًا، تواصل مع الدعم');
      }
      if (profile.status == AccountStatus.banned) {
        throw AuthException('حسابك محظور من استخدام المنصة');
      }
      return profile;
    } on fb.FirebaseAuthException catch (e) {
      throw AuthException(_mapFirebaseError(e.code));
    }
  }

  @override
  Future<void> sendPasswordResetEmail({required String email}) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on fb.FirebaseAuthException catch (e) {
      throw AuthException(_mapFirebaseError(e.code));
    }
  }

  @override
  Future<void> logout() => _auth.signOut();

  @override
  Future<UserEntity?> fetchUserProfile(String uid) async {
    final doc = await _usersRef.doc(uid).get();
    if (!doc.exists || doc.data() == null) return null;
    return UserModel.fromMap(uid, doc.data()!);
  }
}

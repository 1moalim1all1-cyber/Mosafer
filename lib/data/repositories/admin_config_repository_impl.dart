import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/admin_entities.dart';
import '../../domain/repositories/admin_config_repository.dart';

class AdminConfigRepositoryImpl implements AdminConfigRepository {
  final FirebaseFirestore _firestore;

  AdminConfigRepositoryImpl({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  // ================= المحافظات =================
  CollectionReference<Map<String, dynamic>> get _governoratesRef =>
      _firestore.collection(AppConstants.governoratesCollection);

  @override
  Stream<List<GovernorateEntity>> watchGovernorates() {
    return _governoratesRef.orderBy('name').snapshots().map((snap) => snap.docs
        .map((d) => GovernorateEntity(
              id: d.id,
              name: d.data()['name'] ?? '',
              isActive: d.data()['isActive'] ?? true,
            ))
        .toList());
  }

  @override
  Future<void> addGovernorate(String name) {
    return _governoratesRef.add({'name': name, 'isActive': true});
  }

  @override
  Future<void> updateGovernorate(String id, {required String name, required bool isActive}) {
    return _governoratesRef.doc(id).update({'name': name, 'isActive': isActive});
  }

  @override
  Future<void> deleteGovernorate(String id) {
    return _governoratesRef.doc(id).delete();
  }

  // ================= أنواع السيارات =================
  CollectionReference<Map<String, dynamic>> get _carTypesRef =>
      _firestore.collection(AppConstants.carTypesCollection);

  @override
  Stream<List<CarTypeEntity>> watchCarTypes() {
    return _carTypesRef.orderBy('name').snapshots().map((snap) => snap.docs
        .map((d) => CarTypeEntity(
              id: d.id,
              name: d.data()['name'] ?? '',
              isActive: d.data()['isActive'] ?? true,
            ))
        .toList());
  }

  @override
  Future<void> addCarType(String name) {
    return _carTypesRef.add({'name': name, 'isActive': true});
  }

  @override
  Future<void> updateCarType(String id, {required String name, required bool isActive}) {
    return _carTypesRef.doc(id).update({'name': name, 'isActive': isActive});
  }

  @override
  Future<void> deleteCarType(String id) {
    return _carTypesRef.doc(id).delete();
  }

  // ================= الكوبونات =================
  CollectionReference<Map<String, dynamic>> get _couponsRef =>
      _firestore.collection(AppConstants.couponsCollection);

  @override
  Stream<List<CouponEntity>> watchCoupons() {
    return _couponsRef.orderBy('code').snapshots().map((snap) => snap.docs.map((d) {
          final data = d.data();
          return CouponEntity(
            id: d.id,
            code: data['code'] ?? '',
            discountType: CouponDiscountType.values.firstWhere(
              (t) => t.name == (data['discountType'] ?? 'percentage'),
              orElse: () => CouponDiscountType.percentage,
            ),
            value: (data['value'] ?? 0).toDouble(),
            maxUses: data['maxUses'] ?? 0,
            usedCount: data['usedCount'] ?? 0,
            expiresAt: data['expiresAt'] != null
                ? (data['expiresAt'] as Timestamp).toDate()
                : null,
            isActive: data['isActive'] ?? true,
          );
        }).toList());
  }

  @override
  Future<void> addCoupon(CouponEntity coupon) {
    return _couponsRef.add({
      'code': coupon.code.toUpperCase(),
      'discountType': coupon.discountType.name,
      'value': coupon.value,
      'maxUses': coupon.maxUses,
      'usedCount': 0,
      'expiresAt': coupon.expiresAt != null ? Timestamp.fromDate(coupon.expiresAt!) : null,
      'isActive': coupon.isActive,
    });
  }

  @override
  Future<void> updateCoupon(CouponEntity coupon) {
    return _couponsRef.doc(coupon.id).update({
      'code': coupon.code.toUpperCase(),
      'discountType': coupon.discountType.name,
      'value': coupon.value,
      'maxUses': coupon.maxUses,
      'expiresAt': coupon.expiresAt != null ? Timestamp.fromDate(coupon.expiresAt!) : null,
      'isActive': coupon.isActive,
    });
  }

  @override
  Future<void> deleteCoupon(String id) {
    return _couponsRef.doc(id).delete();
  }

  // ================= الإعدادات العامة =================
  DocumentReference<Map<String, dynamic>> get _settingsDoc =>
      _firestore.collection(AppConstants.appSettingsCollection).doc('general');

  @override
  Stream<AppSettingsEntity> watchAppSettings() {
    return _settingsDoc.snapshots().map((doc) {
      final data = doc.data();
      if (data == null) return const AppSettingsEntity();
      return AppSettingsEntity(
        commissionStandardPercent: (data['commissionStandardPercent'] ?? 10).toDouble(),
        commissionReturnEmptyPercent: (data['commissionReturnEmptyPercent'] ?? 5).toDouble(),
        logoUrl: data['logoUrl'],
        facebookUrl: data['facebookUrl'],
        instagramUrl: data['instagramUrl'],
        whatsappNumber: data['whatsappNumber'],
        supportEmail: data['supportEmail'] ?? '',
      );
    });
  }

  @override
  Future<void> updateAppSettings(AppSettingsEntity settings) {
    return _settingsDoc.set({
      'commissionStandardPercent': settings.commissionStandardPercent,
      'commissionReturnEmptyPercent': settings.commissionReturnEmptyPercent,
      'logoUrl': settings.logoUrl,
      'facebookUrl': settings.facebookUrl,
      'instagramUrl': settings.instagramUrl,
      'whatsappNumber': settings.whatsappNumber,
      'supportEmail': settings.supportEmail,
    }, SetOptions(merge: true));
  }

  // ================= إحصائيات =================
  @override
  Future<AdminDashboardStats> fetchDashboardStats() async {
    final activeTripsCount = await _firestore
        .collection(AppConstants.tripsCollection)
        .where('status', isEqualTo: 'active')
        .count()
        .get();

    final pendingDriversCount = await _firestore
        .collection(AppConstants.driversCollection)
        .where('verificationStatus', isEqualTo: 'pending')
        .count()
        .get();

    final startOfDay = DateTime.now();
    final startOfDayTimestamp =
        Timestamp.fromDate(DateTime(startOfDay.year, startOfDay.month, startOfDay.day));
    final todayBookingsCount = await _firestore
        .collection(AppConstants.bookingsCollection)
        .where('createdAt', isGreaterThanOrEqualTo: startOfDayTimestamp)
        .count()
        .get();

    final totalUsersCount =
        await _firestore.collection(AppConstants.usersCollection).count().get();

    return AdminDashboardStats(
      activeTrips: activeTripsCount.count ?? 0,
      pendingDrivers: pendingDriversCount.count ?? 0,
      todayBookings: todayBookingsCount.count ?? 0,
      totalUsers: totalUsersCount.count ?? 0,
    );
  }
}

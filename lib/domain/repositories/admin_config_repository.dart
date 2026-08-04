import '../entities/admin_entities.dart';

abstract class AdminConfigRepository {
  // ---- المحافظات ----
  Stream<List<GovernorateEntity>> watchGovernorates();
  Future<void> addGovernorate(String name);
  Future<void> updateGovernorate(String id, {required String name, required bool isActive});
  Future<void> deleteGovernorate(String id);

  // ---- أنواع السيارات ----
  Stream<List<CarTypeEntity>> watchCarTypes();
  Future<void> addCarType(String name);
  Future<void> updateCarType(String id, {required String name, required bool isActive});
  Future<void> deleteCarType(String id);

  // ---- الكوبونات ----
  Stream<List<CouponEntity>> watchCoupons();
  Future<void> addCoupon(CouponEntity coupon);
  Future<void> updateCoupon(CouponEntity coupon);
  Future<void> deleteCoupon(String id);

  // ---- الإعدادات العامة ----
  Stream<AppSettingsEntity> watchAppSettings();
  Future<void> updateAppSettings(AppSettingsEntity settings);

  // ---- إحصائيات لوحة التحكم ----
  Future<AdminDashboardStats> fetchDashboardStats();
}

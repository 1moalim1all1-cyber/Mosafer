import 'dart:io';
import '../entities/driver_entity.dart';

abstract class DriverRepository {
  /// رفع المستندات الخمسة على Cloudinary وحفظ الروابط + بيانات السيارة
  /// في Firestore بحالة "pending" بانتظار مراجعة الإدارة.
  Future<void> submitDriverDocuments({
    required String uid,
    required File nationalIdImage,
    required File licenseImage,
    required File vehicleLicenseImage,
    required File vehicleImage,
    required File selfieImage,
    required VehicleInfo vehicle,
  });

  Stream<DriverEntity?> watchDriverStatus(String uid);

  Future<DriverEntity?> getDriverProfile(String uid);

  /// طابور السائقين بانتظار المراجعة - تستخدمها لوحة الإدارة.
  Stream<List<DriverEntity>> watchPendingDrivers();

  /// اعتماد/رفض السائق - عبر Cloud Functions (approveDriver/rejectDriver)
  /// بصلاحيات إدارية محمية سيرفريًا، مش تعديل مباشر على Firestore.
  Future<void> approveDriver(String driverId);
  Future<void> rejectDriver(String driverId, String reason);
}

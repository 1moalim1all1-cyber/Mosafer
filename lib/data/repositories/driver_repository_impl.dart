import 'dart:typed_data';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../core/constants/app_constants.dart';
import '../../core/config/cloudinary_service.dart';
import '../../domain/entities/driver_entity.dart';
import '../../domain/repositories/driver_repository.dart';
import '../models/driver_model.dart';

class DriverRepositoryImpl implements DriverRepository {
  final FirebaseFirestore _firestore;
  final CloudinaryService _cloudinary;
  final FirebaseFunctions _functions;

  DriverRepositoryImpl({
    FirebaseFirestore? firestore,
    CloudinaryService? cloudinary,
    FirebaseFunctions? functions,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _cloudinary = cloudinary ?? CloudinaryService.instance,
        _functions = functions ?? FirebaseFunctions.instance;

  CollectionReference<Map<String, dynamic>> get _driversRef =>
      _firestore.collection(AppConstants.driversCollection);

  @override
  Future<void> submitDriverDocuments({
    required String uid,
    required Uint8List nationalIdBytes,
    required Uint8List licenseBytes,
    required Uint8List vehicleLicenseBytes,
    required Uint8List vehicleBytes,
    required Uint8List selfieBytes,
    required VehicleInfo vehicle,
  }) async {
    // الرفع بالتوازي أسرع من رفع الصور واحدة ورا التانية
    final results = await Future.wait([
      _cloudinary.uploadImageBytes(
        bytes: nationalIdBytes,
        folder: AppConstants.cloudinaryNationalIdFolder,
      ),
      _cloudinary.uploadImageBytes(
        bytes: licenseBytes,
        folder: AppConstants.cloudinaryLicenseFolder,
      ),
      _cloudinary.uploadImageBytes(
        bytes: vehicleLicenseBytes,
        folder: AppConstants.cloudinaryLicenseFolder,
      ),
      _cloudinary.uploadImageBytes(
        bytes: vehicleBytes,
        folder: AppConstants.cloudinaryVehicleFolder,
      ),
      _cloudinary.uploadImageBytes(
        bytes: selfieBytes,
        folder: AppConstants.cloudinaryProfileFolder,
      ),
    ]);

    final model = DriverModel(
      uid: uid,
      verificationStatus: VerificationStatus.pending,
      nationalIdImageUrl: results[0],
      licenseImageUrl: results[1],
      vehicleLicenseImageUrl: results[2],
      vehicleImageUrl: results[3],
      selfieVerificationUrl: results[4],
      vehicle: vehicle,
    );

    await _driversRef.doc(uid).set(model.toMap(), SetOptions(merge: true));
  }

  @override
  Stream<DriverEntity?> watchDriverStatus(String uid) {
    return _driversRef.doc(uid).snapshots().map((doc) {
      if (!doc.exists || doc.data() == null) return null;
      return DriverModel.fromMap(uid, doc.data()!);
    });
  }

  @override
  Future<DriverEntity?> getDriverProfile(String uid) async {
    final doc = await _driversRef.doc(uid).get();
    if (!doc.exists || doc.data() == null) return null;
    return DriverModel.fromMap(uid, doc.data()!);
  }

  @override
  Stream<List<DriverEntity>> watchPendingDrivers() {
    return _driversRef
        .where('verificationStatus', isEqualTo: 'pending')
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => DriverModel.fromMap(d.id, d.data()))
            .toList());
  }

  @override
  Future<void> approveDriver(String driverId) async {
    await _functions.httpsCallable('approveDriver').call({'driverId': driverId});
  }

  @override
  Future<void> rejectDriver(String driverId, String reason) async {
    await _functions
        .httpsCallable('rejectDriver')
        .call({'driverId': driverId, 'reason': reason});
  }
}

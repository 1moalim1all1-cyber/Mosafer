import 'package:equatable/equatable.dart';

enum VerificationStatus { notSubmitted, pending, approved, rejected }

class VehicleInfo extends Equatable {
  final String make;
  final String model;
  final int year;
  final String color;
  final String plateNumber;
  final String carType; // اقتصادية / عائلية / فاخرة... تُدار من لوحة الإدارة لاحقًا
  final int seats;

  const VehicleInfo({
    required this.make,
    required this.model,
    required this.year,
    required this.color,
    required this.plateNumber,
    required this.carType,
    required this.seats,
  });

  /// رقم اللوحة جزئي للعرض العام (زي ما اتفقنا: يظهر جزء بس قبل قبول الحجز)
  String get maskedPlateNumber {
    if (plateNumber.length <= 3) return '***';
    return '${plateNumber.substring(0, 3)}***';
  }

  @override
  List<Object?> get props => [make, model, year, color, plateNumber, carType, seats];
}

class DriverEntity extends Equatable {
  final String uid;
  final VerificationStatus verificationStatus;
  final String? rejectionReason;
  final String? nationalIdImageUrl;
  final String? licenseImageUrl;
  final String? vehicleLicenseImageUrl;
  final String? vehicleImageUrl;
  final String? selfieVerificationUrl;
  final VehicleInfo? vehicle;

  const DriverEntity({
    required this.uid,
    this.verificationStatus = VerificationStatus.notSubmitted,
    this.rejectionReason,
    this.nationalIdImageUrl,
    this.licenseImageUrl,
    this.vehicleLicenseImageUrl,
    this.vehicleImageUrl,
    this.selfieVerificationUrl,
    this.vehicle,
  });

  bool get isApproved => verificationStatus == VerificationStatus.approved;
  bool get hasSubmittedDocuments =>
      nationalIdImageUrl != null &&
      licenseImageUrl != null &&
      vehicleLicenseImageUrl != null &&
      vehicleImageUrl != null &&
      selfieVerificationUrl != null;

  @override
  List<Object?> get props => [uid, verificationStatus, vehicle];
}

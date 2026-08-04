import '../../domain/entities/driver_entity.dart';

class DriverModel extends DriverEntity {
  const DriverModel({
    required super.uid,
    super.verificationStatus,
    super.rejectionReason,
    super.nationalIdImageUrl,
    super.licenseImageUrl,
    super.vehicleLicenseImageUrl,
    super.vehicleImageUrl,
    super.selfieVerificationUrl,
    super.vehicle,
  });

  factory DriverModel.fromMap(String uid, Map<String, dynamic> map) {
    final vehicleMap = map['vehicle'] as Map<String, dynamic>?;
    return DriverModel(
      uid: uid,
      verificationStatus: VerificationStatus.values.firstWhere(
        (s) => s.name == (map['verificationStatus'] ?? 'notSubmitted'),
        orElse: () => VerificationStatus.notSubmitted,
      ),
      rejectionReason: map['rejectionReason'],
      nationalIdImageUrl: map['nationalIdImageUrl'],
      licenseImageUrl: map['licenseImageUrl'],
      vehicleLicenseImageUrl: map['vehicleLicenseImageUrl'],
      vehicleImageUrl: map['vehicleImageUrl'],
      selfieVerificationUrl: map['selfieVerificationUrl'],
      vehicle: vehicleMap == null
          ? null
          : VehicleInfo(
              make: vehicleMap['make'] ?? '',
              model: vehicleMap['model'] ?? '',
              year: vehicleMap['year'] ?? 0,
              color: vehicleMap['color'] ?? '',
              plateNumber: vehicleMap['plateNumber'] ?? '',
              carType: vehicleMap['carType'] ?? '',
              seats: vehicleMap['seats'] ?? 4,
            ),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'verificationStatus': verificationStatus.name,
      'rejectionReason': rejectionReason,
      'nationalIdImageUrl': nationalIdImageUrl,
      'licenseImageUrl': licenseImageUrl,
      'vehicleLicenseImageUrl': vehicleLicenseImageUrl,
      'vehicleImageUrl': vehicleImageUrl,
      'selfieVerificationUrl': selfieVerificationUrl,
      'vehicle': vehicle == null
          ? null
          : {
              'make': vehicle!.make,
              'model': vehicle!.model,
              'year': vehicle!.year,
              'color': vehicle!.color,
              'plateNumber': vehicle!.plateNumber,
              'carType': vehicle!.carType,
              'seats': vehicle!.seats,
            },
    };
  }
}

import 'package:equatable/equatable.dart';

class GovernorateEntity extends Equatable {
  final String id;
  final String name;
  final bool isActive;

  const GovernorateEntity({
    required this.id,
    required this.name,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, name, isActive];
}

class CarTypeEntity extends Equatable {
  final String id;
  final String name;
  final bool isActive;

  const CarTypeEntity({
    required this.id,
    required this.name,
    this.isActive = true,
  });

  @override
  List<Object?> get props => [id, name, isActive];
}

enum CouponDiscountType { percentage, fixed }

class CouponEntity extends Equatable {
  final String id;
  final String code;
  final CouponDiscountType discountType;
  final double value;
  final int maxUses;
  final int usedCount;
  final DateTime? expiresAt;
  final bool isActive;

  const CouponEntity({
    required this.id,
    required this.code,
    required this.discountType,
    required this.value,
    required this.maxUses,
    this.usedCount = 0,
    this.expiresAt,
    this.isActive = true,
  });

  bool get isExpired => expiresAt != null && expiresAt!.isBefore(DateTime.now());
  bool get isExhausted => usedCount >= maxUses;

  @override
  List<Object?> get props => [id, code, discountType, value, isActive];
}

class AppSettingsEntity extends Equatable {
  final double commissionStandardPercent;
  final double commissionReturnEmptyPercent;
  final String? logoUrl;
  final String? facebookUrl;
  final String? instagramUrl;
  final String? whatsappNumber;
  final String supportEmail;

  const AppSettingsEntity({
    this.commissionStandardPercent = 10,
    this.commissionReturnEmptyPercent = 5,
    this.logoUrl,
    this.facebookUrl,
    this.instagramUrl,
    this.whatsappNumber,
    this.supportEmail = '',
  });

  @override
  List<Object?> get props => [
        commissionStandardPercent,
        commissionReturnEmptyPercent,
        logoUrl,
        facebookUrl,
        instagramUrl,
        whatsappNumber,
        supportEmail,
      ];
}

class AdminDashboardStats extends Equatable {
  final int activeTrips;
  final int pendingDrivers;
  final int todayBookings;
  final int totalUsers;

  const AdminDashboardStats({
    this.activeTrips = 0,
    this.pendingDrivers = 0,
    this.todayBookings = 0,
    this.totalUsers = 0,
  });

  @override
  List<Object?> get props => [activeTrips, pendingDrivers, todayBookings, totalUsers];
}

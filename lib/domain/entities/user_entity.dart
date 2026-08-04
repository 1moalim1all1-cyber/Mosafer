import 'package:equatable/equatable.dart';

enum UserRole { passenger, driver, admin }

enum Gender { male, female }

enum AccountStatus { active, suspended, banned }

class UserEntity extends Equatable {
  final String uid;
  final UserRole role;
  final String fullName;
  final String phone;
  final String email;
  final Gender gender;
  final String? profileImageUrl;
  final bool isPhoneVerified;
  final bool isEmailVerified;
  final double trustScore;
  final int totalTrips;
  final double avgRating;
  final AccountStatus status;
  final String language;
  final List<String> favoriteTrips;
  final String referralCode; // كود المستخدم بتاعه هو - يشاركه مع أصحابه
  final String? referredByUid; // لو اتسجّل بكود صاحب معيّن
  final DateTime createdAt;

  const UserEntity({
    required this.uid,
    required this.role,
    required this.fullName,
    required this.phone,
    required this.email,
    required this.gender,
    this.profileImageUrl,
    this.isPhoneVerified = false,
    this.isEmailVerified = false,
    this.trustScore = 0,
    this.totalTrips = 0,
    this.avgRating = 0,
    this.status = AccountStatus.active,
    this.language = 'ar',
    this.favoriteTrips = const [],
    this.referralCode = '',
    this.referredByUid,
    required this.createdAt,
  });

  bool get isDriver => role == UserRole.driver;
  bool get isPassenger => role == UserRole.passenger;
  bool get isAdmin => role == UserRole.admin;
  bool get isFemale => gender == Gender.female;

  @override
  List<Object?> get props => [uid, role, fullName, phone, email, status];
}

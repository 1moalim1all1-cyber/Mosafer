import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.uid,
    required super.role,
    required super.fullName,
    required super.phone,
    required super.email,
    required super.gender,
    super.profileImageUrl,
    super.isPhoneVerified,
    super.isEmailVerified,
    super.trustScore,
    super.totalTrips,
    super.avgRating,
    super.status,
    super.language,
    super.favoriteTrips,
    required super.createdAt,
  });

  factory UserModel.fromEntity(UserEntity e) => UserModel(
        uid: e.uid,
        role: e.role,
        fullName: e.fullName,
        phone: e.phone,
        email: e.email,
        gender: e.gender,
        profileImageUrl: e.profileImageUrl,
        isPhoneVerified: e.isPhoneVerified,
        isEmailVerified: e.isEmailVerified,
        trustScore: e.trustScore,
        totalTrips: e.totalTrips,
        avgRating: e.avgRating,
        status: e.status,
        language: e.language,
        favoriteTrips: e.favoriteTrips,
        createdAt: e.createdAt,
      );

  factory UserModel.fromMap(String uid, Map<String, dynamic> map) {
    return UserModel(
      uid: uid,
      role: UserRole.values.firstWhere(
        (r) => r.name == (map['role'] ?? 'passenger'),
        orElse: () => UserRole.passenger,
      ),
      fullName: map['fullName'] ?? '',
      phone: map['phone'] ?? '',
      email: map['email'] ?? '',
      gender: Gender.values.firstWhere(
        (g) => g.name == (map['gender'] ?? 'male'),
        orElse: () => Gender.male,
      ),
      profileImageUrl: map['profileImageUrl'],
      isPhoneVerified: map['isPhoneVerified'] ?? false,
      isEmailVerified: map['isEmailVerified'] ?? false,
      trustScore: (map['trustScore'] ?? 0).toDouble(),
      totalTrips: map['totalTrips'] ?? 0,
      avgRating: (map['avgRating'] ?? 0).toDouble(),
      status: AccountStatus.values.firstWhere(
        (s) => s.name == (map['status'] ?? 'active'),
        orElse: () => AccountStatus.active,
      ),
      language: map['language'] ?? 'ar',
      favoriteTrips: List<String>.from(map['favoriteTrips'] ?? const []),
      createdAt: (map['createdAt'] is Timestamp)
          ? (map['createdAt'] as Timestamp).toDate()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'role': role.name,
      'fullName': fullName,
      'phone': phone,
      'email': email,
      'gender': gender.name,
      'profileImageUrl': profileImageUrl,
      'isPhoneVerified': isPhoneVerified,
      'isEmailVerified': isEmailVerified,
      'trustScore': trustScore,
      'totalTrips': totalTrips,
      'avgRating': avgRating,
      'status': status.name,
      'language': language,
      'favoriteTrips': favoriteTrips,
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}

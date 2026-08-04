import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_constants.dart';
import '../../auth/providers/auth_providers.dart';

/// تبديل حالة المفضلة لرحلة معيّنة. العملية آمنة أمنيًا لأنها بتعدّل
/// حقل favoriteTrips بتاع المستخدم نفسه بس (firestore.rules بتسمح
/// بتعديل وثيقة المستخدم من مالكها).
class FavoritesService {
  final FirebaseFirestore _firestore;
  FavoritesService({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  Future<void> toggleFavorite({
    required String uid,
    required String tripId,
    required bool isCurrentlyFavorite,
  }) async {
    final userRef = _firestore.collection(AppConstants.usersCollection).doc(uid);
    await userRef.update({
      'favoriteTrips': isCurrentlyFavorite
          ? FieldValue.arrayRemove([tripId])
          : FieldValue.arrayUnion([tripId]),
    });
  }
}

final favoritesServiceProvider = Provider<FavoritesService>((ref) => FavoritesService());

/// قائمة IDs الرحلات المفضلة للمستخدم الحالي - بتتحدث لحظيًا مع أي تعديل
final favoriteTripIdsProvider = StreamProvider.autoDispose<List<String>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return const Stream.empty();
  return FirebaseFirestore.instance
      .collection(AppConstants.usersCollection)
      .doc(user.uid)
      .snapshots()
      .map((doc) => List<String>.from(doc.data()?['favoriteTrips'] ?? const []));
});

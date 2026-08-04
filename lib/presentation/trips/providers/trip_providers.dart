import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../domain/entities/trip_entity.dart';
import '../../../domain/entities/trip_search_params.dart';
import '../../../domain/repositories/trip_repository.dart';
import '../../../data/repositories/trip_repository_impl.dart';
import '../../auth/providers/auth_providers.dart';
import '../../admin/providers/admin_providers.dart';
import '../../../core/constants/egypt_governorates.dart';

final tripRepositoryProvider = Provider<TripRepository>((ref) {
  return TripRepositoryImpl();
});

/// معايير البحث الحالية (يوم واحد افتراضيًا = النهاردة، مقعد واحد)
final searchParamsProvider = StateProvider<TripSearchParams>((ref) {
  final now = DateTime.now();
  return TripSearchParams(
    originCity: '',
    destinationCity: '',
    date: DateTime(now.year, now.month, now.day),
  );
});

/// نتيجة آخر بحث تم تنفيذه فعليًا (يتغيّر بس لما المستخدم يدوس "ابحث")
final tripSearchResultsProvider =
    FutureProvider.autoDispose<List<TripEntity>>((ref) async {
  final params = ref.watch(searchParamsProvider);
  final currentUser = ref.watch(currentUserProvider);

  if (params.originCity.isEmpty || params.destinationCity.isEmpty) {
    return [];
  }

  final gender = currentUser?.gender.name ?? 'male';

  return ref.read(tripRepositoryProvider).searchTrips(
        params: params,
        requesterGender: gender,
      );
});

/// رحلة واحدة بالتفصيل (Stream عشان أي تحديث في عدد المقاعد ينعكس فورًا)
final tripDetailsProvider =
    StreamProvider.autoDispose.family<TripEntity?, String>((ref, tripId) {
  return ref.read(tripRepositoryProvider).watchTrip(tripId);
});

/// كل رحلات السائق الحالي (لعرضها في لوحته)
final driverTripsProvider =
    StreamProvider.autoDispose.family<List<TripEntity>, String>((ref, driverId) {
  return ref.read(tripRepositoryProvider).watchDriverTrips(driverId);
});

/// أسماء المحافظات الفعّالة - مصدرها Firestore (تديرها لوحة الإدارة في
/// Phase 9)، مع Fallback للقائمة الثابتة لو الأدمن لسه معملش أي تعديل،
/// عشان التطبيق يفضل شغال من أول تشغيل بدون إعداد يدوي إجباري.
final activeGovernorateNamesProvider = Provider.autoDispose<List<String>>((ref) {
  final governoratesAsync = ref.watch(adminGovernoratesProvider);
  return governoratesAsync.maybeWhen(
    data: (list) {
      final activeNames = list.where((g) => g.isActive).map((g) => g.name).toList();
      return activeNames.isEmpty ? EgyptGovernorates.list : activeNames;
    },
    orElse: () => EgyptGovernorates.list,
  );
});

/// عداد اجتماعي بسيط للصفحة الرئيسية - إجمالي الرحلات المكتملة على
/// المنصة. بيقرا من وثيقة عامة stats/public بدل استعلام مباشر على
/// bookings (اللي محمية بقواعد أمان تمنع أي مستخدم عادي يشوف حجوزات
/// غيره)، والعداد ده بيتحدّث تلقائيًا من Cloud Function وقت إنهاء
/// أي رحلة (markTripCompleted).
final totalCompletedTripsCountProvider = StreamProvider.autoDispose<int>((ref) {
  return FirebaseFirestore.instance
      .collection('stats')
      .doc('public')
      .snapshots()
      .map((doc) => (doc.data()?['completedTripsCount'] ?? 0) as int);
});

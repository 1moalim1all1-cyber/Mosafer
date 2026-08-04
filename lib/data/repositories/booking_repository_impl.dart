import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';

import '../../core/constants/app_constants.dart';
import '../../domain/entities/booking_entity.dart';
import '../../domain/repositories/booking_repository.dart';
import '../models/booking_model.dart';

/// استثناءات موحّدة بترجم أكواد Firebase Functions لرسائل عربية واضحة.
/// بنفس الاسم اللي كانت الشاشات بتتوقعه من Phase 3-6 عشان مانلمسش الـ UI.
class BookingConflictException implements Exception {
  final String message;
  BookingConflictException(this.message);
  @override
  String toString() => message;
}

class InsufficientBalanceException implements Exception {
  final String message;
  InsufficientBalanceException(this.message);
  @override
  String toString() => message;
}

class BookingRepositoryImpl implements BookingRepository {
  final FirebaseFirestore _firestore;
  final FirebaseFunctions _functions;

  BookingRepositoryImpl({
    FirebaseFirestore? firestore,
    FirebaseFunctions? functions,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _functions = functions ?? FirebaseFunctions.instance;

  /// كل منطق الحجز الحساس بقى في Cloud Functions (Admin SDK)، فمفيش
  /// أي Firestore Transaction بتتنفّذ من العميل هنا تاني - الكود ده
  /// بقى مجرد "غلاف" (Wrapper) بينادي السيرفر ويترجم الأخطاء بس.
  Future<T> _callFunction<T>(
    String name,
    Map<String, dynamic> data,
    T Function(Map<String, dynamic> result) onSuccess,
  ) async {
    try {
      final callable = _functions.httpsCallable(name);
      final result = await callable.call(data);
      return onSuccess(Map<String, dynamic>.from(result.data as Map));
    } on FirebaseFunctionsException catch (e) {
      final message = e.message ?? 'حصل خطأ، حاول تاني';
      if (e.code == 'failed-precondition' && message.contains('رصيد محفظتك')) {
        throw InsufficientBalanceException(message);
      }
      throw BookingConflictException(message);
    }
  }

  @override
  Future<String> createBooking({
    required String tripId,
    required String passengerId,
    required String driverId,
    required int seatsBooked,
    required double totalPrice,
    required PaymentMethod paymentMethod,
    String? couponCode,
  }) {
    return _callFunction<String>(
      'createBooking',
      {
        'tripId': tripId,
        'seatsBooked': seatsBooked,
        'paymentMethod': paymentMethod.name,
        if (couponCode != null && couponCode.isNotEmpty) 'couponCode': couponCode,
      },
      (result) => result['bookingId'] as String,
    );
  }

  @override
  Future<void> cancelBooking(
    String bookingId, {
    required String tripId,
    required int seatsToRestore,
  }) {
    return _callFunction<void>(
      'cancelBooking',
      {'bookingId': bookingId},
      (_) {},
    );
  }

  @override
  Future<void> respondToBooking({
    required String bookingId,
    required String tripId,
    required int seatsBooked,
    required bool accept,
  }) {
    return _callFunction<void>(
      'respondToBooking',
      {'bookingId': bookingId, 'accept': accept},
      (_) {},
    );
  }

  @override
  Future<void> markTripCompleted(String tripId) {
    return _callFunction<void>(
      'markTripCompleted',
      {'tripId': tripId},
      (_) {},
    );
  }

  // ---- قراءة الحجوزات: تفضل مباشرة من Firestore، مفيش أي حساسية أمنية
  // في القراءة نفسها طول ما firestore.rules بتضمن كل مستخدم يشوف حجوزاته بس ----

  @override
  Stream<List<BookingEntity>> watchTripBookings(String tripId) {
    return _firestore
        .collection(AppConstants.bookingsCollection)
        .where('tripId', isEqualTo: tripId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.id, d.data())).toList());
  }

  @override
  Stream<List<BookingEntity>> watchPassengerBookings(String passengerId) {
    return _firestore
        .collection(AppConstants.bookingsCollection)
        .where('passengerId', isEqualTo: passengerId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.id, d.data())).toList());
  }

  @override
  Stream<List<BookingEntity>> watchDriverBookings(String driverId) {
    return _firestore
        .collection(AppConstants.bookingsCollection)
        .where('driverId', isEqualTo: driverId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) =>
            snap.docs.map((d) => BookingModel.fromMap(d.id, d.data())).toList());
  }
}

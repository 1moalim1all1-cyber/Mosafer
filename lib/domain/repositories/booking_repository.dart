import '../entities/booking_entity.dart';

abstract class BookingRepository {
  /// إنشاء حجز - لازم يتم داخل Transaction واحدة تضمن:
  /// 1) إن المقاعد المتاحة ما تنزلش تحت الصفر لو حجزين حصلوا في نفس اللحظة.
  /// 2) خصم عدد المقاعد المحجوزة من الرحلة فورًا.
  Future<String> createBooking({
    required String tripId,
    required String passengerId,
    required String driverId,
    required int seatsBooked,
    required double totalPrice,
    required PaymentMethod paymentMethod,
    String? couponCode,
  });

  Future<void> cancelBooking(String bookingId, {required String tripId, required int seatsToRestore});

  /// قبول أو رفض السائق لطلب حجز. الرفض بيرجّع المقاعد المحجوزة للرحلة تلقائيًا.
  Future<void> respondToBooking({
    required String bookingId,
    required String tripId,
    required int seatsBooked,
    required bool accept,
  });

  /// السائق بيعلّم الرحلة كمنتهية - بيحوّل أرباح الحجوزات المدفوعة بالمحفظة
  /// (بعد خصم العمولة) لمحفظته فعليًا.
  Future<void> markTripCompleted(String tripId);

  Stream<List<BookingEntity>> watchPassengerBookings(String passengerId);

  Stream<List<BookingEntity>> watchDriverBookings(String driverId);

  /// طلبات الحجز الخاصة برحلة معيّنة (تُستخدم في شاشة السائق لقبول/رفض الحجوزات)
  Stream<List<BookingEntity>> watchTripBookings(String tripId);
}

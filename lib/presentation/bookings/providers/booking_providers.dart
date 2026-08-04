import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/repositories/booking_repository.dart';
import '../../../data/repositories/booking_repository_impl.dart';

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  return BookingRepositoryImpl();
});

final bookingLoadingProvider = StateProvider<bool>((ref) => false);
final bookingErrorProvider = StateProvider<String?>((ref) => null);

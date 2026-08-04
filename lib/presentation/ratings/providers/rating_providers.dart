import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/repositories/rating_repository.dart';
import '../../../data/repositories/rating_repository_impl.dart';

final ratingRepositoryProvider = Provider<RatingRepository>((ref) {
  return RatingRepositoryImpl();
});

final ratingSubmittingProvider = StateProvider<bool>((ref) => false);

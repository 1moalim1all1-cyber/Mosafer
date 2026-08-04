import 'package:equatable/equatable.dart';

class TripSearchParams extends Equatable {
  final String originCity;
  final String destinationCity;
  final DateTime date;
  final int seatsNeeded;
  final bool returnEmptyOnly; // فلتر "راجع فاضي"
  final bool womenOnlyFilter; // فلتر "سيدات فقط" (يفعّله الراكب الأنثى بس)

  const TripSearchParams({
    required this.originCity,
    required this.destinationCity,
    required this.date,
    this.seatsNeeded = 1,
    this.returnEmptyOnly = false,
    this.womenOnlyFilter = false,
  });

  TripSearchParams copyWith({
    String? originCity,
    String? destinationCity,
    DateTime? date,
    int? seatsNeeded,
    bool? returnEmptyOnly,
    bool? womenOnlyFilter,
  }) {
    return TripSearchParams(
      originCity: originCity ?? this.originCity,
      destinationCity: destinationCity ?? this.destinationCity,
      date: date ?? this.date,
      seatsNeeded: seatsNeeded ?? this.seatsNeeded,
      returnEmptyOnly: returnEmptyOnly ?? this.returnEmptyOnly,
      womenOnlyFilter: womenOnlyFilter ?? this.womenOnlyFilter,
    );
  }

  @override
  List<Object?> get props => [
        originCity,
        destinationCity,
        date,
        seatsNeeded,
        returnEmptyOnly,
        womenOnlyFilter,
      ];
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../providers/trip_providers.dart';
import '../../auth/providers/auth_providers.dart';
import '../../bookings/providers/booking_providers.dart';
import '../../shared/widgets/app_button.dart';
import '../../../data/repositories/booking_repository_impl.dart';
import '../../../domain/entities/booking_entity.dart';
import '../../../domain/entities/trip_entity.dart';
import '../../../domain/entities/user_entity.dart';
import '../../wallet/providers/wallet_providers.dart';
import '../../chat/providers/chat_providers.dart';
import '../providers/favorites_providers.dart';
import '../../../core/theme/app_colors.dart';

/// جلب بيانات السائق المرتبطة بالرحلة (الاسم، التقييم، الصورة)
final _driverInfoProvider = FutureProvider.autoDispose
    .family<UserEntity?, String>((ref, driverId) {
  return ref.read(authRepositoryProvider).fetchUserProfile(driverId);
});

class TripDetailsScreen extends ConsumerStatefulWidget {
  final String tripId;
  const TripDetailsScreen({super.key, required this.tripId});

  @override
  ConsumerState<TripDetailsScreen> createState() => _TripDetailsScreenState();
}

class _TripDetailsScreenState extends ConsumerState<TripDetailsScreen> {
  int _seatsToBook = 1;
  PaymentMethod _paymentMethod = PaymentMethod.cash;
  final _couponController = TextEditingController();
  String? _couponMessage;
  double _couponDiscount = 0;

  double _finalTotal(TripEntity trip) {
    final original = trip.pricePerSeat * _seatsToBook;
    return (original - _couponDiscount).clamp(0, original);
  }

  Future<void> _applyCoupon(TripEntity trip) async {
    final code = _couponController.text.trim().toUpperCase();
    if (code.isEmpty) return;

    setState(() {
      _couponMessage = null;
      _couponDiscount = 0;
    });

    try {
      final snap = await FirebaseFirestore.instance
          .collection('coupons')
          .where('code', isEqualTo: code)
          .limit(1)
          .get();

      if (snap.docs.isEmpty) {
        setState(() => _couponMessage = 'الكود ده مش موجود');
        return;
      }

      final coupon = snap.docs.first.data();
      final isActive = coupon['isActive'] == true;
      final expiresAt = coupon['expiresAt'];
      final notExpired = expiresAt == null ||
          (expiresAt as Timestamp).toDate().isAfter(DateTime.now());
      final usedCount = (coupon['usedCount'] ?? 0) as int;
      final maxUses = (coupon['maxUses'] ?? 0) as int;
      final notExhausted = usedCount < maxUses;

      if (!isActive || !notExpired || !notExhausted) {
        setState(() => _couponMessage = 'الكود ده منتهي أو مش متاح دلوقتي');
        return;
      }

      final original = trip.pricePerSeat * _seatsToBook;
      final discountType = coupon['discountType'] ?? 'percentage';
      final value = (coupon['value'] ?? 0).toDouble();
      final discount =
          discountType == 'percentage' ? original * (value / 100) : value;

      setState(() {
        _couponDiscount = discount.clamp(0, original);
        _couponMessage = 'تم تطبيق الخصم! وفّرت ${_couponDiscount.toStringAsFixed(0)} ج.م';
      });
    } catch (_) {
      setState(() => _couponMessage = 'حصل خطأ، حاول تاني');
    }
  }

  Future<void> _confirmBooking(TripEntity trip) async {
    final currentUser = ref.read(currentUserProvider);
    if (currentUser == null) return;

    ref.read(bookingLoadingProvider.notifier).state = true;
    ref.read(bookingErrorProvider.notifier).state = null;

    try {
      await ref.read(bookingRepositoryProvider).createBooking(
            tripId: trip.id,
            passengerId: currentUser.uid,
            driverId: trip.driverId,
            seatsBooked: _seatsToBook,
            totalPrice: trip.pricePerSeat * _seatsToBook,
            paymentMethod: _paymentMethod,
            couponCode: _couponController.text.trim().isEmpty
                ? null
                : _couponController.text.trim(),
          );

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('تم الحجز بنجاح 🎉'),
          content: const Text(
            'حجزك بانتظار موافقة السائق، هتوصلك إشعار فور ما يتم التأكيد',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _openChatWithDriver(trip);
              },
              child: const Text('راسل السائق'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('تمام'),
            ),
          ],
        ),
      );
    } on BookingConflictException catch (e) {
      ref.read(bookingErrorProvider.notifier).state = e.message;
    } on InsufficientBalanceException catch (e) {
      ref.read(bookingErrorProvider.notifier).state = e.message;
    } catch (_) {
      ref.read(bookingErrorProvider.notifier).state = 'حصل خطأ، حاول تاني';
    } finally {
      if (mounted) ref.read(bookingLoadingProvider.notifier).state = false;
    }
  }

  Future<void> _openChatWithDriver(TripEntity trip) async {
    final currentUser = ref.read(currentUserProvider);
    if (currentUser == null) return;

    final chatId = ref
        .read(chatRepositoryProvider)
        .buildChatId(tripId: trip.id, passengerId: currentUser.uid);

    await ref.read(chatRepositoryProvider).ensureChatExists(
          chatId: chatId,
          tripId: trip.id,
          passengerId: currentUser.uid,
          driverId: trip.driverId,
        );

    if (!mounted) return;
    context.push('/chat/$chatId');
  }

  @override
  Widget build(BuildContext context) {
    final tripAsync = ref.watch(tripDetailsProvider(widget.tripId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('تفاصيل الرحلة'),
        actions: [
          tripAsync.maybeWhen(
            data: (trip) => trip == null
                ? const SizedBox.shrink()
                : Consumer(
                    builder: (context, ref, _) {
                      final currentUser = ref.watch(currentUserProvider);
                      final favoritesAsync = ref.watch(favoriteTripIdsProvider);
                      final isFavorite = favoritesAsync.maybeWhen(
                        data: (ids) => ids.contains(trip.id),
                        orElse: () => false,
                      );
                      return IconButton(
                        icon: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: isFavorite ? AppColors.error : null,
                        ),
                        onPressed: currentUser == null
                            ? null
                            : () => ref.read(favoritesServiceProvider).toggleFavorite(
                                  uid: currentUser.uid,
                                  tripId: trip.id,
                                  isCurrentlyFavorite: isFavorite,
                                ),
                      );
                    },
                  ),
            orElse: () => const SizedBox.shrink(),
          ),
          tripAsync.maybeWhen(
            data: (trip) => trip == null
                ? const SizedBox.shrink()
                : IconButton(
                    icon: const Icon(Icons.chat_bubble_outline),
                    onPressed: () => _openChatWithDriver(trip),
                  ),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: tripAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => const Center(child: Text('حصل خطأ في تحميل الرحلة')),
        data: (trip) {
          if (trip == null) {
            return const Center(child: Text('الرحلة دي مش موجودة'));
          }
          return _buildContent(context, trip);
        },
      ),
    );
  }

  Widget _buildContent(BuildContext context, TripEntity trip) {
    final driverAsync = ref.watch(_driverInfoProvider(trip.driverId));
    final isLoading = ref.watch(bookingLoadingProvider);
    final error = ref.watch(bookingErrorProvider);
    final timeFormat = DateFormat('hh:mm a - EEEE d MMMM', 'ar');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (trip.isWomenOnly)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.womenOnly.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: const [
                  Icon(Icons.female, color: AppColors.womenOnly),
                  SizedBox(width: 8),
                  Expanded(child: Text('رحلة سيدات فقط')),
                ],
              ),
            ),

          // ---- بيانات السائق ----
          driverAsync.when(
            loading: () => const SizedBox(
                height: 60, child: Center(child: CircularProgressIndicator())),
            error: (_, __) => const SizedBox.shrink(),
            data: (driver) {
              if (driver == null) return const SizedBox.shrink();
              return Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                        backgroundImage: driver.profileImageUrl != null
                            ? NetworkImage(driver.profileImageUrl!)
                            : null,
                        child: driver.profileImageUrl == null
                            ? const Icon(Icons.person)
                            : null,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(driver.fullName,
                                style: Theme.of(context).textTheme.titleMedium),
                            Row(
                              children: [
                                const Icon(Icons.star, size: 14, color: AppColors.ratingStar),
                                const SizedBox(width: 4),
                                Text('${driver.avgRating.toStringAsFixed(1)} · ${driver.totalTrips} رحلة'),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),

          const SizedBox(height: 16),
          Text('${trip.originCity} → ${trip.destinationCity}',
              style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 6),
          Text(timeFormat.format(trip.departureTime),
              style: Theme.of(context).textTheme.bodyMedium),

          const SizedBox(height: 20),
          _infoRow(context, Icons.event_seat, '${trip.availableSeats} مقاعد متاحة'),
          _infoRow(context, Icons.directions_car, trip.carType),
          _infoRow(context, Icons.timer_outlined,
              '${trip.estimatedDurationMinutes} دقيقة تقريبًا'),

          if (trip.originLat != 0 && trip.destinationLat != 0) ...[
            const SizedBox(height: 16),
            _TripRouteMap(trip: trip),
          ],

          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('عدد المقاعد', style: Theme.of(context).textTheme.titleMedium),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed: _seatsToBook > 1
                        ? () => setState(() => _seatsToBook--)
                        : null,
                  ),
                  Text('$_seatsToBook'),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: _seatsToBook < trip.availableSeats
                        ? () => setState(() => _seatsToBook++)
                        : null,
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 16),
          Text('كوبون خصم (اختياري)', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _couponController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(hintText: 'اكتب كود الكوبون'),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton(
                onPressed: () => _applyCoupon(trip),
                child: const Text('تطبيق'),
              ),
            ],
          ),
          if (_couponMessage != null) ...[
            const SizedBox(height: 6),
            Text(
              _couponMessage!,
              style: TextStyle(
                color: _couponDiscount > 0 ? AppColors.success : AppColors.error,
                fontSize: 13,
              ),
            ),
          ],

          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('الإجمالي', style: Theme.of(context).textTheme.titleMedium),
              Text(
                '${_finalTotal(trip).toStringAsFixed(0)} ج.م',
                style: Theme.of(context)
                    .textTheme
                    .headlineMedium
                    ?.copyWith(color: AppColors.accent),
              ),
            ],
          ),

          const SizedBox(height: 12),
          Text('طريقة الدفع', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _PaymentMethodChip(
                  label: 'نقدي',
                  icon: Icons.money,
                  selected: _paymentMethod == PaymentMethod.cash,
                  onTap: () => setState(() => _paymentMethod = PaymentMethod.cash),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Consumer(
                  builder: (context, ref, _) {
                    final balanceAsync = ref.watch(walletBalanceProvider);
                    return _PaymentMethodChip(
                      label: balanceAsync.maybeWhen(
                        data: (b) => 'المحفظة (${b.toStringAsFixed(0)} ج.م)',
                        orElse: () => 'المحفظة',
                      ),
                      icon: Icons.account_balance_wallet_outlined,
                      selected: _paymentMethod == PaymentMethod.wallet,
                      onTap: () => setState(() => _paymentMethod = PaymentMethod.wallet),
                    );
                  },
                ),
              ),
            ],
          ),

          if (error != null) ...[
            const SizedBox(height: 12),
            Text(error, style: const TextStyle(color: AppColors.error)),
          ],

          const SizedBox(height: 24),
          AppButton(
            label: _paymentMethod == PaymentMethod.wallet
                ? 'احجز الآن (دفع من المحفظة)'
                : 'احجز الآن (دفع نقدي)',
            isLoading: isLoading,
            onPressed: trip.isBookable ? () => _confirmBooking(trip) : null,
          ),
        ],
      ),
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.lightTextSecondary),
          const SizedBox(width: 8),
          Text(text, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}

class _PaymentMethodChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentMethodChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withValues(alpha: 0.1) : null,
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.lightBorder,
            width: selected ? 1.6 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: selected ? AppColors.primary : null),
            const SizedBox(height: 4),
            Text(label, style: Theme.of(context).textTheme.bodySmall,
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

/// معاينة ثابتة (غير تفاعلية) لمسار الرحلة على خريطة OpenStreetMap،
/// بتعرض نقطتي الانطلاق والوصول بالظبط زي ما السائق حددهم وقت الإنشاء.
class _TripRouteMap extends StatelessWidget {
  final TripEntity trip;
  const _TripRouteMap({required this.trip});

  @override
  Widget build(BuildContext context) {
    final origin = LatLng(trip.originLat, trip.originLng);
    final destination = LatLng(trip.destinationLat, trip.destinationLng);
    final centerLat = (trip.originLat + trip.destinationLat) / 2;
    final centerLng = (trip.originLng + trip.destinationLng) / 2;
    final hasLiveDriver = trip.hasFreshLiveLocation;
    final driverPoint = hasLiveDriver
        ? LatLng(trip.driverLiveLat!, trip.driverLiveLng!)
        : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasLiveDriver)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.success,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  'السائق بيشارك موقعه الحي دلوقتي',
                  style: Theme.of(context)
                      .textTheme
                      .bodySmall
                      ?.copyWith(color: AppColors.success, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: SizedBox(
            height: 200,
            child: IgnorePointer(
              // خريطة عرض بس - مش تفاعلية هنا، لو الراكب عايز يتفاعل معاها
              // يقدر نضيف زرار "افتح كخريطة كاملة" لاحقًا
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: driverPoint ?? LatLng(centerLat, centerLng),
                  initialZoom: hasLiveDriver ? 12 : 7,
                  interactionOptions: const InteractionOptions(flags: InteractiveFlag.none),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.mosafer.app',
                  ),
                  PolylineLayer(
                    polylines: [
                      Polyline(points: [origin, destination], strokeWidth: 3, color: AppColors.accent),
                    ],
                  ),
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: origin,
                        width: 36,
                        height: 36,
                        child: const Icon(Icons.trip_origin, color: AppColors.success, size: 28),
                      ),
                      Marker(
                        point: destination,
                        width: 36,
                        height: 36,
                        child: const Icon(Icons.location_on, color: AppColors.error, size: 32),
                      ),
                      // موقع السائق الحي - زي أيقونة كريم بالظبط، بتتحدث
                      // تلقائيًا لحظيًا مع كل تحديث من Firestore
                      if (driverPoint != null)
                        Marker(
                          point: driverPoint,
                          width: 44,
                          height: 44,
                          child: Container(
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary,
                              border: Border.all(color: Colors.white, width: 2.5),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.4),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: const Icon(Icons.directions_car, color: Colors.white, size: 22),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

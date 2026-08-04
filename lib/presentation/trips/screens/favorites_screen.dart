import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/favorites_providers.dart';
import '../providers/trip_providers.dart';
import '../widgets/trip_card.dart';
import '../../shared/widgets/app_button.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoriteIdsAsync = ref.watch(favoriteTripIdsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المفضلة')),
      body: favoriteIdsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => const Center(child: Text('حصل خطأ')),
        data: (ids) {
          if (ids.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.favorite_border, size: 48),
                    const SizedBox(height: 12),
                    const Text('لسه مضفتش أي رحلة للمفضلة'),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: 200,
                      child: AppButton(
                        label: 'ابحث عن رحلة',
                        onPressed: () => context.go('/home'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: ids.length,
            itemBuilder: (context, index) {
              final tripId = ids[index];
              return Consumer(
                builder: (context, ref, _) {
                  final tripAsync = ref.watch(tripDetailsProvider(tripId));
                  return tripAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (trip) {
                      if (trip == null) return const SizedBox.shrink();
                      return TripCard(
                        trip: trip,
                        onTap: () => context.push('/trip/${trip.id}'),
                      );
                    },
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

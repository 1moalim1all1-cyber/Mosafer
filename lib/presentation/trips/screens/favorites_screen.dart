import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../providers/favorites_providers.dart';
import '../providers/trip_providers.dart';
import '../widgets/trip_card.dart';

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
            return const Center(child: Text('لسه مضفتش أي رحلة للمفضلة'));
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

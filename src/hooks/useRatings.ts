import { useState, useCallback } from 'react';
import { Rating, UserRatingStats } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

export function useRatings(userId?: string) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userStats, setUserStats] = useState<UserRatingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = useCallback(async (ratedUserId: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'ratings'),
        where('ratedUserId', '==', ratedUserId)
      );
      const snapshot = await getDocs(q);
      const fetchedRatings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Rating[];
      setRatings(fetchedRatings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserStats = useCallback(async (ratedUserId: string) => {
    try {
      const statsRef = doc(db, 'rating_stats', ratedUserId);
      const snapshot = await getDoc(statsRef);
      if (snapshot.exists()) {
        setUserStats({ userId: snapshot.id, ...snapshot.data() } as UserRatingStats);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats');
    }
  }, []);

  const submitRating = useCallback(
    async (ratingData: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const docRef = await addDoc(collection(db, 'ratings'), {
          ...ratingData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        await fetchRatings(ratingData.ratedUserId);
        await fetchUserStats(ratingData.ratedUserId);
        return docRef.id;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit rating');
        return null;
      }
    },
    [fetchRatings, fetchUserStats]
  );

  return {
    ratings,
    userStats,
    loading,
    error,
    fetchRatings,
    fetchUserStats,
    submitRating,
  };
}

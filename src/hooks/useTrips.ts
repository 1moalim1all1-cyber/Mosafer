import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Trip } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const q = filters
        ? query(collection(db, 'trips'), where('status', '==', filters.status))
        : collection(db, 'trips');
      const snapshot = await getDocs(q);
      const fetchedTrips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Trip[];
      setTrips(fetchedTrips);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrip = useMutation({
    mutationFn: async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'trips'), {
        ...tripData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...tripData };
    },
  });

  const updateTrip = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Trip> }) => {
      const tripRef = doc(db, 'trips', id);
      await updateDoc(tripRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    },
  });

  const getTripById = useCallback(async (tripId: string) => {
    try {
      const docRef = doc(db, 'trips', tripId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Trip) : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trip');
      return null;
    }
  }, []);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    getTripById,
  };
}

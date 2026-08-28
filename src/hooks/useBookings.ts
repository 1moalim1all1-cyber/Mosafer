import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Booking } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      let q;
      if (userId) {
        q = query(collection(db, 'bookings'), where('passengerId', '==', userId));
      } else {
        q = collection(db, 'bookings');
      }
      const snapshot = await getDocs(q);
      const fetchedBookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(fetchedBookings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createBooking = useMutation({
    mutationFn: async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
      const docRef = await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...bookingData };
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Booking> }) => {
      const bookingRef = doc(db, 'bookings', id);
      await updateDoc(bookingRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    },
  });

  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      });
      return bookingId;
    },
  });

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBooking,
    cancelBooking,
  };
}

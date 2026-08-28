import { useState, useCallback, useEffect } from 'react';
import { Location } from '../types';

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by this browser');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setError(null);
        },
        (err) => {
          setError(err.message);
        }
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      }
    );
    setWatchId(id);
    setWatching(true);
  }, []);

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
      setWatchId(null);
    }
  }, [watchId]);

  const calculateDistance = useCallback(
    (lat2: number, lon2: number): number => {
      if (!location) return 0;
      const R = 6371;
      const dLat = ((lat2 - location.latitude) * Math.PI) / 180;
      const dLon = ((lon2 - location.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((location.latitude * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [location]
  );

  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    loading,
    error,
    watching,
    getCurrentLocation,
    watchLocation,
    stopWatching,
    calculateDistance,
  };
}

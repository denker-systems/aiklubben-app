import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UserLocation {
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionGranted(false);
        return;
      }
      setPermissionGranted(true);

      const coords = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      setLocation({
        city: geocode?.city ?? geocode?.subregion ?? null,
        country: geocode?.country ?? null,
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });
    } catch (err) {
      console.error('[useLocation] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        requestLocation();
      } else {
        setPermissionGranted(false);
      }
    });
  }, []);

  return { location, permissionGranted, loading, requestLocation };
}

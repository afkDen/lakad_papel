import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { setLastKnownLocation } from '../context/DocumentContext';

export function useLocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const fetchLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lon } = location.coords;
      setLatitude(lat);
      setLongitude(lon);
      setLastKnownLocation(lat, lon); // Update the global cache
    } catch (err) {
      console.error('Error getting current location:', err);
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      if (granted) {
        await fetchLocation();
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
    }
  };

  useEffect(() => {
    async function checkPermission() {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        const granted = status === 'granted';
        setPermissionGranted(granted);
        if (granted) {
          await fetchLocation();
        }
      } catch (err) {
        console.error('Error checking location permission:', err);
      }
    }
    checkPermission();
  }, []);

  return {
    latitude,
    longitude,
    permissionGranted,
    requestPermission,
  };
}

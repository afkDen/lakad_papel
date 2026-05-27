import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { setLastKnownLocation } from '../context/DocumentContext';

export function useLocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lon } = location.coords;
      if (isMounted.current) {
        setLatitude(lat);
        setLongitude(lon);
      }
      setLastKnownLocation(lat, lon); // Update the global cache
    } catch (err) {
      console.error('Error getting current location:', err);
    }
  };

  const requestPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      if (isMounted.current) {
        setPermissionGranted(granted);
      }
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
        if (isMounted.current) {
          setPermissionGranted(granted);
        }
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

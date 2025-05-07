import { toast } from '@/hooks/use-toast';
/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

// Default location (e.g., Los Angeles) if geolocation fails or is denied
const DEFAULT_LOCATION: Location = {
  lat: 34.0522,
  lng: -118.2437,
};

/**
 * Asynchronously retrieves the user's current location using the browser's Geolocation API.
 * Falls back to a default location if permission is denied or an error occurs.
 *
 * @returns A promise that resolves to a Location object containing latitude and longitude.
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Error getting user location:', error.message);
          let title = 'Location Error';
          let description = 'Could not retrieve your current location. Using a default location.';

          if (error.code === error.PERMISSION_DENIED) {
            title = 'Location Access Denied';
            description = 'Please enable location access in your browser settings to see nearby posts. Using a default location for now.';
          }
          
          toast({
            variant: 'destructive',
            title: title,
            description: description,
          });
          resolve(DEFAULT_LOCATION);
        },
        {
          enableHighAccuracy: false, // Can be true for more accuracy but more power usage
          timeout: 10000, // 10 seconds
          maximumAge: 60000 // 1 minute cache
        }
      );
    } else {
      console.warn('Geolocation is not supported by this browser.');
      toast({
        variant: 'destructive',
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation. Using a default location.',
      });
      resolve(DEFAULT_LOCATION);
    }
  });
}

import type { Location } from '@/services/location';

/**
 * Calculates the distance in miles between two geographical points using the Haversine formula.
 * @param loc1 The first location.
 * @param loc2 The second location.
 * @returns The distance in miles.
 */
export function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = deg2rad(loc2.lat - loc1.lat);
  const dLon = deg2rad(loc2.lng - loc1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(loc1.lat)) * Math.cos(deg2rad(loc2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

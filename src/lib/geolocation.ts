import { detectLocation, LocationState } from './locationStore';

export interface UserLocationResult {
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
  method: 'GPS_HIGH_ACCURACY' | 'GPS_STANDARD' | 'IP_GEOLOCATION';
}

export async function acquireUserLocation(): Promise<UserLocationResult> {
  const loc: LocationState = await detectLocation(true);
  return {
    lat: loc.lat,
    lng: loc.lng,
    address: loc.address,
    accuracy: loc.accuracy || 10,
    method: loc.isGpsVerified ? 'GPS_HIGH_ACCURACY' : 'IP_GEOLOCATION',
  };
}

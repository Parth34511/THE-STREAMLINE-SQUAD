export interface LocationState {
  lat: number;
  lng: number;
  address: string;
  isGpsVerified: boolean;
  accuracy?: number;
  method?: 'GPS' | 'CLIENT_IP' | 'USER_PICK';
}

const STORAGE_KEY = 'civic_portal_user_location_v5';
const LOCATION_CHANGE_EVENT = 'civic_location_changed';

export function getStoredLocation(): LocationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number' && parsed.address) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored location:', e);
  }
  return null;
}

export function saveLocation(location: LocationState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    window.dispatchEvent(new CustomEvent(LOCATION_CHANGE_EVENT, { detail: location }));
  } catch (e) {
    console.warn('Error saving location:', e);
  }
}

export function subscribeLocationChange(callback: (loc: LocationState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<LocationState>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };
  window.addEventListener(LOCATION_CHANGE_EVENT, handler);
  return () => window.removeEventListener(LOCATION_CHANGE_EVENT, handler);
}

/**
 * Reverse geocodes lat/lng into a clean human-readable street/locality address.
 */
export async function reverseGeocodeLatLng(lat: number, lng: number): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.formattedAddress && !data.formattedAddress.includes('Unknown')) {
        return data.formattedAddress;
      }
    }
  } catch (err) {
    console.warn('Reverse geocode fetch error:', err);
  }
  return `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

/**
 * Client-Side HTTPS Real IP Geolocation
 * Executes directly in user's browser (uses user's exact ISP IP, not cloud server proxy)
 */
export async function fetchRealClientIpLocation(): Promise<{ lat: number; lng: number; label?: string } | null> {
  // Provider 1: ipwho.is (CORS enabled, HTTPS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.city || data.region || data.country;
        return { lat: data.latitude, lng: data.longitude, label: city };
      }
    }
  } catch (e) {
    console.warn('ipwho.is failed:', e);
  }

  // Provider 2: BigDataCloud (CORS enabled, HTTPS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.locality || data.city || data.principalSubdivision;
        return { lat: data.latitude, lng: data.longitude, label: city };
      }
    }
  } catch (e) {
    console.warn('bigdatacloud failed:', e);
  }

  // Provider 3: ipapi.co (CORS enabled, HTTPS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const city = data.city || data.region || data.country_name;
        return { lat: data.latitude, lng: data.longitude, label: city };
      }
    }
  } catch (e) {
    console.warn('ipapi.co failed:', e);
  }

  // Provider 4: geojs.io (CORS enabled, HTTPS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng, label: data.city || data.region };
      }
    }
  } catch (e) {
    console.warn('geojs failed:', e);
  }

  return null;
}

/**
 * Direct Browser Geolocation Hardware GPS Call with Fallback Strategy:
 * 1. Tries high accuracy (GPS/Hardware).
 * 2. Tries standard accuracy (Fast WiFi/Network positioning).
 * 3. Fallbacks seamlessly to live Client IP lookup if GPS fails/denied.
 */
export async function detectBrowserGpsLocation(): Promise<LocationState> {
  const queryPosition = (opts: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return reject(new Error('BROWSER_UNSUPPORTED'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });
  };

  let pos: GeolocationPosition | null = null;

  // Tier 1: Try High Accuracy (GPS/Hardware) with 5s timeout
  try {
    pos = await queryPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000,
    });
  } catch (err: any) {
    console.info('Tier 1 high accuracy GPS position failed/timed out:', err);
  }

  // Tier 2: Try Standard Accuracy (Fast WiFi/Network) if Tier 1 failed
  if (!pos) {
    try {
      pos = await queryPosition({
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 60000,
      });
    } catch (err: any) {
      console.info('Tier 2 standard accuracy position failed:', err);
    }
  }

  // If Browser Geolocation succeeded:
  if (pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = Math.round(pos.coords.accuracy || 10);
    const address = await reverseGeocodeLatLng(lat, lng);

    const newLoc: LocationState = {
      lat,
      lng,
      address,
      isGpsVerified: true,
      accuracy,
      method: 'GPS',
    };
    saveLocation(newLoc);
    return newLoc;
  }

  // Tier 3: Browser Geolocation failed/denied/timed out -> Resolve real Client IP
  const ipLoc = await fetchRealClientIpLocation();
  if (ipLoc) {
    const address = await reverseGeocodeLatLng(ipLoc.lat, ipLoc.lng);
    const resolvedAddress = address && !address.startsWith('Coordinates') 
      ? address 
      : (ipLoc.label ? `${ipLoc.label} Region` : `Coordinates (${ipLoc.lat.toFixed(4)}, ${ipLoc.lng.toFixed(4)})`);

    const newLoc: LocationState = {
      lat: ipLoc.lat,
      lng: ipLoc.lng,
      address: resolvedAddress,
      isGpsVerified: false,
      accuracy: 2500,
      method: 'CLIENT_IP',
    };
    saveLocation(newLoc);
    return newLoc;
  }

  throw new Error('POSITION_UNAVAILABLE');
}

/**
 * Absolute Dynamic Location Detection (Zero Hardcoded Fallbacks)
 * 1. Returns stored selection if user previously manually picked or detected location.
 * 2. Runs real-time dynamic detection:
 *    a) Tries Browser Hardware GPS (Tier 1 & Tier 2).
 *    b) If GPS denied or unavailable, falls back to Client IP lookup.
 *    c) Reverse geocodes exact coordinates.
 */
export async function detectLocation(forceGps = false): Promise<LocationState> {
  if (!forceGps) {
    const stored = getStoredLocation();
    if (stored) return stored;
  }

  return await detectBrowserGpsLocation();
}

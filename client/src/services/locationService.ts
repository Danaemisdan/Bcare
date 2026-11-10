// B Care Real-Time Location & Geocoding Service
// Auto-detects user GPS with fallback to IP-based geolocation and reverse geocoding

export interface UserLocationData {
  area: string;
  city: string;
  state: string;
  country: string;
  displayName: string;
  lat: number;
  lng: number;
  accuracyMeters?: number;
  isLiveGps: boolean;
  timestamp: number;
}

const STORAGE_KEY = 'bcare_user_live_location';

// Default fallback location (Hyderabad - Central Tech Hub of India)
const DEFAULT_LOCATION: UserLocationData = {
  area: 'Banjara Hills',
  city: 'Hyderabad',
  state: 'Telangana',
  country: 'India',
  displayName: 'Banjara Hills, Hyderabad',
  lat: 17.4156,
  lng: 78.4350,
  accuracyMeters: 50,
  isLiveGps: false,
  timestamp: Date.now()
};

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Generates an official Google Maps turn-by-turn navigation URL
 */
export function getGoogleMapsDirectionsUrl(
  destLat: number,
  destLng: number,
  originLat?: number,
  originLng?: number,
  destName?: string
): string {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}`;
  }
  if (destName) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destName)}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
}

/**
 * Reverse geocode latitude and longitude to human-readable address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ area: string; city: string; state: string; country: string }> {
  try {
    // 1. Try BigDataCloud (fast, accurate, no key needed)
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      const area = data.locality || data.suburb || data.neighbourhood || data.city || 'Nearby Area';
      const city = data.city || data.locality || data.principalSubdivision || 'City';
      const state = data.principalSubdivision || 'State';
      const country = data.countryName || 'India';
      return { area, city, state, country };
    }
  } catch (e) {
    // Continue to fallback
  }

  try {
    // 2. Fallback to OpenStreetMap Nominatim
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: { 'User-Agent': 'BCare-Healthcare-App/2.0' },
        signal: AbortSignal.timeout(4000)
      }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || addr.road || 'Local Area';
      const city = addr.city || addr.town || addr.municipality || addr.state_district || 'City';
      const state = addr.state || 'State';
      const country = addr.country || 'India';
      return { area, city, state, country };
    }
  } catch (e) {
    // Fallback
  }

  return {
    area: 'Live Location',
    city: 'Local Region',
    state: 'India',
    country: 'India'
  };
}

/**
 * IP-based geolocation fallback
 */
export async function fetchIpLocation(): Promise<UserLocationData | null> {
  try {
    const res = await fetch('http://ip-api.com/json/', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.lat && data.lon) {
        const area = data.city || 'City Center';
        const city = data.city || 'Hyderabad';
        const state = data.regionName || 'Telangana';
        const country = data.country || 'India';
        const displayName = area !== city ? `${area}, ${city}` : `${city}, ${state}`;
        return {
          area,
          city,
          state,
          country,
          displayName,
          lat: data.lat,
          lng: data.lon,
          accuracyMeters: 5000,
          isLiveGps: false,
          timestamp: Date.now()
        };
      }
    }
  } catch (e) {
    // Continue
  }
  return null;
}

/**
 * Automatically detects current user location using GPS with IP and cached fallbacks
 */
export async function detectCurrentLocation(forceGps = false): Promise<UserLocationData> {
  // If cached and fresh (less than 15 mins old), use it unless forcing GPS
  if (!forceGps) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as UserLocationData;
        if (Date.now() - parsed.timestamp < 15 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  // 1. Try Browser Geolocation (HTML5 GPS)
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 30000
        });
      });

      const { latitude, longitude, accuracy } = pos.coords;
      const geocoded = await reverseGeocode(latitude, longitude);

      const displayName =
        geocoded.area && geocoded.city && geocoded.area !== geocoded.city
          ? `${geocoded.area}, ${geocoded.city}`
          : `${geocoded.city}, ${geocoded.state}`;

      const locationResult: UserLocationData = {
        area: geocoded.area,
        city: geocoded.city,
        state: geocoded.state,
        country: geocoded.country,
        displayName,
        lat: latitude,
        lng: longitude,
        accuracyMeters: Math.round(accuracy),
        isLiveGps: true,
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(locationResult));
      } catch (e) {}

      return locationResult;
    } catch (gpsError) {
      console.warn('Browser GPS permission not granted or timed out, falling back to IP detection:', gpsError);
    }
  }

  // 2. Try IP-based location fallback
  const ipLocation = await fetchIpLocation();
  if (ipLocation) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLocation));
    } catch (e) {}
    return ipLocation;
  }

  // 3. Fallback
  return DEFAULT_LOCATION;
}

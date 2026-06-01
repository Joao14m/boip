export type Coords = { lat: number; lng: number };

/**
 * Returns the browser's current coordinates, or null when location is
 * unavailable (unsupported, permission denied, timeout, or any error). The
 * marketplace feed uses this to sort by proximity; when it returns null the
 * backend falls back to the user's home-municipality center, so callers can
 * safely ignore a null result.
 */
export function getDeviceCoords(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 300000 },
    );
  });
}

import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };

/**
 * Returns the device's current coordinates, or null when location is unavailable
 * (permission denied, or any error). The marketplace feed uses this to sort by
 * proximity; when it returns null the backend falls back to the user's
 * home-municipality center, so callers can safely ignore a null result.
 *
 * The OS permission prompt is shown only the first time (when status is
 * undetermined); afterwards the stored decision is reused.
 */
export async function getDeviceCoords(): Promise<Coords | null> {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'undetermined') {
      status = (await Location.requestForegroundPermissionsAsync()).status;
    }
    if (status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
}

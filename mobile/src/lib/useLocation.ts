import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export type Coords = { lat: number; lng: number };

// idle: abhi poocha nahi | asking: GPS le rahe | ready: mil gayi
// denied: mana kiya (dobara pooch sakte hain) | blocked: hamesha ke liye mana (Settings se khulegi) | failed: GPS nahi mila
export type LocationState =
  | { status: "idle" | "asking" | "denied" | "blocked" | "failed" }
  | { status: "ready"; coords: Coords };

// India ke andar? (backend jaisi seema)
function inIndia(lat: number, lng: number) {
  return lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;
}

// Customer ki location: sirf app ki memory me, phone ya database me save nahi hoti.
// App khulte hi poochte hain (aapka "location zaroor maange" wala niyam).
export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: "idle" });

  const ask = useCallback(async () => {
    setState({ status: "asking" });
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted" && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== "granted") {
        setState({ status: perm.canAskAgain ? "denied" : "blocked" });
        return;
      }

      // Pehle purani (jaldi) location, na mile to nayi
      const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 });
      const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
      const { latitude, longitude } = pos.coords;
      if (!inIndia(latitude, longitude)) {
        setState({ status: "failed" });
        return;
      }
      setState({ status: "ready", coords: { lat: latitude, lng: longitude } });
    } catch {
      setState({ status: "failed" });
    }
  }, []);

  // "Location hatao": wapas shuru jaisa (button dikhe), dobara apne aap nahi poochte
  const clear = useCallback(() => setState({ status: "idle" }), []);

  // Screen khulte hi ek baar
  useEffect(() => {
    void ask();
  }, [ask]);

  return { state, ask, clear };
}

// Ek baar abhi ki GPS location (dukaan ki location bharne ke liye, poori sahi, gol nahi)
export async function getCurrentCoords(): Promise<{ ok: true; coords: Coords } | { ok: false; reason: "denied" | "failed" }> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") return { ok: false, reason: "denied" };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const { latitude, longitude } = pos.coords;
    if (!inIndia(latitude, longitude)) return { ok: false, reason: "failed" };
    return { ok: true, coords: { lat: latitude, lng: longitude } };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

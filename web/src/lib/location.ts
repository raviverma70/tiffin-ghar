import { cookies } from "next/headers";

// Customer ki location cookie me (URL me nahi, taaki link share karne par jagah na dikhe).
// Sirf ~100 meter tak gol ki hui, 1 din tak. Database me kabhi save nahi hoti.
export const LOCATION_COOKIE = "tg_loc";

export const LOCATION_COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24,
  sameSite: "lax" as const,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export type Coords = { lat: number; lng: number };

// India ke andar? (backend jaisi seema)
export function isIndiaCoords(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98;
}

export function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000;
}

export async function getSavedLocation(): Promise<Coords | null> {
  const store = await cookies();
  const raw = store.get(LOCATION_COOKIE)?.value;
  const m = raw ? /^(-?\d{1,3}\.\d{1,3}),(-?\d{1,3}\.\d{1,3})$/.exec(raw) : null;
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  return isIndiaCoords(lat, lng) ? { lat, lng } : null;
}

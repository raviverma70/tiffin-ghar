"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isIndiaCoords, LOCATION_COOKIE, LOCATION_COOKIE_OPTIONS, roundCoord } from "@/lib/location";

// Browser se mili location cookie me rakho (gol karke). India ke bahar ho to kuch nahi.
export async function saveLocationAction(lat: number, lng: number): Promise<boolean> {
  if (typeof lat !== "number" || typeof lng !== "number" || !isIndiaCoords(lat, lng)) return false;

  const store = await cookies();
  store.set(LOCATION_COOKIE, `${roundCoord(lat).toFixed(3)},${roundCoord(lng).toFixed(3)}`, LOCATION_COOKIE_OPTIONS);
  revalidatePath("/");
  return true;
}

export async function clearLocationAction(): Promise<void> {
  const store = await cookies();
  store.delete(LOCATION_COOKIE);
  revalidatePath("/");
}

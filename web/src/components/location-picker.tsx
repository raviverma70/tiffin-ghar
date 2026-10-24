"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";
import type { MessageKey } from "@/i18n/messages/hinglish";

export type Coords = { latitude: number; longitude: number };

// Browser se abhi ki location (GPS). Sirf localhost ya https par chalta hai.
export function getBrowserLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: Math.round(pos.coords.latitude * 1e6) / 1e6,
          longitude: Math.round(pos.coords.longitude * 1e6) / 1e6,
        }),
      (err) => reject(new Error(err.code === err.PERMISSION_DENIED ? "denied" : "failed")),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}

export function locationErrorKey(e: unknown): MessageKey {
  const code = e instanceof Error ? e.message : "";
  if (code === "denied") return "pf.locationDenied";
  if (code === "unsupported") return "pf.locationUnsupported";
  return "pf.locationFail";
}

// Dukaan ki location: button dabao, hidden fields me latitude/longitude bhar jate hain
export default function LocationPicker({ initial }: { initial: Coords | null }) {
  const t = useT();
  const [coords, setCoords] = useState<Coords | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<MessageKey | null>(null);
  const [changed, setChanged] = useState(false);

  async function pick() {
    setBusy(true);
    setError(null);
    try {
      setCoords(await getBrowserLocation());
      setChanged(true);
    } catch (e) {
      setError(locationErrorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4">
      <p className="text-sm font-semibold text-gray-900">📍 {t("pf.location")}</p>
      <p className="mt-1 text-sm text-gray-600">{t("pf.locationHint")}</p>

      <input type="hidden" name="latitude" value={coords ? String(coords.latitude) : ""} />
      <input type="hidden" name="longitude" value={coords ? String(coords.longitude) : ""} />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={pick}
          disabled={busy}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-orange-700 shadow-sm ring-1 ring-orange-300 hover:bg-orange-100 disabled:opacity-50"
        >
          {busy ? t("pf.locationBusy") : t("pf.locationBtn")}
        </button>

        {coords ? (
          <span className="text-sm text-green-700">
            ✓ {t("pf.locationSet")} ·{" "}
            <a
              href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {t("pf.locationMap")}
            </a>
          </span>
        ) : (
          <span className="text-sm text-gray-500">{t("pf.locationNone")}</span>
        )}
      </div>

      {changed && <p className="mt-2 text-sm text-orange-700">{t("pf.locationRemember")}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{t(error)}</p>}
    </div>
  );
}

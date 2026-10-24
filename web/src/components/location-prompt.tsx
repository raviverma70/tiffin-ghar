"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import { getBrowserLocation } from "@/components/location-picker";
import { clearLocationAction, saveLocationAction } from "@/app/location-actions";

// Ek baar (is tab me) apne aap poochte hain, mana kare to dobara pareshan nahi karte
const ASKED_KEY = "tg_loc_asked";

export default function LocationPrompt({ hasLocation }: { hasLocation: boolean }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  // GPS lo, cookie me rakho, page dobara lao. State sirf jawab aane ke baad badalta hai.
  async function locate() {
    try {
      const { latitude, longitude } = await getBrowserLocation();
      const ok = await saveLocationAction(latitude, longitude);
      if (!ok) throw new Error("outside");
      startTransition(() => router.refresh());
    } catch {
      setFailed(true);
    }
  }

  async function ask() {
    setBusy(true);
    setFailed(false);
    await locate();
    setBusy(false);
  }

  // Page khulte hi location maango (customer ne pehle mana nahi kiya ho to)
  useEffect(() => {
    if (hasLocation) return;
    let asked = false;
    try {
      asked = sessionStorage.getItem(ASKED_KEY) === "1";
      sessionStorage.setItem(ASKED_KEY, "1");
    } catch {
      // private mode: har baar poochna theek hai
    }
    if (asked) return;
    getBrowserLocation()
      .then(({ latitude, longitude }) => saveLocationAction(latitude, longitude))
      .then((ok) => {
        if (!ok) throw new Error("outside");
        startTransition(() => router.refresh());
      })
      .catch(() => setFailed(true));
  }, [hasLocation, router]);

  if (hasLocation) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-medium text-green-700">📍 {t("home.locOn")}</span>
        <form
          action={async () => {
            await clearLocationAction();
            startTransition(() => router.refresh());
          }}
        >
          <button className="text-gray-500 underline hover:text-gray-800">{t("home.locClear")}</button>
        </form>
      </div>
    );
  }

  const working = busy || pending;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={ask}
        disabled={working}
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm ring-1 ring-orange-300 transition hover:bg-orange-50 disabled:opacity-60"
      >
        <span aria-hidden>📍</span>
        {working ? t("home.locAsking") : failed ? t("home.locRetry") : t("home.locBtn")}
      </button>
      <p className="text-xs text-gray-500">{failed ? t("home.locDenied") : t("home.locWhy")}</p>
    </div>
  );
}

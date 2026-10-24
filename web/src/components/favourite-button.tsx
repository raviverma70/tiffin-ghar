"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { useT } from "@/i18n/client";
import { toggleFavouriteAction } from "@/app/provider/[id]/actions";

const base =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-xl shadow-sm transition hover:scale-105";

// Dil ka button: dabate hi turant laal (optimistic), backend fail ho to wapas
export default function FavouriteButton({
  providerId,
  initial,
  loggedIn,
}: {
  providerId: number;
  initial: boolean;
  loggedIn: boolean;
}) {
  const t = useT();
  const [fav, setFav] = useOptimistic(initial);
  const [, startTransition] = useTransition();

  if (!loggedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/provider/${providerId}`)}`}
        aria-label={t("fav.add")}
        title={t("fav.add")}
        className={`${base} border-gray-200 text-gray-400`}
      >
        ♡
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={fav}
      aria-label={fav ? t("fav.remove") : t("fav.add")}
      title={fav ? t("fav.remove") : t("fav.add")}
      onClick={() =>
        startTransition(async () => {
          setFav(!fav);
          await toggleFavouriteAction(providerId, !fav);
        })
      }
      className={`${base} ${fav ? "border-red-200 text-red-500" : "border-gray-200 text-gray-400"}`}
    >
      {fav ? "♥" : "♡"}
    </button>
  );
}

import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";
import CustomerNav from "@/components/customer-nav";
import Thumb from "@/components/thumb";
import { RatingBadge } from "@/components/shop-card";

type Favourite = {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  photoUrl: string | null;
  isOpen: boolean;
  rating: number | null;
  ratingCount: number;
};

export default async function FavouritesPage() {
  const { t } = await getT();
  const res = await authedFetch("/me/favourites", { mode: "page", returnTo: "/favourites" });
  const items = res.ok ? ((await res.json()) as { items: Favourite[] }).items : null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <CustomerNav active="favs" />
      <h1 className="mt-5 text-2xl font-bold text-gray-900">♥ {t("fav.title")}</h1>

      {!items && <p className="mt-4 text-red-600">{t("fav.loadFail")}</p>}
      {items && items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">{t("fav.empty")}</p>
      )}

      {items && items.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {items.map((f) => (
            <li key={f.id}>
              <Link
                href={`/provider/${f.id}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <Thumb src={photoSrc(f.photoUrl)} alt={f.shopName} className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{f.shopName}</p>
                  <p className="truncate text-sm text-gray-500">{[f.area, f.city].filter(Boolean).join(", ")}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <RatingBadge rating={f.rating} count={f.ratingCount} />
                    <span className={`text-xs font-medium ${f.isOpen ? "text-green-700" : "text-gray-500"}`}>
                      {f.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow")}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

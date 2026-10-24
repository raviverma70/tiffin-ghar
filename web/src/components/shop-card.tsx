import Link from "next/link";
import type { ShopCard as Shop } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { MEAL_ICON } from "@/lib/provider";
import { getT } from "@/i18n/server";
import Thumb from "@/components/thumb";

// Rating ka hara badge (Justdial jaisa idea, apne rang me)
export async function RatingBadge({ rating, count }: { rating: number | null; count: number }) {
  const { t } = await getT();
  if (!rating || count === 0) {
    return (
      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{t("home.newShop")}</span>
    );
  }
  const tone = rating >= 4 ? "bg-green-600" : rating >= 3 ? "bg-lime-600" : "bg-amber-500";
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
      <span className={`rounded-md px-2 py-0.5 text-sm font-bold text-white ${tone}`}>
        {rating.toFixed(1)} ★
      </span>
      <span className="text-xs text-gray-500">{t("rating.count", { n: count })}</span>
    </span>
  );
}

export default async function ShopCard({ shop }: { shop: Shop }) {
  const { t } = await getT();
  const place = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/provider/${shop.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg"
    >
      <div className="relative">
        <Thumb src={photoSrc(shop.photoUrl)} alt={shop.shopName} className="h-40 w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {shop.inArea && (
            <span className="rounded-full bg-orange-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
              {t("home.inArea")}
            </span>
          )}
          {shop.distanceKm !== null && (
            <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-gray-800 shadow">
              📍 {t("home.km", { km: shop.distanceKm })}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-gray-900 group-hover:text-orange-700">{shop.shopName}</h3>
          <RatingBadge rating={shop.rating} count={shop.ratingCount} />
        </div>
        <p className="mt-0.5 text-sm text-gray-500">{place}</p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {shop.isVerified && (
            <span
              title={t("home.verifiedTitle")}
              className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
            >
              ✓ {t("home.verified")}
            </span>
          )}
          {shop.isPureVeg && (
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-200">
              🟢 {t("home.pureVeg")}
            </span>
          )}
          {shop.planCount > 0 && (
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
              🗓️ {t("home.plansCount", { n: shop.planCount })}
            </span>
          )}
        </div>

        {shop.todayPreview.length > 0 && (
          <p className="mt-3 text-sm text-gray-700">
            <span className="font-medium text-gray-900">{t("home.today")}</span>{" "}
            {shop.todayPreview.map((d) => `${MEAL_ICON[d.mealTime]} ${d.name}`).join(" · ")}
          </p>
        )}

        {shop.topReview && (
          <p className="mt-2 line-clamp-1 text-sm italic text-gray-500">“{shop.topReview.comment}”</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {shop.startingPricePaise !== null ? (
            <span className="text-sm font-semibold text-gray-900">
              {t("home.startsAt", { price: formatPrice(shop.startingPricePaise) })}
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm group-hover:bg-orange-700">
            {t("home.viewMenu")} →
          </span>
        </div>
      </div>
    </Link>
  );
}

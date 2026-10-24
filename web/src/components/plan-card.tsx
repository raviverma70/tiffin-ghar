import Link from "next/link";
import type { PlanCard as Plan } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/provider";
import { getT } from "@/i18n/server";
import { RatingBadge } from "@/components/shop-card";

export default async function PlanCard({ plan }: { plan: Plan }) {
  const { t } = await getT();
  const perDay = formatPrice(Math.round(plan.pricePaise / plan.days));
  const day1 = plan.dayMenus.flatMap((m) => m.dishes).slice(0, 4);

  return (
    <Link
      href={`/provider/${plan.provider.id}#plans`}
      className="group flex h-full w-72 shrink-0 snap-start flex-col rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50 to-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          🗓️ {t("home.planDays", { n: plan.days })}
        </span>
        {plan.isVeg && <span className="text-xs font-medium text-green-700">🟢 {t("home.pureVeg")}</span>}
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-gray-900 group-hover:text-purple-800">{plan.name}</h3>
      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
        <span>{plan.provider.shopName}</span>
        <RatingBadge rating={plan.provider.rating} count={plan.provider.ratingCount} />
      </p>

      <p className="mt-2 text-sm text-gray-700">
        {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
      </p>
      {day1.length > 0 && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{t("home.day1")}</span> {day1.join(", ")}
        </p>
      )}

      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          <p className="text-xl font-bold text-gray-900">{formatPrice(plan.pricePaise)}</p>
          <p className="text-xs text-gray-500">{t("home.perDay", { price: perDay })}</p>
        </div>
        <span className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm group-hover:bg-purple-700">
          {t("home.planView")} →
        </span>
      </div>
    </Link>
  );
}

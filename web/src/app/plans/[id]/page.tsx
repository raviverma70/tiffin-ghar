import Link from "next/link";
import { getPlan } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { addDaysIso, todayInIndia } from "@/lib/customer";
import { formatPrice } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/provider";
import { getT } from "@/i18n/server";
import { RatingBadge } from "@/components/shop-card";
import PlanMenuTable from "@/components/plan-menu-table";
import SubscribeForm from "./subscribe-form";

export default async function PlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t } = await getT();
  const here = `/plans/${id}`;
  const user = await getCurrentUser(here);
  const plan = /^\d{1,10}$/.test(id) ? await getPlan(id) : null;

  if (!plan) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("plan.notFound")}</p>
      </main>
    );
  }

  const meals = plan.days * plan.mealTimes.length;
  const today = todayInIndia();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <Link href={`/provider/${plan.provider.id}?tab=plans`} className="text-sm text-orange-700 hover:underline">
        &larr; {plan.provider.shopName}
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm">
            <p className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white">
                🗓️ {t("home.planDays", { n: plan.days })}
              </span>
              {plan.isVeg && <span className="text-sm font-medium text-green-700">🟢 {t("home.pureVeg")}</span>}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{plan.name}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-gray-600">
              <Link href={`/provider/${plan.provider.id}`} className="font-medium text-gray-800 hover:underline">
                {t("plan.byShop", { shop: plan.provider.shopName })}
              </Link>
              <RatingBadge rating={plan.provider.rating} count={plan.provider.ratingCount} />
            </p>
            <p className="mt-2 text-gray-700">
              {t("plan.summary", {
                days: plan.days,
                times: plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + "),
              })}
            </p>
            {plan.description && <p className="mt-2 text-gray-600">{plan.description}</p>}

            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-1">
              <p className="text-3xl font-bold text-gray-900">{formatPrice(plan.pricePaise)}</p>
              <p className="text-sm text-gray-600">
                {t("plan.perDay", { price: formatPrice(Math.round(plan.pricePaise / plan.days)) })} ·{" "}
                {t("plan.perMeal", { price: formatPrice(Math.round(plan.pricePaise / meals)) })}
              </p>
            </div>
          </div>

          <h2 className="mt-8 text-xl font-semibold text-gray-900">{t("plan.menuTitle")}</h2>
          <div className="mt-3">
            <PlanMenuTable days={plan.days} mealTimes={plan.mealTimes} dayMenus={plan.dayMenus} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{t("plan.formTitle")}</h2>
            <div className="mt-4">
              {user ? (
                <SubscribeForm
                  planId={plan.id}
                  days={plan.days}
                  pricePaise={plan.pricePaise}
                  minDate={today}
                  maxDate={addDaysIso(today, 30)}
                />
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">{t("plan.loginFirst")}</p>
                  <Link
                    href={`/login?next=${encodeURIComponent(here)}`}
                    className="block rounded-xl bg-purple-600 px-5 py-3 text-center font-semibold text-white hover:bg-purple-700"
                  >
                    {t("of.loginButton")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

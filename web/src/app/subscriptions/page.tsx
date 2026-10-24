import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { currentPlanDay, type CustomerSubscription } from "@/lib/customer";
import { formatDay, formatPrice, lastDayIso } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY, SUB_STATUS_KEY, SUB_STATUS_STYLE } from "@/lib/provider";
import { getT } from "@/i18n/server";
import CustomerNav from "@/components/customer-nav";

export default async function MySubscriptionsPage() {
  const { t, locale } = await getT();

  const res = await authedFetch("/subscriptions?limit=50", { mode: "page", returnTo: "/subscriptions" });
  const data = res.ok ? ((await res.json()) as { items: CustomerSubscription[] }) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <CustomerNav active="subs" />
      <h1 className="mt-5 text-2xl font-bold text-gray-900">{t("msub.title")}</h1>

      {!data && <p className="mt-4 text-red-600">{t("msub.loadFail")}</p>}
      {data && data.items.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">
          <p>{t("msub.empty")}</p>
          <Link href="/" className="mt-3 inline-block font-semibold text-orange-700 hover:underline">
            {t("nav.home")} →
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((s) => {
            const day = s.status === "ACTIVE" ? currentPlanDay(s.startDate, s.days) : null;
            return (
              <li key={s.id}>
                <Link
                  href={`/subscriptions/${s.id}`}
                  className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-purple-300 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{s.planName}</p>
                      <p className="text-sm text-gray-600">{s.provider.shopName}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${SUB_STATUS_STYLE[s.status]}`}>
                      {t(SUB_STATUS_KEY[s.status])}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    🗓️{" "}
                    {t("msub.dates", {
                      start: formatDay(s.startDate, locale),
                      end: formatDay(lastDayIso(s.startDate, s.days), locale),
                    })}{" "}
                    · {s.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    {day ? (
                      <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">
                        {t("msub.today", { n: day })}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="font-semibold text-gray-900">{formatPrice(s.pricePaise)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

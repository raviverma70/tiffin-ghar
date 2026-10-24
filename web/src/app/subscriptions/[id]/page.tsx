import Link from "next/link";
import { notFound } from "next/navigation";
import { authedFetch } from "@/lib/authed";
import { currentPlanDay, type CustomerSubscription } from "@/lib/customer";
import { formatDay, formatPrice, lastDayIso } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY, SUB_STATUS_KEY, SUB_STATUS_STYLE } from "@/lib/provider";
import { getT } from "@/i18n/server";
import CustomerNav from "@/components/customer-nav";
import ConfirmButton from "@/components/confirm-button";
import PlanMenuTable from "@/components/plan-menu-table";
import { cancelSubscriptionAction } from "../actions";

export default async function SubscriptionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; notice?: string }>;
}) {
  const { id } = await params;
  const { new: isNew, notice } = await searchParams;
  const { t, locale } = await getT();
  if (!/^\d{1,10}$/.test(id)) notFound();

  const here = `/subscriptions/${id}`;
  const res = await authedFetch(here, { mode: "page", returnTo: here });

  if (!res.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <CustomerNav active="subs" />
        <p className="mt-6 text-gray-600">{res.status === 404 ? t("msub.notFound") : t("msub.loadFail")}</p>
      </main>
    );
  }

  const s = (await res.json()) as CustomerSubscription;
  const day = s.status === "ACTIVE" ? currentPlanDay(s.startDate, s.days) : null;
  const start = formatDay(s.startDate, locale);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <CustomerNav active="subs" />

      {isNew && (
        <p className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">✓ {t("msub.sent")}</p>
      )}
      {notice && <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{notice}</p>}

      <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">{t("msub.number", { id: s.id })}</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">{s.planName}</h1>
            <Link href={`/provider/${s.provider.id}`} className="text-gray-600 hover:underline">
              {s.provider.shopName}
            </Link>
          </div>
          <div className="text-right">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${SUB_STATUS_STYLE[s.status]}`}>
              {t(SUB_STATUS_KEY[s.status])}
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(s.pricePaise)}</p>
          </div>
        </div>

        <dl className="mt-4 space-y-1 text-gray-700">
          <dd>
            🗓️ {t("msub.dates", { start, end: formatDay(lastDayIso(s.startDate, s.days), locale) })} ·{" "}
            {s.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
          </dd>
          <dd>📍 {t("msub.address", { address: s.deliveryAddress })}</dd>
          {s.note && <dd>📝 {t("msub.note", { note: s.note })}</dd>}
        </dl>

        {day !== null && (
          <p className="mt-4 inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
            {day === 0 ? t("msub.notStarted", { date: start }) : t("msub.today", { n: day })}
          </p>
        )}

        {s.status === "REQUESTED" && (
          <form action={cancelSubscriptionAction} className="mt-4">
            <input type="hidden" name="id" value={s.id} />
            <ConfirmButton
              message={t("msub.confirmCancel")}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              {t("msub.cancel")}
            </ConfirmButton>
          </form>
        )}
        {s.status === "ACTIVE" && <p className="mt-4 text-sm text-gray-500">{t("msub.cancelHint")}</p>}
      </div>

      {s.dayMenus && s.dayMenus.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-semibold text-gray-900">{t("msub.menu")}</h2>
          <div className="mt-3">
            <PlanMenuTable days={s.days} mealTimes={s.mealTimes} dayMenus={s.dayMenus} today={day || null} />
          </div>
        </>
      )}
    </main>
  );
}

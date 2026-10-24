import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import {
  MEAL_ICON,
  MEAL_SHORT_KEY,
  SUB_ACTION_KEY,
  SUB_NEXT,
  SUB_STATUSES,
  SUB_STATUS_KEY,
  SUB_STATUS_STYLE,
  type ProviderSubscription,
  type SubscriptionStatus,
} from "@/lib/provider";
import { formatDay, formatPrice, lastDayIso } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import { updateSubscriptionStatusAction } from "../actions";

const LIMIT = 20;

function pathFor(status: string, page: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page > 1) q.set("page", String(page));
  const qs = q.toString();
  return qs ? `/dashboard/subscriptions?${qs}` : "/dashboard/subscriptions";
}

export default async function ProviderSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; notice?: string }>;
}) {
  const { status: statusParam, page: pageParam, notice } = await searchParams;
  const { t, locale } = await getT();

  const status: SubscriptionStatus | "" = SUB_STATUSES.includes(statusParam as SubscriptionStatus)
    ? (statusParam as SubscriptionStatus)
    : "";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = pathFor(status, page);

  await requireProviderUser(here);

  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status) q.set("status", status);
  const res = await providerFetch(`/providers/me/subscriptions?${q}`, { mode: "page", returnTo: here });
  const data = res.ok ? ((await res.json()) as { items: ProviderSubscription[]; total: number }) : null;
  const pages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <DashNav active="subs" />

      <h1 className="mt-6 text-2xl font-bold text-gray-900">{t("subs.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("subs.hint")}</p>

      <nav className="mt-4 flex flex-wrap gap-2">
        {(["", ...SUB_STATUSES] as const).map((s) => (
          <Link
            key={s || "all"}
            href={pathFor(s, 1)}
            className={
              s === status
                ? "rounded-full bg-orange-600 px-3 py-1 text-sm font-medium text-white"
                : "rounded-full border bg-white px-3 py-1 text-sm text-gray-700 hover:bg-orange-50"
            }
          >
            {s ? t(SUB_STATUS_KEY[s]) : t("subs.filterAll")}
          </Link>
        ))}
      </nav>

      {notice && <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">{t("subs.loadFail")}</p>}
      {data && data.items.length === 0 && (
        <p className="mt-6 rounded-xl border border-dashed bg-white p-4 text-gray-600">{t("subs.empty")}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((s) => (
            <li key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    #{s.id} · {s.planName}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {t("subs.meals", {
                      days: s.days,
                      times: s.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + "),
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${SUB_STATUS_STYLE[s.status]}`}>
                    {t(SUB_STATUS_KEY[s.status])}
                  </span>
                  <p className="mt-1 text-lg font-bold text-orange-700">{formatPrice(s.pricePaise)}</p>
                </div>
              </div>

              <dl className="mt-3 space-y-1 text-sm text-gray-700">
                <dd>
                  🗓️{" "}
                  {t("subs.dates", {
                    start: formatDay(s.startDate, locale),
                    end: formatDay(lastDayIso(s.startDate, s.days), locale),
                  })}
                </dd>
                <dd>📞 {t("subs.customer", { phone: s.user.phone })}</dd>
                <dd>📍 {t("subs.address", { address: s.deliveryAddress })}</dd>
                {s.note && <dd>📝 {t("subs.note", { note: s.note })}</dd>}
              </dl>

              {SUB_NEXT[s.status] && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {SUB_NEXT[s.status]!.map((next) => {
                    const danger = next === "REJECTED" || next === "CANCELLED";
                    return (
                      <form key={next} action={updateSubscriptionStatusAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <input type="hidden" name="status" value={next} />
                        <input type="hidden" name="back" value={here} />
                        <ConfirmButton
                          message={danger ? t("subs.confirm") : undefined}
                          className={
                            danger
                              ? "rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                              : "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                          }
                        >
                          {t(SUB_ACTION_KEY[next])}
                        </ConfirmButton>
                      </form>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-6 flex justify-between text-sm">
          {page > 1 ? (
            <Link href={pathFor(status, page - 1)} className="text-orange-700">
              &larr;
            </Link>
          ) : (
            <span />
          )}
          <span className="text-gray-500">
            {page} / {pages}
          </span>
          {page < pages ? (
            <Link href={pathFor(status, page + 1)} className="text-orange-700">
              &rarr;
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </main>
  );
}

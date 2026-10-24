import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import {
  ACTION_KEY,
  FILTERS,
  NEXT_STATUSES,
  type ProviderOrder,
} from "@/lib/provider";
import type { OrderStatus } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import AutoRefresh from "@/components/auto-refresh";
import { OrderStatusBadge } from "@/components/order-status";
import ConfirmButton from "@/components/confirm-button";
import { updateOrderStatusAction } from "../actions";

const LIMIT = 20;

function pathFor(status: string, page: number) {
  const q = new URLSearchParams();
  if (status) q.set("status", status);
  if (page > 1) q.set("page", String(page));
  const qs = q.toString();
  return qs ? `/dashboard/orders?${qs}` : "/dashboard/orders";
}

export default async function ProviderOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; notice?: string }>;
}) {
  const { status: statusParam, page: pageParam, notice } = await searchParams;
  const { t, locale } = await getT();

  const status: OrderStatus | "" = FILTERS.some((f) => f.value !== "" && f.value === statusParam)
    ? (statusParam as OrderStatus)
    : "";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = pathFor(status, page);

  await requireProviderUser(here);

  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status) q.set("status", status);

  const res = await providerFetch(`/providers/me/orders?${q.toString()}`, {
    mode: "page",
    returnTo: here,
  });
  const data = res.ok ? ((await res.json()) as { items: ProviderOrder[]; total: number }) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <AutoRefresh seconds={30} />
      <DashNav active="orders" />

      <h1 className="mt-6 text-2xl font-bold text-gray-900">{t("porders.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("porders.hint")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "all"}
            href={pathFor(f.value, 1)}
            className={
              f.value === status
                ? "rounded-full bg-orange-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm"
                : "rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-orange-50"
            }
          >
            {t(f.key)}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">{t("porders.loadFail")}</p>}
      {data && data.items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">{t("porders.none")}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((o) => {
            const next = NEXT_STATUSES[o.status] ?? [];
            return (
              <li
                key={o.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${o.status === "PLACED" ? "border-blue-300 ring-2 ring-blue-100" : "border-gray-200"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{t("orders.number", { id: o.id })}</p>
                    <p className="text-sm text-gray-500">{formatDate(o.createdAt, locale)}</p>
                  </div>
                  <OrderStatusBadge status={o.status} forProvider size="md" />
                </div>

                <div className="mt-3 space-y-0.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                  <p>
                    {t("porders.customer")}{" "}
                    <a href={`tel:${o.user.phone}`} className="font-semibold text-orange-700 hover:underline">
                      {o.user.phone}
                    </a>
                  </p>
                  <p className="mt-1">{t("porders.address", { address: o.deliveryAddress })}</p>
                  {o.note && <p className="mt-1">{t("porders.note", { note: o.note })}</p>}
                </div>

                <ul className="mt-3 divide-y divide-gray-100">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-4 py-1.5 text-sm text-gray-800">
                      <span>
                        {it.name} x {it.quantity}
                      </span>
                      <span>{formatPrice(it.pricePaise * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
                  <span>{t("porders.total")}</span>
                  <span>{formatPrice(o.totalPaise)}</span>
                </p>

                {next.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {next.map((s) => (
                      <form key={s} action={updateOrderStatusAction}>
                        <input type="hidden" name="id" value={o.id} />
                        <input type="hidden" name="status" value={s} />
                        <input type="hidden" name="back" value={here} />
                        <ConfirmButton
                          message={s === "REJECTED" ? t("porders.confirmReject") : undefined}
                          className={
                            s === "REJECTED"
                              ? "rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                              : "rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                          }
                        >
                          {t(ACTION_KEY[s])}
                        </ConfirmButton>
                      </form>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={pathFor(status, page - 1)} className="text-orange-600">
            &larr; {t("porders.newer")}
          </Link>
        ) : (
          <span />
        )}
        {data && data.total > page * LIMIT && (
          <Link href={pathFor(status, page + 1)} className="text-orange-600">
            {t("orders.older")} &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}

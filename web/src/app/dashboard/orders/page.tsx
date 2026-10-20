import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import {
  ACTION_KEY,
  FILTERS,
  NEXT_STATUSES,
  PROVIDER_STATUS_KEY,
  type ProviderOrder,
} from "@/lib/provider";
import type { OrderStatus } from "@/lib/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import AutoRefresh from "@/components/auto-refresh";
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
    <main className="mx-auto max-w-2xl p-6">
      <AutoRefresh seconds={30} />
      <DashNav active="orders" />

      <h1 className="mt-6 text-2xl font-bold">{t("porders.title")}</h1>
      <p className="mt-1 text-sm text-gray-600">{t("porders.hint")}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value || "all"}
            href={pathFor(f.value, 1)}
            className={
              f.value === status
                ? "rounded bg-orange-600 px-3 py-1 text-sm text-white"
                : "rounded border px-3 py-1 text-sm hover:bg-orange-50"
            }
          >
            {t(f.key)}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">{t("porders.loadFail")}</p>}
      {data && data.items.length === 0 && <p className="mt-4 text-gray-600">{t("porders.none")}</p>}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((o) => {
            const next = NEXT_STATUSES[o.status] ?? [];
            return (
              <li key={o.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{t("orders.number", { id: o.id })}</p>
                    <p className="text-sm text-gray-600">{formatDate(o.createdAt, locale)}</p>
                  </div>
                  <p className="rounded border px-2 py-1 text-sm font-semibold">
                    {t(PROVIDER_STATUS_KEY[o.status])}
                  </p>
                </div>

                <div className="mt-3 text-sm">
                  <p>
                    {t("porders.customer")}{" "}
                    <a href={`tel:${o.user.phone}`} className="text-orange-600">
                      {o.user.phone}
                    </a>
                  </p>
                  <p className="mt-1">{t("porders.address", { address: o.deliveryAddress })}</p>
                  {o.note && <p className="mt-1">{t("porders.note", { note: o.note })}</p>}
                </div>

                <ul className="mt-3 space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between gap-4 text-sm">
                      <span>
                        {it.name} x {it.quantity}
                      </span>
                      <span>{formatPrice(it.pricePaise * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 flex justify-between border-t pt-2 font-semibold">
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
                              ? "rounded border border-red-600 px-3 py-2 text-sm text-red-600"
                              : "rounded bg-orange-600 px-3 py-2 text-sm text-white"
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

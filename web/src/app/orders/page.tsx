import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/orders";
import { OrderStatusBadge } from "@/components/order-status";
import { getT } from "@/i18n/server";
import CustomerNav from "@/components/customer-nav";

const LIMIT = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { t, locale } = await getT();

  const res = await authedFetch(`/orders?page=${page}&limit=${LIMIT}`, {
    mode: "page",
    returnTo: page > 1 ? `/orders?page=${page}` : "/orders",
  });

  const data = res.ok ? ((await res.json()) as { items: Order[]; total: number }) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <CustomerNav active="orders" />
      <h1 className="mt-5 text-2xl font-bold text-gray-900">{t("orders.title")}</h1>

      {!data && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{t("orders.loadFail")}</p>}

      {data && data.items.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-4xl" aria-hidden>
            🍱
          </p>
          <p className="mt-2 text-gray-600">{t("orders.empty")}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-700"
          >
            {t("orders.emptyCta")}
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {data.items.map((o) => {
            const names = o.items.map((it) => `${it.name} × ${it.quantity}`).join(", ");
            return (
              <li key={o.id}>
                <Link
                  href={`/orders/${o.id}`}
                  className="group block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-gray-900 group-hover:text-orange-700">
                        {o.provider.shopName}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        #{o.id} · {formatDate(o.createdAt, locale)}
                      </p>
                    </div>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm text-gray-600">{names}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm text-gray-500">{t("orders.items", { n: o.items.length })}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{formatPrice(o.totalPaise)}</span>
                      <span className="text-sm font-semibold text-orange-700">{t("orders.view")} →</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {data && data.total > page * LIMIT && (
        <p className="mt-6 text-center">
          <Link
            href={`/orders?page=${page + 1}`}
            className="inline-block rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50"
          >
            {t("orders.older")} &rarr;
          </Link>
        </p>
      )}
    </main>
  );
}

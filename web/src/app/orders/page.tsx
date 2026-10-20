import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_KEY, type Order } from "@/lib/orders";
import { getT } from "@/i18n/server";

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
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; {t("nav.home")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("orders.title")}</h1>

      {!data && <p className="mt-4 text-red-600">{t("orders.loadFail")}</p>}

      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">{t("orders.empty")}</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {data.items.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block rounded-xl border bg-white p-4 shadow-sm hover:bg-orange-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{o.provider.shopName}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(o.createdAt, locale)} - {t("orders.items", { n: o.items.length })}
                    </p>
                    <p className="mt-1 text-sm">{t(STATUS_KEY[o.status])}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(o.totalPaise)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && data.total > page * LIMIT && (
        <p className="mt-6">
          <Link href={`/orders?page=${page + 1}`} className="text-orange-600">
            {t("orders.older")} &rarr;
          </Link>
        </p>
      )}
    </main>
  );
}

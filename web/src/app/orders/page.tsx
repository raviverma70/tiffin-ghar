import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_LABEL, type Order } from "@/lib/orders";

const LIMIT = 20;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const res = await authedFetch(`/orders?page=${page}&limit=${LIMIT}`, {
    mode: "page",
    returnTo: page > 1 ? `/orders?page=${page}` : "/orders",
  });

  const data = res.ok
    ? ((await res.json()) as { items: Order[]; total: number })
    : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Mere orders</h1>

      {!data && <p className="mt-4 text-red-600">Orders nahi la paye, baad me try karo.</p>}

      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Abhi tak koi order nahi diya.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-3">
          {data.items.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="block rounded border p-4 hover:bg-orange-50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{o.provider.shopName}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(o.createdAt)} - {o.items.length} item
                    </p>
                    <p className="mt-1 text-sm">{STATUS_LABEL[o.status]}</p>
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
            Aur purane orders &rarr;
          </Link>
        </p>
      )}
    </main>
  );
}
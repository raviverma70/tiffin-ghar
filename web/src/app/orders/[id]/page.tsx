import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_LABEL, type Order } from "@/lib/orders";
import { cancelOrderAction } from "../actions";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await authedFetch(`/orders/${encodeURIComponent(id)}`, {
    mode: "page",
    returnTo: `/orders/${id}`,
  });

  if (res.status === 404 || res.status === 400) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; Mere orders
        </Link>
        <p className="mt-6 text-gray-600">Ye order nahi mila.</p>
      </main>
    );
  }

  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; Mere orders
        </Link>
        <p className="mt-6 text-red-600">Order nahi la paye, baad me try karo.</p>
      </main>
    );
  }

  const order = (await res.json()) as Order;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/orders" className="text-orange-600">
        &larr; Mere orders
      </Link>

      <h1 className="mt-4 text-2xl font-bold">Order #{order.id}</h1>
      <p className="text-gray-600">
        {order.provider.shopName} - {formatDate(order.createdAt)}
      </p>

      <p className="mt-4 rounded border p-3 font-semibold">{STATUS_LABEL[order.status]}</p>

      <ul className="mt-6 space-y-2">
        {order.items.map((it) => (
          <li key={it.id} className="flex justify-between gap-4">
            <span>
              {it.name} x {it.quantity}
            </span>
            <span>{formatPrice(it.pricePaise * it.quantity)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 flex justify-between border-t pt-3 font-semibold">
        <span>Total (COD, delivery par)</span>
        <span>{formatPrice(order.totalPaise)}</span>
      </p>

      <div className="mt-6 text-sm text-gray-600">
        <p>Delivery ka pata: {order.deliveryAddress}</p>
        {order.note && <p className="mt-1">Note: {order.note}</p>}
      </div>

      {order.status === "PLACED" && (
        <form action={cancelOrderAction} className="mt-6">
          <input type="hidden" name="id" value={order.id} />
          <button className="rounded border border-red-600 px-4 py-2 text-red-600">
            Order cancel karo
          </button>
        </form>
      )}
    </main>
  );
}
import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { STATUS_KEY, type Order } from "@/lib/orders";
import { getT } from "@/i18n/server";
import AutoRefresh from "@/components/auto-refresh";
import { Stars } from "@/components/stars";
import { cancelOrderAction } from "../actions";
import ReviewForm from "./review-form";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getT();

  const res = await authedFetch(`/orders/${encodeURIComponent(id)}`, {
    mode: "page",
    returnTo: `/orders/${id}`,
  });

  if (res.status === 404 || res.status === 400) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; {t("orders.title")}
        </Link>
        <p className="mt-6 text-gray-600">{t("orders.notFound")}</p>
      </main>
    );
  }

  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/orders" className="text-orange-600">
          &larr; {t("orders.title")}
        </Link>
        <p className="mt-6 text-red-600">{t("orders.orderLoadFail")}</p>
      </main>
    );
  }

  const order = (await res.json()) as Order;

  return (
    <main className="mx-auto max-w-2xl p-6">
      {["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status) && (
        <AutoRefresh seconds={15} />
      )}

      <Link href="/orders" className="text-orange-600">
        &larr; {t("orders.title")}
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{t("orders.number", { id: order.id })}</h1>
      <p className="text-gray-600">
        {order.provider.shopName} - {formatDate(order.createdAt, locale)}
      </p>

      <p className="mt-4 rounded border bg-white p-3 font-semibold">{t(STATUS_KEY[order.status])}</p>

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
        <span>{t("orders.total")}</span>
        <span>{formatPrice(order.totalPaise)}</span>
      </p>

      <div className="mt-6 text-sm text-gray-600">
        <p>{t("orders.address", { address: order.deliveryAddress })}</p>
        {order.note && <p className="mt-1">{t("orders.note", { note: order.note })}</p>}
      </div>

      {order.status === "PLACED" && (
        <form action={cancelOrderAction} className="mt-6">
          <input type="hidden" name="id" value={order.id} />
          <button className="rounded border border-red-600 px-4 py-2 text-red-600">
            {t("orders.cancel")}
          </button>
        </form>
      )}

      {order.status === "DELIVERED" && (
        <div className="mt-8 rounded-xl border bg-white p-4">
          {order.review ? (
            <>
              <p className="font-semibold">{t("orders.reviewMine")}</p>
              <p className="mt-1">
                <Stars value={order.review.rating} />
              </p>
              {order.review.comment && (
                <p className="mt-1 text-sm text-gray-600">{order.review.comment}</p>
              )}
            </>
          ) : (
            <>
              <p className="font-semibold">{t("orders.reviewAsk")}</p>
              <ReviewForm orderId={order.id} />
            </>
          )}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { authedFetch } from "@/lib/authed";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_STYLE, STATUS_KEY, type Order } from "@/lib/orders";
import { OrderStatusBadge, OrderTimeline } from "@/components/order-status";
import { getT } from "@/i18n/server";
import AutoRefresh from "@/components/auto-refresh";
import { Stars } from "@/components/stars";
import { cancelOrderAction } from "../actions";
import ReviewForm from "./review-form";
import ReviewPhotosEditor from "./review-photos-editor";
import { photoSrc } from "@/lib/photo";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ photoError?: string }>;
}) {
  const { id } = await params;
  const { photoError } = await searchParams;
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
  const live = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status);
  const stopped = order.status === "REJECTED" || order.status === "CANCELLED";

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {live && <AutoRefresh seconds={15} />}

      <Link href="/orders" className="text-sm text-orange-700 hover:underline">
        &larr; {t("orders.title")}
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("orders.number", { id: order.id })}</h1>
          <p className="mt-0.5 text-gray-600">
            <Link href={`/provider/${order.provider.id}`} className="font-medium text-gray-800 hover:underline">
              {order.provider.shopName}
            </Link>{" "}
            · {formatDate(order.createdAt, locale)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="md" />
      </div>

      {/* Order kahan tak pahuncha */}
      <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("orders.status")}</h2>
        {stopped ? (
          <p className={`mt-3 rounded-xl p-3 font-semibold ring-1 ${ORDER_STATUS_STYLE[order.status]}`}>
            {t(STATUS_KEY[order.status])}
          </p>
        ) : (
          <>
            <div className="mt-4">
              <OrderTimeline status={order.status} />
            </div>
            <p className="mt-4 text-center font-medium text-gray-800">{t(STATUS_KEY[order.status])}</p>
          </>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("orders.itemsTitle")}</h2>
        <ul className="mt-3 divide-y divide-gray-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex justify-between gap-4 py-2">
              <span className="text-gray-800">
                {it.name} <span className="text-gray-500">× {it.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">{formatPrice(it.pricePaise * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold text-gray-900">
          <span>{t("orders.total")}</span>
          <span>{formatPrice(order.totalPaise)}</span>
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t("orders.deliveryTitle")}</h2>
        <p className="mt-2">📍 {t("orders.address", { address: order.deliveryAddress })}</p>
        {order.note && <p className="mt-1">📝 {t("orders.note", { note: order.note })}</p>}
      </section>

      {order.status === "PLACED" && (
        <form action={cancelOrderAction} className="mt-5">
          <input type="hidden" name="id" value={order.id} />
          <button className="rounded-xl border border-red-300 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50">
            {t("orders.cancel")}
          </button>
        </form>
      )}

      {order.status === "DELIVERED" && (
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-sm sm:p-5">
          {order.review ? (
            <>
              <p className="font-semibold">{t("orders.reviewMine")}</p>
              <p className="mt-1">
                <Stars value={order.review.rating} />
              </p>
              {order.review.comment && (
                <p className="mt-1 text-sm text-gray-600">{order.review.comment}</p>
              )}
              {photoError && <p className="mt-2 text-sm text-amber-700">{t("rphoto.someFailed")}</p>}
              <ReviewPhotosEditor
                orderId={order.id}
                reviewId={order.review.id}
                photos={order.review.photos.flatMap((p) => {
                  const src = photoSrc(p.url);
                  return src ? [{ id: p.id, src }] : [];
                })}
              />
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

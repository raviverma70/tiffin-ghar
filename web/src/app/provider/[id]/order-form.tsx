"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { placeOrderAction, type OrderState } from "./actions";
import { formatPrice } from "@/lib/format";

type Item = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
};

const initial: OrderState = { error: "" };
const MAX_QTY = 20;

export default function OrderForm({
  providerId,
  items,
  loggedIn,
}: {
  providerId: number;
  items: Item[];
  loggedIn: boolean;
}) {
  const [qty, setQty] = useState<Record<number, number>>({});
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [state, action, pending] = useActionState(placeOrderAction, initial);

  const lines = items
    .filter((i) => (qty[i.id] ?? 0) > 0)
    .map((i) => ({ menuItemId: i.id, quantity: qty[i.id] ?? 0 }));
  const total = items.reduce((sum, i) => sum + i.pricePaise * (qty[i.id] ?? 0), 0);

  function change(id: number, delta: number) {
    setQty((prev) => {
      const next = Math.min(MAX_QTY, Math.max(0, (prev[id] ?? 0) + delta));
      return { ...prev, [id]: next };
    });
  }

  return (
    <div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  <span
                    className={item.isVeg ? "text-green-600" : "text-red-600"}
                    title={item.isVeg ? "Veg" : "Non-veg"}
                  >
                    &#9679;
                  </span>{" "}
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                <p className="mt-1 font-semibold">{formatPrice(item.pricePaise)}</p>
              </div>

              {loggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => change(item.id, -1)}
                    className="h-8 w-8 rounded border"
                    aria-label="Kam karo"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{qty[item.id] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => change(item.id, 1)}
                    className="h-8 w-8 rounded border"
                    aria-label="Badhao"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {!loggedIn && (
        <p className="mt-6 rounded border p-4">
          Order dene ke liye pehle{" "}
          <Link href={`/login?next=${encodeURIComponent(`/provider/${providerId}`)}`} className="text-orange-600">
            login karo
          </Link>
          .
        </p>
      )}

      {loggedIn && items.length > 0 && (
        <form action={action} className="mt-6 space-y-3 rounded border p-4">
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="items" value={JSON.stringify(lines)} />

          <h3 className="text-lg font-semibold">Aapka order</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-gray-600">Upar se items chuno (+ dabao).</p>
          ) : (
            <p className="text-sm text-gray-600">
              {lines.length} item, total {formatPrice(total)} (payment: COD, delivery par)
            </p>
          )}

          <textarea
            name="deliveryAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            minLength={10}
            maxLength={250}
            rows={3}
            placeholder="Delivery ka poora pata"
            className="w-full rounded border px-3 py-2"
          />
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder="Dukaan ke liye note (optional)"
            className="w-full rounded border px-3 py-2"
          />

          <button
            disabled={pending || lines.length === 0}
            className="w-full rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {pending ? "Ruko..." : "Order karo"}
          </button>

          {state.error && <p className="text-red-600">{state.error}</p>}
        </form>
      )}
    </div>
  );
}
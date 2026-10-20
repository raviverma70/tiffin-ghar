"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { placeOrderAction, type OrderState } from "./actions";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n/client";
import Thumb from "@/components/thumb";

type Item = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  photo: string | null;
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
  const t = useT();
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
          <li key={item.id} className="flex gap-4 rounded-xl border bg-white p-3 shadow-sm">
            <Thumb src={item.photo} alt={item.name} className="h-20 w-20 shrink-0 rounded-lg" />

            <div className="flex flex-1 items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  <span
                    className={item.isVeg ? "text-green-600" : "text-red-600"}
                    title={item.isVeg ? t("of.veg") : t("of.nonveg")}
                  >
                    &#9679;
                  </span>{" "}
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
                <p className="mt-1 font-semibold text-orange-700">{formatPrice(item.pricePaise)}</p>
              </div>

              {loggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => change(item.id, -1)}
                    className="h-8 w-8 rounded-full border hover:bg-orange-50"
                    aria-label={t("of.less")}
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{qty[item.id] ?? 0}</span>
                  <button
                    type="button"
                    onClick={() => change(item.id, 1)}
                    className="h-8 w-8 rounded-full bg-orange-600 text-white hover:bg-orange-700"
                    aria-label={t("of.more")}
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
        <p className="mt-6 rounded-xl border bg-white p-4">
          {t("of.loginFirst")}{" "}
          <Link
            href={`/login?next=${encodeURIComponent(`/provider/${providerId}`)}`}
            className="text-orange-600"
          >
            {t("of.loginButton")}
          </Link>
        </p>
      )}

      {loggedIn && items.length > 0 && (
        <form action={action} className="mt-6 space-y-3 rounded-xl border bg-white p-4 shadow-sm">
          <input type="hidden" name="providerId" value={providerId} />
          <input type="hidden" name="items" value={JSON.stringify(lines)} />

          <h3 className="text-lg font-semibold">{t("of.title")}</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-gray-600">{t("of.pick")}</p>
          ) : (
            <p className="text-sm text-gray-600">
              {t("of.summary", { count: lines.length, total: formatPrice(total) })}
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
            placeholder={t("of.addrPh")}
            className="w-full rounded-lg border px-3 py-2"
          />
          <input
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={t("of.notePh")}
            className="w-full rounded-lg border px-3 py-2"
          />

          <button
            disabled={pending || lines.length === 0}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("of.submit")}
          </button>

          {state.error && <p className="text-red-600">{state.error}</p>}
        </form>
      )}
    </div>
  );
}

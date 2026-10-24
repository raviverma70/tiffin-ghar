"use client";

import { useActionState, useState } from "react";
import { subscribeAction, type SubscribeState } from "./actions";
import { formatDay, formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/i18n/client";

const initial: SubscribeState = { error: "" };
const field =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200";

// minDate/maxDate server se (India ki tareekh), taaki browser ki galat ghadi se fark na pade
export default function SubscribeForm({
  planId,
  days,
  pricePaise,
  minDate,
  maxDate,
}: {
  planId: number;
  days: number;
  pricePaise: number;
  minDate: string;
  maxDate: string;
}) {
  const t = useT();
  const locale = useLocale();
  const [state, action, pending] = useActionState(subscribeAction, initial);
  const [startDate, setStartDate] = useState(minDate);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Aakhri din = shuru + (din - 1)
  let lastDay: string | null = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    const d = new Date(`${startDate}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days - 1);
    lastDay = formatDay(d.toISOString(), locale);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="planId" value={planId} />

      <label className="block text-sm font-medium text-gray-700">
        {t("plan.start")}
        <input
          type="date"
          name="startDate"
          value={startDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className={field}
        />
        <span className="mt-1 block text-xs font-normal text-gray-500">
          {t("plan.startHint")}
          {lastDay && ` · ${t("plan.endsOn", { date: lastDay })}`}
        </span>
      </label>

      <label className="block text-sm font-medium text-gray-700">
        {t("plan.address")}
        <textarea
          name="deliveryAddress"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          minLength={10}
          maxLength={250}
          rows={2}
          className={field}
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        {t("plan.note")}
        <input name="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className={field} />
      </label>

      <div className="rounded-xl bg-purple-50 p-3 text-sm text-purple-900">
        <p className="flex justify-between font-semibold">
          <span>{t("plan.total")}</span>
          <span>{formatPrice(pricePaise)}</span>
        </p>
        <p className="mt-1 text-purple-800">{t("plan.payInfo")}</p>
      </div>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        disabled={pending}
        className="w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-purple-700 disabled:opacity-50"
      >
        {pending ? t("common.loading") : t("plan.submit")}
      </button>
    </form>
  );
}

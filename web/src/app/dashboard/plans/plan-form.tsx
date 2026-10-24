"use client";

import { useActionState, useState } from "react";
import { createPlanAction, updatePlanAction, type PlanFormState } from "./actions";
import { MEAL_ICON, MEAL_KEY, MEAL_TIMES, paiseToRupees, rupeesToPaise, type MealTime } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import {
  PLAN_DAYS,
  PLAN_DESC_SUGGESTIONS,
  PLAN_NAME_SUGGESTIONS,
  PLAN_PRICE_SUGGESTIONS,
} from "@/lib/suggestions";
import { useT } from "@/i18n/client";
import SuggestInput from "@/components/suggest-input";

type Plan = {
  id: number;
  name: string;
  description: string | null;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
};

const initial: PlanFormState = { error: "" };
const field =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";
const pill = "rounded-full px-4 py-1.5 text-sm transition";
const pillOn = `${pill} bg-orange-600 font-medium text-white shadow-sm`;
const pillOff = `${pill} border border-gray-300 bg-white text-gray-700 hover:bg-orange-50`;

export default function PlanForm({ plan }: { plan?: Plan }) {
  const t = useT();
  const editing = Boolean(plan);
  const [state, action, pending] = useActionState(editing ? updatePlanAction : createPlanAction, initial);

  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [days, setDays] = useState(String(plan?.days ?? 7));
  const [mealTimes, setMealTimes] = useState<MealTime[]>(plan?.mealTimes ?? ["LUNCH"]);
  const [price, setPrice] = useState(plan ? paiseToRupees(plan.pricePaise) : "");
  const [isVeg, setIsVeg] = useState(plan?.isVeg ?? true);

  function toggleMeal(m: MealTime) {
    setMealTimes((list) =>
      list.includes(m) ? list.filter((x) => x !== m) : MEAL_TIMES.filter((x) => x === m || list.includes(x)),
    );
  }

  // "Lagbhag ₹60 ek khana": daam samajhne me madad
  const paise = rupeesToPaise(price);
  const nDays = Number(days);
  const meals = Number.isInteger(nDays) && nDays > 0 ? nDays * mealTimes.length : 0;
  const perMeal = paise !== null && meals > 0 ? formatPrice(Math.round(paise / meals)) : null;

  return (
    <form action={action} className="space-y-5 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
      {plan && <input type="hidden" name="planId" value={plan.id} />}
      {mealTimes.map((m) => (
        <input key={m} type="hidden" name="mealTimes" value={m} />
      ))}

      <label className="block text-sm font-medium text-gray-700">
        {t("plans.name")}
        <SuggestInput
          name="name"
          value={name}
          onValueChange={setName}
          suggestions={PLAN_NAME_SUGGESTIONS}
          required
          minLength={2}
          maxLength={60}
          className={field}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">{t("plans.days")}</legend>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {PLAN_DAYS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === String(d)}
              onClick={() => setDays(String(d))}
              className={days === String(d) ? pillOn : pillOff}
            >
              {t("plans.daysN", { n: d })}
            </button>
          ))}
          <input
            name="days"
            value={days}
            onChange={(e) => setDays(e.target.value.replace(/\D/g, "").slice(0, 2))}
            inputMode="numeric"
            required
            aria-label={t("plans.daysCustom")}
            className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-center focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">{t("plans.daysCustom")}</p>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">{t("plans.times")}</legend>
        <p className="text-xs text-gray-500">{t("plans.timesHint")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEAL_TIMES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mealTimes.includes(m)}
              onClick={() => toggleMeal(m)}
              className={mealTimes.includes(m) ? pillOn : pillOff}
            >
              {MEAL_ICON[m]} {t(MEAL_KEY[m])}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-gray-700">
        {t("plans.price")}
        <SuggestInput
          name="price"
          value={price}
          onValueChange={setPrice}
          suggestions={PLAN_PRICE_SUGGESTIONS}
          required
          inputMode="decimal"
          className={field}
        />
        {perMeal && <span className="mt-1 block text-xs font-normal text-gray-500">{t("plans.perMeal", { price: perMeal })}</span>}
      </label>

      <label className="block text-sm font-medium text-gray-700">
        {t("plans.desc")}
        <SuggestInput
          name="description"
          value={description}
          onValueChange={setDescription}
          suggestions={PLAN_DESC_SUGGESTIONS}
          append
          textarea
          maxLength={300}
          className={field}
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isVeg"
          checked={isVeg}
          onChange={(e) => setIsVeg(e.target.checked)}
          className="h-4 w-4 accent-green-600"
        />
        {t("plans.veg")}
      </label>

      {editing && <p className="text-xs text-amber-700">{t("plans.settingsNote")}</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.saved && !state.error && <p className="text-green-600">{t("plans.saved")}</p>}

      <button
        disabled={pending || mealTimes.length === 0}
        className="rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? t("common.loading") : editing ? t("common.save") : t("plans.create")}
      </button>
    </form>
  );
}

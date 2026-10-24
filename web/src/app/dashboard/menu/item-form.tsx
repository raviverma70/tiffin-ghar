"use client";

import { useActionState, useState } from "react";
import { createMenuItemAction, updateMenuItemAction, type FormState } from "../actions";
import {
  DAY_KEYS,
  MEAL_ICON,
  MEAL_KEY,
  MEAL_TIMES,
  paiseToRupees,
  type DashMenuItem,
  type MealTime,
} from "@/lib/provider";
import { DESCRIPTION_SUGGESTIONS, DISH_SUGGESTIONS, PRICE_SUGGESTIONS, THALI_SUGGESTIONS } from "@/lib/suggestions";
import { useT } from "@/i18n/client";
import SuggestInput from "@/components/suggest-input";

const initial: FormState = { error: "" };
const field =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export default function ItemForm({ item }: { item?: DashMenuItem }) {
  const t = useT();
  const editing = Boolean(item);
  const [state, action, pending] = useActionState(
    editing ? updateMenuItemAction : createMenuItemAction,
    initial,
  );

  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [price, setPrice] = useState(item ? paiseToRupees(item.pricePaise) : "");
  const [day, setDay] = useState(item?.dayOfWeek == null ? "" : String(item.dayOfWeek));
  const [mealTime, setMealTime] = useState<MealTime>(item?.mealTime ?? "LUNCH");
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);

  return (
    <form action={action} className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="mealTime" value={mealTime} />

      <fieldset>
        <legend className="text-sm font-medium text-gray-700">{t("item.mealTime")}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEAL_TIMES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mealTime === m}
              onClick={() => setMealTime(m)}
              className={
                mealTime === m
                  ? "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm"
                  : "rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-orange-50"
              }
            >
              {MEAL_ICON[m]} {t(MEAL_KEY[m])}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-gray-700">
        {t("item.name")}
        <SuggestInput
          name="name"
          value={name}
          onValueChange={setName}
          suggestions={[...THALI_SUGGESTIONS, ...DISH_SUGGESTIONS[mealTime]]}
          required
          minLength={2}
          maxLength={80}
          className={field}
        />
      </label>

      <label className="block text-sm font-medium text-gray-700">
        {t("item.desc")}
        <SuggestInput
          name="description"
          value={description}
          onValueChange={setDescription}
          suggestions={[...DESCRIPTION_SUGGESTIONS, ...DISH_SUGGESTIONS[mealTime]]}
          append
          textarea
          maxLength={300}
          className={field}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          {t("item.price")}
          <SuggestInput
            name="price"
            value={price}
            onValueChange={setPrice}
            suggestions={PRICE_SUGGESTIONS}
            required
            inputMode="decimal"
            className={field}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          {t("item.day")}
          <select name="dayOfWeek" value={day} onChange={(e) => setDay(e.target.value)} className={field}>
            <option value="">{t("menu.everyDay")}</option>
            {DAY_KEYS.map((key, i) => (
              <option key={key} value={i}>
                {t(key)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isVeg"
            checked={isVeg}
            onChange={(e) => setIsVeg(e.target.checked)}
            className="h-4 w-4 accent-green-600"
          />
          {t("item.veg")}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isAvailable"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 accent-orange-600"
          />
          {t("item.available")}
        </label>
      </div>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        disabled={pending}
        className="rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? t("common.loading") : editing ? t("common.save") : t("item.add")}
      </button>
    </form>
  );
}

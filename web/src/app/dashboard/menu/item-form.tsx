"use client";

import { useActionState, useState } from "react";
import { createMenuItemAction, updateMenuItemAction, type FormState } from "../actions";
import { DAY_KEYS, paiseToRupees, type DashMenuItem } from "@/lib/provider";
import { useT } from "@/i18n/client";

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border bg-white px-3 py-2";

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
  const [isVeg, setIsVeg] = useState(item?.isVeg ?? true);
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true);

  return (
    <form action={action} className="space-y-3 rounded-xl border bg-white p-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <label className="block text-sm">
        {t("item.name")}
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={80}
          className={field}
        />
      </label>

      <label className="block text-sm">
        {t("item.desc")}
        <textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
          rows={2}
          className={field}
        />
      </label>

      <label className="block text-sm">
        {t("item.price")}
        <input
          name="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          inputMode="decimal"
          className={field}
        />
      </label>

      <label className="block text-sm">
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

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isVeg"
          checked={isVeg}
          onChange={(e) => setIsVeg(e.target.checked)}
        />
        {t("item.veg")}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
        />
        {t("item.available")}
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? t("common.loading") : editing ? t("common.save") : t("item.add")}
      </button>
    </form>
  );
}

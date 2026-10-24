"use client";

import { useActionState, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { savePlanMenuAction, type PlanFormState } from "../actions";
import { MEAL_ICON, MEAL_KEY, type MealTime, type PlanDayMenu } from "@/lib/provider";
import { DISH_SUGGESTIONS } from "@/lib/suggestions";
import { useT } from "@/i18n/client";

type Cells = Record<string, string[]>;

const key = (day: number, meal: MealTime) => `${day}:${meal}`;
const small =
  "rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-orange-50 disabled:opacity-40";

function toCells(menus: PlanDayMenu[]): Cells {
  const cells: Cells = {};
  for (const m of menus) cells[key(m.day, m.mealTime)] = [...m.dishes];
  return cells;
}

const initial: PlanFormState = { error: "" };

// Ek din ke ek time ki dishes: chips + likhne ka box + suggestions
function DishCell({
  meal,
  dishes,
  onChange,
}: {
  meal: MealTime;
  dishes: string[];
  onChange: (dishes: string[]) => void;
}) {
  const t = useT();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  function add(raw: string) {
    // "Dal, Chawal" paste karo to dono jud jayein
    const next = [...dishes];
    for (const piece of raw.split(",")) {
      const dish = piece.trim().slice(0, 60);
      if (dish && !next.some((d) => d.toLowerCase() === dish.toLowerCase()) && next.length < 12) next.push(dish);
    }
    onChange(next);
    setDraft("");
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) add(draft);
    } else if (e.key === "Backspace" && !draft && dishes.length > 0) {
      onChange(dishes.slice(0, -1));
    }
  }

  const suggestions = DISH_SUGGESTIONS[meal].filter(
    (s) => !dishes.some((d) => d.toLowerCase() === s.toLowerCase()) && s.toLowerCase().includes(draft.trim().toLowerCase()),
  );

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {MEAL_ICON[meal]} {t(MEAL_KEY[meal])}
      </p>
      <div
        className={`mt-1 flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5 ${
          dishes.length === 0 ? "border-dashed border-amber-400" : "border-gray-300"
        }`}
      >
        {dishes.map((d) => (
          <span key={d} className="flex items-center gap-1 rounded-full bg-orange-100 py-0.5 pl-2.5 pr-1 text-sm text-orange-900">
            {d}
            <button
              type="button"
              onClick={() => onChange(dishes.filter((x) => x !== d))}
              aria-label={t("plans.removeDish", { dish: d })}
              className="flex h-5 w-5 items-center justify-center rounded-full text-orange-700 hover:bg-orange-200"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (draft.trim()) add(draft);
            setOpen(false);
          }}
          placeholder={dishes.length === 0 ? t("plans.dishPh") : ""}
          aria-label={`${t(MEAL_KEY[meal])}: ${t("plans.addDish")}`}
          maxLength={60}
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm focus:outline-none"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {suggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => add(s)}
              className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs text-orange-800 hover:bg-orange-100"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MenuGrid({
  planId,
  days,
  mealTimes,
  initialMenus,
}: {
  planId: number;
  days: number;
  mealTimes: MealTime[];
  initialMenus: PlanDayMenu[];
}) {
  const t = useT();
  const [cells, setCells] = useState<Cells>(() => toCells(initialMenus));
  const [state, action, pending] = useActionState(savePlanMenuAction, initial);

  const dayList = Array.from({ length: days }, (_, i) => i + 1);
  const payloadOf = (c: Cells) =>
    JSON.stringify(
      dayList.flatMap((day) => mealTimes.map((mealTime) => ({ day, mealTime, dishes: c[key(day, mealTime)] ?? [] }))),
    );
  const payload = payloadOf(cells);

  // Save hone par jo bheja tha wahi "saved" maano; usse alag ho to "save nahi hua" dikhao
  const [savedPayload, setSavedPayload] = useState(payload);
  const submitted = useRef(payload);
  useEffect(() => {
    if (state.saved && !state.error) setSavedPayload(submitted.current);
  }, [state]);
  const dirty = payload !== savedPayload;
  const total = days * mealTimes.length;
  const filled = dayList.reduce(
    (n, d) => n + mealTimes.filter((m) => (cells[key(d, m)]?.length ?? 0) > 0).length,
    0,
  );

  function update(next: Cells) {
    setCells(next);
  }

  function setCell(day: number, meal: MealTime, dishes: string[]) {
    update({ ...cells, [key(day, meal)]: dishes });
  }

  function copyDay(from: number, targets: number[]) {
    const next = { ...cells };
    for (const to of targets) for (const m of mealTimes) next[key(to, m)] = [...(cells[key(from, m)] ?? [])];
    update(next);
  }

  // Din 8 = Din 1, Din 9 = Din 2 ... (har hafte wahi menu)
  function repeatWeek() {
    const next = { ...cells };
    for (let d = 8; d <= days; d++) {
      const src = ((d - 1) % 7) + 1;
      for (const m of mealTimes) next[key(d, m)] = [...(cells[key(src, m)] ?? [])];
    }
    update(next);
  }

  return (
    <form action={action} onSubmit={() => (submitted.current = payload)}>
      <input type="hidden" name="planId" value={planId} />
      <input type="hidden" name="menu" value={payload} />

      {/* Kitna bhara: progress */}
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-800">
            {filled === total ? `✓ ${t("plans.complete")}` : t("plans.missing", { n: total - filled })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {days > 7 && (
              <button type="button" onClick={repeatWeek} className={small}>
                🔁 {t("plans.repeatWeek")}
              </button>
            )}
            <button
              disabled={pending}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
            >
              {pending ? t("common.loading") : t("plans.saveMenu")}
            </button>
          </div>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden>
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(filled / total) * 100}%` }} />
        </div>
        {dirty && !pending && <p className="mt-2 text-xs text-amber-700">● {t("plans.unsaved")}</p>}
        {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
        {state.saved && !state.error && !dirty && <p className="mt-2 text-sm text-green-600">{t("plans.saved")}</p>}
      </div>

      <ol className="mt-4 grid gap-4 md:grid-cols-2">
        {dayList.map((day) => (
          <li key={day} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-900">{t("plans.day", { n: day })}</h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  className={small}
                  disabled={day === days}
                  onClick={() => copyDay(day, [day + 1])}
                >
                  {t("plans.copyNext")}
                </button>
                <button
                  type="button"
                  className={small}
                  onClick={() => copyDay(day, dayList.filter((d) => d !== day))}
                >
                  {t("plans.copyAll")}
                </button>
                <button
                  type="button"
                  className={small}
                  onClick={() => {
                    const next = { ...cells };
                    for (const m of mealTimes) next[key(day, m)] = [];
                    update(next);
                  }}
                >
                  {t("plans.clearDay")}
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-3">
              {mealTimes.map((m) => (
                <DishCell
                  key={m}
                  meal={m}
                  dishes={cells[key(day, m)] ?? []}
                  onChange={(dishes) => setCell(day, m, dishes)}
                />
              ))}
            </div>
          </li>
        ))}
      </ol>
    </form>
  );
}

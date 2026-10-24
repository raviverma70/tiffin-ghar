import type { DayMenu } from "@/lib/api";
import { MEAL_ICON, MEAL_SHORT_KEY, type MealTime } from "@/lib/provider";
import { getT } from "@/i18n/server";

// Plan ka din-wise menu: PC par table, phone par har din ka card. today = aaj ka din (rang se)
export default async function PlanMenuTable({
  days,
  mealTimes,
  dayMenus,
  today,
}: {
  days: number;
  mealTimes: MealTime[];
  dayMenus: DayMenu[];
  today?: number | null;
}) {
  const { t } = await getT();
  const cell = (day: number, meal: MealTime) =>
    dayMenus.find((m) => m.day === day && m.mealTime === meal)?.dishes.join(", ") ?? "-";
  const dayList = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <>
      {/* Phone */}
      <ol className="space-y-2 sm:hidden">
        {dayList.map((day) => (
          <li
            key={day}
            className={`rounded-xl border p-3 ${day === today ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"}`}
          >
            <p className="text-sm font-semibold text-gray-900">
              {t("plan.day", { n: day })}
              {day === today && (
                <span className="ml-2 rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">{t("msub.todayBadge")}</span>
              )}
            </p>
            {mealTimes.map((m) => (
              <p key={m} className="mt-1 text-sm text-gray-700">
                <span className="font-medium">
                  {MEAL_ICON[m]} {t(MEAL_SHORT_KEY[m])}:
                </span>{" "}
                {cell(day, m)}
              </p>
            ))}
          </li>
        ))}
      </ol>

      {/* PC */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th scope="col" className="w-24 px-4 py-2.5 font-semibold">
                {t("plan.dayCol")}
              </th>
              {mealTimes.map((m) => (
                <th key={m} scope="col" className="px-4 py-2.5 font-semibold">
                  {MEAL_ICON[m]} {t(MEAL_SHORT_KEY[m])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {dayList.map((day) => (
              <tr key={day} className={day === today ? "bg-orange-50" : undefined}>
                <th scope="row" className="whitespace-nowrap px-4 py-2.5 font-semibold text-gray-900">
                  {t("plan.day", { n: day })}
                  {day === today && (
                    <span className="ml-2 rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white">{t("msub.todayBadge")}</span>
                  )}
                </th>
                {mealTimes.map((m) => (
                  <td key={m} className="px-4 py-2.5 text-gray-700">
                    {cell(day, m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

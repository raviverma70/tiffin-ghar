import type { MealTime } from "../generated/prisma/enums.js";

// Plan poora tab hai jab har din ke har chune hue time ka menu bhara ho
export function isMenuComplete(
  plan: { days: number; mealTimes: MealTime[] },
  dayMenus: { day: number; mealTime: MealTime }[],
) {
  const filled = new Set(dayMenus.map((m) => `${m.day}:${m.mealTime}`));
  for (let day = 1; day <= plan.days; day++) {
    for (const time of plan.mealTimes) {
      if (!filled.has(`${day}:${time}`)) return false;
    }
  }
  return true;
}

export const MENU_INCOMPLETE = "Plan chalu karne se pehle har din ka menu bharo";

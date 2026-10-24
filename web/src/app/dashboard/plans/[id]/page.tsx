import Link from "next/link";
import { notFound } from "next/navigation";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import { MEAL_ICON, MEAL_SHORT_KEY, menuSlots, type ProviderPlan } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import ConfirmButton from "@/components/confirm-button";
import PlanForm from "../plan-form";
import MenuGrid from "./menu-grid";
import { deletePlanAction, togglePlanAction } from "../actions";

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { id } = await params;
  const { notice } = await searchParams;
  const { t } = await getT();
  if (!/^\d{1,10}$/.test(id)) notFound();

  const here = `/dashboard/plans/${id}`;
  await requireProviderUser(here);

  const res = await providerFetch(`/providers/me/plans/${id}`, { mode: "page", returnTo: here });
  if (res.status === 404) notFound();
  const plan = res.ok ? ((await res.json()) as ProviderPlan) : null;

  if (!plan) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <DashNav active="plans" />
        <p className="mt-6 text-red-600">{t("plans.loadFail")}</p>
      </main>
    );
  }

  const total = menuSlots(plan);
  const complete = plan.dayMenus.length >= total;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <DashNav active="plans" />

      <Link href="/dashboard/plans" className="mt-6 inline-block text-sm text-orange-700 hover:underline">
        &larr; {t("plans.back")}
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
          <p className="mt-1 text-gray-600">
            {t("plans.daysN", { n: plan.days })} ·{" "}
            {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")} ·{" "}
            <span className="font-semibold text-orange-700">{formatPrice(plan.pricePaise)}</span>
          </p>
        </div>

        <form action={togglePlanAction} className="text-right">
          <input type="hidden" name="planId" value={plan.id} />
          <input type="hidden" name="active" value={String(!plan.isActive)} />
          <button
            disabled={!plan.isActive && !complete}
            className={
              plan.isActive
                ? "rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                : "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            }
          >
            {plan.isActive ? t("plans.turnOff") : t("plans.turnOn")}
          </button>
          <p className={`mt-1 text-xs ${plan.isActive ? "text-green-700" : "text-gray-500"}`}>
            {plan.isActive ? t("plans.activeNote") : t("plans.inactiveNote")}
          </p>
        </form>
      </div>

      {notice && <p className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{notice}</p>}

      <h2 className="mt-8 text-lg font-semibold text-gray-900">{t("plans.menuTitle")}</h2>
      <p className="mt-1 text-sm text-gray-600">{t("plans.menuHint")}</p>
      <div className="mt-4">
        <MenuGrid
          key={`${plan.days}-${plan.mealTimes.join(",")}`}
          planId={plan.id}
          days={plan.days}
          mealTimes={plan.mealTimes}
          initialMenus={plan.dayMenus}
        />
      </div>

      <details className="mt-8 rounded-xl border bg-white p-4">
        <summary className="cursor-pointer font-semibold">{t("plans.settings")}</summary>
        <div className="mt-4">
          <PlanForm plan={plan} />
        </div>
      </details>

      <form action={deletePlanAction} className="mt-6">
        <input type="hidden" name="planId" value={plan.id} />
        <ConfirmButton
          message={t("plans.confirmDelete")}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          {t("plans.delete")}
        </ConfirmButton>
      </form>
    </main>
  );
}

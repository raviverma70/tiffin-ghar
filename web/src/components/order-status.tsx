import { ORDER_STATUS_ICON, ORDER_STATUS_STYLE, ORDER_STEPS, STATUS_KEY, STEP_KEY, type OrderStatus } from "@/lib/orders";
import { PROVIDER_STATUS_KEY } from "@/lib/provider";
import { getT } from "@/i18n/server";

// Rangin status: customer ko customer wala text, dukaan wale ko dukaan wala
export async function OrderStatusBadge({
  status,
  forProvider = false,
  size = "sm",
}: {
  status: OrderStatus;
  forProvider?: boolean;
  size?: "sm" | "md";
}) {
  const { t } = await getT();
  const label = t(forProvider ? PROVIDER_STATUS_KEY[status] : STEP_KEY[status]);
  const pad = size === "md" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold ring-1 ${pad} ${ORDER_STATUS_STYLE[status]}`}>
      <span aria-hidden>{ORDER_STATUS_ICON[status]}</span>
      {label}
    </span>
  );
}

// Order kahan tak pahuncha: 5 kadam, jo ho gaye hare, abhi wala orange
export async function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = await getT();
  const current = ORDER_STEPS.indexOf(status);

  return (
    <ol className="grid grid-cols-5 gap-1" aria-label={t(STATUS_KEY[status])}>
      {ORDER_STEPS.map((step, i) => {
        const done = i < current || status === "DELIVERED";
        const now = i === current && status !== "DELIVERED";
        return (
          <li key={step} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <span className={`h-1 flex-1 rounded ${i === 0 ? "invisible" : done || now ? "bg-green-500" : "bg-gray-200"}`} />
              <span
                aria-current={now ? "step" : undefined}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${
                  done
                    ? "bg-green-500 text-white"
                    : now
                      ? "bg-orange-500 text-white ring-4 ring-orange-200 motion-safe:animate-pulse"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? "✓" : ORDER_STATUS_ICON[step]}
              </span>
              <span
                className={`h-1 flex-1 rounded ${i === ORDER_STEPS.length - 1 ? "invisible" : done ? "bg-green-500" : "bg-gray-200"}`}
              />
            </div>
            <span className={`mt-1.5 text-[11px] leading-tight sm:text-xs ${now ? "font-semibold text-orange-700" : done ? "text-gray-700" : "text-gray-400"}`}>
              {t(STEP_KEY[step])}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

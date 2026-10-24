import Link from "next/link";
import { getMenu, getShop, getShopPlans } from "@/lib/api";
import { authedFetch } from "@/lib/authed";
import { getReviews } from "@/lib/reviews";
import { getCurrentUser } from "@/lib/session";
import { formatDate, formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { DAY_KEYS, MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/provider";
import { getT } from "@/i18n/server";
import type { MessageKey } from "@/i18n/messages/hinglish";
import { Stars } from "@/components/stars";
import { RatingBadge } from "@/components/shop-card";
import Thumb from "@/components/thumb";
import FavouriteButton from "@/components/favourite-button";
import ShareButton from "@/components/share-button";
import PlanMenuTable from "@/components/plan-menu-table";
import ReviewPhotos from "@/components/review-photos";
import OrderForm from "./order-form";

const TABS = ["menu", "plans", "reviews", "info"] as const;
type Tab = (typeof TABS)[number];

const TAB_KEY: Record<Tab, MessageKey> = {
  menu: "shop.tabMenu",
  plans: "shop.tabPlans",
  reviews: "shop.tabReviews",
  info: "shop.tabInfo",
};

const pill = "rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";

export default async function ProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const { t, locale } = await getT();

  const here = tabParam ? `/provider/${id}?tab=${tabParam}` : `/provider/${id}`;
  const user = await getCurrentUser(here);
  const shop = /^\d{1,10}$/.test(id) ? await getShop(id) : null;

  if (!shop) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("shop.notFound")}</p>
      </main>
    );
  }

  // Band dukaan par seedha Plans (wahan kuch dikhne layak ho)
  const tab: Tab = TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : !shop.isOpen && shop.planCount > 0
      ? "plans"
      : "menu";

  // Sirf chune hue tab ka data lao
  const [menu, plans, reviews] = await Promise.all([
    tab === "menu" && shop.isOpen ? getMenu(id) : Promise.resolve(null),
    tab === "plans" ? getShopPlans(id) : Promise.resolve([]),
    tab === "reviews" ? getReviews(id, 1, 5) : Promise.resolve(null),
  ]);

  let isFavourite = false;
  if (user) {
    const favRes = await authedFetch("/me/favourites", { mode: "page", returnTo: here });
    if (favRes.ok) {
      const favs = (await favRes.json()) as { items: { id: number }[] };
      isFavourite = favs.items.some((f) => f.id === shop.id);
    }
  }

  const place = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href={`/?city=${encodeURIComponent(shop.city)}`} className="text-sm text-orange-700 hover:underline">
        &larr; {t("home.shopsIn", { city: shop.city })}
      </Link>

      {/* Dukaan ka upar wala hissa */}
      <div className="mt-3 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <Thumb src={photoSrc(shop.photoUrl)} alt={shop.shopName} className="h-44 w-full sm:h-60" />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{shop.shopName}</h1>
              <p className="mt-0.5 text-gray-500">
                {place} - {shop.pincode}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton title={shop.shopName} text={t("share.text", { shop: shop.shopName })} />
              <FavouriteButton providerId={shop.id} initial={isFavourite} loggedIn={Boolean(user)} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RatingBadge rating={shop.rating} count={shop.ratingCount} />
            <span
              className={`${pill} ${shop.isOpen ? "bg-green-50 text-green-700 ring-green-200" : "bg-gray-100 text-gray-600 ring-gray-200"}`}
            >
              {shop.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow")}
            </span>
            {shop.isVerified && <span className={`${pill} bg-blue-50 text-blue-700 ring-blue-200`}>✓ {t("home.verified")}</span>}
            {shop.isPureVeg && <span className={`${pill} bg-green-50 text-green-700 ring-green-200`}>🟢 {t("home.pureVeg")}</span>}
            {shop.planCount > 0 && (
              <span className={`${pill} bg-purple-50 text-purple-700 ring-purple-200`}>
                🗓️ {t("home.plansCount", { n: shop.planCount })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="sticky top-[57px] z-10 -mx-4 mt-5 flex gap-1 overflow-x-auto border-b border-gray-200 bg-[#fffaf5]/95 px-4 backdrop-blur">
        {TABS.map((k) => (
          <Link
            key={k}
            href={k === "menu" ? `/provider/${shop.id}` : `/provider/${shop.id}?tab=${k}`}
            aria-current={k === tab ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
              k === tab ? "border-orange-600 text-orange-700" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {t(TAB_KEY[k])}
            {k === "plans" && shop.planCount > 0 && (
              <span className="ml-1.5 rounded-full bg-purple-100 px-1.5 text-xs text-purple-700">{shop.planCount}</span>
            )}
          </Link>
        ))}
      </nav>

      <section className="mt-6">
        {tab === "menu" &&
          (!shop.isOpen ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-gray-600">{t("shop.closedMenu")}</p>
          ) : !menu ? (
            <p className="text-gray-600">{t("shop.closed")}</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-900">{t("shop.todayMenu", { day: t(DAY_KEYS[menu.day]) })}</h2>
              {menu.items.length === 0 ? (
                <p className="mt-4 text-gray-600">{t("shop.noItems")}</p>
              ) : (
                <OrderForm
                  providerId={shop.id}
                  items={menu.items.map((i) => ({ ...i, photo: photoSrc(i.photoUrl) }))}
                  loggedIn={Boolean(user)}
                />
              )}
            </>
          ))}

        {tab === "plans" &&
          (plans.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-gray-600">{t("shop.noPlans")}</p>
          ) : (
            <ul className="space-y-5">
              {plans.map((plan) => (
                <li key={plan.id} className="rounded-2xl border border-purple-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                          🗓️ {t("home.planDays", { n: plan.days })}
                        </span>
                        {plan.isVeg && <span className="text-xs font-medium text-green-700">🟢 {t("home.pureVeg")}</span>}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <p className="mt-0.5 text-sm text-gray-600">
                        {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
                      </p>
                      {plan.description && <p className="mt-1 text-sm text-gray-500">{plan.description}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(plan.pricePaise)}</p>
                      <p className="text-xs text-gray-500">
                        {t("plan.perDay", { price: formatPrice(Math.round(plan.pricePaise / plan.days)) })}
                      </p>
                    </div>
                  </div>

                  <details className="group mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-purple-700 hover:underline">
                      {t("shop.seeDayMenu")}
                    </summary>
                    <div className="mt-3">
                      <PlanMenuTable days={plan.days} mealTimes={plan.mealTimes} dayMenus={plan.dayMenus} />
                    </div>
                  </details>

                  <Link
                    href={`/plans/${plan.id}`}
                    className="mt-4 inline-block rounded-xl bg-purple-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-purple-700"
                  >
                    {t("shop.takePlan")} →
                  </Link>
                </li>
              ))}
            </ul>
          ))}

        {tab === "reviews" &&
          (!reviews || reviews.items.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-gray-600">{t("reviews.empty")}</p>
          ) : (
            <>
              <ul className="space-y-3">
                {reviews.items.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <Stars value={r.rating} />
                      <span className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</span>
                    </div>
                    {r.comment && <p className="mt-2 text-gray-800">{r.comment}</p>}
                    <ReviewPhotos photos={r.photos} customer={r.customer} />
                    <p className="mt-2 text-xs text-gray-500">{t("reviews.customer", { name: r.customer })}</p>
                  </li>
                ))}
              </ul>
              {reviews.total > reviews.items.length && (
                <Link href={`/provider/${shop.id}/reviews`} className="mt-4 inline-block font-semibold text-orange-700 hover:underline">
                  {t("shop.allReviews")} →
                </Link>
              )}
            </>
          ))}

        {tab === "info" && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              { k: t("shop.infoPlace"), v: `📍 ${place} - ${shop.pincode}` },
              { k: t("shop.infoStatus"), v: shop.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow") },
              { k: t("shop.infoTrust"), v: shop.isVerified ? `✓ ${t("shop.verifiedLong")}` : t("shop.approvedLong") },
              { k: t("shop.infoFood"), v: shop.isPureVeg ? `🟢 ${t("shop.vegOnly")}` : t("shop.vegAndNonveg") },
              { k: t("shop.infoPlans"), v: `🗓️ ${t("home.plansCount", { n: shop.planCount })}` },
              { k: t("shop.infoPay"), v: t("shop.payNote") },
            ].map((row) => (
              <div key={row.k} className="rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{row.k}</dt>
                <dd className="mt-1 text-gray-800">{row.v}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </main>
  );
}

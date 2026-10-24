import Link from "next/link";
import { getAreas, getCities, getPlans, getProviders, type PlanCard as Plan, type ShopCard as Shop } from "@/lib/api";
import { getSavedLocation } from "@/lib/location";
import { getCurrentUser } from "@/lib/session";
import { getT } from "@/i18n/server";
import { translateError } from "@/i18n/errors";
import ShopCard from "@/components/shop-card";
import PlanCard from "@/components/plan-card";
import LocationPrompt from "@/components/location-prompt";

// Backend se shehar na mile to ye dikhte hain
const FALLBACK_CITIES = ["Prayagraj", "Lucknow", "Varanasi", "Kanpur", "Delhi", "Mumbai"];

type Params = { city?: string; area?: string; sort?: string; veg?: string };

// "gonda" -> "Gonda"
function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const chipOn = "rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm";
const chipOff =
  "rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:bg-orange-50";

export default async function Home({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const city = sp.city?.trim() || undefined;
  const area = city ? sp.area?.trim() || undefined : undefined;
  const veg = sp.veg === "1";
  const { t } = await getT();

  // Ek hi jagah se link banao, baaki chune hue filter bache rahein
  function href(change: Partial<Record<keyof Params, string | undefined>>) {
    const next: Params = { city, area, sort: sp.sort, veg: veg ? "1" : undefined, ...change };
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
    const qs = q.toString();
    return qs ? `/?${qs}` : "/";
  }

  // Login purana ho to naya token yahin le liya jata hai
  await getCurrentUser(href({}));

  const location = await getSavedLocation();
  const sort = sp.sort === "rating" || (sp.sort === "distance" && location) ? sp.sort : undefined;
  const listing = Boolean(city || location);

  let shops: Shop[] | null = null;
  let activeSort: "distance" | "rating" = "rating";
  let error = "";

  if (listing) {
    try {
      const data = await getProviders({
        city,
        area,
        sort: sort as "distance" | "rating" | undefined,
        veg,
        ...(location ? { lat: location.lat, lng: location.lng } : {}),
      });
      shops = data.items;
      activeSort = data.sort;
    } catch (e) {
      error = e instanceof Error ? translateError(t, e.message) : t("err.generic");
    }
  }

  // Plans ki row: chuna shehar, warna sabse paas wali dukaan ka shehar
  const planCity = city ?? shops?.[0]?.city;
  const [plans, areas, apiCities]: [Plan[], string[], string[]] = await Promise.all([
    planCity ? getPlans(planCity, area) : Promise.resolve([]),
    city ? getAreas(city) : Promise.resolve([]),
    getCities(),
  ]);
  const cities = apiCities.length > 0 ? apiCities.map(titleCase) : FALLBACK_CITIES;

  const steps = [
    { icon: "📍", title: t("home.step1Title"), text: t("home.step1Text") },
    { icon: "🍛", title: t("home.step2Title"), text: t("home.step2Text") },
    { icon: "🛵", title: t("home.step3Title"), text: t("home.step3Text") },
  ];

  return (
    <main>
      <section className="bg-gradient-to-b from-orange-100 via-orange-50 to-[#fffaf5]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
            {t("home.heroA")} <span className="text-orange-600">{t("home.heroB")}</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-gray-600 sm:text-lg">{t("home.heroSub")}</p>

          <div className="mt-6">
            <LocationPrompt hasLocation={Boolean(location)} />
          </div>

          <form className="mt-5 flex max-w-xl gap-2">
            <input
              name="city"
              defaultValue={city}
              placeholder={t("home.searchPlaceholder")}
              aria-label={t("home.searchPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
            <button className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-700">
              {t("home.search")}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2" aria-label={t("home.citiesLabel")}>
            {cities.map((c) => (
              <Link
                key={c}
                href={href({ city: c, area: undefined })}
                className={city?.toLowerCase() === c.toLowerCase() ? chipOn : chipOff}
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}

        {shops && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                {city ? t("home.shopsIn", { city: titleCase(city) }) : t("home.nearYou")}
                <span className="ml-2 align-middle text-base font-medium text-gray-500">
                  {t("home.resultCount", { n: shops.length })}
                </span>
              </h2>
            </div>

            {/* Sort aur filter */}
            <div className="mt-4 flex flex-wrap items-center gap-2" aria-label={t("home.sortLabel")}>
              {location && (
                <Link href={href({ sort: "distance" })} className={activeSort === "distance" ? chipOn : chipOff}>
                  📍 {t("home.sortNear")}
                </Link>
              )}
              <Link href={href({ sort: "rating" })} className={activeSort === "rating" ? chipOn : chipOff}>
                ⭐ {t("home.sortRating")}
              </Link>
              <Link
                href={href({ veg: veg ? undefined : "1" })}
                aria-pressed={veg}
                className={veg ? "rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm" : chipOff}
              >
                🟢 {t("home.veg")}
              </Link>
            </div>

            {/* Area: chuna area sabse upar */}
            {city && areas.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2" aria-label={t("home.areasLabel")}>
                <span className="text-sm font-medium text-gray-500">{t("home.areasLabel")}:</span>
                <Link href={href({ area: undefined })} className={!area ? chipOn : chipOff}>
                  {t("home.allAreas")}
                </Link>
                {areas.map((a) => (
                  <Link
                    key={a}
                    href={href({ area: a })}
                    className={area?.toLowerCase() === a.toLowerCase() ? chipOn : chipOff}
                  >
                    {a}
                  </Link>
                ))}
              </div>
            )}

            {shops.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-600">
                {city ? t("home.noShops", { city: titleCase(city) }) : t("home.noShopsNear")}
              </p>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shops.map((s) => (
                  <li key={s.id}>
                    <ShopCard shop={s} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {plans.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">🗓️ {t("home.plansTitle")}</h2>
            <p className="mt-1 text-sm text-gray-600">{t("home.plansSub")}</p>
            <ul className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3">
              {plans.map((p) => (
                <li key={p.id} className="flex">
                  <PlanCard plan={p} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {!listing && (
          <>
            <h2 className="text-xl font-semibold">{t("home.how")}</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {steps.map((s) => (
                <li key={s.title} className="rounded-2xl border bg-white p-5 shadow-sm">
                  <p className="text-3xl">{s.icon}</p>
                  <p className="mt-2 font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 rounded-2xl bg-orange-600 p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{t("home.ctaTitle")}</p>
            <p className="mt-1 text-sm text-orange-100">{t("home.ctaText")}</p>
          </div>
          <Link
            href="/login?as=provider"
            className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-orange-700 sm:mt-0"
          >
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>
    </main>
  );
}

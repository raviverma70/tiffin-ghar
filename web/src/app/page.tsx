import Link from "next/link";
import { getProviders, type Provider } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { photoSrc } from "@/lib/photo";
import { RatingLine } from "@/components/stars";
import Thumb from "@/components/thumb";

const CITIES = ["Prayagraj", "Lucknow", "Varanasi", "Kanpur", "Delhi", "Mumbai"];

const STEPS = [
  { icon: "📍", title: "Shehar chuno", text: "Apne shehar ki khuli tiffin dukaanein dekho." },
  { icon: "🍛", title: "Aaj ka menu", text: "Har dukaan ka aaj ka khana aur daam ek jagah." },
  { icon: "🛵", title: "Order karo", text: "COD me order do, ghar par khana pao." },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const query = city?.trim();

  // Login purana ho to naya token yahin le liya jata hai
  const here = query ? `/?city=${encodeURIComponent(query)}` : "/";
  await getCurrentUser(here);

  let providers: Provider[] | null = null;
  let error = "";

  if (query) {
    try {
      providers = (await getProviders(query)).items;
    } catch (e) {
      error = e instanceof Error ? e.message : "Kuch gadbad hui";
    }
  }

  return (
    <main>
      <section className="bg-gradient-to-b from-orange-100 to-[#fffaf5]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Ghar ka khana, <span className="text-orange-600">aapke shehar me</span>
          </h1>
          <p className="mt-3 max-w-xl text-gray-600">
            Apne aas-paas ki tiffin dukaanein dekho, aaj ka menu chuno aur ghar baithe order karo.
          </p>

          <form className="mt-6 flex max-w-xl gap-2">
            <input
              name="city"
              defaultValue={query}
              placeholder="Apna shehar likho (jaise Prayagraj)"
              className="flex-1 rounded-lg border bg-white px-4 py-3 shadow-sm"
            />
            <button className="rounded-lg bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-700">
              Dhundo
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <Link
                key={c}
                href={`/?city=${encodeURIComponent(c)}`}
                className="rounded-full border bg-white px-3 py-1 text-sm hover:bg-orange-50"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pt-6">
        {error && <p className="text-red-600">{error}</p>}

        {providers && (
          <>
            <h2 className="text-xl font-semibold">
              {query} ki dukaanein {providers.length > 0 && `(${providers.length})`}
            </h2>

            {providers.length === 0 && (
              <p className="mt-4 text-gray-600">{query} me abhi koi khuli dukaan nahi mili.</p>
            )}

            {providers.length > 0 && (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {providers.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/provider/${p.id}`}
                      className="block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
                    >
                      <Thumb src={photoSrc(p.photoUrl)} alt={p.shopName} className="h-40 w-full" />
                      <div className="p-4">
                        <p className="text-lg font-semibold">{p.shopName}</p>
                        <p className="text-sm text-gray-600">
                          {p.city} - {p.pincode}
                        </p>
                        <div className="mt-1">
                          <RatingLine rating={p.rating} count={p.ratingCount} />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {!providers && !error && (
          <>
            <h2 className="text-xl font-semibold">Kaise kaam karta hai</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.title} className="rounded-xl border bg-white p-5 shadow-sm">
                  <p className="text-3xl">{s.icon}</p>
                  <p className="mt-2 font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{s.text}</p>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-10 rounded-2xl bg-orange-600 p-6 text-white sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">Apni tiffin dukaan hai?</p>
            <p className="mt-1 text-sm text-orange-100">
              Menu daalo, orders lo aur apne shehar ke customers tak pahucho.
            </p>
          </div>
          <Link
            href="/login?as=provider"
            className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-semibold text-orange-700 sm:mt-0"
          >
            Dukaan kholo
          </Link>
        </div>
      </section>
    </main>
  );
}
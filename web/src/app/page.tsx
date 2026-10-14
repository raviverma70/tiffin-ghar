import Link from "next/link";
import { getProviders, type Provider } from "@/lib/api";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city } = await searchParams;
  const query = city?.trim();

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
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-bold">Tiffin Ghar</h1>
      <p className="mt-1 text-gray-600">Ghar ka khana, aapke shehar me.</p>

      <form className="mt-6 flex gap-2">
        <input
          name="city"
          defaultValue={query}
          placeholder="Apna shehar likho (jaise Prayagraj)"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded bg-orange-600 px-4 py-2 text-white">Dhundo</button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {providers && providers.length === 0 && (
        <p className="mt-4 text-gray-600">
          {query} me abhi koi khuli dukaan nahi mili.
        </p>
      )}

      {providers && providers.length > 0 && (
        <ul className="mt-6 space-y-3">
          {providers.map((p) => (
            <li key={p.id}>
              <Link
                href={`/provider/${p.id}`}
                className="block rounded border p-4 hover:bg-orange-50"
              >
                <p className="text-lg font-semibold">{p.shopName}</p>
                <p className="text-sm text-gray-600">
                  {p.city} - {p.pincode}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
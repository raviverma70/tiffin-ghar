import Link from "next/link";
import { getMenu, formatPrice } from "@/lib/api";

const DAY_NAMES = [
  "Ravivar",
  "Somvar",
  "Mangalvar",
  "Budhvar",
  "Guruvar",
  "Shukravar",
  "Shanivar",
];

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getMenu(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; Wapas
        </Link>
        <p className="mt-6 text-gray-600">Ye dukaan abhi band hai ya mili nahi.</p>
      </main>
    );
  }

  const { provider, day, items } = data;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href={`/?city=${encodeURIComponent(provider.city)}`}
        className="text-orange-600"
      >
        &larr; {provider.city} ki dukaanein
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        Aaj ka menu ({DAY_NAMES[day]})
      </h2>

      {items.length === 0 && (
        <p className="mt-4 text-gray-600">Aaj ke liye abhi koi item nahi hai.</p>
      )}

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="rounded border p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">
                  <span
                    className={item.isVeg ? "text-green-600" : "text-red-600"}
                    title={item.isVeg ? "Veg" : "Non-veg"}
                  >
                    &#9679;
                  </span>{" "}
                  {item.name}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                )}
              </div>
              <p className="font-semibold">{formatPrice(item.pricePaise)}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
import Link from "next/link";
import { getMenu } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import OrderForm from "./order-form";
import { RatingLine } from "@/components/stars";

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
  const user = await getCurrentUser(`/provider/${id}`);
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
      <div className="flex items-center justify-between">
        <Link
          href={`/?city=${encodeURIComponent(provider.city)}`}
          className="text-orange-600"
        >
          &larr; {provider.city} ki dukaanein
        </Link>
        {user && (
          <Link href="/orders" className="text-orange-600">
            Mere orders
          </Link>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
        <RatingLine rating={provider.rating} count={provider.ratingCount} />
        <Link href={`/provider/${provider.id}/reviews`} className="text-sm text-orange-600">
          Reviews dekho
        </Link>
      </div>

      <h2 className="mt-6 text-xl font-semibold">Aaj ka menu ({DAY_NAMES[day]})</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-gray-600">Aaj ke liye abhi koi item nahi hai.</p>
      ) : (
        <OrderForm providerId={provider.id} items={items} loggedIn={!!user} />
      )}
    </main>
  );
}
import Link from "next/link";
import { getMenu } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { photoSrc } from "@/lib/photo";
import { DAY_KEYS } from "@/lib/provider";
import { getT } from "@/i18n/server";
import { RatingLine } from "@/components/stars";
import Thumb from "@/components/thumb";
import OrderForm from "./order-form";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getT();
  const user = await getCurrentUser(`/provider/${id}`);
  const data = await getMenu(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("shop.closed")}</p>
      </main>
    );
  }

  const { provider, day, items } = data;
  const menuItems = items.map((i) => ({ ...i, photo: photoSrc(i.photoUrl) }));

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/?city=${encodeURIComponent(provider.city)}`} className="text-orange-600">
        &larr; {t("home.shopsIn", { city: provider.city })}
      </Link>

      <Thumb
        src={photoSrc(provider.photoUrl)}
        alt={provider.shopName}
        className="mt-4 h-48 w-full rounded-2xl sm:h-60"
      />

      <h1 className="mt-4 text-3xl font-bold">{provider.shopName}</h1>
      <p className="text-gray-600">
        {provider.city} - {provider.pincode}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <RatingLine rating={provider.rating} count={provider.ratingCount} />
        <Link href={`/provider/${provider.id}/reviews`} className="text-sm text-orange-600">
          {t("shop.reviewsLink")}
        </Link>
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        {t("shop.todayMenu", { day: t(DAY_KEYS[day]) })}
      </h2>

      {menuItems.length === 0 ? (
        <p className="mt-4 text-gray-600">{t("shop.noItems")}</p>
      ) : (
        <OrderForm providerId={provider.id} items={menuItems} loggedIn={!!user} />
      )}
    </main>
  );
}

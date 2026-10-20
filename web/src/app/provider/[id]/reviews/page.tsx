import Link from "next/link";
import { getReviews } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";
import { RatingLine, Stars } from "@/components/stars";

const LIMIT = 20;

export default async function ProviderReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const { t, locale } = await getT();

  const data = await getReviews(id, page, LIMIT);

  if (!data) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.back")}
        </Link>
        <p className="mt-6 text-gray-600">{t("shop.notFound")}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/provider/${data.provider.id}`} className="text-orange-600">
        &larr; {data.provider.shopName}
      </Link>

      <h1 className="mt-4 text-2xl font-bold">{t("reviews.title")}</h1>
      <p className="mt-1">
        <RatingLine rating={data.provider.rating} count={data.provider.ratingCount} />
      </p>

      {data.items.length === 0 && <p className="mt-6 text-gray-600">{t("reviews.empty")}</p>}

      <ul className="mt-6 space-y-3">
        {data.items.map((r) => (
          <li key={r.id} className="rounded border bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <Stars value={r.rating} />
              <span className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</span>
            </div>
            {r.comment && <p className="mt-2">{r.comment}</p>}
            <p className="mt-2 text-xs text-gray-500">{t("reviews.customer", { name: r.customer })}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={`/provider/${data.provider.id}/reviews?page=${page - 1}`} className="text-orange-600">
            &larr; {t("reviews.newer")}
          </Link>
        ) : (
          <span />
        )}
        {data.total > page * LIMIT && (
          <Link href={`/provider/${data.provider.id}/reviews?page=${page + 1}`} className="text-orange-600">
            {t("reviews.older")} &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}

import Link from "next/link";
import { providerFetch, requireProviderUser } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import { getReviews } from "@/lib/reviews";
import { formatDate } from "@/lib/format";
import { getT } from "@/i18n/server";
import ReviewPhotos from "@/components/review-photos";
import DashNav from "@/components/dash-nav";
import { RatingLine, Stars } from "@/components/stars";

const LIMIT = 20;

export default async function DashboardReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = page > 1 ? `/dashboard/reviews?page=${page}` : "/dashboard/reviews";
  const { t, locale } = await getT();

  await requireProviderUser(here);

  const res = await providerFetch("/providers/me", { mode: "page", returnTo: here });
  const p = res.ok ? ((await res.json()) as ProviderProfile) : null;
  const data = p ? await getReviews(p.id, page, LIMIT) : null;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="reviews" />

      <h1 className="mt-6 text-2xl font-bold">{t("reviews.title")}</h1>

      {!data && <p className="mt-4 text-gray-600">{t("dreviews.pending")}</p>}

      {data && (
        <>
          <p className="mt-1">
            <RatingLine rating={data.provider.rating} count={data.provider.ratingCount} />
          </p>

          {data.items.length === 0 && <p className="mt-6 text-gray-600">{t("dreviews.none")}</p>}

          <ul className="mt-6 space-y-3">
            {data.items.map((r) => (
              <li key={r.id} className="rounded-xl border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <Stars value={r.rating} />
                  <span className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</span>
                </div>
                {r.comment && <p className="mt-2">{r.comment}</p>}
                <ReviewPhotos photos={r.photos} customer={r.customer} />
                <p className="mt-2 text-xs text-gray-500">
                  {t("reviews.customer", { name: r.customer })}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between">
            {page > 1 ? (
              <Link href={`/dashboard/reviews?page=${page - 1}`} className="text-orange-600">
                &larr; {t("reviews.newer")}
              </Link>
            ) : (
              <span />
            )}
            {data.total > page * LIMIT && (
              <Link href={`/dashboard/reviews?page=${page + 1}`} className="text-orange-600">
                {t("reviews.older")} &rarr;
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}

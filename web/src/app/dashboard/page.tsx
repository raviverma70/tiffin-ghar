import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import { getReviews } from "@/lib/reviews";
import { photoSrc } from "@/lib/photo";
import { getAreas } from "@/lib/api";
import { getT } from "@/i18n/server";
import DashNav from "@/components/dash-nav";
import PhotoUploader from "@/components/photo-uploader";
import { RatingLine } from "@/components/stars";
import ProfileForm from "./profile-form";
import { toggleOpenAction } from "./actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const { t } = await getT();

  const user = await getCurrentUser("/dashboard");
  if (!user) redirect("/login?next=%2Fdashboard");

  const newProfile = (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/" className="text-orange-600">
        &larr; {t("nav.home")}
      </Link>
      <h1 className="mt-4 text-2xl font-bold">{t("nav.startShop")}</h1>
      <p className="mt-1 text-gray-600">{t("dash.newText")}</p>
      <div className="mt-6">
        <ProfileForm mode="create" />
      </div>
    </main>
  );

  if (user.role === "ADMIN") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="text-orange-600">
          &larr; {t("nav.home")}
        </Link>
        <p className="mt-6 text-gray-600">
          {t("dash.adminNote")}{" "}
          <Link href="/admin" className="text-orange-600">
            {t("dash.adminPanel")}
          </Link>
        </p>
      </main>
    );
  }

  if (user.role !== "PROVIDER") return newProfile;

  const res = await providerFetch("/providers/me", {
    mode: "page",
    returnTo: "/dashboard",
  });
  if (res.status === 404) return newProfile;
  if (!res.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <DashNav active="home" />
        <p className="mt-6 text-red-600">{t("dash.profileFail")}</p>
      </main>
    );
  }
  const p = (await res.json()) as ProviderProfile;

  const ordersRes = await providerFetch("/providers/me/orders?status=PLACED&limit=1", {
    mode: "page",
    returnTo: "/dashboard",
  });
  const newOrders = ordersRes.ok ? ((await ordersRes.json()) as { total: number }).total : null;
  const subsRes = await providerFetch("/providers/me/subscriptions?status=REQUESTED&limit=1", {
    mode: "page",
    returnTo: "/dashboard",
  });
  const newSubs = subsRes.ok ? ((await subsRes.json()) as { total: number }).total : null;
  const reviews = await getReviews(p.id, 1, 1);
  const areaSuggestions = await getAreas(p.city);
  const hasLocation = p.latitude !== null && p.longitude !== null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <DashNav active="home" />

      <h1 className="mt-6 text-2xl font-bold text-gray-900">{p.shopName}</h1>
      <p className="text-gray-600">
        {p.area ? `${p.area}, ` : ""}
        {p.city} - {p.pincode}
      </p>

      {!hasLocation && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          📍 {t("dash.locationMissing")}
        </p>
      )}

      {notice && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{notice}</p>
      )}

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="font-semibold">{t("dash.photoTitle")}</p>
        <p className="text-sm text-gray-600">{t("dash.photoHint")}</p>
        <div className="mt-3">
          <PhotoUploader kind="shop" src={photoSrc(p.photoUrl)} />
        </div>
      </div>

      {p.status === "PENDING" && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900">⏳ {t("dash.pending")}</p>
      )}

      {p.status === "REJECTED" && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{t("dash.rejected")}</p>
      )}

      {p.status === "APPROVED" && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className={`font-semibold ${p.isOpen ? "text-green-700" : "text-gray-700"}`}>
            {p.isOpen ? "● " : "○ "}
            {p.isOpen ? t("dash.shopOpen") : t("dash.shopClosed")}
          </p>
          <form action={toggleOpenAction} className="mt-3">
            <input type="hidden" name="isOpen" value={String(!p.isOpen)} />
            <button
              className={
                p.isOpen
                  ? "rounded-xl border border-red-300 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
                  : "rounded-xl bg-green-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-green-700"
              }
            >
              {p.isOpen ? t("dash.closeBtn") : t("dash.openBtn")}
            </button>
          </form>
        </div>
      )}

      <Link
        href="/dashboard/orders?status=PLACED"
        className="mt-4 block rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
      >
        <p className="font-semibold">
          {t("dash.newOrders", { n: newOrders === null ? "-" : newOrders })}
        </p>
        <p className="text-sm text-gray-600">{t("dash.ordersHint")} &rarr;</p>
      </Link>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/subscriptions?status=REQUESTED"
          className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <p className="font-semibold">{t("dash.newSubs", { n: newSubs === null ? "-" : newSubs })}</p>
          <p className="text-sm text-gray-600">{t("dash.subsHint")} &rarr;</p>
        </Link>
        <Link href="/dashboard/plans" className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md">
          <p className="font-semibold">🗓️ {t("dash.plansCard")}</p>
          <p className="text-sm text-gray-600">{t("dash.plansHint")} &rarr;</p>
        </Link>
      </div>

      {reviews && (
        <Link
          href="/dashboard/reviews"
          className="mt-3 block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-orange-300 hover:shadow-md"
        >
          <p className="font-semibold">{t("reviews.title")}</p>
          <p className="mt-1">
            <RatingLine rating={reviews.provider.rating} count={reviews.provider.ratingCount} />
          </p>
        </Link>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>{t("dash.address", { address: p.address })}</p>
        <p>{t("dash.fssai", { value: p.fssaiNumber ?? t("dash.fssaiNone") })}</p>
      </div>

      <details className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm" open={!hasLocation}>
        <summary className="cursor-pointer font-semibold">{t("dash.editProfile")}</summary>
        <div className="mt-4">
          <ProfileForm mode="edit" profile={p} areaSuggestions={areaSuggestions} />
        </div>
      </details>
    </main>
  );
}

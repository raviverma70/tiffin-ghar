import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import type { ProviderProfile } from "@/lib/provider";
import DashNav from "@/components/dash-nav";
import ProfileForm from "./profile-form";
import { toggleOpenAction } from "./actions";
import { getReviews } from "@/lib/reviews";
import { RatingLine } from "@/components/stars";
import PhotoUploader from "@/components/photo-uploader";
import { photoSrc } from "@/lib/photo";

function NewProfile() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Apni dukaan kholo</h1>
      <p className="mt-1 text-gray-600">
        Dukaan ki jaankari bharo. Admin approve karega tab customers ko dikhegi.
      </p>
      <div className="mt-6">
        <ProfileForm mode="create" />
      </div>
    </main>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;

  const user = await getCurrentUser("/dashboard");
  if (!user) redirect("/login?next=%2Fdashboard");

  if (user.role === "ADMIN") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <Link href="/" className="text-orange-600">
          &larr; Home
        </Link>
        <p className="mt-6 text-gray-600">Admin ke liye alag panel baad me banega (Step 9).</p>
      </main>
    );
  }

  if (user.role !== "PROVIDER") return <NewProfile />;

  const res = await providerFetch("/providers/me", {
    mode: "page",
    returnTo: "/dashboard",
  });
  if (res.status === 404) return <NewProfile />;
  if (!res.ok) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <DashNav active="home" />
        <p className="mt-6 text-red-600">Profile nahi la paye, baad me try karo.</p>
      </main>
    );
  }
  const p = (await res.json()) as ProviderProfile;

  const ordersRes = await providerFetch("/providers/me/orders?status=PLACED&limit=1", {
    mode: "page",
    returnTo: "/dashboard",
  });
  const newOrders = ordersRes.ok ? ((await ordersRes.json()) as { total: number }).total : null;
    const reviews = await getReviews(p.id, 1, 1);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <DashNav active="home" />

      <h1 className="mt-6 text-2xl font-bold">{p.shopName}</h1>
      <p className="text-gray-600">
        {p.city} - {p.pincode}
      </p>

      {notice && (
        <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>
      )}
            <div className="mt-4 rounded-xl border bg-white p-4">
        <p className="font-semibold">Dukaan ki photo</p>
        <p className="text-sm text-gray-600">Customers ko dukaan ke card par yahi photo dikhegi.</p>
        <div className="mt-3">
          <PhotoUploader kind="shop" src={photoSrc(p.photoUrl)} />
        </div>
      </div>

      {p.status === "PENDING" && (
        <p className="mt-4 rounded border border-yellow-600 p-3">
          Approval ka intezaar. Admin approve karega tab dukaan khul payegi. Tab tak aap menu bana
          sakte ho.
        </p>
      )}

      {p.status === "REJECTED" && (
        <p className="mt-4 rounded border border-red-600 p-3 text-red-600">
          Aapki profile approve nahi hui. Jaankari theek karke admin se baat karo.
        </p>
      )}

      {p.status === "APPROVED" && (
        <div className="mt-4 rounded border p-4">
          <p className="font-semibold">
            Dukaan abhi {p.isOpen ? "khuli hai (customers ko dikh rahi hai)" : "band hai"}
          </p>
          <form action={toggleOpenAction} className="mt-3">
            <input type="hidden" name="isOpen" value={String(!p.isOpen)} />
            <button
              className={
                p.isOpen
                  ? "rounded border border-red-600 px-4 py-2 text-red-600"
                  : "rounded bg-orange-600 px-4 py-2 text-white"
              }
            >
              {p.isOpen ? "Dukaan band karo" : "Dukaan kholo"}
            </button>
          </form>
        </div>
      )}

      <Link
        href="/dashboard/orders?status=PLACED"
        className="mt-4 block rounded border p-4 hover:bg-orange-50"
      >
        <p className="font-semibold">
          Naye orders: {newOrders === null ? "-" : newOrders}
        </p>
        <p className="text-sm text-gray-600">Orders dekho aur status badlo &rarr;</p>
      </Link>
            {reviews && (
        <Link
          href="/dashboard/reviews"
          className="mt-3 block rounded border p-4 hover:bg-orange-50"
        >
          <p className="font-semibold">Reviews</p>
          <p className="mt-1">
            <RatingLine rating={reviews.provider.rating} count={reviews.provider.ratingCount} />
          </p>
        </Link>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>Pata: {p.address}</p>
        <p>FSSAI: {p.fssaiNumber ?? "daala nahi"}</p>
      </div>

      <details className="mt-6 rounded border p-4">
        <summary className="cursor-pointer font-semibold">Profile badlo</summary>
        <div className="mt-4">
          <ProfileForm mode="edit" profile={p} />
        </div>
      </details>
    </main>
  );
}
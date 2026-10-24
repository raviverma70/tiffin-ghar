import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { providerFetch } from "@/lib/provider-api";
import { formatDate } from "@/lib/format";
import {
  ADMIN_FILTERS,
  PROVIDER_STATUS_TEXT,
  type AdminProvider,
  type AdminStats,
} from "@/lib/admin";
import ConfirmButton from "@/components/confirm-button";
import { setProviderStatusAction } from "./actions";

const LIMIT = 20;

function pathFor(status: string, page: number) {
  const q = new URLSearchParams({ status });
  if (page > 1) q.set("page", String(page));
  return `/admin?${q.toString()}`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; notice?: string }>;
}) {
  const { status: statusParam, page: pageParam, notice } = await searchParams;

  const status = ADMIN_FILTERS.some((f) => f.value === statusParam) ? (statusParam as string) : "PENDING";
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const here = pathFor(status, page);

  const user = await getCurrentUser(here);
  if (!user) redirect(`/login?next=${encodeURIComponent(here)}`);
  if (user.role !== "ADMIN") redirect("/");

  const statsRes = await providerFetch("/admin/stats", { mode: "page", returnTo: here });
  const stats = statsRes.ok ? ((await statsRes.json()) as AdminStats) : null;

  const q = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (status !== "ALL") q.set("status", status);
  const listRes = await providerFetch(`/admin/providers?${q.toString()}`, {
    mode: "page",
    returnTo: here,
  });
  const data = listRes.ok
    ? ((await listRes.json()) as { items: AdminProvider[]; total: number })
    : null;

  // [label, value, icon, rang]
  const cards: [string, number | string, string, string][] = stats
    ? [
        ["Users", stats.users, "👥", "bg-white"],
        ["Approval ke intezaar", stats.providersPending, "⏳", "bg-amber-50"],
        ["Approved dukaanein", stats.providersApproved, "✅", "bg-green-50"],
        ["Reject dukaanein", stats.providersRejected, "✖", "bg-red-50"],
        ["Orders (kul)", stats.orders, "🧾", "bg-white"],
        ["Orders (24 ghante)", stats.orders24h, "⚡", "bg-blue-50"],
        ["Pahunche orders", stats.delivered, "🛵", "bg-white"],
      ]
    : [];

  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
    APPROVED: "bg-green-50 text-green-700 ring-green-200",
    REJECTED: "bg-red-50 text-red-700 ring-red-200",
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <Link href="/" className="text-sm text-orange-700 hover:underline">
        &larr; Website
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">🛡️ Admin</h1>

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map(([label, value, icon, tone]) => (
            <div key={label} className={`rounded-2xl p-4 shadow-sm ring-1 ring-gray-200 ${tone}`}>
              <p className="text-sm" aria-hidden>
                {icon}
              </p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {ADMIN_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={pathFor(f.value, 1)}
            className={
              f.value === status
                ? "rounded-full bg-orange-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm"
                : "rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-orange-50"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">Providers nahi la paye, baad me try karo.</p>}
      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Is filter me koi dukaan nahi hai.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((p) => (
            <li key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{p.shopName}</p>
                  <p className="text-sm text-gray-600">
                    {p.city} - {p.pincode}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${statusStyle[p.status] ?? ""}`}>
                  {PROVIDER_STATUS_TEXT[p.status]}
                </span>
              </div>

              <div className="mt-3 space-y-1 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                <p>Pata: {p.address}</p>
                <p>FSSAI: {p.fssaiNumber ?? "daala nahi"}</p>
                <p>
                  Malik ka phone:{" "}
                  <a href={`tel:${p.user.phone}`} className="text-orange-600">
                    {p.user.phone}
                  </a>
                </p>
                <p className="text-gray-600">
                  Menu me {p._count.menuItems} item, {p._count.orders} order, bani {formatDate(p.createdAt)}
                  {p.status === "APPROVED" && (p.isOpen ? ", abhi khuli hai" : ", abhi band hai")}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {p.status !== "APPROVED" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="APPROVED" />
                    <input type="hidden" name="back" value={here} />
                    <ConfirmButton className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                      Approve karo
                    </ConfirmButton>
                  </form>
                )}
                {p.status !== "REJECTED" && (
                  <form action={setProviderStatusAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="status" value="REJECTED" />
                    <input type="hidden" name="back" value={here} />
                    <ConfirmButton
                      message={
                        p.status === "APPROVED"
                          ? "Ye dukaan band ho jayegi aur customers ko nahi dikhegi. Reject karna hai?"
                          : "Ye dukaan reject karni hai?"
                      }
                      className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Reject karo
                    </ConfirmButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex justify-between">
        {page > 1 ? (
          <Link href={pathFor(status, page - 1)} className="text-orange-600">
            &larr; Pichla
          </Link>
        ) : (
          <span />
        )}
        {data && data.total > page * LIMIT && (
          <Link href={pathFor(status, page + 1)} className="text-orange-600">
            Agla &rarr;
          </Link>
        )}
      </div>
    </main>
  );
}
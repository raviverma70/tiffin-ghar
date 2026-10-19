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

  const cards: [string, number | string][] = stats
    ? [
        ["Users", stats.users],
        ["Approval ke intezaar", stats.providersPending],
        ["Approved dukaanein", stats.providersApproved],
        ["Reject dukaanein", stats.providersRejected],
        ["Orders (kul)", stats.orders],
        ["Orders (24 ghante)", stats.orders24h],
        ["Pahunche orders", stats.delivered],
      ]
    : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link href="/" className="text-orange-600">
        &larr; Website
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Admin</h1>

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map(([label, value]) => (
            <div key={label} className="rounded border p-3">
              <p className="text-2xl font-bold">{value}</p>
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
                ? "rounded bg-orange-600 px-3 py-1 text-sm text-white"
                : "rounded border px-3 py-1 text-sm hover:bg-orange-50"
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      {notice && <p className="mt-4 rounded border border-red-600 p-3 text-red-600">{notice}</p>}
      {!data && <p className="mt-4 text-red-600">Providers nahi la paye, baad me try karo.</p>}
      {data && data.items.length === 0 && (
        <p className="mt-4 text-gray-600">Is filter me koi dukaan nahi hai.</p>
      )}

      {data && data.items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {data.items.map((p) => (
            <li key={p.id} className="rounded border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold">{p.shopName}</p>
                  <p className="text-sm text-gray-600">
                    {p.city} - {p.pincode}
                  </p>
                </div>
                <p className="rounded border px-2 py-1 text-sm font-semibold">
                  {PROVIDER_STATUS_TEXT[p.status]}
                </p>
              </div>

              <div className="mt-3 space-y-1 text-sm">
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
                    <ConfirmButton className="rounded bg-orange-600 px-3 py-2 text-sm text-white">
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
                      className="rounded border border-red-600 px-3 py-2 text-sm text-red-600"
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
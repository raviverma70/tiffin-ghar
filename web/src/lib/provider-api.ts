import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { authedFetch, refreshInline } from "@/lib/authed";
import { getCurrentUser } from "@/lib/session";

type Opts = {
  mode: "page" | "action";
  returnTo: string;
  method?: string;
  body?: unknown;
};

export async function providerFetch(path: string, opts: Opts): Promise<Response> {
  const res = await authedFetch(path, opts);
  if (res.status !== 403) return res;

  // 403: token me purana role ho sakta hai (profile abhi bani). Naya token lo.
  const next = encodeURIComponent(opts.returnTo);
  if (opts.mode === "page") redirect(`/session/refresh?next=${next}`);

  const fresh = await refreshInline();
  if (!fresh) redirect(`/login?next=${next}`);

  try {
    return await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${fresh}`,
        "Content-Type": "application/json",
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server se jud nahi paye, baad me try karo" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Menu aur orders ke pages ke liye: login zaroori, aur role PROVIDER hona chahiye
export async function requireProviderUser(returnTo: string) {
  const user = await getCurrentUser(returnTo);
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (user.role !== "PROVIDER") redirect("/dashboard");
  return user;
}
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_WAIT_COOKIE, setSession, clearSession } from "@/lib/session";
import { refreshOnce } from "@/lib/refresh";

type Options = {
  mode: "page" | "action";
  returnTo: string; // login ya refresh ke baad yahin wapas aayenge
  method?: string;
  body?: unknown;
};

export async function refreshInline(): Promise<string | null> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  // Ek token ka ek hi refresh (lib/refresh.ts). Backend tak na pahunche to login mat mitao.
  const result = await refreshOnce(refresh);
  if (!result.ok) {
    if (result.reason === "invalid") await clearSession();
    return null;
  }
  await setSession(result.accessToken, result.refreshToken);
  return result.accessToken;
}

async function call(path: string, token: string, opts: Options) {
  try {
    return await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

export async function authedFetch(path: string, opts: Options): Promise<Response> {
  const next = encodeURIComponent(opts.returnTo);
  const store = await cookies();
  let access = store.get(ACCESS_COOKIE)?.value ?? null;

  if (!access) {
    if (opts.mode === "page") {
      // Abhi-abhi backend tak nahi pahunche the (REFRESH_WAIT_COOKIE): dobara chakkar mat lagao
      if (store.get(REFRESH_COOKIE) && !store.get(REFRESH_WAIT_COOKIE)) redirect(`/session/refresh?next=${next}`);
      redirect(`/login?next=${next}`);
    }
    access = await refreshInline();
    if (!access) redirect(`/login?next=${next}`);
  }

  let res = await call(path, access, opts);

  if (res.status === 401) {
    if (opts.mode === "page") redirect(`/session/refresh?next=${next}`);
    const fresh = await refreshInline();
    if (!fresh) redirect(`/login?next=${next}`);
    res = await call(path, fresh, opts);
  }

  return res;
}
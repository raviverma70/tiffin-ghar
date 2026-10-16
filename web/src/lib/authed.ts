import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { ACCESS_COOKIE, REFRESH_COOKIE, setSession, clearSession } from "@/lib/session";

type Options = {
  mode: "page" | "action";
  returnTo: string; // login ya refresh ke baad yahin wapas aayenge
  method?: string;
  body?: unknown;
};

async function refreshInline(): Promise<string | null> {
  const store = await cookies();
  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      cache: "no-store",
    });
    if (!res.ok) {
      await clearSession();
      return null;
    }
    const data = await res.json();
    await setSession(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
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
      if (store.get(REFRESH_COOKIE)) redirect(`/session/refresh?next=${next}`);
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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api";
import { refreshInline } from "@/lib/authed";
import { ACCESS_COOKIE } from "@/lib/session";

export async function uploadImage(
  path: string,
  bytes: ArrayBuffer,
  contentType: string,
  returnTo: string,
): Promise<Response> {
  const login = `/login?next=${encodeURIComponent(returnTo)}`;
  const store = await cookies();

  let token = store.get(ACCESS_COOKIE)?.value ?? null;
  if (!token) {
    token = await refreshInline();
    if (!token) redirect(login);
  }

  const send = (t: string) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": contentType },
      body: new Blob([bytes], { type: contentType }),
      cache: "no-store",
    });

  try {
    let res = await send(token);
    // 401/403: token purana ya purana role. Naya token lekar ek baar aur.
    if (res.status === 401 || res.status === 403) {
      const fresh = await refreshInline();
      if (!fresh) redirect(login);
      res = await send(fresh);
    }
    return res;
  } catch {
    return new Response(JSON.stringify({ error: "Server se jud nahi paye, baad me try karo" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
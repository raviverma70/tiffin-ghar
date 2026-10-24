import { API_URL } from "@/lib/api";

// Backend har refresh par purana refresh token band kar deta hai, aur band token dobara aaye to
// "chori" maan kar poora session khatam kar deta hai. Ek page ke do request (page + header,
// ya do tab) ek saath refresh karein to yahi hota tha aur user logout ho jata tha.
// Isliye: ek refresh token ka ek hi refresh. Saath wale requests usi ka jawab lete hain,
// aur jawab thodi der yaad rehta hai (der se aane wale request ke liye).

export type RefreshResult =
  | { ok: true; accessToken: string; refreshToken: string }
  | { ok: false; reason: "invalid" } // session sach me khatam: login dobara
  | { ok: false; reason: "network" }; // backend tak nahi pahunche: login mat mitao

const REMEMBER_MS = 60_000;

type Entry = { promise: Promise<RefreshResult>; at: number };

// globalThis par, taaki route handler aur pages (alag module copies) ek hi map dekhein
const store = globalThis as typeof globalThis & { __tgRefresh?: Map<string, Entry> };
const inflight = (store.__tgRefresh ??= new Map<string, Entry>());

async function callRefresh(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      return { ok: true, accessToken: data.accessToken, refreshToken: data.refreshToken };
    }
    // 429 (bahut koshish) ya 5xx: session galat nahi hai, baad me try
    if (res.status === 429 || res.status >= 500) return { ok: false, reason: "network" };
    return { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "network" };
  }
}

export function refreshOnce(refreshToken: string): Promise<RefreshResult> {
  const now = Date.now();
  for (const [key, entry] of inflight) if (now - entry.at > REMEMBER_MS) inflight.delete(key);

  const existing = inflight.get(refreshToken);
  if (existing) return existing.promise;

  const promise = callRefresh(refreshToken).then((result) => {
    // Network fail yaad mat rakho, agli baar dobara try ho
    if (!result.ok && result.reason === "network") inflight.delete(refreshToken);
    return result;
  });
  inflight.set(refreshToken, { promise, at: now });
  return promise;
}

import { API_URL } from "./config";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens, type Tokens } from "./tokens";

// Error ka text backend wala Hinglish hi rehta hai, screen par translateError(t, error) se dikhao
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // true: token lagao, 401 par refresh karke ek baar dobara try
};

const NETWORK_ERROR = "Server se jud nahi paye, baad me try karo";
const GENERIC_ERROR = "Kuch gadbad hui, baad me try karo";
const REQUEST_TIMEOUT_MS = 15_000;

async function send<T>(path: string, opts: Options, accessToken?: string): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  // Galat IP par phone ka fetch bahut der tak atka rehta hai (spinner chalta rehta tha).
  // 15 second me jawab nahi to ruk jao aur "server se jud nahi paye" dikhao.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, status: res.status, error: json?.error ?? GENERIC_ERROR };
    }
    return { ok: true, data: json as T };
  } catch {
    // backend band hai, galat IP hai, internet nahi, ya 15 second me jawab nahi
    return { ok: false, status: 0, error: NETWORK_ERROR };
  } finally {
    clearTimeout(timer);
  }
}

// Session khatam (refresh token bekaar) hone par login screen dikhane ke liye
type Listener = () => void;
const sessionEndedListeners = new Set<Listener>();

export function onSessionEnded(listener: Listener) {
  sessionEndedListeners.add(listener);
  return () => {
    sessionEndedListeners.delete(listener);
  };
}

// Backend har refresh par purana refresh token band kar deta hai. Do refresh saath chale to
// doosra "session khatam" de dega, isliye ek waqt par ek hi refresh chalta hai, baaki usi ka intezaar karte hain.
let refreshing: Promise<ApiResult<string>> | null = null;

function refreshAccessToken(): Promise<ApiResult<string>> {
  refreshing ??= (async (): Promise<ApiResult<string>> => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return { ok: false, status: 401, error: "Login zaroori hai" };

    const res = await send<Tokens>("/auth/refresh", { method: "POST", body: { refreshToken } });
    if (res.ok) {
      await saveTokens(res.data);
      return { ok: true, data: res.data.accessToken };
    }
    // Network ya rate limit me tokens mat hatao, sirf jab backend token ko galat bataye
    if (res.status === 400 || res.status === 401) {
      await clearTokens();
      sessionEndedListeners.forEach((listener) => listener());
    }
    return res;
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(path: string, opts: Options = {}): Promise<ApiResult<T>> {
  if (!opts.auth) return send<T>(path, opts);

  const token = await getAccessToken();
  if (token) {
    const res = await send<T>(path, opts, token);
    if (res.ok || res.status !== 401) return res;

    // Is beech kisi aur request ne naya token le liya ho to wahi use karo
    const latest = await getAccessToken();
    if (latest && latest !== token) return send<T>(path, opts, latest);
  }

  const fresh = await refreshAccessToken();
  if (!fresh.ok) return fresh;
  return send<T>(path, opts, fresh.data);
}

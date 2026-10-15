export const API_URL = process.env.API_URL ?? "http://localhost:5000/api/v1";

export type Provider = {
  id: number;
  shopName: string;
  city: string;
  pincode: string;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  dayOfWeek: number | null;
};

export type TodayMenu = {
  provider: Provider;
  day: number;
  items: MenuItem[];
};

export async function getProviders(city: string) {
  const res = await fetch(`${API_URL}/providers?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Kuch gadbad hui, baad me try karo");
  }

  return (await res.json()) as {
    items: Provider[];
    total: number;
    page: number;
    limit: number;
  };
}

// Dukaan band ho ya mili na ho to null deta hai
export async function getMenu(id: string) {
  const res = await fetch(`${API_URL}/providers/${encodeURIComponent(id)}/menu`, {
    cache: "no-store",
  });

  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error("Kuch gadbad hui, baad me try karo");

  return (await res.json()) as TodayMenu;
}

// Paise ko rupaye me dikhao: 8500 -> ₹85
export function formatPrice(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
// ---------- Login (Step 5.3) ----------

export type User = {
  id: number;
  phone: string;
  role: string;
  createdAt: string;
};

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json?.error ?? "Kuch gadbad hui, baad me try karo",
      };
    }
    return { ok: true, data: json as T };
  } catch {
    // backend band hai ya network nahi
    return { ok: false, status: 0, error: "Server se baat nahi ho paayi, baad me try karo" };
  }
}

export function sendOtp(phone: string) {
  return post<unknown>("/auth/send-otp", { phone });
}

export function verifyOtp(phone: string, code: string) {
  return post<Tokens & { user: User }>("/auth/verify-otp", { phone, code });
}

export function refreshTokens(refreshToken: string) {
  return post<Tokens>("/auth/refresh", { refreshToken });
}

export function logoutApi(refreshToken: string) {
  return post<unknown>("/auth/logout", { refreshToken });
}

// Token sahi hai to user deta hai, warna null
export async function getMe(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body.user ?? body) as User;
  } catch {
    return null;
  }
}
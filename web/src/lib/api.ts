export const API_URL = process.env.API_URL ?? "http://localhost:5000/api/v1";

export type Provider = {
  id: number;
  shopName: string;
  city: string;
  pincode: string;
    photoUrl: string | null;
  rating: number | null;
  ratingCount: number;
};

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  dayOfWeek: number | null;
    photoUrl: string | null;
};

export type TodayMenu = {
  provider: Provider;
  day: number;
  items: MenuItem[];
};

type MealTime = "BREAKFAST" | "LUNCH" | "DINNER";

// Front page ka card: dukaan + doori + aaj ki jhalak
export type ShopCard = Provider & {
  area: string | null;
  distanceKm: number | null;
  inArea: boolean;
  isVerified: boolean;
  isPureVeg: boolean;
  planCount: number;
  startingPricePaise: number | null;
  todayPreview: { name: string; pricePaise: number; isVeg: boolean; mealTime: MealTime }[];
  topReview: { rating: number; comment: string } | null;
};

export type ShopQuery = {
  city?: string;
  area?: string;
  lat?: number;
  lng?: number;
  sort?: "distance" | "rating";
  veg?: boolean;
};

export async function getProviders(q: ShopQuery) {
  const params = new URLSearchParams();
  if (q.city) params.set("city", q.city);
  if (q.area) params.set("area", q.area);
  if (q.lat !== undefined && q.lng !== undefined) {
    params.set("lat", String(q.lat));
    params.set("lng", String(q.lng));
  }
  if (q.sort) params.set("sort", q.sort);
  if (q.veg) params.set("veg", "1");
  params.set("limit", "50");

  const res = await fetch(`${API_URL}/providers?${params}`, { cache: "no-store" });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Kuch gadbad hui, baad me try karo");
  }

  return (await res.json()) as {
    items: ShopCard[];
    total: number;
    page: number;
    limit: number;
    sort: "distance" | "rating";
  };
}

// Front page ki "Subscription plans" row
export type PlanCard = {
  id: number;
  name: string;
  description: string | null;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
  dayMenus: { mealTime: MealTime; dishes: string[] }[];
  provider: Provider & { area: string | null };
  inArea: boolean;
};

// Fail ho to khali list (plans ki row na dikhe, page na toote)
export async function getPlans(city: string, area?: string): Promise<PlanCard[]> {
  const params = new URLSearchParams({ city, limit: "12" });
  if (area) params.set("area", area);
  try {
    const res = await fetch(`${API_URL}/plans?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    return ((await res.json()) as { items: PlanCard[] }).items;
  } catch {
    return [];
  }
}

// Jin shehron me dukaanein hain. Fail ho to khali list
export async function getCities(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/providers/cities`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: { city: string }[] };
    return data.items.map((c) => c.city);
  } catch {
    return [];
  }
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
// Shehar ke area jahan dukaanein hain (form ke suggestion ke liye). Fail ho to khali list
export async function getAreas(city: string): Promise<string[]> {
  if (city.trim().length < 2) return [];
  try {
    const res = await fetch(`${API_URL}/providers/areas?city=${encodeURIComponent(city)}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = (await res.json()) as { items: { area: string }[] };
    return data.items.map((a) => a.area);
  } catch {
    return [];
  }
}

// Dukaan ke page ka upar wala hissa (band ho tab bhi milta hai)
export type ShopDetail = Provider & {
  area: string | null;
  isOpen: boolean;
  isVerified: boolean;
  isPureVeg: boolean;
  planCount: number;
};

export async function getShop(id: string): Promise<ShopDetail | null> {
  try {
    const res = await fetch(`${API_URL}/providers/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as ShopDetail;
  } catch {
    return null;
  }
}

export type DayMenu = { day: number; mealTime: MealTime; dishes: string[] };

// Dukaan ka plan, poore din-wise menu ke saath
export type PublicPlan = {
  id: number;
  providerId: number;
  name: string;
  description: string | null;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
  dayMenus: DayMenu[];
};

export async function getShopPlans(id: string): Promise<PublicPlan[]> {
  try {
    const res = await fetch(`${API_URL}/providers/${encodeURIComponent(id)}/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    return ((await res.json()) as { items: PublicPlan[] }).items;
  } catch {
    return [];
  }
}

export async function getPlan(id: string): Promise<(PublicPlan & { provider: Provider & { area: string | null } }) | null> {
  try {
    const res = await fetch(`${API_URL}/plans/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PublicPlan & { provider: Provider & { area: string | null } };
  } catch {
    return null;
  }
}

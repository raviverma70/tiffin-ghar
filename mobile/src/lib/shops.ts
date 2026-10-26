import { api } from "./api";
import type { MealTime } from "./meals";

// Backend /providers ka card (website ke ShopCard jaisa)
export type Shop = {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  pincode: string;
  photoUrl: string | null;
  rating: number | null;
  ratingCount: number;
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

// Location sirf ~100 meter tak bhejte hain (backend bhi gol karta hai)
const round = (v: number) => Math.round(v * 1000) / 1000;

// { city: "Prayagraj", veg: "1" } -> "city=Prayagraj&veg=1" (khali values chhod do)
function qs(params: Record<string, string | undefined>) {
  return Object.entries(params)
    .filter((e): e is [string, string] => e[1] !== undefined && e[1] !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export function getShops(q: ShopQuery) {
  const hasLoc = q.lat !== undefined && q.lng !== undefined;
  const query = qs({
    city: q.city,
    area: q.area,
    lat: hasLoc ? String(round(q.lat!)) : undefined,
    lng: hasLoc ? String(round(q.lng!)) : undefined,
    sort: q.sort,
    veg: q.veg ? "1" : undefined,
    limit: "50",
  });
  return api<{ items: Shop[]; total: number; sort: "distance" | "rating" }>(`/providers?${query}`);
}

export type PlanCard = {
  id: number;
  name: string;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
  dayMenus: { mealTime: MealTime; dishes: string[] }[];
  provider: { id: number; shopName: string; area: string | null; rating: number | null; ratingCount: number };
};

export function getPlans(city: string, area?: string) {
  return api<{ items: PlanCard[] }>(`/plans?${qs({ city, area, limit: "12" })}`);
}

export function getCities() {
  return api<{ items: { city: string; shops: number }[] }>("/providers/cities");
}

export function getAreas(city: string) {
  return api<{ items: { area: string; shops: number }[] }>(`/providers/areas?city=${encodeURIComponent(city)}`);
}

// Dukaan ki jaankari (band ho tab bhi)
export type ShopDetail = {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  pincode: string;
  photoUrl: string | null;
  isOpen: boolean;
  rating: number | null;
  ratingCount: number;
  isVerified: boolean;
  isPureVeg: boolean;
  planCount: number;
};

export function getShop(id: string) {
  return api<ShopDetail>(`/providers/${encodeURIComponent(id)}`);
}

// ---------- Dukaan ki screen (Step 5) ----------

export type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  pricePaise: number;
  isVeg: boolean;
  mealTime: MealTime;
  photoUrl: string | null;
};

// Aaj ka menu (sirf khuli dukaan; band ho to 404)
export function getTodayMenu(id: string) {
  return api<{ day: number; items: MenuItem[] }>(`/providers/${encodeURIComponent(id)}/menu`);
}

export type ShopPlan = {
  id: number;
  name: string;
  description: string | null;
  days: number;
  mealTimes: MealTime[];
  pricePaise: number;
  isVeg: boolean;
  dayMenus: { day: number; mealTime: MealTime; dishes: string[] }[];
};

export function getShopPlans(id: string) {
  return api<{ items: ShopPlan[] }>(`/providers/${encodeURIComponent(id)}/plans`);
}

export type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: string;
  photos: { id: number; url: string }[];
};

export function getReviews(id: string, page = 1) {
  return api<{ items: Review[]; total: number }>(
    `/providers/${encodeURIComponent(id)}/reviews?${qs({ page: String(page), limit: "10" })}`,
  );
}

// Order (COD). Daam backend database se leta hai, hum sirf item aur quantity bhejte hain.
export function placeOrder(body: {
  providerId: number;
  items: { menuItemId: number; quantity: number }[];
  deliveryAddress: string;
  note?: string;
}) {
  return api<{ id: number; totalPaise: number }>("/orders", { method: "POST", body, auth: true });
}

// ---------- Pasandida ----------

export function getFavouriteIds() {
  return api<{ items: { id: number }[] }>("/me/favourites", { auth: true });
}

export function setFavourite(providerId: number, favourite: boolean) {
  return api<{ favourite: boolean }>(`/me/favourites/${providerId}`, {
    method: favourite ? "PUT" : "DELETE",
    auth: true,
  });
}

export type FavouriteShop = {
  id: number;
  shopName: string;
  city: string;
  area: string | null;
  photoUrl: string | null;
  isOpen: boolean;
  rating: number | null;
  ratingCount: number;
};

export function getFavourites() {
  return api<{ items: FavouriteShop[] }>("/me/favourites", { auth: true });
}

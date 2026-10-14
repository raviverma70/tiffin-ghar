const API_URL = process.env.API_URL ?? "http://localhost:5000/api/v1";

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
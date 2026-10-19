import { API_URL } from "@/lib/api";

export type ReviewItem = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: string;
};

export type ReviewsPage = {
  provider: { id: number; shopName: string; rating: number | null; ratingCount: number };
  items: ReviewItem[];
  total: number;
  page: number;
  limit: number;
};

// Dukaan na mili (ya approve na ho) to null
export async function getReviews(id: string | number, page = 1, limit = 20): Promise<ReviewsPage | null> {
  try {
    const res = await fetch(
      `${API_URL}/providers/${encodeURIComponent(String(id))}/reviews?page=${page}&limit=${limit}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return (await res.json()) as ReviewsPage;
  } catch {
    return null;
  }
}
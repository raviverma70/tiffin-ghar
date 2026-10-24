"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { uploadImage } from "@/lib/upload";
import { apiError, getT } from "@/i18n/server";

export type ReviewState = { error: string };

export async function cancelOrderAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  await authedFetch(`/orders/${id}/cancel`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "PATCH",
  });

  // Chahe cancel hua ho ya nahi, page par order ka asli status dikhega
  redirect(`/orders/${id}`);
}

export async function submitReviewAction(_prev: ReviewState, fd: FormData): Promise<ReviewState> {
  const id = String(fd.get("id") ?? "");
  if (!/^\d{1,10}$/.test(id)) redirect("/orders");

  const rating = Number(String(fd.get("rating") ?? ""));
  const comment = String(fd.get("comment") ?? "").trim();

  const res = await authedFetch(`/orders/${id}/review`, {
    mode: "action",
    returnTo: `/orders/${id}`,
    method: "POST",
    body: { rating, comment: comment || undefined },
  });

  if (!res.ok) return { error: await apiError(res) };

  // Review ban gaya, ab photos (3 tak). Koi photo fail ho to review nahi rukta, page par batate hain.
  const review = (await res.json()) as { id: number };
  const photos = fd
    .getAll("photos")
    .filter((p): p is File => p instanceof File && p.size > 0 && p.size <= MAX_PHOTO_BYTES)
    .slice(0, MAX_REVIEW_PHOTOS);
  let failed = fd.getAll("photos").length > photos.length;
  for (const photo of photos) {
    const up = await uploadImage(`/reviews/${review.id}/photos`, await photo.arrayBuffer(), photo.type || "image/jpeg", `/orders/${id}`);
    if (!up.ok) failed = true;
  }

  revalidatePath(`/orders/${id}`);
  redirect(failed ? `/orders/${id}?photoError=1` : `/orders/${id}`);
}

// ---------- Review ki photo baad me jodna / hatana ----------

export type ReviewPhotoState = { error: string };

const MAX_PHOTO_BYTES = 400_000;
const MAX_REVIEW_PHOTOS = 3;

function isId(value: string) {
  return /^\d{1,10}$/.test(value);
}

export async function addReviewPhotoAction(_prev: ReviewPhotoState, fd: FormData): Promise<ReviewPhotoState> {
  const { t } = await getT();
  const orderId = String(fd.get("orderId") ?? "");
  const reviewId = String(fd.get("reviewId") ?? "");
  const file = fd.get("file");
  if (!isId(orderId) || !isId(reviewId)) return { error: t("err.reviewNotFound") };
  if (!(file instanceof File) || file.size === 0) return { error: t("err.photoMissing") };
  if (file.size > MAX_PHOTO_BYTES) return { error: t("err.photoLarge") };

  const res = await uploadImage(`/reviews/${reviewId}/photos`, await file.arrayBuffer(), file.type || "image/jpeg", `/orders/${orderId}`);
  if (!res.ok) return { error: await apiError(res) };

  revalidatePath(`/orders/${orderId}`);
  return { error: "" };
}

export async function removeReviewPhotoAction(fd: FormData): Promise<void> {
  const orderId = String(fd.get("orderId") ?? "");
  const reviewId = String(fd.get("reviewId") ?? "");
  const photoId = String(fd.get("photoId") ?? "");
  if (![orderId, reviewId, photoId].every(isId)) redirect("/orders");

  await authedFetch(`/reviews/${reviewId}/photos/${photoId}`, {
    mode: "action",
    returnTo: `/orders/${orderId}`,
    method: "DELETE",
  });
  revalidatePath(`/orders/${orderId}`);
  redirect(`/orders/${orderId}`);
}

import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { api } from "./api";

export const MAX_REVIEW_PHOTOS = 3;
// Backend 2 MB tak leta hai; hum 1000px aur JPG 70% karke ~200 KB bhejte hain
const MAX_SIDE = 1000;

export type ReviewPhoto = { id: number; url: string };

export function postReview(orderId: number, rating: number, comment: string) {
  return api<{ id: number; rating: number; comment: string | null; photos: ReviewPhoto[] }>(`/orders/${orderId}/review`, {
    method: "POST",
    body: { rating, comment: comment.trim() || undefined },
    auth: true,
  });
}

// Phone ki photo (file:// uri) ko review par lagao
export async function uploadReviewPhoto(reviewId: number, uri: string) {
  let blob: Blob;
  try {
    blob = await (await fetch(uri)).blob();
  } catch {
    return { ok: false as const, status: 0, error: "Ye photo sahi nahi hai. JPG, PNG ya WebP bhejo" };
  }
  return api<ReviewPhoto>(`/reviews/${reviewId}/photos`, {
    method: "POST",
    blob,
    contentType: "image/jpeg",
    auth: true,
    timeoutMs: 60_000,
  });
}

export function deleteReviewPhoto(reviewId: number, photoId: number) {
  return api(`/reviews/${reviewId}/photos/${photoId}`, { method: "DELETE", auth: true });
}

// Badi photo ko chhota karo (lambi side 1000px, JPG)
async function shrink(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  const big = Math.max(asset.width, asset.height) > MAX_SIDE;
  if (big) ctx.resize(asset.width >= asset.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  const image = await ctx.renderAsync();
  const result = await image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
  return result.uri;
}

export type PickResult = { uris: string[] } | { error: "denied" | "failed" };

// Gallery ya camera se photo lo (permission maang kar), chhoti karke uri lautao
export async function pickPhotos(source: "gallery" | "camera", limit: number): Promise<PickResult> {
  try {
    if (source === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { error: "denied" };
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (res.canceled) return { uris: [] };
      return { uris: await Promise.all(res.assets.slice(0, 1).map(shrink)) };
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return { error: "denied" };
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: limit > 1,
      selectionLimit: limit,
      quality: 0.8,
    });
    if (res.canceled) return { uris: [] };
    return { uris: await Promise.all(res.assets.slice(0, limit).map(shrink)) };
  } catch {
    return { error: "failed" };
  }
}

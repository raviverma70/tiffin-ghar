// Browser me photo ko chhota karke JPG banata hai (sirf client components me use karo).
// maxSide: lambi side kitne px tak, maxBytes: file kitni badi ho sakti hai.
export async function compressImage(
  file: File,
  { maxSide = 1200, maxBytes = 850_000 }: { maxSide?: number; maxBytes?: number } = {},
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  for (const q of [0.85, 0.7, 0.55, 0.4]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", q));
    if (blob && blob.size <= maxBytes) return new File([blob], "photo.jpg", { type: "image/jpeg" });
  }
  throw new Error("big");
}

// Review ki photo: 3 ek saath server action me jati hain (Next.js ki 1 MB seema), isliye chhoti
export const REVIEW_PHOTO = { maxSide: 1000, maxBytes: 300_000 };
export const MAX_REVIEW_PHOTOS = 3;

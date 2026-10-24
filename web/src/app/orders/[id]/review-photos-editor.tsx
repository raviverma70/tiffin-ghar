"use client";

import { useActionState, useRef, useState, useTransition, type ChangeEvent } from "react";
import { addReviewPhotoAction, removeReviewPhotoAction, type ReviewPhotoState } from "../actions";
import { compressImage, MAX_REVIEW_PHOTOS, REVIEW_PHOTO } from "@/lib/compress-image";
import { useT } from "@/i18n/client";

const initial: ReviewPhotoState = { error: "" };

// Review de diya: ab photo jodo (3 tak) ya hatao
export default function ReviewPhotosEditor({
  orderId,
  reviewId,
  photos,
}: {
  orderId: number;
  reviewId: number;
  // src server par bana hua (photoSrc), client me API ka pata nahi hota
  photos: { id: number; src: string }[];
}) {
  const t = useT();
  const [state, upload, uploading] = useActionState(addReviewPhotoAction, initial);
  const [localError, setLocalError] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLocalError("");
    if (!file.type.startsWith("image/")) {
      setLocalError(t("err.photoOnly"));
      return;
    }
    try {
      const small = await compressImage(file, REVIEW_PHOTO);
      const fd = new FormData();
      fd.set("orderId", String(orderId));
      fd.set("reviewId", String(reviewId));
      fd.set("file", small);
      startTransition(() => upload(fd));
    } catch {
      setLocalError(t("err.photoOpen"));
    }
  }

  const error = localError || state.error;

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {photos.map((p, i) => (
          <div key={p.id} className="relative">
            <a href={p.src} target="_blank" rel="noopener noreferrer" title={t("rphoto.open")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={t("rphoto.preview", { n: i + 1 })}
                className="h-20 w-20 rounded-lg object-cover"
              />
            </a>
            <form action={removeReviewPhotoAction}>
              <input type="hidden" name="orderId" value={orderId} />
              <input type="hidden" name="reviewId" value={reviewId} />
              <input type="hidden" name="photoId" value={p.id} />
              <button
                aria-label={t("rphoto.remove")}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm text-white shadow"
              >
                ×
              </button>
            </form>
          </div>
        ))}
        {photos.length < MAX_REVIEW_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-xs">{uploading ? "..." : `${photos.length}/${MAX_REVIEW_PHOTOS}`}</span>
          </button>
        )}
      </div>
      {photos.length < MAX_REVIEW_PHOTOS && <p className="mt-1 text-xs text-gray-500">{t("rphoto.hint")}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { submitReviewAction, type ReviewState } from "../actions";
import { compressImage, MAX_REVIEW_PHOTOS, REVIEW_PHOTO } from "@/lib/compress-image";
import { useT } from "@/i18n/client";

const initial: ReviewState = { error: "" };

type Picked = { file: File; url: string };

export default function ReviewForm({ orderId }: { orderId: number }) {
  const t = useT();
  const [state, action, pending] = useActionState(submitReviewAction, initial);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<Picked[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Preview ke URL page chhodne par saaf karo
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    setPhotoError("");
    const room = MAX_REVIEW_PHOTOS - photos.length;
    if (files.length > room) setPhotoError(t("rphoto.max"));

    setBusy(true);
    const added: Picked[] = [];
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith("image/")) {
        setPhotoError(t("err.photoOnly"));
        continue;
      }
      try {
        const small = await compressImage(file, REVIEW_PHOTO);
        const url = URL.createObjectURL(small);
        urls.current.push(url);
        added.push({ file: small, url });
      } catch {
        setPhotoError(t("err.photoOpen"));
      }
    }
    setPhotos((list) => [...list, ...added].slice(0, MAX_REVIEW_PHOTOS));
    setBusy(false);
  }

  return (
    <form
      action={(fd) => {
        // Chuni hui (chhoti ki hui) photos form ke saath
        for (const p of photos) fd.append("photos", p.file);
        action(fd);
      }}
      className="mt-3 space-y-4"
    >
      <input type="hidden" name="id" value={orderId} />
      <input type="hidden" name="rating" value={rating} />

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            aria-label={t("review.star", { n })}
            aria-pressed={rating === n}
            className={`text-4xl transition hover:scale-110 ${n <= rating ? "text-orange-500" : "text-gray-300"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder={t("review.placeholder")}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
      />

      <div>
        <p className="text-sm font-medium text-gray-700">📷 {t("rphoto.add")}</p>
        <p className="text-xs text-gray-500">{t("rphoto.hint")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={p.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={t("rphoto.preview", { n: i + 1 })} className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((list) => list.filter((x) => x.url !== p.url))}
                aria-label={t("rphoto.remove")}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-sm text-white shadow"
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_REVIEW_PHOTOS && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">{busy ? "..." : `${photos.length}/${MAX_REVIEW_PHOTOS}`}</span>
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={onPick} className="hidden" />
        {photoError && <p className="mt-1 text-sm text-red-600">{photoError}</p>}
      </div>

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        disabled={pending || busy || rating === 0}
        className="rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? t("common.loading") : t("review.submit")}
      </button>
    </form>
  );
}

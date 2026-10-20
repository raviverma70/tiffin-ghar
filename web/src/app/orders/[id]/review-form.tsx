"use client";

import { useActionState, useState } from "react";
import { submitReviewAction, type ReviewState } from "../actions";
import { useT } from "@/i18n/client";

const initial: ReviewState = { error: "" };

export default function ReviewForm({ orderId }: { orderId: number }) {
  const t = useT();
  const [state, action, pending] = useActionState(submitReviewAction, initial);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <form action={action} className="mt-3 space-y-3">
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
            className={n <= rating ? "text-3xl text-orange-500" : "text-3xl text-gray-300"}
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
        className="w-full rounded border px-3 py-2"
      />

      {state.error && <p className="text-red-600">{state.error}</p>}

      <button
        disabled={pending || rating === 0}
        className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? t("common.loading") : t("review.submit")}
      </button>
    </form>
  );
}

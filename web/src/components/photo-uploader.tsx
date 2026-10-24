"use client";

import { useActionState, useRef, useState, useTransition, type ChangeEvent } from "react";
import { removePhotoAction, uploadPhotoAction, type PhotoState } from "@/app/dashboard/actions";
import Thumb from "@/components/thumb";
import { compressImage } from "@/lib/compress-image";
import { useT } from "@/i18n/client";

const initial: PhotoState = { error: "" };

export default function PhotoUploader({
  kind,
  itemId,
  src,
}: {
  kind: "shop" | "menu";
  itemId?: number;
  src: string | null;
}) {
  const t = useT();
  const [upState, upload, uploading] = useActionState(uploadPhotoAction, initial);
  const [rmState, remove, removing] = useActionState(removePhotoAction, initial);
  const [localError, setLocalError] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // wahi photo dobara chun sako
    if (!file) return;

    setLocalError("");
    if (!file.type.startsWith("image/")) {
      setLocalError(t("err.photoOnly"));
      return;
    }

    try {
      const photo = await compressImage(file);
      const fd = new FormData();
      fd.set("kind", kind);
      if (itemId) fd.set("id", String(itemId));
      fd.set("file", photo);
      startTransition(() => upload(fd));
    } catch {
      setLocalError(t("err.photoOpen"));
    }
  }

  const error = localError || upState.error || rmState.error;

  return (
    <div className="flex items-center gap-3">
      <Thumb src={src} alt={t("photo.alt")} className="h-20 w-20 shrink-0 rounded-lg" />

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || removing}
            className="rounded border px-3 py-1 text-sm hover:bg-orange-50 disabled:opacity-50"
          >
            {uploading ? t("photo.uploading") : src ? t("photo.change") : t("photo.add")}
          </button>

          {src && (
            <form action={remove}>
              <input type="hidden" name="kind" value={kind} />
              {itemId && <input type="hidden" name="id" value={itemId} />}
              <button
                disabled={uploading || removing}
                className="rounded border border-red-600 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
              >
                {removing ? t("common.loading") : t("common.remove")}
              </button>
            </form>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={onPick} className="hidden" />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

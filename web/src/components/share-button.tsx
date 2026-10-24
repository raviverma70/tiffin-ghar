"use client";

import { useState } from "react";
import { useT } from "@/i18n/client";

// Phone par share ka apna menu (WhatsApp waghera), PC par link copy
export default function ShareButton({ title, text }: { title: string; text: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // customer ne share band kar diya: kuch nahi karna
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-orange-50"
    >
      <span aria-hidden>↗</span>
      <span aria-live="polite">{copied ? t("share.copied") : t("share.button")}</span>
    </button>
  );
}

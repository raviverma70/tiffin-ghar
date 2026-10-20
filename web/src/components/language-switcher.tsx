"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/config";
import { setLanguageAction } from "@/i18n/actions";
import { useT } from "@/i18n/client";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={t("nav.language")}
      value={locale}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await setLanguageAction(next);
          router.refresh();
        });
      }}
      className="rounded border bg-white px-2 py-1 text-sm"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_LABEL[l]}
        </option>
      ))}
    </select>
  );
}

"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { MessageKey } from "./messages/hinglish";
import { makeT, type Translator } from "./translate";

type Ctx = { locale: Locale; t: Translator };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Record<MessageKey, string>;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: makeT(messages) }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Client components me: const t = useT();
export function useT(): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT ko I18nProvider ke andar use karo");
  return ctx.t;
}

export function useLocale(): Locale {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useLocale ko I18nProvider ke andar use karo");
  return ctx.locale;
}

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { api } from "@/lib/api";
import { getRefreshToken } from "@/lib/tokens";
import { DEFAULT_LOCALE, isLocale, makeT, messagesFor, type Locale, type Translator } from "./shared";

// Chuni hui bhasha phone me yaad rehti hai (web ki tg_lang cookie jaisi)
const LOCALE_KEY = "tg_lang";

function savedLocale(): Locale {
  try {
    const value = SecureStore.getItem(LOCALE_KEY);
    return isLocale(value) ? value : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

type Ctx = { locale: Locale; t: Translator; setLocale: (locale: Locale) => void };

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(savedLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    SecureStore.setItemAsync(LOCALE_KEY, next).catch(() => {});

    // Login hai to database me bhi (website par bhi wahi bhasha khule). Fail ho to koi baat nahi
    getRefreshToken()
      .then((refreshToken) => {
        if (refreshToken) return api("/me/language", { method: "PATCH", body: { language: next }, auth: true });
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => ({ locale, t: makeT(messagesFor(locale)), setLocale }), [locale, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT ko I18nProvider ke andar use karo");
  return ctx;
}

// Screens me: const t = useT();
export function useT(): Translator {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useSetLocale(): (locale: Locale) => void {
  return useI18n().setLocale;
}

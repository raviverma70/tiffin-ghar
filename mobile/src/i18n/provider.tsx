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

type Ctx = {
  locale: Locale;
  t: Translator;
  setLocale: (locale: Locale) => void;
  syncAfterLogin: (serverLanguage: string | null) => void;
};

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

  // Login ke baad (web ke syncLanguageAfterLogin jaisa): phone par bhasha pehle se chuni hai to
  // database me bhejo, warna database wali bhasha phone par lagao.
  const syncAfterLogin = useCallback((serverLanguage: string | null) => {
    let phoneChoice: string | null = null;
    try {
      phoneChoice = SecureStore.getItem(LOCALE_KEY);
    } catch {
      phoneChoice = null;
    }

    if (isLocale(phoneChoice)) {
      if (phoneChoice !== serverLanguage) {
        api("/me/language", { method: "PATCH", body: { language: phoneChoice }, auth: true }).catch(() => {});
      }
    } else if (isLocale(serverLanguage)) {
      setLocaleState(serverLanguage);
      SecureStore.setItemAsync(LOCALE_KEY, serverLanguage).catch(() => {});
    }
  }, []);

  const value = useMemo(
    () => ({ locale, t: makeT(messagesFor(locale)), setLocale, syncAfterLogin }),
    [locale, setLocale, syncAfterLogin],
  );
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

export function useSyncLanguage(): (serverLanguage: string | null) => void {
  return useI18n().syncAfterLogin;
}

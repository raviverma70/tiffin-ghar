"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { authedFetch } from "@/lib/authed";
import { getSession } from "@/lib/session";
import { LOCALE_COOKIE, isLocale } from "./config";
import { LOCALE_COOKIE_OPTIONS } from "./server";

export async function setLanguageAction(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, LOCALE_COOKIE_OPTIONS);

  // Login hai to database me bhi yaad rakho (mobile app me bhi wahi bhasha khule)
  const session = await getSession();
  if (session.status === "user") {
    await authedFetch("/me/language", {
      mode: "action",
      returnTo: "/",
      method: "PATCH",
      body: { language: locale },
    });
  }

  revalidatePath("/", "layout");
}

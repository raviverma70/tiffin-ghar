import type { Locale } from "../config";
import { hinglish, type MessageKey } from "./hinglish";
import { hi } from "./hi";
import { en } from "./en";

// Sirf server par use hota hai, client ko sirf chuni hui bhasha ke messages milte hain
export function messagesFor(locale: Locale): Record<MessageKey, string> {
  if (locale === "hi") return hi;
  if (locale === "en") return en;
  return hinglish;
}

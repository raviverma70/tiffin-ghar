import type { MessageKey } from "./messages/hinglish";

export type Vars = Record<string, string | number>;
export type Translator = (key: MessageKey, vars?: Vars) => string;

// "{n} item" jaise text me {n} ki jagah value
export function makeT(messages: Record<MessageKey, string>): Translator {
  return (key, vars) => {
    const msg = messages[key] ?? key;
    if (!vars) return msg;
    return msg.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
  };
}

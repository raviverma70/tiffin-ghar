"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { useT } from "@/i18n/client";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onValueChange: (value: string) => void;
  suggestions: readonly string[];
  // true: chip dabane par ", " ke saath jodta hai (jaise "Dal, Chawal"), warna poora value badalta hai
  append?: boolean;
  textarea?: boolean;
  rows?: number;
};

const chip =
  "rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm text-orange-800 transition hover:border-orange-400 hover:bg-orange-100";

// Box par click karte hi neeche suggestion chips dikhte hain. Chip dabao to bhar jata hai, khud bhi likh sakte ho.
export default function SuggestInput({
  value,
  onValueChange,
  suggestions,
  append = false,
  textarea = false,
  rows = 2,
  className,
  ...rest
}: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const hintId = useId();

  const current = value.trim().toLowerCase();
  const parts = value
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  // Jo pehle se bhara hai wo chip dobara mat dikhao. Likhte waqt milte-julte upar.
  const lastPart = append ? (value.split(",").pop() ?? "").trim().toLowerCase() : current;
  const shown = suggestions
    .filter((s) => (append ? !parts.includes(s.toLowerCase()) : s.toLowerCase() !== current))
    .sort((a, b) => Number(b.toLowerCase().startsWith(lastPart)) - Number(a.toLowerCase().startsWith(lastPart)))
    .slice(0, 12);

  function pick(s: string) {
    if (!append) {
      onValueChange(s);
      return;
    }
    // Aadha likha shabd ho to usi ki jagah chip lagao
    const pieces = value.split(",").map((p) => p.trim());
    const lastTyped = pieces[pieces.length - 1] ?? "";
    if (lastTyped && s.toLowerCase().startsWith(lastTyped.toLowerCase())) pieces.pop();
    onValueChange([...pieces.filter(Boolean), s].join(", "));
  }

  const common = {
    ...rest,
    value,
    "aria-describedby": hintId,
    onChange: (e: { target: { value: string } }) => onValueChange(e.target.value),
    onFocus: () => setOpen(true),
    className,
  };

  return (
    <div>
      {textarea ? (
        <textarea {...(common as InputHTMLAttributes<HTMLTextAreaElement>)} rows={rows} />
      ) : (
        <input {...common} />
      )}
      {open && shown.length > 0 && (
        <div className="mt-2">
          <p id={hintId} className="text-xs text-gray-500">
            {t("sugg.hint")}
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            {shown.map((s) => (
              <button
                key={s}
                type="button"
                // mousedown par focus nahi jata, isliye chips band nahi hote
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
                className={chip}
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

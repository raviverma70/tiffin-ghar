"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { useT } from "@/i18n/client";

const initial: LoginState = { step: "phone", phone: "", error: "" };
const field = "mt-1 w-full rounded-lg border bg-white px-3 py-2";

export default function LoginForm({ next }: { next: string }) {
  const t = useT();
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="next" value={next} />

      {state.step === "phone" ? (
        <>
          <label className="block text-sm">
            {t("login.phone")}
            <input
              name="phone"
              defaultValue={state.phone}
              required
              inputMode="numeric"
              autoComplete="tel"
              pattern="\d{10}"
              maxLength={10}
              className={field}
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("login.sendOtp")}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">{t("login.otpFor", { phone: state.phone })}</p>

          <label className="block text-sm">
            {t("login.otp")}
            <input
              name="code"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              className={field}
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-medium text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {pending ? t("common.loading") : t("login.verify")}
          </button>

          <button
            name="intent"
            value="back"
            formNoValidate
            disabled={pending}
            className="w-full rounded-lg border px-4 py-2.5 hover:bg-orange-50"
          >
            {t("login.changeNumber")}
          </button>
        </>
      )}

      {state.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}

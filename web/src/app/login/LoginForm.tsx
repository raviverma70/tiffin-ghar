"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { step: "phone", phone: "", error: "" };

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.step === "phone" ? (
        <>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            defaultValue={state.phone}
            placeholder="10 digit ka mobile number"
            required
            className="w-full rounded border px-3 py-2"
          />
          <button
            disabled={pending}
            className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {pending ? "Bhej rahe hain..." : "OTP bhejo"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600">OTP {state.phone} par bheja gaya hai.</p>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="6 digit ka OTP"
            required
            className="w-full rounded border px-3 py-2"
          />
          <div className="flex items-center gap-4">
            <button
              disabled={pending}
              className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {pending ? "Check kar rahe hain..." : "Login karo"}
            </button>
            <button
              type="submit"
              name="intent"
              value="back"
              formNoValidate
              className="text-sm text-orange-600"
            >
              Number badlo / OTP dobara maango
            </button>
          </div>
        </>
      )}

      {state.error && <p className="text-red-600">{state.error}</p>}
    </form>
  );
}
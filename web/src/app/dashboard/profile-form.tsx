"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type FormState } from "./actions";

type Profile = {
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
};

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border px-3 py-2";

export default function ProfileForm({
  mode,
  profile,
}: {
  mode: "create" | "edit";
  profile?: Profile;
}) {
  const [state, action, pending] = useActionState(
    mode === "create" ? createProfileAction : updateProfileAction,
    initial,
  );
  const [shopName, setShopName] = useState(profile?.shopName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [pincode, setPincode] = useState(profile?.pincode ?? "");
  const [fssai, setFssai] = useState(profile?.fssaiNumber ?? "");

  return (
    <form action={action} className="space-y-3">
      <label className="block text-sm">
        Dukaan ka naam
        <input
          name="shopName"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
          maxLength={80}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Shehar
        <input
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          maxLength={60}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Poora pata
        <textarea
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          minLength={5}
          maxLength={200}
          rows={2}
          className={field}
        />
      </label>

      <label className="block text-sm">
        Pincode (6 digit)
        <input
          name="pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          required
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          className={field}
        />
      </label>

      <label className="block text-sm">
        FSSAI number (14 digit, abhi nahi hai to khali chhodo)
        <input
          name="fssaiNumber"
          value={fssai}
          onChange={(e) => setFssai(e.target.value)}
          inputMode="numeric"
          pattern="\d{14}"
          maxLength={14}
          className={field}
        />
      </label>

      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.saved && !state.error && <p className="text-green-600">Save ho gaya.</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? "Ruko..." : mode === "create" ? "Dukaan ki profile banao" : "Save karo"}
      </button>
    </form>
  );
}
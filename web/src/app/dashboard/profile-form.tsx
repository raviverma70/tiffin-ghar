"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type FormState } from "./actions";
import { useT } from "@/i18n/client";

type Profile = {
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
};

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded border bg-white px-3 py-2";

export default function ProfileForm({
  mode,
  profile,
}: {
  mode: "create" | "edit";
  profile?: Profile;
}) {
  const t = useT();
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
        {t("pf.shopName")}
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
        {t("pf.city")}
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
        {t("pf.address")}
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
        {t("pf.pincode")}
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
        {t("pf.fssai")}
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
      {state.saved && !state.error && <p className="text-green-600">{t("pf.saved")}</p>}

      <button disabled={pending} className="rounded bg-orange-600 px-4 py-2 text-white disabled:opacity-50">
        {pending ? t("common.loading") : mode === "create" ? t("pf.create") : t("common.save")}
      </button>
    </form>
  );
}

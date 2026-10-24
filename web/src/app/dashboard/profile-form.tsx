"use client";

import { useActionState, useState } from "react";
import { createProfileAction, updateProfileAction, type FormState } from "./actions";
import { useT } from "@/i18n/client";
import SuggestInput from "@/components/suggest-input";
import LocationPicker from "@/components/location-picker";
import { CITY_SUGGESTIONS } from "@/lib/suggestions";

type Profile = {
  shopName: string;
  city: string;
  address: string;
  pincode: string;
  fssaiNumber: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
};

const initial: FormState = { error: "" };
const field = "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export default function ProfileForm({
  mode,
  profile,
  areaSuggestions = [],
}: {
  mode: "create" | "edit";
  profile?: Profile;
  areaSuggestions?: string[];
}) {
  const t = useT();
  const [state, action, pending] = useActionState(
    mode === "create" ? createProfileAction : updateProfileAction,
    initial,
  );
  const [shopName, setShopName] = useState(profile?.shopName ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [area, setArea] = useState(profile?.area ?? "");
  const [address, setAddress] = useState(profile?.address ?? "");
  const [pincode, setPincode] = useState(profile?.pincode ?? "");
  const [fssai, setFssai] = useState(profile?.fssaiNumber ?? "");

  const initialCoords =
    profile?.latitude != null && profile.longitude != null
      ? { latitude: profile.latitude, longitude: profile.longitude }
      : null;

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          {t("pf.city")}
          <SuggestInput
            name="city"
            value={city}
            onValueChange={setCity}
            suggestions={CITY_SUGGESTIONS}
            required
            maxLength={60}
            className={field}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          {t("pf.area")}
          <SuggestInput
            name="area"
            value={area}
            onValueChange={setArea}
            suggestions={areaSuggestions}
            maxLength={60}
            className={field}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-gray-700">
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

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
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

        <label className="block text-sm font-medium text-gray-700">
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
      </div>

      <LocationPicker initial={initialCoords} />

      {state.error && <p className="text-red-600">{state.error}</p>}
      {state.saved && !state.error && <p className="text-green-600">{t("pf.saved")}</p>}

      <button
        disabled={pending}
        className="rounded-lg bg-orange-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
      >
        {pending ? t("common.loading") : mode === "create" ? t("pf.create") : t("common.save")}
      </button>
    </form>
  );
}

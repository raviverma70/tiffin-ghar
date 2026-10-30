import { useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { createMenuItem, deleteMenuPhoto, getMyMenu, updateMenuItem, type MyMenuItem } from "@/lib/provider";
import { paiseToRupees, rupeesToPaise } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { pickPhotos, uploadPhoto } from "@/lib/reviews";
import { DAY_KEY } from "@/lib/days";
import { MEAL_ICON, MEAL_KEY, type MealTime } from "@/lib/meals";
import { DESCRIPTION_SUGGESTIONS, DISH_SUGGESTIONS, PRICE_SUGGESTIONS, THALI_SUGGESTIONS } from "@/lib/suggestions";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { SuggestField } from "@/components/SuggestField";
import { Chip } from "@/components/Chip";
import { Button, Card, ErrorText } from "@/components/ui";

const MEALS: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];

// Dish ki photo: gallery/camera se lagao ya hatao (item save hone ke baad hi)
function DishPhoto({ item, onChange }: { item: MyMenuItem; onChange: (photoUrl: string | null) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photo = photoSrc(item.photoUrl);

  async function add(source: "gallery" | "camera") {
    setError("");
    const picked = await pickPhotos(source, 1);
    if ("error" in picked) {
      setError(picked.error === "denied" ? t("mrev.denied") : t("mphoto.fail"));
      return;
    }
    if (picked.uris.length === 0) return;
    setBusy(true);
    const res = await uploadPhoto<{ photoUrl: string }>(`/providers/me/menu/${item.id}/photo`, picked.uris[0]);
    setBusy(false);
    if (res.ok) onChange(res.data.photoUrl);
    else setError(translateError(t, res.error));
  }

  async function remove() {
    setBusy(true);
    const res = await deleteMenuPhoto(item.id);
    setBusy(false);
    if (res.ok) onChange(null);
    else setError(translateError(t, res.error));
  }

  return (
    <Card style={{ gap: 10, padding: 16 }}>
      <Text style={styles.label}>📷 {photo ? t("photo.change") : t("photo.add")}</Text>
      {photo ? <Image source={{ uri: photo }} style={styles.photo} accessibilityLabel={t("photo.alt")} /> : null}
      {busy ? (
        <Text style={styles.muted}>{t("photo.uploading")}</Text>
      ) : (
        <View style={styles.row}>
          <Button title={`🖼️ ${t("mrev.gallery")}`} onPress={() => add("gallery")} variant="outline" style={{ flex: 1 }} />
          <Button title={`📸 ${t("mrev.camera")}`} onPress={() => add("camera")} variant="outline" style={{ flex: 1 }} />
        </View>
      )}
      {photo && !busy ? <Button title={t("common.remove")} onPress={remove} variant="outline" /> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Card>
  );
}

function ItemForm({ id }: { id: number | null }) {
  const t = useT();
  const [item, setItem] = useState<MyMenuItem | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mealTime, setMealTime] = useState<MealTime>("LUNCH");
  const [day, setDay] = useState<number | null>(null);
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  // Badalna ho to purana item bharo (backend me ek item ka GET nahi, isliye list se dhoondte hain)
  useEffect(() => {
    if (id === null) return;
    let alive = true;
    void getMyMenu().then((res) => {
      if (!alive) return;
      setLoading(false);
      if (!res.ok) return setError(translateError(t, res.error));
      const found = res.data.find((i) => i.id === id);
      if (!found) return setError(t("mmenu.notFound"));
      setItem(found);
      setName(found.name);
      setDescription(found.description ?? "");
      setPrice(paiseToRupees(found.pricePaise));
      setMealTime(found.mealTime);
      setDay(found.dayOfWeek);
      setIsVeg(found.isVeg);
      setIsAvailable(found.isAvailable);
    });
    return () => {
      alive = false;
    };
  }, [id, t]);

  async function save() {
    setError("");
    setSaved("");
    const pricePaise = rupeesToPaise(price);
    if (name.trim().length < 2) return setError(t("mmenu.nameShort"));
    if (pricePaise === null || pricePaise < 100) return setError(t("mmenu.badPrice"));
    const body = { name: name.trim(), description: description.trim(), pricePaise, dayOfWeek: day, isVeg, isAvailable, mealTime };

    setSaving(true);
    const res = item ? await updateMenuItem(item.id, body) : await createMenuItem(body);
    setSaving(false);
    if (!res.ok) return setError(translateError(t, res.error));
    if (item) {
      setItem(res.data);
      setSaved(t("pf.saved"));
    } else {
      // Naya item bana: isi screen ko "badlo" wala bana do, taaki photo laga sakein
      router.replace({ pathname: "/dashboard/menu-item", params: { id: String(res.data.id), added: "1" } });
    }
  }

  if (loading) return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;

  const dishSuggestions = [...new Set([...THALI_SUGGESTIONS, ...DISH_SUGGESTIONS[mealTime]])];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <SuggestField label={t("item.name")} value={name} onChangeText={setName} suggestions={dishSuggestions} maxLength={80} />
        <SuggestField
          label={t("item.desc")}
          value={description}
          onChangeText={setDescription}
          suggestions={DESCRIPTION_SUGGESTIONS}
          maxLength={300}
        />
        <SuggestField
          label={t("item.price")}
          value={price}
          onChangeText={setPrice}
          suggestions={PRICE_SUGGESTIONS}
          keyboardType="decimal-pad"
          maxLength={8}
        />

        <Text style={styles.label}>{t("item.mealTime")}</Text>
        <View style={styles.wrap}>
          {MEALS.map((m) => (
            <Chip key={m} label={`${MEAL_ICON[m]} ${t(MEAL_KEY[m])}`} active={mealTime === m} onPress={() => setMealTime(m)} />
          ))}
        </View>

        <Text style={styles.label}>{t("item.day")}</Text>
        <View style={styles.wrap}>
          <Chip label={t("menu.everyDay")} active={day === null} onPress={() => setDay(null)} />
          {DAY_KEY.map((k, i) => (
            <Chip key={k} label={t(k)} active={day === i} onPress={() => setDay(i)} />
          ))}
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>🟢 {t("item.veg")}</Text>
          <Switch value={isVeg} onValueChange={setIsVeg} trackColor={{ true: colors.green }} accessibilityLabel={t("item.veg")} />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>{t("item.available")}</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ true: colors.orange }}
            accessibilityLabel={t("item.available")}
          />
        </View>

        {error ? <ErrorText>{error}</ErrorText> : null}
        {saved ? <Text style={styles.ok}>✓ {saved}</Text> : null}
        <Button title={item ? t("common.save") : t("item.add")} onPress={save} loading={saving} />

        {item ? (
          <DishPhoto item={item} onChange={(photoUrl) => setItem({ ...item, photoUrl })} />
        ) : (
          <Text style={styles.muted}>{t("mmenu.photoLater")}</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function MenuItemScreen() {
  const t = useT();
  const { id, added } = useLocalSearchParams<{ id?: string; added?: string }>();
  const itemId = id && /^\d{1,10}$/.test(id) ? Number(id) : null;
  return (
    <>
      <Stack.Screen options={{ title: itemId ? t("menu.formEdit") : t("menu.formAdd") }} />
      <ProviderGate>
        {added ? <Text style={styles.banner}>✓ {t("menu.added")}</Text> : null}
        <ItemForm key={itemId ?? "new"} id={itemId} />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 60, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSoft },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  row: { flexDirection: "row", gap: 8 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  switchText: { fontSize: 15, color: colors.text, flex: 1 },
  ok: { color: colors.green, fontWeight: "600" },
  photo: { width: "100%", height: 180, borderRadius: radius.md },
  banner: { backgroundColor: "#f0fdf4", color: colors.green, padding: 12, fontWeight: "600" },
});

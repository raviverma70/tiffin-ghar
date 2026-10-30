import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { createPlan, getMyPlan, updatePlan, type MyPlan } from "@/lib/provider";
import { formatPrice, paiseToRupees, rupeesToPaise } from "@/lib/format";
import { MEAL_ICON, MEAL_KEY, type MealTime } from "@/lib/meals";
import { PLAN_DAYS, PLAN_DESC_SUGGESTIONS, PLAN_NAME_SUGGESTIONS, PLAN_PRICE_SUGGESTIONS } from "@/lib/suggestions";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { SuggestField } from "@/components/SuggestField";
import { Chip } from "@/components/Chip";
import { Button, ErrorText } from "@/components/ui";

const MEALS: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];

// Naya plan ya purane plan ki jaankari (naam, din, time, daam, veg) badlo
function PlanForm({ id }: { id: string | null }) {
  const t = useT();
  const [plan, setPlan] = useState<MyPlan | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState("7");
  const [mealTimes, setMealTimes] = useState<MealTime[]>(["LUNCH"]);
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id === null) return;
    let alive = true;
    void getMyPlan(id).then((res) => {
      if (!alive) return;
      setLoading(false);
      if (!res.ok) return setError(res.status === 404 ? t("plans.notFound") : translateError(t, res.error));
      const p = res.data;
      setPlan(p);
      setName(p.name);
      setDescription(p.description ?? "");
      setDays(String(p.days));
      setMealTimes(p.mealTimes);
      setPrice(paiseToRupees(p.pricePaise));
      setIsVeg(p.isVeg);
    });
    return () => {
      alive = false;
    };
  }, [id, t]);

  // Time hamesha Nashta, Lunch, Dinner ke kram me
  function toggleMeal(m: MealTime) {
    setMealTimes((list) => (list.includes(m) ? list.filter((x) => x !== m) : MEALS.filter((x) => x === m || list.includes(x))));
  }

  // "Lagbhag ₹60 ek khana": daam samajhne me madad (website jaisa)
  const paise = rupeesToPaise(price);
  const nDays = Number(days);
  const meals = Number.isInteger(nDays) && nDays > 0 ? nDays * mealTimes.length : 0;
  const perMeal = paise !== null && meals > 0 ? formatPrice(Math.round(paise / meals)) : null;

  async function save() {
    setError("");
    if (name.trim().length < 2) return setError(t("mplan.nameShort"));
    if (!Number.isInteger(nDays) || nDays < 1 || nDays > 31) return setError(t("mplan.badDays"));
    if (mealTimes.length === 0) return setError(t("mplan.noTimes"));
    if (paise === null || paise < 100) return setError(t("mmenu.badPrice"));
    const body = { name: name.trim(), description: description.trim(), days: nDays, mealTimes, pricePaise: paise, isVeg };

    setSaving(true);
    const res = plan ? await updatePlan(plan.id, body) : await createPlan(body);
    setSaving(false);
    if (!res.ok) return setError(translateError(t, res.error));
    // Naya plan: seedha din-wise menu bharne chalo. Badla: wapas menu screen par (wo taaza ho jayegi)
    if (plan) router.back();
    else router.replace({ pathname: "/dashboard/plan-menu", params: { id: String(res.data.id) } });
  }

  if (loading) return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {!plan && <Text style={styles.hint}>{t("plans.hint")}</Text>}
        <SuggestField label={t("plans.name")} value={name} onChangeText={setName} suggestions={PLAN_NAME_SUGGESTIONS} maxLength={60} />

        <Text style={styles.label}>{t("plans.days")}</Text>
        <View style={styles.wrap}>
          {PLAN_DAYS.map((d) => (
            <Chip key={d} label={t("plans.daysN", { n: d })} active={days === String(d)} onPress={() => setDays(String(d))} />
          ))}
        </View>
        <View style={styles.inline}>
          <Text style={styles.muted}>{t("plans.daysCustom")}</Text>
          <TextInput
            value={days}
            onChangeText={(v) => setDays(v.replace(/\D/g, "").slice(0, 2))}
            keyboardType="number-pad"
            accessibilityLabel={t("plans.daysCustom")}
            style={styles.daysInput}
          />
        </View>

        <Text style={styles.label}>{t("plans.times")}</Text>
        <Text style={styles.muted}>{t("plans.timesHint")}</Text>
        <View style={styles.wrap}>
          {MEALS.map((m) => (
            <Chip key={m} label={`${MEAL_ICON[m]} ${t(MEAL_KEY[m])}`} active={mealTimes.includes(m)} onPress={() => toggleMeal(m)} />
          ))}
        </View>

        <View style={{ gap: 4 }}>
          <SuggestField
            label={t("plans.price")}
            value={price}
            onChangeText={setPrice}
            suggestions={PLAN_PRICE_SUGGESTIONS}
            keyboardType="decimal-pad"
            maxLength={9}
          />
          {perMeal ? <Text style={styles.muted}>{t("plans.perMeal", { price: perMeal })}</Text> : null}
        </View>

        <SuggestField
          label={t("plans.desc")}
          value={description}
          onChangeText={setDescription}
          suggestions={PLAN_DESC_SUGGESTIONS}
          append
          multiline
          maxLength={300}
          style={{ minHeight: 80, textAlignVertical: "top", paddingTop: 12 }}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>🟢 {t("plans.veg")}</Text>
          <Switch value={isVeg} onValueChange={setIsVeg} trackColor={{ true: colors.green }} accessibilityLabel={t("plans.veg")} />
        </View>

        {plan ? <Text style={styles.warn}>{t("plans.settingsNote")}</Text> : null}
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Button
          title={plan ? t("common.save") : t("plans.create")}
          onPress={save}
          loading={saving}
          disabled={mealTimes.length === 0 || (id !== null && !plan)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function PlanFormScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const planId = id && /^\d{1,10}$/.test(id) ? id : null;
  return (
    <>
      <Stack.Screen options={{ title: planId ? t("plans.settings") : t("plans.new") }} />
      <ProviderGate>
        <PlanForm key={planId ?? "new"} id={planId} />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 60, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSoft },
  muted: { fontSize: 13, color: colors.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  inline: { flexDirection: "row", alignItems: "center", gap: 10 },
  daysInput: {
    width: 70,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    textAlign: "center",
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#fff",
  },
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
  warn: { fontSize: 13, color: "#92400e", lineHeight: 19 },
});

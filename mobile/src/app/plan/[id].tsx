import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { addDays, getPlan, subscribe, todayInIndia, type PlanDetail } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { useAuth } from "@/auth/provider";
import { translateError, useLocale, useT } from "@/i18n";
import { RatingBadge } from "@/components/cards";
import { Chip } from "@/components/Chip";
import { DayMenuList } from "@/components/shop/PlansTab";
import { Button, Card, ErrorText, Field } from "@/components/ui";

// Shuru ki tareekh: aaj se 14 din ke chips (backend 30 din tak maanta hai)
const START_CHOICES = 14;

export default function PlanScreen() {
  const t = useT();
  const locale = useLocale();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [plan, setPlan] = useState<PlanDetail | null>(null);
  const [loadError, setLoadError] = useState("");

  const today = todayInIndia();
  const [start, setStart] = useState(today);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getPlan(id).then((res) => {
      if (res.ok) setPlan(res.data);
      else setLoadError(res.status === 404 ? t("plan.notFound") : translateError(t, res.error));
    });
  }, [id, t]);

  if (loadError) {
    return (
      <View style={styles.page}>
        <ErrorText>{loadError}</ErrorText>
      </View>
    );
  }
  if (!plan) {
    return (
      <View style={[styles.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  const meals = plan.days * plan.mealTimes.length;
  const lastDay = addDays(start, plan.days - 1);
  const dates = Array.from({ length: START_CHOICES }, (_, i) => addDays(today, i));
  const dateLabel = (d: string, i: number) =>
    i === 0 ? t("mplan.today") : i === 1 ? t("mplan.tomorrow") : formatDate(`${d}T00:00:00Z`, locale).replace(/ \d{4}$/, "");

  async function submit() {
    if (!plan) return;
    setError("");
    if (address.trim().length < 10) {
      setError(t("err.addressRequired"));
      return;
    }
    setBusy(true);
    const res = await subscribe({
      planId: plan.id,
      startDate: start,
      deliveryAddress: address.trim(),
      note: note.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError(translateError(t, res.error));
      return;
    }
    router.replace({ pathname: "/subscriptions/[id]", params: { id: String(res.data.id), new: "1" } });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: plan.name }} />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.pill}>🗓️ {t("home.planDays", { n: plan.days })}</Text>
          <Text style={styles.title}>{plan.name}</Text>
          <Text style={styles.text}>{t("plan.byShop", { shop: plan.provider.shopName })}</Text>
          <RatingBadge rating={plan.provider.rating} count={plan.provider.ratingCount} />
          <Text style={styles.text}>
            {t("plan.summary", {
              days: plan.days,
              times: plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + "),
            })}
          </Text>
          {plan.description ? <Text style={styles.muted}>{plan.description}</Text> : null}
          <Text style={styles.price}>{formatPrice(plan.pricePaise)}</Text>
          <Text style={styles.muted}>
            {t("plan.perDay", { price: formatPrice(Math.round(plan.pricePaise / plan.days)) })} ·{" "}
            {t("plan.perMeal", { price: formatPrice(Math.round(plan.pricePaise / meals)) })}
          </Text>
        </View>

        <Text style={styles.h2}>{t("plan.menuTitle")}</Text>
        <DayMenuList days={plan.days} mealTimes={plan.mealTimes} dayMenus={plan.dayMenus} />

        <Card style={{ marginTop: 18 }}>
          <Text style={styles.h2}>{t("plan.formTitle")}</Text>
          {!user ? (
            <>
              <Text style={styles.text}>{t("plan.loginFirst")}</Text>
              <Button title={t("of.loginButton")} onPress={() => router.push("/login")} />
            </>
          ) : (
            <>
              <Text style={styles.label}>{t("plan.start")}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {dates.map((d, i) => (
                  <Chip key={d} label={dateLabel(d, i)} active={start === d} onPress={() => setStart(d)} />
                ))}
              </ScrollView>
              <Text style={styles.muted}>{t("plan.endsOn", { date: formatDate(`${lastDay}T00:00:00Z`, locale) })}</Text>

              <Field
                label={t("plan.address")}
                value={address}
                onChangeText={setAddress}
                multiline
                maxLength={250}
                style={{ minHeight: 76, textAlignVertical: "top", paddingTop: 12 }}
              />
              <Field label={t("plan.note")} value={note} onChangeText={setNote} maxLength={200} />

              <View style={styles.payBox}>
                <View style={styles.row}>
                  <Text style={styles.payStrong}>{t("plan.total")}</Text>
                  <Text style={styles.payStrong}>{formatPrice(plan.pricePaise)}</Text>
                </View>
                <Text style={styles.payText}>{t("plan.payInfo")}</Text>
              </View>

              {error ? <ErrorText>{error}</ErrorText> : null}
              <Button title={t("plan.submit")} onPress={submit} loading={busy} style={{ backgroundColor: "#9333ea" }} />
            </>
          )}
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 6 },
  hero: { backgroundColor: "#faf5ff", borderColor: "#e9d5ff", borderWidth: 1, borderRadius: radius.xl, padding: 18, gap: 6 },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "#9333ea",
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  text: { fontSize: 15, color: colors.textSoft, lineHeight: 21 },
  muted: { fontSize: 13, color: colors.muted },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSoft },
  price: { fontSize: 30, fontWeight: "800", color: colors.text, marginTop: 6 },
  h2: { fontSize: 20, fontWeight: "800", color: colors.text, marginTop: 14 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  payBox: { backgroundColor: "#faf5ff", borderRadius: radius.md, padding: 12, gap: 4 },
  payStrong: { fontWeight: "700", color: "#581c87", fontSize: 15 },
  payText: { color: "#6b21a8", fontSize: 13, lineHeight: 19 },
});

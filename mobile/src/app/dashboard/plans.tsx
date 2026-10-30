import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { getMyPlans, type MyPlan } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, ErrorText } from "@/components/ui";

function PlanList() {
  const t = useT();
  const [plans, setPlans] = useState<MyPlan[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyPlans();
    setLoading(false);
    if (res.ok) {
      setPlans(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={loading && plans !== null} onRefresh={load} tintColor={colors.orange} />}
    >
      <Text style={styles.hint}>{t("plans.hint")}</Text>
      <Button title={`+ ${t("plans.new")}`} onPress={() => router.push("/dashboard/plan-form")} />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {plans === null && !error && <ActivityIndicator color={colors.orange} style={{ marginTop: 24 }} />}
      {plans && plans.length === 0 && <Text style={styles.empty}>{t("plans.empty")}</Text>}

      {plans?.map((plan) => {
        const total = plan.days * plan.mealTimes.length;
        const done = Math.min(plan.dayMenus.length, total);
        return (
          <Pressable
            key={plan.id}
            onPress={() => router.push({ pathname: "/dashboard/plan-menu", params: { id: String(plan.id) } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.row}>
              <Text style={styles.name}>
                {plan.isVeg ? "🟢 " : ""}
                {plan.name}
              </Text>
              <Text style={[styles.badge, plan.isActive ? styles.on : styles.off]}>
                {plan.isActive ? t("plans.active") : t("plans.inactive")}
              </Text>
            </View>
            <Text style={styles.small}>
              {t("plans.daysN", { n: plan.days })} · {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
            </Text>
            <Text style={styles.price}>{formatPrice(plan.pricePaise)}</Text>
            <View style={styles.bar}>
              <View style={[styles.fill, { width: `${total ? (done / total) * 100 : 0}%` }]} />
            </View>
            <View style={styles.row}>
              <Text style={styles.small}>{t("plans.filled", { done, total })}</Text>
              <Text style={styles.small}>{t("plans.subs", { n: plan._count.subscriptions })}</Text>
            </View>
            <Text style={styles.link}>{t("plans.open")} →</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export default function MyPlansScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("plans.title") }} />
      <ProviderGate>
        <PlanList />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 17, fontWeight: "700", color: colors.text, flex: 1 },
  badge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, overflow: "hidden" },
  on: { backgroundColor: "#dcfce7", color: "#166534" },
  off: { backgroundColor: "#f3f4f6", color: colors.textSoft },
  small: { fontSize: 13, color: colors.muted },
  price: { fontSize: 18, fontWeight: "800", color: colors.orangeDark },
  bar: { height: 6, borderRadius: 3, backgroundColor: "#f3f4f6", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.green },
  link: { color: colors.orangeDark, fontWeight: "600", marginTop: 4 },
  empty: {
    textAlign: "center",
    color: colors.textSoft,
    padding: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
  },
});

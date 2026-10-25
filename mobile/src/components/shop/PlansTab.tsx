import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getShopPlans, type ShopPlan } from "@/lib/shops";
import { formatPrice } from "@/lib/format";
import { MEAL_ICON, MEAL_SHORT_KEY, type MealTime } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { router } from "expo-router";
import { Button, ErrorText } from "@/components/ui";

// Har din ka menu: din ka card, andar har time ki dishes. today = aaj ka din (orange)
export function DayMenuList({
  days: count,
  mealTimes,
  dayMenus,
  today,
}: {
  days: number;
  mealTimes: MealTime[];
  dayMenus: { day: number; mealTime: MealTime; dishes: string[] }[];
  today?: number | null;
}) {
  const t = useT();
  const days = Array.from({ length: count }, (_, i) => i + 1);
  return (
    <View style={{ gap: 8, marginTop: 10 }}>
      {days.map((day) => (
        <View key={day} style={[styles.day, day === today && styles.today]}>
          <Text style={styles.dayTitle}>
            {t("plan.day", { n: day })}
            {day === today ? `  · ${t("msub.todayBadge")}` : ""}
          </Text>
          {mealTimes.map((m) => {
            const dishes = dayMenus.find((d) => d.day === day && d.mealTime === m)?.dishes ?? [];
            return (
              <Text key={m} style={styles.dayLine}>
                <Text style={{ fontWeight: "600" }}>
                  {MEAL_ICON[m]} {t(MEAL_SHORT_KEY[m])}:
                </Text>{" "}
                {dishes.length > 0 ? dishes.join(", ") : "-"}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function PlansTab({ shopId }: { shopId: number }) {
  const t = useT();
  const [plans, setPlans] = useState<ShopPlan[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    getShopPlans(String(shopId)).then((res) => {
      if (res.ok) setPlans(res.data.items);
      else setError(translateError(t, res.error));
    });
  }, [shopId, t]);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!plans) return <ActivityIndicator color={colors.orange} style={{ marginVertical: 24 }} />;
  if (plans.length === 0) return <Text style={styles.empty}>{t("shop.noPlans")}</Text>;

  return (
    <View style={{ gap: 14 }}>
      {plans.map((plan) => (
        <View key={plan.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.daysPill}>🗓️ {t("home.planDays", { n: plan.days })}</Text>
            {plan.isVeg && <Text style={styles.veg}>🟢 {t("home.pureVeg")}</Text>}
          </View>
          <View style={[styles.row, { alignItems: "flex-start", marginTop: 8 }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.name}>{plan.name}</Text>
              <Text style={styles.small}>
                {plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}
              </Text>
              {plan.description ? <Text style={styles.small}>{plan.description}</Text> : null}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>{formatPrice(plan.pricePaise)}</Text>
              <Text style={styles.small}>
                {t("plan.perDay", { price: formatPrice(Math.round(plan.pricePaise / plan.days)) })}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => setOpen(open === plan.id ? null : plan.id)}
            accessibilityRole="button"
            accessibilityState={{ expanded: open === plan.id }}
            style={{ marginTop: 10 }}
          >
            <Text style={styles.toggle}>
              {open === plan.id ? "▾" : "▸"} {t("shop.seeDayMenu")}
            </Text>
          </Pressable>
          {open === plan.id && <DayMenuList days={plan.days} mealTimes={plan.mealTimes} dayMenus={plan.dayMenus} />}

          <Button
            title={`${t("shop.takePlan")} →`}
            onPress={() => router.push({ pathname: "/plan/[id]", params: { id: String(plan.id) } })}
            style={{ marginTop: 14, backgroundColor: "#9333ea" }}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: "#e9d5ff", padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "space-between" },
  daysPill: {
    backgroundColor: "#9333ea",
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  veg: { color: colors.green, fontSize: 12, fontWeight: "600" },
  name: { fontSize: 18, fontWeight: "700", color: colors.text },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  price: { fontSize: 22, fontWeight: "800", color: colors.text },
  toggle: { color: "#7e22ce", fontWeight: "700", fontSize: 14 },
  day: { backgroundColor: "#faf5ff", borderRadius: radius.md, padding: 10, gap: 3 },
  today: { backgroundColor: colors.orangeSoft, borderWidth: 1, borderColor: colors.orange },
  dayTitle: { fontWeight: "700", color: colors.text },
  dayLine: { fontSize: 14, color: colors.textSoft, lineHeight: 20 },
  empty: {
    color: colors.textSoft,
    padding: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
  },
});

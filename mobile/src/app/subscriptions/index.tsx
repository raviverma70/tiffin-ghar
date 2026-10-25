import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { addDays, currentPlanDay, getSubscriptions, type Subscription } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { SubscriptionBadge } from "@/components/status";
import { NeedLogin } from "@/components/NeedLogin";
import { Button, ErrorText } from "@/components/ui";

function SubsList() {
  const t = useT();
  const locale = useLocale();
  const [subs, setSubs] = useState<Subscription[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getSubscriptions();
    setLoading(false);
    if (res.ok) {
      setSubs(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!subs && !error) return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={subs ?? []}
      keyExtractor={(s) => String(s.id)}
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
      ListHeaderComponent={error ? <ErrorText>{error}</ErrorText> : null}
      ListEmptyComponent={
        !error ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🗓️</Text>
            <Text style={styles.muted}>{t("msub.empty")}</Text>
            <Button title={t("orders.emptyCta")} onPress={() => router.replace("/")} />
          </View>
        ) : null
      }
      renderItem={({ item: s }) => {
        const day = s.status === "ACTIVE" ? currentPlanDay(s.startDate, s.days) : null;
        const start = s.startDate.slice(0, 10);
        return (
          <Pressable
            onPress={() => router.push({ pathname: "/subscriptions/[id]", params: { id: String(s.id) } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
          >
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{s.planName}</Text>
                <Text style={styles.small}>{s.provider.shopName}</Text>
              </View>
              <SubscriptionBadge status={s.status} />
            </View>
            <Text style={styles.text}>
              🗓️{" "}
              {t("msub.dates", {
                start: formatDate(`${start}T00:00:00Z`, locale),
                end: formatDate(`${addDays(start, s.days - 1)}T00:00:00Z`, locale),
              })}
            </Text>
            <Text style={styles.small}>{s.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}</Text>
            <View style={styles.row}>
              {day ? <Text style={styles.today}>{t("msub.today", { n: day })}</Text> : <View />}
              <Text style={styles.price}>{formatPrice(s.pricePaise)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

export default function SubscriptionsScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("msub.title") }} />
      <NeedLogin>
        <SubsList />
      </NeedLogin>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  small: { fontSize: 12, color: colors.muted },
  text: { fontSize: 14, color: colors.textSoft },
  today: {
    backgroundColor: "#ffedd5",
    color: colors.orangeDark,
    fontWeight: "700",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  price: { fontSize: 17, fontWeight: "800", color: colors.text },
  muted: { fontSize: 15, color: colors.textSoft, textAlign: "center" },
  empty: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
  },
});

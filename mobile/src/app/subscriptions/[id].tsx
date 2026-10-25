import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { addDays, cancelSubscription, currentPlanDay, getSubscription, type Subscription } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { SubscriptionBadge } from "@/components/status";
import { NeedLogin } from "@/components/NeedLogin";
import { DayMenuList } from "@/components/shop/PlansTab";
import { Button, Card, ErrorText } from "@/components/ui";

function SubDetail({ id, isNew }: { id: string; isNew: boolean }) {
  const t = useT();
  const locale = useLocale();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(isNew);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getSubscription(id);
    setLoading(false);
    if (res.ok) {
      setSub(res.data);
      setError("");
    } else setError(res.status === 404 ? t("msub.notFound") : translateError(t, res.error));
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  function askCancel() {
    if (!sub) return;
    Alert.alert(t("msub.cancel"), t("msub.confirmCancel"), [
      { text: t("mcommon.no"), style: "cancel" },
      {
        text: t("mcommon.yes"),
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          const res = await cancelSubscription(sub.id);
          setBusy(false);
          setShowNew(false);
          if (res.ok) await load();
          else setError(translateError(t, res.error));
        },
      },
    ]);
  }

  if (!sub) {
    return error ? (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    ) : (
      <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
    );
  }

  const start = sub.startDate.slice(0, 10);
  const day = sub.status === "ACTIVE" ? currentPlanDay(sub.startDate, sub.days) : null;
  const startText = formatDate(`${start}T00:00:00Z`, locale);

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
    >
      <Stack.Screen options={{ title: t("msub.number", { id: sub.id }) }} />

      {showNew && <Text style={styles.sent}>✓ {t("msub.sent")}</Text>}

      <Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{sub.planName}</Text>
            <Text
              style={styles.link}
              onPress={() => router.push({ pathname: "/shop/[id]", params: { id: String(sub.provider.id) } })}
            >
              {sub.provider.shopName}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <SubscriptionBadge status={sub.status} />
            <Text style={styles.price}>{formatPrice(sub.pricePaise)}</Text>
          </View>
        </View>
        <Text style={styles.text}>
          🗓️ {t("msub.dates", { start: startText, end: formatDate(`${addDays(start, sub.days - 1)}T00:00:00Z`, locale) })}
        </Text>
        <Text style={styles.text}>{sub.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}</Text>
        <Text style={styles.text}>📍 {t("msub.address", { address: sub.deliveryAddress })}</Text>
        {sub.note ? <Text style={styles.text}>📝 {t("msub.note", { note: sub.note })}</Text> : null}
        {day !== null && (
          <Text style={styles.today}>{day === 0 ? t("msub.notStarted", { date: startText }) : t("msub.today", { n: day })}</Text>
        )}
        {error ? <ErrorText>{error}</ErrorText> : null}
        {sub.status === "REQUESTED" && <Button title={t("msub.cancel")} onPress={askCancel} variant="outline" loading={busy} />}
        {sub.status === "ACTIVE" && <Text style={styles.small}>{t("msub.cancelHint")}</Text>}
      </Card>

      {sub.dayMenus && sub.dayMenus.length > 0 && (
        <>
          <Text style={styles.h2}>{t("msub.menu")}</Text>
          <DayMenuList days={sub.days} mealTimes={sub.mealTimes} dayMenus={sub.dayMenus} today={day || null} />
        </>
      )}
    </ScrollView>
  );
}

export default function SubscriptionScreen() {
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  return <NeedLogin>{id ? <SubDetail id={id} isNew={isNew === "1"} /> : null}</NeedLogin>;
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 20, fontWeight: "800", color: colors.text },
  link: { fontSize: 14, color: colors.textSoft, textDecorationLine: "underline", marginTop: 2 },
  price: { fontSize: 20, fontWeight: "800", color: colors.text },
  text: { fontSize: 15, color: colors.textSoft, lineHeight: 21 },
  small: { fontSize: 13, color: colors.muted },
  h2: { fontSize: 20, fontWeight: "800", color: colors.text },
  sent: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
    borderWidth: 1,
    color: "#166534",
    padding: 12,
    borderRadius: radius.lg,
    overflow: "hidden",
    lineHeight: 20,
  },
  today: {
    alignSelf: "flex-start",
    backgroundColor: "#ffedd5",
    color: colors.orangeDark,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    overflow: "hidden",
  },
});

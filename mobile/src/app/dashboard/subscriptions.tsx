import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import {
  getShopSubscriptions,
  setSubscriptionStatus,
  SUB_ACTION_KEY,
  SUB_FILTERS,
  SUB_NEXT,
  type ShopSubscription,
  type SubAction,
} from "@/lib/provider";
import { addDays, type SubscriptionStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { SubscriptionBadge } from "@/components/status";
import { Chip } from "@/components/Chip";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, ErrorText } from "@/components/ui";

function SubsList() {
  const t = useT();
  const locale = useLocale();
  const [filter, setFilter] = useState<SubscriptionStatus | undefined>("REQUESTED");
  const [subs, setSubs] = useState<ShopSubscription[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getShopSubscriptions(filter);
    setLoading(false);
    if (res.ok) {
      setSubs(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [filter, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    setSubs(null);
  }, [filter]);

  async function change(sub: ShopSubscription, status: SubAction) {
    setBusyId(sub.id);
    const res = await setSubscriptionStatus(sub.id, status);
    setBusyId(null);
    if (!res.ok) setError(translateError(t, res.error));
    else setError("");
    void load();
  }

  function ask(sub: ShopSubscription, status: SubAction) {
    if (status === "ACTIVE" || status === "COMPLETED") {
      void change(sub, status);
      return;
    }
    Alert.alert(t(SUB_ACTION_KEY[status]), t("subs.confirm"), [
      { text: t("mcommon.no"), style: "cancel" },
      { text: t("mcommon.yes"), style: "destructive", onPress: () => void change(sub, status) },
    ]);
  }

  return (
    <FlatList
      data={subs ?? []}
      keyExtractor={(s) => String(s.id)}
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading && subs !== null} onRefresh={load} tintColor={colors.orange} />}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 12 }}>
          <Text style={styles.muted}>{t("subs.hint")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SUB_FILTERS.map((f) => (
              <Chip key={f.key} label={t(f.key)} active={filter === f.value} onPress={() => setFilter(f.value)} />
            ))}
          </ScrollView>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </View>
      }
      ListEmptyComponent={
        subs === null ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 24 }} />
        ) : (
          <Text style={styles.empty}>{t("subs.empty")}</Text>
        )
      }
      renderItem={({ item: s }) => {
        const next = SUB_NEXT[s.status] ?? [];
        const start = s.startDate.slice(0, 10);
        return (
          <View style={[styles.card, s.status === "REQUESTED" && styles.newCard]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  #{s.id} · {s.planName}
                </Text>
                <Text style={styles.muted}>
                  {t("subs.meals", {
                    days: s.days,
                    times: s.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + "),
                  })}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <SubscriptionBadge status={s.status} />
                <Text style={styles.price}>{formatPrice(s.pricePaise)}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.text}>
                🗓️{" "}
                {t("subs.dates", {
                  start: formatDate(`${start}T00:00:00Z`, locale),
                  end: formatDate(`${addDays(start, s.days - 1)}T00:00:00Z`, locale),
                })}
              </Text>
              <View style={styles.row}>
                <Text style={styles.text}>📞 {t("subs.customer", { phone: s.user.phone })}</Text>
                <Button
                  title={t("mdash.call")}
                  onPress={() => Linking.openURL(`tel:${s.user.phone}`)}
                  variant="outline"
                  style={styles.smallBtn}
                />
              </View>
              <Text style={styles.text}>📍 {t("subs.address", { address: s.deliveryAddress })}</Text>
              {s.note ? <Text style={styles.text}>📝 {t("subs.note", { note: s.note })}</Text> : null}
            </View>

            {next.length > 0 && (
              <View style={[styles.row, { flexWrap: "wrap", justifyContent: "flex-start" }]}>
                {next.map((a) => {
                  const danger = a === "REJECTED" || a === "CANCELLED";
                  return (
                    <Button
                      key={a}
                      title={t(SUB_ACTION_KEY[a])}
                      onPress={() => ask(s, a)}
                      loading={busyId === s.id}
                      variant={danger ? "outline" : "primary"}
                      style={[styles.actionBtn, !danger && { backgroundColor: colors.green }]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

export default function ShopSubscriptionsScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("subs.title") }} />
      <ProviderGate>
        <SubsList />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  newCard: { borderColor: "#93c5fd", borderWidth: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  name: { fontSize: 16, fontWeight: "800", color: colors.text },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  price: { fontSize: 17, fontWeight: "800", color: colors.text },
  infoBox: { backgroundColor: "#f9fafb", borderRadius: radius.md, padding: 10, gap: 4 },
  text: { fontSize: 14, color: colors.text, lineHeight: 20, flexShrink: 1 },
  smallBtn: { minHeight: 36, paddingHorizontal: 12 },
  actionBtn: { minHeight: 44, flexGrow: 1 },
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

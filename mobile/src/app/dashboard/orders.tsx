import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Linking, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import {
  ACTION_KEY,
  getShopOrders,
  NEXT_STATUSES,
  ORDER_FILTERS,
  PROVIDER_STATUS_KEY,
  setOrderStatus,
  type NextStatus,
  type ShopOrder,
} from "@/lib/provider";
import type { OrderStatus } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { OrderBadge } from "@/components/status";
import { Chip } from "@/components/Chip";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, ErrorText } from "@/components/ui";

// Naye orders apne aap aate rahein (website jaisa, 30 second)
const REFRESH_MS = 30_000;

function OrdersList() {
  const t = useT();
  const locale = useLocale();
  const [filter, setFilter] = useState<OrderStatus | undefined>("PLACED");
  const [orders, setOrders] = useState<ShopOrder[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getShopOrders(filter);
    setLoading(false);
    if (res.ok) {
      setOrders(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [filter, t]);

  useFocusEffect(
    useCallback(() => {
      void load();
      const timer = setInterval(() => void load(), REFRESH_MS);
      return () => clearInterval(timer);
    }, [load]),
  );

  // Filter badla: list khali karke spinner
  useEffect(() => {
    setOrders(null);
  }, [filter]);

  async function change(order: ShopOrder, status: NextStatus) {
    setBusyId(order.id);
    const res = await setOrderStatus(order.id, status);
    setBusyId(null);
    if (!res.ok) {
      // Customer ne beech me cancel kiya ho to 409: message dikhao aur list taaza
      setError(translateError(t, res.error));
      void load();
      return;
    }
    setError("");
    void load();
  }

  function ask(order: ShopOrder, status: NextStatus) {
    if (status !== "REJECTED") {
      void change(order, status);
      return;
    }
    Alert.alert(t(ACTION_KEY[status]), t("porders.confirmReject"), [
      { text: t("mcommon.no"), style: "cancel" },
      { text: t("mcommon.yes"), style: "destructive", onPress: () => void change(order, status) },
    ]);
  }

  return (
    <FlatList
      data={orders ?? []}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading && orders !== null} onRefresh={load} tintColor={colors.orange} />}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {ORDER_FILTERS.map((f) => (
              <Chip key={f.key} label={t(f.key)} active={filter === f.value} onPress={() => setFilter(f.value)} />
            ))}
          </ScrollView>
          <Text style={styles.muted}>{t("mdash.autoRefresh")}</Text>
          {error ? <ErrorText>{error}</ErrorText> : null}
        </View>
      }
      ListEmptyComponent={
        orders === null ? (
          <ActivityIndicator color={colors.orange} style={{ marginTop: 24 }} />
        ) : (
          <Text style={styles.empty}>{t("porders.none")}</Text>
        )
      }
      renderItem={({ item: o }) => {
        const next = NEXT_STATUSES[o.status] ?? [];
        return (
          <View style={[styles.card, o.status === "PLACED" && styles.newCard]}>
            <View style={styles.row}>
              <View>
                <Text style={styles.number}>{t("orders.number", { id: o.id })}</Text>
                <Text style={styles.muted}>{formatDate(o.createdAt, locale)}</Text>
              </View>
              <OrderBadge status={o.status} label={t(PROVIDER_STATUS_KEY[o.status])} />
            </View>

            <View style={styles.infoBox}>
              <View style={styles.row}>
                <Text style={styles.text}>
                  {t("porders.customer")} <Text style={{ fontWeight: "700" }}>{o.user.phone}</Text>
                </Text>
                <Button
                  title={`📞 ${t("mdash.call")}`}
                  onPress={() => Linking.openURL(`tel:${o.user.phone}`)}
                  variant="outline"
                  style={styles.smallBtn}
                />
              </View>
              <Text style={styles.text}>{t("porders.address", { address: o.deliveryAddress })}</Text>
              {o.note ? <Text style={styles.text}>{t("porders.note", { note: o.note })}</Text> : null}
            </View>

            {o.items.map((it) => (
              <View key={it.id} style={styles.row}>
                <Text style={styles.text}>
                  {it.name} <Text style={styles.muted}>× {it.quantity}</Text>
                </Text>
                <Text style={styles.text}>{formatPrice(it.pricePaise * it.quantity)}</Text>
              </View>
            ))}
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.total}>{t("porders.total")}</Text>
              <Text style={styles.total}>{formatPrice(o.totalPaise)}</Text>
            </View>

            {next.length > 0 && (
              <View style={[styles.row, { flexWrap: "wrap", justifyContent: "flex-start" }]}>
                {next.map((s) => (
                  <Button
                    key={s}
                    title={t(ACTION_KEY[s])}
                    onPress={() => ask(o, s)}
                    loading={busyId === o.id}
                    variant={s === "REJECTED" ? "outline" : "primary"}
                    style={[styles.actionBtn, s !== "REJECTED" && { backgroundColor: colors.green }]}
                  />
                ))}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

export default function ShopOrdersScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("porders.title") }} />
      <ProviderGate>
        <OrdersList />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  newCard: { borderColor: "#93c5fd", borderWidth: 2 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  number: { fontSize: 17, fontWeight: "800", color: colors.text },
  muted: { fontSize: 12, color: colors.muted },
  infoBox: { backgroundColor: "#f9fafb", borderRadius: radius.md, padding: 10, gap: 4 },
  text: { fontSize: 14, color: colors.text, lineHeight: 20, flexShrink: 1 },
  smallBtn: { minHeight: 36, paddingHorizontal: 12 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 },
  total: { fontSize: 16, fontWeight: "800", color: colors.text },
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

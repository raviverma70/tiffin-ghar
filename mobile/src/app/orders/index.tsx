import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { getOrders, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { OrderBadge } from "@/components/status";
import { NeedLogin } from "@/components/NeedLogin";
import { Button, ErrorText } from "@/components/ui";

function OrdersList() {
  const t = useT();
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getOrders();
    setLoading(false);
    if (res.ok) {
      setOrders(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [t]);

  // Screen par wapas aao to taaza list (order dene ke baad bhi)
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!orders && !error) return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={orders ?? []}
      keyExtractor={(o) => String(o.id)}
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
      ListHeaderComponent={error ? <ErrorText>{error}</ErrorText> : null}
      ListEmptyComponent={
        !error ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>🍱</Text>
            <Text style={styles.muted}>{t("orders.empty")}</Text>
            <Button title={t("orders.emptyCta")} onPress={() => router.replace("/")} />
          </View>
        ) : null
      }
      renderItem={({ item: o }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/orders/[id]", params: { id: String(o.id) } })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.shop} numberOfLines={1}>
                {o.provider.shopName}
              </Text>
              <Text style={styles.small}>
                #{o.id} · {formatDate(o.createdAt, locale)}
              </Text>
            </View>
            <OrderBadge status={o.status} />
          </View>
          <Text style={styles.items} numberOfLines={1}>
            {o.items.map((it) => `${it.name} × ${it.quantity}`).join(", ")}
          </Text>
          <View style={[styles.row, styles.footer]}>
            <Text style={styles.small}>{t("orders.items", { n: o.items.length })}</Text>
            <Text style={styles.total}>
              {formatPrice(o.totalPaise)} <Text style={styles.view}>{t("orders.view")} →</Text>
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

export default function OrdersScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("orders.title") }} />
      <NeedLogin>
        <OrdersList />
      </NeedLogin>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  shop: { fontSize: 16, fontWeight: "700", color: colors.text },
  small: { fontSize: 12, color: colors.muted },
  items: { fontSize: 14, color: colors.textSoft },
  footer: { borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 8, marginTop: 2 },
  total: { fontSize: 17, fontWeight: "800", color: colors.text },
  view: { fontSize: 14, fontWeight: "700", color: colors.orangeDark },
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

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { cancelOrder, getOrder, type Order } from "@/lib/orders";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/days";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { LIVE_STATUSES, ORDER_STATUS_KEY, OrderBadge, OrderTimeline } from "@/components/status";
import { NeedLogin } from "@/components/NeedLogin";
import { Button, Card, ErrorText } from "@/components/ui";
import { MyReview, ReviewForm } from "@/components/OrderReview";

// Order chalu ho tab tak har 15 second me taaza (website jaisa)
const REFRESH_MS = 15_000;

function OrderDetail({ id }: { id: string }) {
  const t = useT();
  const locale = useLocale();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getOrder(id);
    setLoading(false);
    if (res.ok) {
      setOrder(res.data);
      setError("");
    } else setError(res.status === 404 ? t("orders.notFound") : translateError(t, res.error));
  }, [id, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const live = order ? LIVE_STATUSES.includes(order.status) : false;
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [live, load]);

  function askCancel() {
    if (!order) return;
    Alert.alert(t("orders.cancel"), t("mord.confirmCancel"), [
      { text: t("mcommon.no"), style: "cancel" },
      {
        text: t("mcommon.yes"),
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          const res = await cancelOrder(order.id);
          setBusy(false);
          if (res.ok) setOrder(res.data);
          else setError(translateError(t, res.error));
        },
      },
    ]);
  }

  if (!order) {
    return error ? (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    ) : (
      <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
    );
  }

  const stopped = order.status === "REJECTED" || order.status === "CANCELLED";

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
    >
      <Stack.Screen options={{ title: t("orders.number", { id: order.id }) }} />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text
            style={styles.shop}
            onPress={() => router.push({ pathname: "/shop/[id]", params: { id: String(order.provider.id) } })}
          >
            {order.provider.shopName}
          </Text>
          <Text style={styles.small}>{formatDate(order.createdAt, locale)}</Text>
        </View>
        <OrderBadge status={order.status} />
      </View>

      <Card>
        <Text style={styles.label}>{t("orders.status")}</Text>
        {stopped ? (
          <Text style={styles.stopped}>{t(ORDER_STATUS_KEY[order.status])}</Text>
        ) : (
          <>
            <OrderTimeline status={order.status} />
            <Text style={styles.statusText}>{t(ORDER_STATUS_KEY[order.status])}</Text>
          </>
        )}
      </Card>

      <Card>
        <Text style={styles.label}>{t("orders.itemsTitle")}</Text>
        {order.items.map((it) => (
          <View key={it.id} style={styles.row}>
            <Text style={styles.text}>
              {it.name} <Text style={styles.small}>× {it.quantity}</Text>
            </Text>
            <Text style={styles.text}>{formatPrice(it.pricePaise * it.quantity)}</Text>
          </View>
        ))}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.total}>{t("orders.total")}</Text>
          <Text style={styles.total}>{formatPrice(order.totalPaise)}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>{t("orders.deliveryTitle")}</Text>
        <Text style={styles.text}>📍 {t("orders.address", { address: order.deliveryAddress })}</Text>
        {order.note ? <Text style={styles.text}>📝 {t("orders.note", { note: order.note })}</Text> : null}
      </Card>

      {error ? <ErrorText>{error}</ErrorText> : null}
      {order.status === "PLACED" && (
        <Button title={t("orders.cancel")} onPress={askCancel} variant="outline" loading={busy} />
      )}
      {order.status === "DELIVERED" &&
        (order.review ? (
          <MyReview review={order.review} photoFailed={photoFailed} onChange={load} />
        ) : (
          <ReviewForm
            orderId={order.id}
            onDone={(failed) => {
              setPhotoFailed(failed);
              void load();
            }}
          />
        ))}
    </ScrollView>
  );
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NeedLogin>{id ? <OrderDetail id={id} /> : null}</NeedLogin>;
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  shop: { fontSize: 18, fontWeight: "800", color: colors.text, textDecorationLine: "underline" },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 11, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  statusText: { textAlign: "center", fontSize: 15, fontWeight: "600", color: colors.text, marginTop: 4 },
  stopped: {
    backgroundColor: "#f3f4f6",
    borderRadius: radius.md,
    padding: 12,
    fontWeight: "700",
    color: colors.textSoft,
    overflow: "hidden",
  },
  text: { fontSize: 15, color: colors.text, lineHeight: 21, flexShrink: 1 },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  total: { fontSize: 18, fontWeight: "800", color: colors.text },
});

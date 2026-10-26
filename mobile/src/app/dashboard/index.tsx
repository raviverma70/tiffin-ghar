import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { getMyShop, getShopOrders, getShopSubscriptions, setShopOpen, type MyShop } from "@/lib/provider";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, Card, ErrorText } from "@/components/ui";

function Dashboard() {
  const t = useT();
  const [shop, setShop] = useState<MyShop | null>(null);
  const [newOrders, setNewOrders] = useState<number | null>(null);
  const [newSubs, setNewSubs] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, o, sub] = await Promise.all([getMyShop(), getShopOrders("PLACED"), getShopSubscriptions("REQUESTED")]);
    setLoading(false);
    if (!s.ok) {
      setError(s.status === 404 ? t("mdash.noProfile") : translateError(t, s.error));
      return;
    }
    setError("");
    setShop(s.data);
    setNewOrders(o.ok ? o.data.total : null);
    setNewSubs(sub.ok ? sub.data.total : null);
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function toggleOpen() {
    if (!shop) return;
    setBusy(true);
    const res = await setShopOpen(!shop.isOpen);
    setBusy(false);
    if (res.ok) setShop(res.data);
    else setError(translateError(t, res.error));
  }

  if (!shop) {
    return error ? (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    ) : (
      <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
    >
      <View>
        <Text style={styles.title}>{shop.shopName}</Text>
        <Text style={styles.muted}>
          {[shop.area, shop.city].filter(Boolean).join(", ")} - {shop.pincode}
        </Text>
      </View>

      {shop.status === "PENDING" && <Text style={styles.warn}>⏳ {t("dash.pending")}</Text>}
      {shop.status === "REJECTED" && <Text style={styles.bad}>{t("dash.rejected")}</Text>}
      {(shop.latitude === null || shop.longitude === null) && <Text style={styles.warn}>📍 {t("mdash.noLocation")}</Text>}
      {error ? <ErrorText>{error}</ErrorText> : null}

      {shop.status === "APPROVED" && (
        <Card style={shop.isOpen ? styles.openCard : undefined}>
          <Text style={[styles.openText, { color: shop.isOpen ? colors.green : colors.textSoft }]}>
            {shop.isOpen ? "● " : "○ "}
            {shop.isOpen ? t("dash.shopOpen") : t("dash.shopClosed")}
          </Text>
          <Button
            title={shop.isOpen ? t("dash.closeBtn") : t("dash.openBtn")}
            onPress={toggleOpen}
            loading={busy}
            variant={shop.isOpen ? "outline" : "primary"}
            style={shop.isOpen ? undefined : { backgroundColor: colors.green }}
          />
        </Card>
      )}

      <Pressable
        onPress={() => router.push("/dashboard/orders")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.tile, styles.blue, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.tileTitle}>🧾 {t("dash.newOrders", { n: newOrders ?? "-" })}</Text>
        <Text style={styles.muted}>{t("dash.ordersHint")} →</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/dashboard/subscriptions")}
        accessibilityRole="button"
        style={({ pressed }) => [styles.tile, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.tileTitle}>🗓️ {t("dash.newSubs", { n: newSubs ?? "-" })}</Text>
        <Text style={styles.muted}>{t("dash.subsHint")} →</Text>
      </Pressable>

      <Text style={styles.note}>{t("mdash.webNote")}</Text>
    </ScrollView>
  );
}

export default function DashboardScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("mdash.title") }} />
      <ProviderGate>
        <Dashboard />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  title: { fontSize: 26, fontWeight: "800", color: colors.text },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2 },
  warn: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
    borderWidth: 1,
    color: "#78350f",
    padding: 12,
    borderRadius: radius.lg,
    overflow: "hidden",
    lineHeight: 20,
  },
  bad: {
    backgroundColor: colors.redSoft,
    borderColor: "#fecaca",
    borderWidth: 1,
    color: colors.red,
    padding: 12,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  openCard: { borderColor: "#bbf7d0", backgroundColor: "#f0fdf4" },
  openText: { fontSize: 17, fontWeight: "700" },
  tile: { backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 4 },
  blue: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  tileTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  note: { fontSize: 13, color: colors.muted, lineHeight: 19 },
});

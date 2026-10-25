import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getShop, type ShopDetail } from "@/lib/shops";
import { photoSrc } from "@/lib/photo";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { RatingBadge } from "@/components/cards";
import { Card, ErrorText } from "@/components/ui";

// Dukaan ki screen: abhi upar ka hissa. Menu, order, plans aur reviews agle step (Mobile Step 5) me.
export default function ShopScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getShop(id).then((res) => {
      if (res.ok) setShop(res.data);
      else setError(res.status === 404 ? t("shop.notFound") : translateError(t, res.error));
    });
  }, [id, t]);

  if (error) {
    return (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={[styles.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  const photo = photoSrc(shop.photoUrl);
  const place = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Stack.Screen options={{ title: shop.shopName }} />
      <View style={styles.card}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Text style={{ fontSize: 48 }}>🍱</Text>
          </View>
        )}
        <View style={{ padding: 16, gap: 8 }}>
          <Text style={styles.title}>{shop.shopName}</Text>
          <Text style={styles.muted}>
            {place} - {shop.pincode}
          </Text>
          <View style={styles.row}>
            <RatingBadge rating={shop.rating} count={shop.ratingCount} />
            <Text style={[styles.status, { color: shop.isOpen ? colors.green : colors.muted }]}>
              {shop.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow")}
            </Text>
          </View>
          <View style={styles.row}>
            {shop.isVerified && <Text style={styles.tag}>✓ {t("home.verified")}</Text>}
            {shop.isPureVeg && <Text style={styles.tag}>🟢 {t("home.pureVeg")}</Text>}
            {shop.planCount > 0 && <Text style={styles.tag}>🗓️ {t("home.plansCount", { n: shop.planCount })}</Text>}
          </View>
        </View>
      </View>

      <Card style={{ marginTop: 14 }}>
        <Text style={styles.soon}>🛠️ {t("mshop.soon")}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  photo: { width: "100%", height: 190 },
  noPhoto: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  muted: { fontSize: 14, color: colors.muted },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  status: { fontSize: 13, fontWeight: "600" },
  tag: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSoft,
    backgroundColor: "#f3f4f6",
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    overflow: "hidden",
  },
  soon: { fontSize: 15, color: colors.textSoft, lineHeight: 22 },
});

import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { getFavouriteIds, getShop, setFavourite, type ShopDetail } from "@/lib/shops";
import { photoSrc } from "@/lib/photo";
import { colors, radius } from "@/lib/theme";
import { useAuth } from "@/auth/provider";
import { translateError, useT, type MessageKey } from "@/i18n";
import { RatingBadge } from "@/components/cards";
import { Chip } from "@/components/Chip";
import { ErrorText } from "@/components/ui";
import { MenuTab } from "@/components/shop/MenuTab";
import { PlansTab } from "@/components/shop/PlansTab";
import { InfoTab, ReviewsTab } from "@/components/shop/ReviewsTab";

type Tab = "menu" | "plans" | "reviews" | "info";
const TABS: { key: Tab; label: MessageKey }[] = [
  { key: "menu", label: "shop.tabMenu" },
  { key: "plans", label: "shop.tabPlans" },
  { key: "reviews", label: "shop.tabReviews" },
  { key: "info", label: "shop.tabInfo" },
];

// Dukaan ki poori screen: header, ♥, share, aur 4 tabs (website jaisi)
export default function ShopScreen() {
  const t = useT();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    getShop(id).then((res) => {
      if (res.ok) {
        setShop(res.data);
        // Band dukaan par seedha Plans (wahan kuch dikhne layak ho)
        setTab((cur) => cur ?? (!res.data.isOpen && res.data.planCount > 0 ? "plans" : "menu"));
      } else setError(res.status === 404 ? t("shop.notFound") : translateError(t, res.error));
    });
  }, [id, t]);

  // Login ho to: ye dukaan pasand me hai?
  useEffect(() => {
    if (!user || !id) return;
    getFavouriteIds().then((res) => {
      if (res.ok) setFav(res.data.items.some((f) => String(f.id) === id));
    });
  }, [user, id]);

  async function toggleFav() {
    if (!shop) return;
    if (!user) {
      router.push("/login");
      return;
    }
    const next = !fav;
    setFav(next); // turant dikhao, fail ho to wapas
    const res = await setFavourite(shop.id, next);
    if (!res.ok) setFav(!next);
  }

  async function share() {
    if (!shop) return;
    try {
      await Share.share({ message: t("share.text", { shop: shop.shopName }) });
    } catch {
      // customer ne band kar diya
    }
  }

  if (error) {
    return (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    );
  }

  if (!shop || !tab) {
    return (
      <View style={[styles.page, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  const photo = photoSrc(shop.photoUrl);
  const place = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
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
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{shop.shopName}</Text>
              <Text style={styles.muted}>
                {place} - {shop.pincode}
              </Text>
            </View>
            <Pressable onPress={share} accessibilityRole="button" accessibilityLabel={t("share.button")} style={styles.round}>
              <Text style={styles.roundText}>↗</Text>
            </Pressable>
            <Pressable
              onPress={toggleFav}
              accessibilityRole="button"
              accessibilityLabel={fav ? t("fav.remove") : t("fav.add")}
              accessibilityState={{ selected: fav }}
              style={[styles.round, fav && { borderColor: "#fecaca" }]}
            >
              <Text style={[styles.roundText, { color: fav ? "#ef4444" : colors.muted }]}>{fav ? "♥" : "♡"}</Text>
            </Pressable>
          </View>

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((k) => (
          <Chip
            key={k.key}
            label={k.key === "plans" && shop.planCount > 0 ? `${t(k.label)} (${shop.planCount})` : t(k.label)}
            active={tab === k.key}
            onPress={() => setTab(k.key)}
          />
        ))}
      </ScrollView>

      {tab === "menu" && <MenuTab shopId={shop.id} isOpen={shop.isOpen} />}
      {tab === "plans" && <PlansTab shopId={shop.id} />}
      {tab === "reviews" && <ReviewsTab shopId={shop.id} />}
      {tab === "info" && <InfoTab shop={shop} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: { backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  photo: { width: "100%", height: 190 },
  noPhoto: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2 },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  roundText: { fontSize: 20, color: colors.text },
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
  tabs: { gap: 8, paddingVertical: 16 },
});

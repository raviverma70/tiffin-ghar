import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { getReviews, type Review, type ShopDetail } from "@/lib/shops";
import { photoSrc } from "@/lib/photo";
import { formatDate } from "@/lib/days";
import { colors, radius } from "@/lib/theme";
import { translateError, useLocale, useT } from "@/i18n";
import { Button, ErrorText } from "@/components/ui";

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <Text accessibilityLabel={`${value} / 5`} style={{ fontSize: 16 }}>
      <Text style={{ color: "#f97316" }}>{"★".repeat(full)}</Text>
      <Text style={{ color: "#d1d5db" }}>{"★".repeat(5 - full)}</Text>
    </Text>
  );
}

export function ReviewsTab({ shopId }: { shopId: number }) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<Review[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async (p: number) => {
      setBusy(true);
      const res = await getReviews(String(shopId), p);
      setBusy(false);
      if (!res.ok) {
        setError(translateError(t, res.error));
        return;
      }
      setItems((prev) => (p === 1 ? res.data.items : [...(prev ?? []), ...res.data.items]));
      setTotal(res.data.total);
      setPage(p);
    },
    [shopId, t],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  if (error) return <ErrorText>{error}</ErrorText>;
  if (!items) return <ActivityIndicator color={colors.orange} style={{ marginVertical: 24 }} />;
  if (items.length === 0) return <Text style={styles.empty}>{t("reviews.empty")}</Text>;

  return (
    <View style={{ gap: 12 }}>
      {items.map((r) => (
        <View key={r.id} style={styles.card}>
          <View style={styles.row}>
            <Stars value={r.rating} />
            <Text style={styles.small}>{formatDate(r.createdAt, locale)}</Text>
          </View>
          {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
          {r.photos.length > 0 && (
            <View style={styles.photos}>
              {r.photos.map((p) => {
                const src = photoSrc(p.url);
                if (!src) return null;
                return (
                  <Pressable key={p.id} onPress={() => Linking.openURL(src)} accessibilityLabel={t("rphoto.open")}>
                    <Image source={{ uri: src }} style={styles.photo} accessibilityLabel={t("rev.photoAlt", { name: r.customer })} />
                  </Pressable>
                );
              })}
            </View>
          )}
          <Text style={styles.small}>{t("reviews.customer", { name: r.customer })}</Text>
        </View>
      ))}
      {items.length < total && (
        <Button title={t("reviews.older")} onPress={() => load(page + 1)} loading={busy} variant="outline" />
      )}
    </View>
  );
}

// Jaankari: jagah, khula/band, bharosa, khana, plans, payment
export function InfoTab({ shop }: { shop: ShopDetail }) {
  const t = useT();
  const place = [shop.area, shop.city].filter(Boolean).join(", ");
  const rows: [string, string][] = [
    [t("shop.infoPlace"), `📍 ${place} - ${shop.pincode}`],
    [t("shop.infoStatus"), shop.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow")],
    [t("shop.infoTrust"), shop.isVerified ? `✓ ${t("shop.verifiedLong")}` : t("shop.approvedLong")],
    [t("shop.infoFood"), shop.isPureVeg ? `🟢 ${t("shop.vegOnly")}` : t("shop.vegAndNonveg")],
    [t("shop.infoPlans"), `🗓️ ${t("home.plansCount", { n: shop.planCount })}`],
    [t("shop.infoPay"), t("shop.payNote")],
  ];
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.card}>
          <Text style={styles.label}>{k}</Text>
          <Text style={styles.comment}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  small: { fontSize: 12, color: colors.muted },
  comment: { fontSize: 15, color: colors.text, lineHeight: 21 },
  label: { fontSize: 11, fontWeight: "700", color: colors.muted, textTransform: "uppercase", letterSpacing: 0.5 },
  photos: { flexDirection: "row", gap: 8 },
  photo: { width: 84, height: 84, borderRadius: radius.md },
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

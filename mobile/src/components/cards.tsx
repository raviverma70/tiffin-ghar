import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { PlanCard as Plan, Shop } from "@/lib/shops";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { MEAL_ICON, MEAL_SHORT_KEY } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { useT } from "@/i18n";

// Rating ka badge: 4+ gehra hara, 3+ halka hara, kam ho to peela, review nahi to "Nayi"
export function RatingBadge({ rating, count }: { rating: number | null; count: number }) {
  const t = useT();
  if (!rating || count === 0) {
    return (
      <View style={[styles.badge, { backgroundColor: "#f3f4f6" }]}>
        <Text style={[styles.badgeText, { color: colors.textSoft }]}>{t("home.newShop")}</Text>
      </View>
    );
  }
  const bg = rating >= 4 ? "#16a34a" : rating >= 3 ? "#65a30d" : "#f59e0b";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: "#fff" }]}>{rating.toFixed(1)} ★</Text>
      </View>
      <Text style={styles.small}>{t("rating.count", { n: count })}</Text>
    </View>
  );
}

function Pill({ text, tone }: { text: string; tone: "blue" | "green" | "purple" | "orange" }) {
  const map = {
    blue: ["#eff6ff", "#1d4ed8"],
    green: ["#f0fdf4", "#15803d"],
    purple: ["#faf5ff", "#7e22ce"],
    orange: [colors.orange, "#fff"],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function ShopCard({ shop, onPress }: { shop: Shop; onPress: () => void }) {
  const t = useT();
  const photo = photoSrc(shop.photoUrl);
  const place = [shop.area, shop.city].filter(Boolean).join(", ");

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={shop.shopName}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <View>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" accessibilityIgnoresInvertColors />
        ) : (
          <View style={[styles.photo, styles.noPhoto]}>
            <Text style={{ fontSize: 40 }}>🍱</Text>
          </View>
        )}
        <View style={styles.overlay}>
          {shop.inArea && <Pill text={t("home.inArea")} tone="orange" />}
          {shop.distanceKm !== null && (
            <View style={styles.distance}>
              <Text style={styles.distanceText}>📍 {t("home.km", { km: shop.distanceKm })}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {shop.shopName}
          </Text>
          <RatingBadge rating={shop.rating} count={shop.ratingCount} />
        </View>
        <Text style={styles.muted}>{place}</Text>

        <View style={styles.pills}>
          {shop.isVerified && <Pill text={`✓ ${t("home.verified")}`} tone="blue" />}
          {shop.isPureVeg && <Pill text={`🟢 ${t("home.pureVeg")}`} tone="green" />}
          {shop.planCount > 0 && <Pill text={`🗓️ ${t("home.plansCount", { n: shop.planCount })}`} tone="purple" />}
        </View>

        {shop.todayPreview.length > 0 && (
          <Text style={styles.today} numberOfLines={2}>
            <Text style={{ fontWeight: "600", color: colors.text }}>{t("home.today")} </Text>
            {shop.todayPreview.map((d) => `${MEAL_ICON[d.mealTime]} ${d.name}`).join(" · ")}
          </Text>
        )}
        {shop.topReview && (
          <Text style={styles.review} numberOfLines={1}>
            “{shop.topReview.comment}”
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>
            {shop.startingPricePaise !== null ? t("home.startsAt", { price: formatPrice(shop.startingPricePaise) }) : ""}
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{t("home.viewMenu")} →</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const t = useT();
  const day1 = plan.dayMenus.flatMap((m) => m.dishes).slice(0, 4).join(", ");
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={plan.name}
      style={({ pressed }) => [styles.planCard, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.titleRow}>
        <Pill text={`🗓️ ${t("home.planDays", { n: plan.days })}`} tone="purple" />
        {plan.isVeg && <Text style={[styles.small, { color: colors.green }]}>🟢 {t("home.pureVeg")}</Text>}
      </View>
      <Text style={[styles.title, { marginTop: 8 }]} numberOfLines={2}>
        {plan.name}
      </Text>
      <Text style={styles.muted} numberOfLines={1}>
        {plan.provider.shopName}
      </Text>
      <RatingBadge rating={plan.provider.rating} count={plan.provider.ratingCount} />
      <Text style={styles.today}>{plan.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")}</Text>
      {day1 ? (
        <Text style={styles.muted} numberOfLines={2}>
          <Text style={{ fontWeight: "600" }}>{t("home.day1")}</Text> {day1}
        </Text>
      ) : null}
      <View style={[styles.footer, { marginTop: "auto" }]}>
        <View>
          <Text style={styles.bigPrice}>{formatPrice(plan.pricePaise)}</Text>
          <Text style={styles.small}>{t("home.perDay", { price: formatPrice(Math.round(plan.pricePaise / plan.days)) })}</Text>
        </View>
        <View style={[styles.cta, { backgroundColor: "#9333ea" }]}>
          <Text style={styles.ctaText}>{t("home.planView")} →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  photo: { width: "100%", height: 150 },
  noPhoto: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  overlay: { position: "absolute", top: 10, left: 10, flexDirection: "row", gap: 6, flexWrap: "wrap" },
  distance: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  distanceText: { fontSize: 12, fontWeight: "600", color: colors.text },
  body: { padding: 14, gap: 6 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { flex: 1, fontSize: 17, fontWeight: "700", color: colors.text },
  muted: { fontSize: 13, color: colors.muted },
  small: { fontSize: 12, color: colors.muted },
  badge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText: { fontSize: 13, fontWeight: "700" },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pill: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3 },
  pillText: { fontSize: 12, fontWeight: "600" },
  today: { fontSize: 14, color: colors.textSoft, lineHeight: 20 },
  review: { fontSize: 13, color: colors.muted, fontStyle: "italic" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8, gap: 8 },
  price: { fontSize: 14, fontWeight: "600", color: colors.text },
  bigPrice: { fontSize: 20, fontWeight: "700", color: colors.text },
  cta: { backgroundColor: colors.orange, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 7 },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  planCard: {
    width: 260,
    minHeight: 280,
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 14,
    gap: 6,
  },
});

import { StyleSheet, Text, View } from "react-native";
import type { OrderStatus, SubscriptionStatus } from "@/lib/orders";
import { colors } from "@/lib/theme";
import { useT, type MessageKey } from "@/i18n";

// Website jaise rang: neela = naya, peela = ban raha, baingani = raste me, hara = pahuncha, laal/grey = band
const ORDER_STYLE: Record<OrderStatus, [string, string]> = {
  PLACED: ["#eff6ff", "#1d4ed8"],
  ACCEPTED: ["#f0f9ff", "#0369a1"],
  PREPARING: ["#fffbeb", "#92400e"],
  OUT_FOR_DELIVERY: ["#f5f3ff", "#6d28d9"],
  DELIVERED: ["#f0fdf4", "#15803d"],
  REJECTED: ["#fef2f2", "#b91c1c"],
  CANCELLED: ["#f3f4f6", "#4b5563"],
};

const ORDER_ICON: Record<OrderStatus, string> = {
  PLACED: "🧾",
  ACCEPTED: "👍",
  PREPARING: "🍳",
  OUT_FOR_DELIVERY: "🛵",
  DELIVERED: "✅",
  REJECTED: "✖",
  CANCELLED: "✖",
};

const STEP_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "step.PLACED",
  ACCEPTED: "step.ACCEPTED",
  PREPARING: "step.PREPARING",
  OUT_FOR_DELIVERY: "step.OUT_FOR_DELIVERY",
  DELIVERED: "step.DELIVERED",
  REJECTED: "step.REJECTED",
  CANCELLED: "step.CANCELLED",
};

// Lamba text (detail me): "Order mil gaya, dukaan ke jawab ka intezaar"
export const ORDER_STATUS_KEY: Record<OrderStatus, MessageKey> = {
  PLACED: "status.PLACED",
  ACCEPTED: "status.ACCEPTED",
  PREPARING: "status.PREPARING",
  OUT_FOR_DELIVERY: "status.OUT_FOR_DELIVERY",
  DELIVERED: "status.DELIVERED",
  REJECTED: "status.REJECTED",
  CANCELLED: "status.CANCELLED",
};

const STEPS: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export const LIVE_STATUSES: OrderStatus[] = ["PLACED", "ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"];

function Badge({ bg, fg, text }: { bg: string; fg: string; text: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: fg + "33" }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{text}</Text>
    </View>
  );
}

export function OrderBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  const [bg, fg] = ORDER_STYLE[status];
  return <Badge bg={bg} fg={fg} text={`${ORDER_ICON[status]} ${t(STEP_KEY[status])}`} />;
}

const SUB_STYLE: Record<SubscriptionStatus, [string, string]> = {
  REQUESTED: ["#eff6ff", "#1d4ed8"],
  ACTIVE: ["#f0fdf4", "#15803d"],
  COMPLETED: ["#f3f4f6", "#374151"],
  REJECTED: ["#fef2f2", "#b91c1c"],
  CANCELLED: ["#fef2f2", "#b91c1c"],
};

const SUB_KEY: Record<SubscriptionStatus, MessageKey> = {
  REQUESTED: "sstatus.REQUESTED",
  ACTIVE: "sstatus.ACTIVE",
  COMPLETED: "sstatus.COMPLETED",
  REJECTED: "sstatus.REJECTED",
  CANCELLED: "sstatus.CANCELLED",
};

export function SubscriptionBadge({ status }: { status: SubscriptionStatus }) {
  const t = useT();
  const [bg, fg] = SUB_STYLE[status];
  return <Badge bg={bg} fg={fg} text={t(SUB_KEY[status])} />;
}

// Order kahan tak pahuncha: 5 kadam, ho chuke hare ✓, abhi wala orange
export function OrderTimeline({ status }: { status: OrderStatus }) {
  const t = useT();
  const current = STEPS.indexOf(status);
  return (
    <View style={styles.timeline} accessibilityLabel={t(ORDER_STATUS_KEY[status])}>
      {STEPS.map((step, i) => {
        const done = i < current || status === "DELIVERED";
        const now = i === current && status !== "DELIVERED";
        return (
          <View key={step} style={styles.step}>
            <View style={styles.lineRow}>
              <View style={[styles.line, { opacity: i === 0 ? 0 : 1 }, (done || now) && styles.lineOn]} />
              <View style={[styles.dot, done && styles.dotDone, now && styles.dotNow]}>
                <Text style={[styles.dotText, (done || now) && { color: "#fff" }]}>{done ? "✓" : ORDER_ICON[step]}</Text>
              </View>
              <View style={[styles.line, { opacity: i === STEPS.length - 1 ? 0 : 1 }, done && styles.lineOn]} />
            </View>
            <Text style={[styles.stepText, now && styles.stepNow, done && { color: colors.text }]} numberOfLines={2}>
              {t(STEP_KEY[step])}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },
  timeline: { flexDirection: "row" },
  step: { flex: 1, alignItems: "center" },
  lineRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  line: { flex: 1, height: 3, backgroundColor: "#e5e7eb", borderRadius: 2 },
  lineOn: { backgroundColor: "#22c55e" },
  dot: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  dotDone: { backgroundColor: "#22c55e" },
  dotNow: { backgroundColor: colors.orange, borderWidth: 3, borderColor: "#fed7aa" },
  dotText: { fontSize: 14, color: "#9ca3af" },
  stepText: { marginTop: 6, fontSize: 11, textAlign: "center", color: "#9ca3af" },
  stepNow: { color: colors.orangeDark, fontWeight: "700" },
});

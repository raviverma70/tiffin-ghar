import { StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { formatPrice } from "@/lib/format";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { Button, Card } from "@/components/ui";

// Order ho gaya. Order ka live status (timeline) Mobile Step 6 me "Mere orders" ke saath.
export default function OrderPlaced() {
  const t = useT();
  const { id, total } = useLocalSearchParams<{ id: string; total: string }>();
  const totalPaise = Number(total);

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: t("mshop.placed"), headerBackVisible: false }} />
      <Card style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 56 }}>✅</Text>
        <Text style={styles.title}>{t("mshop.placed")}</Text>
        <Text style={styles.text}>
          {t("mshop.placedText", {
            id: id ?? "-",
            total: Number.isFinite(totalPaise) ? formatPrice(totalPaise) : "-",
          })}
        </Text>
        <Button title={t("mshop.backHome")} onPress={() => router.replace("/")} style={{ alignSelf: "stretch" }} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: colors.bg, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, textAlign: "center" },
  text: { fontSize: 15, color: colors.textSoft, textAlign: "center", lineHeight: 22 },
});

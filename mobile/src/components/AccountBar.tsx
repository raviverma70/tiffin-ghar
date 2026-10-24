import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/auth/provider";
import { colors, radius } from "@/lib/theme";
import { useT } from "@/i18n";
import { Button } from "@/components/ui";

// Upar: login hai to number + Logout, nahi to Login button
export function AccountBar() {
  const t = useT();
  const { state, logout, reload } = useAuth();

  if (state.status === "loading") {
    return (
      <View style={styles.box}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }

  if (state.status === "offline") {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>{t("mlogin.offline")}</Text>
        <Button title={t("home.locRetry")} onPress={reload} variant="outline" />
      </View>
    );
  }

  if (state.status === "guest") {
    return (
      <View style={[styles.box, styles.row]}>
        <Text style={[styles.text, { flex: 1 }]}>{t("mlogin.guest")}</Text>
        <Button title={t("nav.login")} onPress={() => router.push("/login")} style={{ minHeight: 42 }} />
      </View>
    );
  }

  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Text style={[styles.text, { flex: 1, fontWeight: "600" }]}>
          👋 {t("mlogin.welcome", { phone: state.user.phone })}
        </Text>
        <Button title={t("nav.logout")} onPress={logout} variant="outline" style={{ minHeight: 42 }} />
      </View>
      {state.user.role === "PROVIDER" && <Text style={styles.note}>{t("mlogin.providerNote")}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orangeBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: 12,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { color: colors.text, fontSize: 15 },
  note: { color: colors.textSoft, fontSize: 13 },
});

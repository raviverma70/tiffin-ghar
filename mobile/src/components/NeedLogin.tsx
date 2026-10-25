import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/auth/provider";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { Button, Card } from "@/components/ui";

// Login wali screens: login nahi to "login karo", ho to andar ka content
export function NeedLogin({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <View style={styles.page}>
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }
  if (state.status !== "user") {
    return (
      <View style={styles.page}>
        <Card style={{ alignSelf: "stretch" }}>
          <Text style={styles.text}>{state.status === "offline" ? t("mlogin.offline") : t("mlogin.guest")}</Text>
          <Button title={t("nav.login")} onPress={() => router.push("/login")} />
        </Card>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 15, color: colors.textSoft, lineHeight: 21 },
});

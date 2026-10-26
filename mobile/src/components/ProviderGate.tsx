import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/auth/provider";
import { colors } from "@/lib/theme";
import { useT } from "@/i18n";
import { Card } from "@/components/ui";
import { NeedLogin } from "@/components/NeedLogin";

// Dukaan wale ki screens: login + role PROVIDER zaroori. Customer ko batao ki dukaan website se banti hai.
export function ProviderGate({ children }: { children: React.ReactNode }) {
  const t = useT();
  const { user } = useAuth();
  return (
    <NeedLogin>
      {user && user.role !== "PROVIDER" ? (
        <View style={styles.page}>
          <Card>
            <Text style={{ fontSize: 40 }}>🏪</Text>
            <Text style={styles.text}>{t("mdash.noProfile")}</Text>
          </Card>
        </View>
      ) : (
        children
      )}
    </NeedLogin>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, backgroundColor: colors.bg, justifyContent: "center" },
  text: { fontSize: 15, color: colors.textSoft, lineHeight: 22 },
});

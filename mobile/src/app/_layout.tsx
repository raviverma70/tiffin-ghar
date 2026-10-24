import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/auth/provider";
import { colors } from "@/lib/theme";

export default function RootLayout() {
  return (
    <I18nProvider>
      {/* AuthProvider bhasha ke andar: login ke baad bhasha sync karta hai */}
      <AuthProvider>
        <Stack
          screenOptions={{
            title: "Tiffin Ghar",
            headerTintColor: colors.orangeDark,
            headerTitleStyle: { fontWeight: "700", color: colors.text },
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
        <StatusBar style="dark" />
      </AuthProvider>
    </I18nProvider>
  );
}

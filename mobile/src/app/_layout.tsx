import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nProvider } from "@/i18n";

export default function RootLayout() {
  return (
    <I18nProvider>
      <Stack screenOptions={{ title: "Tiffin Ghar" }} />
      <StatusBar style="auto" />
    </I18nProvider>
  );
}

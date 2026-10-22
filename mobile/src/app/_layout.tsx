import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ title: "Tiffin Ghar" }} />
      <StatusBar style="auto" />
    </>
  );
}

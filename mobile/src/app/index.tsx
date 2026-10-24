import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { API_URL } from "@/lib/config";
import { translateError, useT } from "@/i18n";
import { LanguagePicker } from "@/components/LanguagePicker";
import { AccountBar } from "@/components/AccountBar";

// Test screen: backend se dukaanein aur bhasha badalna. Step 4 me asli dukaan list banegi.
const CITY = "Prayagraj";

type Shop = { id: number; shopName: string; city: string };

export default function Home() {
  const t = useT();
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Shop[] }>(`/providers?city=${encodeURIComponent(CITY)}`).then((res) => {
      if (res.ok) setShops(res.data.items);
      else setError(res.error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <AccountBar />
      <LanguagePicker />

      {error ? (
        <View style={styles.center}>
          {/* Backend ka Hinglish error, chuni bhasha me */}
          <Text style={styles.error}>{translateError(t, error)}</Text>
          <Text style={styles.muted}>{API_URL}</Text>
        </View>
      ) : !shops ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>{t("common.loading")}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>{t("home.shopsIn", { city: CITY })}</Text>
          <FlatList
            data={shops}
            keyExtractor={(s) => String(s.id)}
            renderItem={({ item }) => <Text style={styles.item}>{item.shopName}</Text>}
            ListEmptyComponent={<Text style={styles.muted}>{t("home.noShops", { city: CITY })}</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 20, fontWeight: "600" },
  item: { fontSize: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  error: { color: "#b91c1c", textAlign: "center" },
  muted: { color: "#6b7280", textAlign: "center" },
});

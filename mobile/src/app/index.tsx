import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { API_URL } from "@/lib/config";
import { DEFAULT_LOCALE, makeT, messagesFor } from "@/i18n";

// Step 1 ki test screen: dikhati hai ki phone backend tak pahunch raha hai. Step 4 me asli dukaan list banegi.
const t = makeT(messagesFor(DEFAULT_LOCALE));
const CITY = "Prayagraj";

type Shop = { id: number; shopName: string; city: string };

export default function Home() {
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/providers?city=${encodeURIComponent(CITY)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(t("err.generic"));
        const data: { items: Shop[] } = await res.json();
        setShops(data.items);
      })
      .catch(() => setError(t("err.network")));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.muted}>{API_URL}</Text>
      </View>
    );
  }

  if (!shops) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("home.shopsIn", { city: CITY })}</Text>
      <FlatList
        data={shops}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => <Text style={styles.item}>{item.shopName}</Text>}
        ListEmptyComponent={<Text style={styles.muted}>{t("home.noShops", { city: CITY })}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  item: { fontSize: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  error: { color: "#b91c1c", textAlign: "center" },
  muted: { color: "#6b7280", textAlign: "center" },
});

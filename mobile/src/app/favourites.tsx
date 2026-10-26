import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { getFavourites, setFavourite, type FavouriteShop } from "@/lib/shops";
import { photoSrc } from "@/lib/photo";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { RatingBadge } from "@/components/cards";
import { NeedLogin } from "@/components/NeedLogin";
import { Button, ErrorText } from "@/components/ui";

function FavList() {
  const t = useT();
  const [items, setItems] = useState<FavouriteShop[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getFavourites();
    setLoading(false);
    if (res.ok) {
      setItems(res.data.items);
      setError("");
    } else setError(translateError(t, res.error));
  }, [t]);

  // Dukaan ke page par ♥ badla ho to wapas aane par taaza
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function remove(id: number) {
    setItems((list) => (list ?? []).filter((f) => f.id !== id)); // turant hatao
    const res = await setFavourite(id, false);
    if (!res.ok) void load(); // fail ho to wapas lao
  }

  if (!items && !error) return <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />;

  return (
    <FlatList
      data={items ?? []}
      keyExtractor={(f) => String(f.id)}
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.orange} />}
      ListHeaderComponent={error ? <ErrorText>{error}</ErrorText> : null}
      ListEmptyComponent={
        !error ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 40 }}>♡</Text>
            <Text style={styles.muted}>{t("fav.empty")}</Text>
            <Button title={t("orders.emptyCta")} onPress={() => router.replace("/")} />
          </View>
        ) : null
      }
      renderItem={({ item: f }) => {
        const photo = photoSrc(f.photoUrl);
        return (
          <Pressable
            onPress={() => router.push({ pathname: "/shop/[id]", params: { id: String(f.id) } })}
            accessibilityRole="button"
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.noThumb]}>
                <Text style={{ fontSize: 30 }}>🍱</Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.name} numberOfLines={1}>
                {f.shopName}
              </Text>
              <Text style={styles.small} numberOfLines={1}>
                {[f.area, f.city].filter(Boolean).join(", ")}
              </Text>
              <RatingBadge rating={f.rating} count={f.ratingCount} />
              <Text style={[styles.small, { color: f.isOpen ? colors.green : colors.muted, fontWeight: "600" }]}>
                {f.isOpen ? `● ${t("shop.open")}` : t("shop.closedNow")}
              </Text>
            </View>
            <Pressable
              onPress={() => remove(f.id)}
              accessibilityRole="button"
              accessibilityLabel={t("fav.remove")}
              hitSlop={10}
              style={styles.heart}
            >
              <Text style={{ fontSize: 22, color: "#ef4444" }}>♥</Text>
            </Pressable>
          </Pressable>
        );
      }}
    />
  );
}

export default function FavouritesScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("fav.title") }} />
      <NeedLogin>
        <FavList />
      </NeedLogin>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1 },
  card: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  thumb: { width: 76, height: 76, borderRadius: radius.md },
  noThumb: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  small: { fontSize: 12, color: colors.muted },
  heart: { padding: 6 },
  muted: { fontSize: 15, color: colors.textSoft, textAlign: "center" },
  empty: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
  },
});

import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, router, useFocusEffect } from "expo-router";
import { deleteMenuItem, getMyMenu, updateMenuItem, type MyMenuItem } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { DAY_KEY } from "@/lib/days";
import { MEAL_ICON, MEAL_KEY, type MealTime } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, ErrorText } from "@/components/ui";

const MEALS: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];

function MenuList() {
  const t = useT();
  const [items, setItems] = useState<MyMenuItem[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMyMenu();
    setLoading(false);
    if (res.ok) {
      setItems(res.data);
      setError("");
    } else setError(translateError(t, res.error));
  }, [t]);

  // Form se wapas aao to taaza list
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function toggle(item: MyMenuItem) {
    setBusyId(item.id);
    const res = await updateMenuItem(item.id, { isAvailable: !item.isAvailable });
    setBusyId(null);
    if (!res.ok) setError(translateError(t, res.error));
    void load();
  }

  function askDelete(item: MyMenuItem) {
    Alert.alert(item.name, t("menu.confirmDelete"), [
      { text: t("mcommon.no"), style: "cancel" },
      {
        text: t("mcommon.yes"),
        style: "destructive",
        onPress: async () => {
          setBusyId(item.id);
          const res = await deleteMenuItem(item.id);
          setBusyId(null);
          if (!res.ok) setError(translateError(t, res.error));
          void load();
        },
      },
    ]);
  }

  const edit = (id?: number) =>
    router.push({ pathname: "/dashboard/menu-item", params: id ? { id: String(id) } : {} });

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      refreshControl={<RefreshControl refreshing={loading && items !== null} onRefresh={load} tintColor={colors.orange} />}
    >
      <Text style={styles.hint}>{t("menu.hint")}</Text>
      <Button title={`+ ${t("menu.formAdd")}`} onPress={() => edit()} />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {items === null && <ActivityIndicator color={colors.orange} style={{ marginTop: 24 }} />}
      {items && items.length === 0 && <Text style={styles.empty}>{t("menu.empty")}</Text>}

      {items &&
        MEALS.map((meal) => {
          const group = items.filter((i) => i.mealTime === meal);
          if (group.length === 0) return null;
          return (
            <View key={meal} style={{ gap: 10 }}>
              <Text style={styles.h3}>
                {MEAL_ICON[meal]} {t(MEAL_KEY[meal])} ({group.length})
              </Text>
              {group.map((item) => {
                const photo = photoSrc(item.photoUrl);
                return (
                  <View key={item.id} style={[styles.card, !item.isAvailable && { opacity: 0.6 }]}>
                    <View style={styles.row}>
                      {photo ? (
                        <Image source={{ uri: photo }} style={styles.thumb} />
                      ) : (
                        <View style={[styles.thumb, styles.noThumb]}>
                          <Text style={{ fontSize: 24 }}>🍱</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text style={styles.name}>
                          <Text style={{ color: item.isVeg ? colors.green : colors.red }}>● </Text>
                          {item.name}
                        </Text>
                        {item.description ? (
                          <Text style={styles.small} numberOfLines={2}>
                            {item.description}
                          </Text>
                        ) : null}
                        <Text style={styles.small}>
                          {item.dayOfWeek === null ? t("menu.everyDay") : t(DAY_KEY[item.dayOfWeek])} ·{" "}
                          {item.isAvailable ? t("menu.on") : t("menu.off")}
                        </Text>
                      </View>
                      <Text style={styles.price}>{formatPrice(item.pricePaise)}</Text>
                    </View>
                    <View style={styles.actions}>
                      <Button
                        title={item.isAvailable ? t("menu.turnOff") : t("menu.turnOn")}
                        onPress={() => toggle(item)}
                        variant="outline"
                        loading={busyId === item.id}
                        style={styles.action}
                      />
                      <Button title={t("common.edit")} onPress={() => edit(item.id)} variant="outline" style={styles.action} />
                      <Button title={t("common.remove")} onPress={() => askDelete(item)} variant="outline" style={styles.action} />
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
    </ScrollView>
  );
}

export default function MyMenuScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("menu.title") }} />
      <ProviderGate>
        <MenuList />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 40, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  hint: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  h3: { fontSize: 16, fontWeight: "700", color: colors.textSoft },
  card: { backgroundColor: "#fff", borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  thumb: { width: 60, height: 60, borderRadius: radius.md },
  noThumb: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  small: { fontSize: 12, color: colors.muted },
  price: { fontSize: 16, fontWeight: "800", color: colors.orangeDark },
  actions: { flexDirection: "row", gap: 8 },
  action: { flex: 1, minHeight: 38, paddingHorizontal: 6 },
  empty: {
    textAlign: "center",
    color: colors.textSoft,
    padding: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
  },
});

import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { getTodayMenu, placeOrder, type MenuItem } from "@/lib/shops";
import { formatPrice } from "@/lib/format";
import { photoSrc } from "@/lib/photo";
import { MEAL_ICON, MEAL_KEY, type MealTime } from "@/lib/meals";
import { colors, radius } from "@/lib/theme";
import { useAuth } from "@/auth/provider";
import { DAY_KEY } from "@/lib/days";
import { translateError, useT } from "@/i18n";
import { Button, Card, ErrorText, Field } from "@/components/ui";

const MAX_QTY = 20;
const MEAL_ORDER: MealTime[] = ["BREAKFAST", "LUNCH", "DINNER"];

// Aaj ka menu, quantity (+/-), aur neeche order ka form (COD)
export function MenuTab({ shopId, isOpen }: { shopId: number; isOpen: boolean }) {
  const t = useT();
  const { user } = useAuth();
  const [menu, setMenu] = useState<{ day: number; items: MenuItem[] } | null>(null);
  const [loadError, setLoadError] = useState("");
  const [qty, setQty] = useState<Record<number, number>>({});
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    getTodayMenu(String(shopId)).then((res) => {
      if (res.ok) setMenu(res.data);
      else setLoadError(res.status === 404 ? t("shop.closed") : translateError(t, res.error));
    });
  }, [shopId, isOpen, t]);

  if (!isOpen) return <Text style={styles.empty}>{t("shop.closedMenu")}</Text>;
  if (loadError) return <ErrorText>{loadError}</ErrorText>;
  if (!menu) return <ActivityIndicator color={colors.orange} style={{ marginVertical: 24 }} />;

  const lines = menu.items.filter((i) => (qty[i.id] ?? 0) > 0);
  const total = lines.reduce((sum, i) => sum + i.pricePaise * (qty[i.id] ?? 0), 0);
  const count = lines.reduce((sum, i) => sum + (qty[i.id] ?? 0), 0);

  function change(id: number, delta: number) {
    setQty((prev) => ({ ...prev, [id]: Math.min(MAX_QTY, Math.max(0, (prev[id] ?? 0) + delta)) }));
  }

  async function submit() {
    setError("");
    if (address.trim().length < 10) {
      setError(t("err.addressRequired"));
      return;
    }
    setBusy(true);
    const res = await placeOrder({
      providerId: shopId,
      items: lines.map((i) => ({ menuItemId: i.id, quantity: qty[i.id] ?? 0 })),
      deliveryAddress: address.trim(),
      note: note.trim() || undefined,
    });
    setBusy(false);
    if (!res.ok) {
      setError(translateError(t, res.error));
      return;
    }
    router.replace({
      pathname: "/order-placed",
      params: { id: String(res.data.id), total: String(res.data.totalPaise) },
    });
  }

  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.h3}>{t("shop.todayMenu", { day: t(DAY_KEY[menu.day]) })}</Text>
      {menu.items.length === 0 && <Text style={styles.empty}>{t("shop.noItems")}</Text>}

      {MEAL_ORDER.map((meal) => {
        const group = menu.items.filter((i) => i.mealTime === meal);
        if (group.length === 0) return null;
        return (
          <View key={meal} style={{ gap: 10 }}>
            <Text style={styles.mealTitle}>{MEAL_ICON[meal]} {t(MEAL_KEY[meal])}</Text>
            {group.map((item) => {
              const n = qty[item.id] ?? 0;
              const photo = photoSrc(item.photoUrl);
              return (
                <View key={item.id} style={[styles.item, n > 0 && styles.itemOn]}>
                  {photo ? (
                    <Image source={{ uri: photo }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.noThumb]}>
                      <Text style={{ fontSize: 26 }}>🍱</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.itemName}>
                      <Text style={{ color: item.isVeg ? colors.green : colors.red }}>● </Text>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text style={styles.small} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                    <Text style={styles.price}>{formatPrice(item.pricePaise)}</Text>
                  </View>
                  {user && (
                    <View style={styles.qty}>
                      <Pressable
                        onPress={() => change(item.id, -1)}
                        accessibilityRole="button"
                        accessibilityLabel={`${t("of.less")}: ${item.name}`}
                        style={[styles.qtyBtn, styles.qtyMinus]}
                      >
                        <Text style={styles.qtyMinusText}>−</Text>
                      </Pressable>
                      <Text style={styles.qtyNum} accessibilityLiveRegion="polite">
                        {n}
                      </Text>
                      <Pressable
                        onPress={() => change(item.id, 1)}
                        accessibilityRole="button"
                        accessibilityLabel={`${t("of.more")}: ${item.name}`}
                        style={[styles.qtyBtn, styles.qtyPlus]}
                      >
                        <Text style={styles.qtyPlusText}>+</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}

      {!user && menu.items.length > 0 && (
        <Card style={{ backgroundColor: colors.orangeSoft, borderColor: colors.orangeBorder }}>
          <Text style={styles.text}>{t("of.loginFirst")}</Text>
          <Button title={t("of.loginButton")} onPress={() => router.push("/login")} />
        </Card>
      )}

      {user && menu.items.length > 0 && (
        <Card>
          <Text style={styles.h3}>{t("of.title")}</Text>
          <Text style={styles.text}>
            {count === 0 ? t("of.pick") : t("of.summary", { count, total: formatPrice(total) })}
          </Text>
          <Field
            label={t("of.addrPh")}
            value={address}
            onChangeText={setAddress}
            multiline
            maxLength={250}
            style={{ minHeight: 76, textAlignVertical: "top", paddingTop: 12 }}
          />
          <Field label={t("of.notePh")} value={note} onChangeText={setNote} maxLength={200} />
          {error ? <ErrorText>{error}</ErrorText> : null}
          <Button
            title={count > 0 ? `${t("of.submit")} · ${formatPrice(total)}` : t("of.submit")}
            onPress={submit}
            loading={busy}
            disabled={count === 0}
          />
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  h3: { fontSize: 19, fontWeight: "700", color: colors.text },
  mealTitle: { fontSize: 15, fontWeight: "700", color: colors.textSoft },
  empty: {
    color: colors.textSoft,
    padding: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#d1d5db",
    borderRadius: radius.xl,
    backgroundColor: "#fff",
    lineHeight: 21,
  },
  item: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
  },
  itemOn: { borderColor: colors.orange, backgroundColor: colors.orangeSoft },
  thumb: { width: 72, height: 72, borderRadius: radius.md },
  noThumb: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: colors.text },
  small: { fontSize: 13, color: colors.muted },
  price: { fontSize: 15, fontWeight: "700", color: colors.orangeDark },
  qty: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  qtyMinus: { borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#fff" },
  qtyPlus: { backgroundColor: colors.orange },
  qtyMinusText: { fontSize: 20, color: colors.text, fontWeight: "600" },
  qtyPlusText: { fontSize: 20, color: "#fff", fontWeight: "700" },
  qtyNum: { minWidth: 18, textAlign: "center", fontSize: 16, fontWeight: "700", color: colors.text },
  text: { fontSize: 15, color: colors.textSoft, lineHeight: 21 },
});

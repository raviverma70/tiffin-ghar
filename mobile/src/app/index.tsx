import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { getAreas, getCities, getPlans, getShops, type PlanCard as Plan, type Shop } from "@/lib/shops";
import { useLocation } from "@/lib/useLocation";
import { API_URL } from "@/lib/config";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { AccountBar } from "@/components/AccountBar";
import { LanguagePicker } from "@/components/LanguagePicker";
import { PlanCard, ShopCard } from "@/components/cards";
import { Chip } from "@/components/Chip";
import { Button, ErrorText } from "@/components/ui";

// Backend se shehar na mile to ye
const FALLBACK_CITIES = ["Prayagraj", "Lucknow", "Varanasi", "Kanpur", "Delhi", "Mumbai"];

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Home() {
  const t = useT();
  const { state: loc, ask, clear } = useLocation();
  const coords = loc.status === "ready" ? loc.coords : null;

  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState<string | undefined>();
  const [area, setArea] = useState<string | undefined>();
  const [sort, setSort] = useState<"distance" | "rating" | undefined>();
  const [veg, setVeg] = useState(false);

  const [shops, setShops] = useState<Shop[] | null>(null);
  const [activeSort, setActiveSort] = useState<"distance" | "rating">("rating");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>(FALLBACK_CITIES);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const listing = Boolean(city || coords);

  // Dukaanein + plans (shehar, area, sort, veg ya location badle to)
  const load = useCallback(async () => {
    if (!city && !coords) {
      setShops(null);
      setPlans([]);
      return;
    }
    setLoading(true);
    setError("");
    const res = await getShops({
      city,
      area,
      sort: sort === "distance" && !coords ? undefined : sort,
      veg,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    });
    if (!res.ok) {
      setError(translateError(t, res.error));
      setShops([]);
      setLoading(false);
      return;
    }
    setShops(res.data.items);
    setActiveSort(res.data.sort);
    const planCity = city ?? res.data.items[0]?.city;
    const planRes = planCity ? await getPlans(planCity, area) : null;
    setPlans(planRes?.ok ? planRes.data.items : []);
    setLoading(false);
  }, [city, area, sort, veg, coords, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Shehar chuna: uske area
  useEffect(() => {
    if (!city) return;
    getAreas(city).then((res) => setAreas(res.ok ? res.data.items.map((a) => a.area) : []));
  }, [city]);

  // Shehar ke button backend se
  useEffect(() => {
    getCities().then((res) => {
      if (res.ok && res.data.items.length > 0) setCities(res.data.items.map((c) => titleCase(c.city)));
    });
  }, []);

  function pickCity(c: string | undefined) {
    setCity(c);
    setArea(undefined);
    setAreas([]);
    setCityInput(c ?? "");
  }

  const openShop = (id: number) => router.push({ pathname: "/shop/[id]", params: { id: String(id) } });

  const header = (
    <View style={styles.header}>
      <AccountBar />
      <LanguagePicker />

      <View>
        <Text style={styles.hero}>
          {t("home.heroA")} <Text style={{ color: colors.orange }}>{t("home.heroB")}</Text>
        </Text>
        <Text style={styles.heroSub}>{t("home.heroSub")}</Text>
      </View>

      {/* Location */}
      <View style={styles.locBox}>
        {loc.status === "asking" ? (
          <View style={styles.row}>
            <ActivityIndicator color={colors.orange} />
            <Text style={styles.locText}>{t("home.locAsking")}</Text>
          </View>
        ) : coords ? (
          <View style={styles.row}>
            <Text style={[styles.locText, { color: colors.green, flex: 1, fontWeight: "600" }]}>📍 {t("home.locOn")}</Text>
            <Pressable onPress={clear} accessibilityRole="button">
              <Text style={styles.link}>{t("home.locClear")}</Text>
            </Pressable>
          </View>
        ) : loc.status === "blocked" ? (
          <>
            <Text style={styles.locText}>{t("mhome.blocked")}</Text>
            <Button title={t("mhome.openSettings")} onPress={() => Linking.openSettings()} variant="outline" />
          </>
        ) : (
          <>
            <Button title={`📍 ${loc.status === "idle" ? t("home.locBtn") : t("home.locRetry")}`} onPress={ask} variant="outline" />
            <Text style={styles.small}>
              {loc.status === "denied" || loc.status === "failed" ? t("home.locDenied") : t("home.locWhy")}
            </Text>
          </>
        )}
      </View>

      {/* Shehar */}
      <View style={styles.row}>
        <TextInput
          value={cityInput}
          onChangeText={setCityInput}
          placeholder={t("home.searchPlaceholder")}
          placeholderTextColor={colors.muted}
          accessibilityLabel={t("home.searchPlaceholder")}
          returnKeyType="search"
          onSubmitEditing={() => pickCity(cityInput.trim() || undefined)}
          style={styles.search}
        />
        <Button title={t("home.search")} onPress={() => pickCity(cityInput.trim() || undefined)} style={{ minHeight: 48 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {cities.map((c) => (
          <Chip key={c} label={c} active={city?.toLowerCase() === c.toLowerCase()} onPress={() => pickCity(c)} />
        ))}
      </ScrollView>

      {listing && (
        <>
          <Text style={styles.h2}>
            {city ? t("home.shopsIn", { city: titleCase(city) }) : t("home.nearYou")}{" "}
            {shops ? <Text style={styles.count}>{t("home.resultCount", { n: shops.length })}</Text> : null}
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {coords && <Chip label={`📍 ${t("home.sortNear")}`} active={activeSort === "distance"} onPress={() => setSort("distance")} />}
            <Chip label={`⭐ ${t("home.sortRating")}`} active={activeSort === "rating"} onPress={() => setSort("rating")} />
            <Chip label={`🟢 ${t("home.veg")}`} active={veg} onPress={() => setVeg((v) => !v)} tone="green" />
          </ScrollView>

          {city && areas.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              <Chip label={t("home.allAreas")} active={!area} onPress={() => setArea(undefined)} />
              {areas.map((a) => (
                <Chip key={a} label={a} active={area?.toLowerCase() === a.toLowerCase()} onPress={() => setArea(a)} />
              ))}
            </ScrollView>
          )}

          {error ? <ErrorText>{error}</ErrorText> : null}
          {/* Development me: app kis address par backend dhundh raha hai (galat IP turant dikhe) */}
          {error && __DEV__ ? <Text style={styles.small}>API: {API_URL}</Text> : null}
        </>
      )}
    </View>
  );

  const footer = (
    <View style={{ gap: 12, paddingBottom: 32 }}>
      {plans.length > 0 && (
        <View style={{ gap: 4 }}>
          <Text style={styles.h2}>🗓️ {t("home.plansTitle")}</Text>
          <Text style={styles.small}>{t("home.plansSub")}</Text>
          <FlatList
            data={plans}
            horizontal
            keyExtractor={(p) => String(p.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingVertical: 8 }}
            renderItem={({ item }) => (
              <PlanCard plan={item} onPress={() => router.push({ pathname: "/plan/[id]", params: { id: String(item.id) } })} />
            )}
          />
        </View>
      )}
      {!listing && (
        <View style={styles.how}>
          {[
            ["📍", t("home.step1Title"), t("home.step1Text")],
            ["🍛", t("home.step2Title"), t("home.step2Text")],
            ["🛵", t("home.step3Title"), t("home.step3Text")],
          ].map(([icon, title, text]) => (
            <View key={title} style={styles.howItem}>
              <Text style={{ fontSize: 28 }}>{icon}</Text>
              <Text style={styles.howTitle}>{title}</Text>
              <Text style={styles.small}>{text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FlatList
      data={listing ? (shops ?? []) : []}
      keyExtractor={(s) => String(s.id)}
      renderItem={({ item }) => <ShopCard shop={item} onPress={() => openShop(item.id)} />}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ListEmptyComponent={
        listing ? (
          loading ? (
            <ActivityIndicator color={colors.orange} style={{ marginVertical: 24 }} />
          ) : (
            <Text style={styles.empty}>{city ? t("home.noShops", { city: titleCase(city) }) : t("home.noShopsNear")}</Text>
          )
        ) : null
      }
      contentContainerStyle={styles.page}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      refreshControl={<RefreshControl refreshing={loading && shops !== null} onRefresh={load} tintColor={colors.orange} />}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: colors.bg },
  header: { gap: 14, marginBottom: 14 },
  hero: { fontSize: 28, fontWeight: "800", color: colors.text, lineHeight: 34 },
  heroSub: { fontSize: 15, color: colors.textSoft, marginTop: 6, lineHeight: 21 },
  locBox: { gap: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  locText: { fontSize: 14, color: colors.text },
  link: { color: colors.muted, textDecorationLine: "underline", fontSize: 14 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 18 },
  search: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#fff",
    color: colors.text,
  },
  chips: { gap: 8, paddingVertical: 2 },
  h2: { fontSize: 22, fontWeight: "800", color: colors.text },
  count: { fontSize: 14, fontWeight: "500", color: colors.muted },
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
  how: { gap: 12 },
  howItem: { backgroundColor: "#fff", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 4 },
  howTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
});

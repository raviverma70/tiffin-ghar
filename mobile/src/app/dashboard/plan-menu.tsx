import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, useNavigation } from "expo-router";
import { deletePlan, getMyPlan, savePlanMenu, updatePlan, type MyPlan } from "@/lib/provider";
import { formatPrice } from "@/lib/format";
import { MEAL_ICON, MEAL_KEY, MEAL_SHORT_KEY, type MealTime } from "@/lib/meals";
import { DISH_SUGGESTIONS } from "@/lib/suggestions";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, ErrorText } from "@/components/ui";

// "3:LUNCH" -> dishes (website ke menu-grid jaisa)
type Cells = Record<string, string[]>;
const key = (day: number, meal: MealTime) => `${day}:${meal}`;

function toCells(menus: MyPlan["dayMenus"]): Cells {
  const cells: Cells = {};
  for (const m of menus) cells[key(m.day, m.mealTime)] = [...m.dishes];
  return cells;
}

function itemsOf(plan: MyPlan, cells: Cells) {
  const out: { day: number; mealTime: MealTime; dishes: string[] }[] = [];
  for (let day = 1; day <= plan.days; day++)
    for (const mealTime of plan.mealTimes) out.push({ day, mealTime, dishes: cells[key(day, mealTime)] ?? [] });
  return out;
}

// Ek din ke ek time ki dishes: chips (× se hatao) + likhne ka box + suggestions
function DishCell({ meal, dishes, onChange }: { meal: MealTime; dishes: string[]; onChange: (d: string[]) => void }) {
  const t = useT();
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  function add(raw: string) {
    // "Dal, Chawal" likho to dono jud jayein; same dish do baar nahi, 12 se zyada nahi
    const next = [...dishes];
    for (const piece of raw.split(",")) {
      const dish = piece.trim().slice(0, 60);
      if (dish && !next.some((d) => d.toLowerCase() === dish.toLowerCase()) && next.length < 12) next.push(dish);
    }
    onChange(next);
    setDraft("");
  }

  const suggestions = DISH_SUGGESTIONS[meal].filter(
    (s) => !dishes.some((d) => d.toLowerCase() === s.toLowerCase()) && s.toLowerCase().includes(draft.trim().toLowerCase()),
  );

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.mealLabel}>
        {MEAL_ICON[meal]} {t(MEAL_KEY[meal])}
      </Text>
      <View style={[styles.cell, dishes.length === 0 && styles.cellEmpty]}>
        {dishes.map((d) => (
          <Pressable
            key={d}
            onPress={() => onChange(dishes.filter((x) => x !== d))}
            accessibilityRole="button"
            accessibilityLabel={t("plans.removeDish", { dish: d })}
            style={styles.dish}
          >
            <Text style={styles.dishText}>{d}  ×</Text>
          </Pressable>
        ))}
        <TextInput
          value={draft}
          onChangeText={(v) => (v.endsWith(",") ? add(v) : setDraft(v))}
          onSubmitEditing={() => draft.trim() && add(draft)}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            if (draft.trim()) add(draft);
            setOpen(false);
          }}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder={dishes.length === 0 ? t("plans.dishPh") : "+"}
          placeholderTextColor={colors.muted}
          accessibilityLabel={`${t(MEAL_KEY[meal])}: ${t("plans.addDish")}`}
          maxLength={60}
          style={styles.cellInput}
        />
      </View>
      {open && suggestions.length > 0 && (
        <ScrollView horizontal keyboardShouldPersistTaps="always" showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {suggestions.slice(0, 10).map((s) => (
            <Pressable key={s} onPress={() => add(s)} accessibilityRole="button" style={styles.sugg}>
              <Text style={styles.suggText}>+ {s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function PlanMenu({ id }: { id: string }) {
  const t = useT();
  const navigation = useNavigation();
  const [plan, setPlan] = useState<MyPlan | null>(null);
  const [cells, setCells] = useState<Cells>({});
  const [savedJson, setSavedJson] = useState("");
  const [day, setDay] = useState(1);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "toggle" | "delete">("");

  const json = plan ? JSON.stringify(itemsOf(plan, cells)) : "";
  const dirty = plan !== null && json !== savedJson;
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  // Server ka plan aaye to cells bhi wahi (lekin bina save badlav ho to unhe mat mitao)
  const apply = useCallback((p: MyPlan, force: boolean) => {
    setPlan(p);
    setDay((d) => Math.min(d, p.days));
    if (force || !dirtyRef.current) {
      const c = toCells(p.dayMenus);
      setCells(c);
      setSavedJson(JSON.stringify(itemsOf(p, c)));
    }
  }, []);

  const load = useCallback(async () => {
    const res = await getMyPlan(id);
    if (res.ok) {
      apply(res.data, false);
      setError("");
    } else setError(res.status === 404 ? t("plans.notFound") : translateError(t, res.error));
  }, [id, t, apply]);

  // Settings badal kar wapas aao to din/time naye
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  // Bina save kiye peeche jaane lago to poochho
  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      Alert.alert(t("plans.unsaved"), t("mplan.leaveMsg"), [
        { text: t("mplan.stay"), style: "cancel" },
        { text: t("mplan.leave"), style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
      ]);
    });
  }, [navigation, t]);

  if (!plan) {
    return error ? (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    ) : (
      <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
    );
  }

  const p = plan;
  const dayList = Array.from({ length: p.days }, (_, i) => i + 1);
  const total = p.days * p.mealTimes.length;
  const filledAt = (d: number) => p.mealTimes.filter((m) => (cells[key(d, m)]?.length ?? 0) > 0).length;
  const filled = dayList.reduce((n, d) => n + filledAt(d), 0);
  const savedComplete = p.dayMenus.length >= total;

  const setCell = (meal: MealTime, dishes: string[]) => setCells((c) => ({ ...c, [key(day, meal)]: dishes }));

  function copyDay(targets: number[]) {
    setCells((c) => {
      const next = { ...c };
      for (const to of targets) for (const m of p.mealTimes) next[key(to, m)] = [...(c[key(day, m)] ?? [])];
      return next;
    });
  }

  // Din 8 = Din 1, Din 9 = Din 2 ... (har hafte wahi menu)
  function repeatWeek() {
    setCells((c) => {
      const next = { ...c };
      for (let d = 8; d <= p.days; d++) for (const m of p.mealTimes) next[key(d, m)] = [...(c[key(((d - 1) % 7) + 1, m)] ?? [])];
      return next;
    });
  }

  async function save() {
    setError("");
    setNotice("");
    setBusy("save");
    // Khali jagah backend nahi leta, isliye sirf bhari hui bhejo
    const res = await savePlanMenu(p.id, itemsOf(p, cells).filter((i) => i.dishes.length > 0));
    setBusy("");
    if (!res.ok) return setError(translateError(t, res.error));
    apply(res.data, true);
    setNotice(t("plans.saved"));
  }

  async function toggle() {
    setError("");
    setNotice("");
    setBusy("toggle");
    const res = await updatePlan(p.id, { isActive: !p.isActive });
    setBusy("");
    if (res.ok) apply(res.data, false);
    else setError(translateError(t, res.error));
  }

  function askDelete() {
    Alert.alert(p.name, t("plans.confirmDelete"), [
      { text: t("mcommon.no"), style: "cancel" },
      {
        text: t("mcommon.yes"),
        style: "destructive",
        onPress: async () => {
          setBusy("delete");
          const res = await deletePlan(p.id);
          setBusy("");
          if (!res.ok) return setError(translateError(t, res.error));
          if (res.data.deleted) {
            dirtyRef.current = false;
            router.back();
          } else {
            setNotice(t("plans.deactivated"));
            void load();
          }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" stickyHeaderIndices={[1]}>
        {/* 0: plan ki jaankari + chalu/band */}
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.title}>{p.name}</Text>
            <Text style={styles.muted}>
              {t("plans.daysN", { n: p.days })} · {p.mealTimes.map((m) => `${MEAL_ICON[m]} ${t(MEAL_SHORT_KEY[m])}`).join(" + ")} ·{" "}
              <Text style={styles.price}>{formatPrice(p.pricePaise)}</Text>
            </Text>
          </View>
          <Text style={[styles.status, p.isActive ? styles.on : styles.off]}>
            {p.isActive ? `● ${t("plans.activeNote")}` : `○ ${t("plans.inactiveNote")}`}
          </Text>
          <Button
            title={p.isActive ? t("plans.turnOff") : t("plans.turnOn")}
            onPress={toggle}
            loading={busy === "toggle"}
            disabled={!p.isActive && (!savedComplete || dirty)}
            variant={p.isActive ? "outline" : "primary"}
            style={p.isActive ? undefined : { backgroundColor: colors.green }}
          />
          {!p.isActive && (!savedComplete || dirty) ? <Text style={styles.small}>{t("mplan.fillFirst")}</Text> : null}
          <Button
            title={`⚙️ ${t("plans.settings")}`}
            onPress={() => router.push({ pathname: "/dashboard/plan-form", params: { id: String(p.id) } })}
            variant="outline"
          />
          <Text style={styles.h2}>{t("plans.menuTitle")}</Text>
          <Text style={styles.small}>{t("plans.menuHint")}</Text>
        </View>

        {/* 1: upar chipka hua: kitna bhara + save + din chuno */}
        <View style={styles.sticky}>
          <View style={styles.rowBetween}>
            <Text style={styles.progressText}>
              {filled === total ? `✓ ${t("plans.complete")}` : t("plans.missing", { n: total - filled })}
            </Text>
            <Button
              title={t("plans.saveMenu")}
              onPress={save}
              loading={busy === "save"}
              disabled={!dirty}
              style={{ minHeight: 40, paddingHorizontal: 14 }}
            />
          </View>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${(filled / total) * 100}%` }]} />
          </View>
          {dirty ? <Text style={styles.unsaved}>● {t("plans.unsaved")}</Text> : null}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 4 }}>
            {dayList.map((d) => {
              const full = filledAt(d) === p.mealTimes.length;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDay(d)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: d === day }}
                  style={[styles.dayChip, full && styles.dayFull, d === day && styles.dayOn]}
                >
                  <Text style={[styles.dayText, d === day && { color: "#fff" }]}>
                    {full ? "✓ " : ""}
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 2: chuna hua din */}
        <View style={styles.dayCard}>
          <Text style={styles.h3}>{t("plans.day", { n: day })}</Text>
          {p.mealTimes.map((m) => (
            <DishCell key={`${day}-${m}`} meal={m} dishes={cells[key(day, m)] ?? []} onChange={(d) => setCell(m, d)} />
          ))}
          <View style={styles.tools}>
            {day < p.days && (
              <Button
                title={`${t("plans.copyNext")} →`}
                onPress={() => {
                  copyDay([day + 1]);
                  setDay(day + 1);
                }}
                variant="outline"
                style={styles.tool}
              />
            )}
            <Button title={t("plans.copyAll")} onPress={() => copyDay(dayList.filter((d) => d !== day))} variant="outline" style={styles.tool} />
            {p.days > 7 && <Button title={`🔁 ${t("plans.repeatWeek")}`} onPress={repeatWeek} variant="outline" style={styles.tool} />}
            <Button
              title={t("plans.clearDay")}
              onPress={() => setCells((c) => ({ ...c, ...Object.fromEntries(p.mealTimes.map((m) => [key(day, m), []])) }))}
              variant="outline"
              style={styles.tool}
            />
          </View>
        </View>

        {error ? <ErrorText>{error}</ErrorText> : null}
        {notice ? <Text style={styles.ok}>✓ {notice}</Text> : null}

        <Button title={t("plans.delete")} onPress={askDelete} loading={busy === "delete"} variant="outline" style={styles.danger} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function PlanMenuScreen() {
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const planId = id && /^\d{1,10}$/.test(id) ? id : null;
  return (
    <>
      <Stack.Screen options={{ title: t("plans.menuTitle") }} />
      <ProviderGate>
        {planId ? (
          <PlanMenu key={planId} id={planId} />
        ) : (
          <View style={styles.page}>
            <ErrorText>{t("plans.notFound")}</ErrorText>
          </View>
        )}
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 60, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  title: { fontSize: 22, fontWeight: "800", color: colors.text },
  muted: { fontSize: 14, color: colors.muted, marginTop: 2 },
  small: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  price: { fontWeight: "700", color: colors.orangeDark },
  status: { padding: 10, borderRadius: radius.md, overflow: "hidden", fontWeight: "600" },
  on: { backgroundColor: "#f0fdf4", color: colors.green },
  off: { backgroundColor: "#f3f4f6", color: colors.textSoft },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 6 },
  h3: { fontSize: 17, fontWeight: "700", color: colors.text },
  sticky: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    gap: 8,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  progressText: { fontSize: 14, fontWeight: "600", color: colors.text, flex: 1 },
  bar: { height: 6, borderRadius: 3, backgroundColor: "#f3f4f6", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: colors.green },
  unsaved: { fontSize: 12, color: "#b45309" },
  dayChip: {
    minWidth: 42,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderStyle: "dashed",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  dayFull: { borderStyle: "solid", borderColor: "#86efac", backgroundColor: "#f0fdf4" },
  dayOn: { backgroundColor: colors.orange, borderColor: colors.orange, borderStyle: "solid" },
  dayText: { fontWeight: "700", color: colors.text },
  dayCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: 14, gap: 14 },
  mealLabel: { fontSize: 13, fontWeight: "700", color: colors.muted },
  cell: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    padding: 6,
    minHeight: 48,
  },
  cellEmpty: { borderStyle: "dashed", borderColor: "#fbbf24" },
  dish: { backgroundColor: "#ffedd5", borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6 },
  dishText: { color: "#7c2d12", fontSize: 14 },
  cellInput: { flexGrow: 1, minWidth: 110, fontSize: 15, color: colors.text, paddingVertical: 6, paddingHorizontal: 4 },
  sugg: {
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeSoft,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggText: { color: "#9a3412", fontSize: 13 },
  tools: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tool: { minHeight: 38, paddingHorizontal: 12 },
  ok: { color: colors.green, fontWeight: "600" },
  danger: { borderColor: "#fca5a5" },
});

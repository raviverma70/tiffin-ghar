import { Pressable, StyleSheet, Text, View } from "react-native";
import { LOCALES, LOCALE_LABEL, useLocale, useSetLocale, useT } from "@/i18n";

export function LanguagePicker() {
  const t = useT();
  const locale = useLocale();
  const setLocale = useSetLocale();

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={t("nav.language")}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <Pressable
            key={l}
            onPress={() => setLocale(l)}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{LOCALE_LABEL[l]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#d1d5db" },
  chipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  label: { color: "#111827" },
  labelActive: { color: "#fff" },
});

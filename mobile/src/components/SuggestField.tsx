import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, radius } from "@/lib/theme";
import { useT } from "@/i18n";

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suggestions: readonly string[];
  // true: chip ", " ke saath judta hai (jaise "Dal, Chawal"), warna poora value badalta hai
  append?: boolean;
};

// Box par tap karte hi neeche chips; chip dabao to bhar jaye, khud bhi likh sakte ho (website ke SuggestInput jaisa)
export function SuggestField({ label, value, onChangeText, suggestions, append = false, style, ...rest }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);

  const parts = value
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const shown = suggestions
    .filter((s) => (append ? !parts.includes(s.toLowerCase()) : s.toLowerCase() !== value.trim().toLowerCase()))
    .slice(0, 12);

  function pick(s: string) {
    if (!append) onChangeText(s);
    else onChangeText([...value.split(",").map((p) => p.trim()).filter(Boolean), s].join(", "));
  }

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
        style={[styles.input, style]}
        {...rest}
      />
      {open && shown.length > 0 && (
        <View style={{ gap: 4 }}>
          <Text style={styles.hint}>{t("sugg.hint")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ gap: 6 }}>
            {shown.map((s) => (
              <Pressable key={s} onPress={() => pick(s)} accessibilityRole="button" style={styles.chip}>
                <Text style={styles.chipText}>+ {s}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "500", color: colors.textSoft },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: "#fff",
  },
  hint: { fontSize: 12, color: colors.muted },
  chip: {
    borderWidth: 1,
    borderColor: colors.orangeBorder,
    backgroundColor: colors.orangeSoft,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { color: "#9a3412", fontSize: 13, fontWeight: "500" },
});

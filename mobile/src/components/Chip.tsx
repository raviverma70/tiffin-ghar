import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "@/lib/theme";

// Sort/filter ka gol button (website ke chips jaisa)
export function Chip({
  label,
  active,
  onPress,
  tone = "orange",
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tone?: "orange" | "green";
}) {
  const on = tone === "green" ? colors.green : colors.orange;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active ? { backgroundColor: on, borderColor: on } : null]}
    >
      <Text style={[styles.text, active && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  text: { fontSize: 14, fontWeight: "600", color: colors.text },
});

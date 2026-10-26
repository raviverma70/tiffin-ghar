import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors, radius } from "@/lib/theme";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

// App ka ek jaisa button (website ke orange button jaisa)
export function Button({ title, onPress, variant = "primary", loading, disabled, style }: ButtonProps) {
  const off = disabled || loading;
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityState={{ disabled: off, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.primary : styles.outline,
        pressed && !off && { opacity: 0.85 },
        off && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? "#fff" : colors.orange} />
      ) : (
        <Text style={[styles.buttonText, { color: primary ? "#fff" : colors.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

// Label + input
export const Field = forwardRef<TextInput, TextInputProps & { label: string }>(function Field(
  { label, style, ...props },
  ref,
) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        accessibilityLabel={label}
        {...props}
      />
    </View>
  );
});

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <Text style={styles.error} accessibilityLiveRegion="polite">
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.orange },
  outline: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  buttonText: { fontSize: 16, fontWeight: "600" },
  label: { fontSize: 14, fontWeight: "500", color: colors.textSoft },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    paddingHorizontal: 14,
    fontSize: 17,
    color: colors.text,
    backgroundColor: "#fff",
  },
  error: {
    color: colors.red,
    backgroundColor: colors.redSoft,
    padding: 10,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
});

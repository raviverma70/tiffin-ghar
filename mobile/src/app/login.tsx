import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { Stack, router } from "expo-router";
import { useAuth } from "@/auth/provider";
import { OTP_RE, PHONE_RE, sendOtp } from "@/lib/auth";
import { colors } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { Button, Card, ErrorText, Field } from "@/components/ui";

// Backend 60 second me ek hi OTP bhejta hai
const RESEND_SECONDS = 60;

export default function LoginScreen() {
  const t = useT();
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);
  const otpRef = useRef<TextInput>(null);

  // "Dobara bhejo" ka countdown
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  async function askOtp() {
    setError("");
    if (!PHONE_RE.test(phone)) {
      setError(t("err.phone10"));
      return;
    }
    setBusy(true);
    const res = await sendOtp(phone);
    setBusy(false);
    if (!res.ok) {
      setError(translateError(t, res.error));
      return;
    }
    setStep("otp");
    setCode("");
    setWait(RESEND_SECONDS);
    setTimeout(() => otpRef.current?.focus(), 300);
  }

  async function verify() {
    setError("");
    if (!OTP_RE.test(code)) {
      setError(t("err.otp6"));
      return;
    }
    setBusy(true);
    const res = await login(phone, code);
    setBusy(false);
    if (!res.ok) {
      setError(translateError(t, res.error));
      return;
    }
    // Jahan se aaye the wahan wapas, warna home
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack.Screen options={{ title: t("login.title") }} />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.emoji} accessibilityElementsHidden>
            🍱
          </Text>
          <Text style={styles.title}>{t("login.title")}</Text>
          <Text style={styles.intro}>{t("login.introCustomer")}</Text>

          {step === "phone" ? (
            <>
              <Field
                label={t("login.phone")}
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={10}
                returnKeyType="send"
                onSubmitEditing={askOtp}
                autoFocus
              />
              <Button title={t("login.sendOtp")} onPress={askOtp} loading={busy} disabled={phone.length !== 10} />
            </>
          ) : (
            <>
              <Text style={styles.sentTo}>✓ {t("login.otpFor", { phone })}</Text>
              <Field
                ref={otpRef}
                label={t("login.otp")}
                value={code}
                onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={verify}
                style={styles.otp}
              />
              <Button title={t("login.verify")} onPress={verify} loading={busy} disabled={code.length !== 6} />
              <Button
                title={wait > 0 ? t("login.resendIn", { s: wait }) : t("login.resend")}
                onPress={askOtp}
                variant="outline"
                disabled={busy || wait > 0}
              />
              <Button
                title={t("login.changeNumber")}
                onPress={() => {
                  setStep("phone");
                  setError("");
                }}
                variant="outline"
                disabled={busy}
              />
            </>
          )}

          {error ? <ErrorText>{error}</ErrorText> : null}

          <Text style={styles.secure}>🔒 {t("login.secure")}</Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, backgroundColor: colors.bg, flexGrow: 1 },
  emoji: { fontSize: 40 },
  title: { fontSize: 28, fontWeight: "700", color: colors.text },
  intro: { fontSize: 15, color: colors.textSoft, lineHeight: 22 },
  sentTo: { fontSize: 15, color: colors.green, fontWeight: "500" },
  otp: { fontSize: 24, letterSpacing: 8, textAlign: "center" },
  secure: { fontSize: 12, color: colors.muted, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
});

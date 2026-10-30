import { useEffect, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { deleteShopPhoto, getMyProfile, updateProfile, type MyProfile } from "@/lib/provider";
import { photoSrc } from "@/lib/photo";
import { pickPhotos, uploadPhoto } from "@/lib/reviews";
import { getCurrentCoords, type Coords } from "@/lib/useLocation";
import { colors, radius } from "@/lib/theme";
import { translateError, useT } from "@/i18n";
import { ProviderGate } from "@/components/ProviderGate";
import { Button, Card, ErrorText, Field } from "@/components/ui";

// Dukaan ki photo
function ShopPhoto({ profile, onChange }: { profile: MyProfile; onChange: (photoUrl: string | null) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const photo = photoSrc(profile.photoUrl);

  async function add(source: "gallery" | "camera") {
    setError("");
    const picked = await pickPhotos(source, 1);
    if ("error" in picked) return setError(picked.error === "denied" ? t("mrev.denied") : t("mphoto.fail"));
    if (picked.uris.length === 0) return;
    setBusy(true);
    const res = await uploadPhoto<{ photoUrl: string }>("/providers/me/photo", picked.uris[0]);
    setBusy(false);
    if (res.ok) onChange(res.data.photoUrl);
    else setError(translateError(t, res.error));
  }

  async function remove() {
    setBusy(true);
    const res = await deleteShopPhoto();
    setBusy(false);
    if (res.ok) onChange(null);
    else setError(translateError(t, res.error));
  }

  return (
    <Card style={{ padding: 16 }}>
      <Text style={styles.h2}>📷 {t("dash.photoTitle")}</Text>
      <Text style={styles.muted}>{t("dash.photoHint")}</Text>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.photo} accessibilityLabel={t("photo.alt")} />
      ) : (
        <View style={[styles.photo, styles.noPhoto]}>
          <Text style={{ fontSize: 40 }}>🏪</Text>
        </View>
      )}
      {busy ? (
        <Text style={styles.muted}>{t("photo.uploading")}</Text>
      ) : (
        <View style={styles.row}>
          <Button title={`🖼️ ${t("mrev.gallery")}`} onPress={() => add("gallery")} variant="outline" style={{ flex: 1 }} />
          <Button title={`📸 ${t("mrev.camera")}`} onPress={() => add("camera")} variant="outline" style={{ flex: 1 }} />
        </View>
      )}
      {photo && !busy ? <Button title={t("common.remove")} onPress={remove} variant="outline" /> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Card>
  );
}

// Area aur GPS location (dukaan par khade hokar)
function ShopPlace({ profile, onSaved }: { profile: MyProfile; onSaved: (p: MyProfile) => void }) {
  const t = useT();
  const [area, setArea] = useState(profile.area ?? "");
  const [coords, setCoords] = useState<Coords | null>(
    profile.latitude !== null && profile.longitude !== null ? { lat: profile.latitude, lng: profile.longitude } : null,
  );
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const changed =
    area.trim() !== (profile.area ?? "") || coords?.lat !== (profile.latitude ?? undefined) || coords?.lng !== (profile.longitude ?? undefined);

  async function locate() {
    setError("");
    setSaved(false);
    setLocating(true);
    const res = await getCurrentCoords();
    setLocating(false);
    if (res.ok) setCoords(res.coords);
    else setError(res.reason === "denied" ? t("mprof.denied") : t("pf.locationFail"));
  }

  async function save() {
    setError("");
    setSaved(false);
    const a = area.trim();
    if (a && a.length < 2) return setError(t("mprof.areaShort"));
    const body: { area?: string; latitude?: number; longitude?: number } = {};
    if (a && a !== (profile.area ?? "")) body.area = a;
    if (coords) {
      body.latitude = coords.lat;
      body.longitude = coords.lng;
    }
    if (Object.keys(body).length === 0) return;
    setSaving(true);
    const res = await updateProfile(body);
    setSaving(false);
    if (!res.ok) return setError(translateError(t, res.error));
    onSaved(res.data);
    setSaved(true);
  }

  const mapUrl = coords ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}` : null;

  return (
    <Card style={{ padding: 16 }}>
      <Text style={styles.h2}>📍 {t("pf.location")}</Text>
      <Field label={t("pf.area")} value={area} onChangeText={setArea} maxLength={60} />
      <Text style={styles.muted}>{t("mprof.locationHint")}</Text>
      <Text style={[styles.state, coords ? styles.set : styles.none]}>
        {coords ? `✓ ${t("pf.locationSet")}` : `○ ${t("pf.locationNone")}`}
      </Text>
      {coords ? (
        <Text style={styles.small}>
          {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
        </Text>
      ) : null}
      <Button title={locating ? t("pf.locationBusy") : `📍 ${t("pf.locationBtn")}`} onPress={locate} loading={locating} variant="outline" />
      {mapUrl ? <Button title={`🗺️ ${t("pf.locationMap")}`} onPress={() => void Linking.openURL(mapUrl)} variant="outline" /> : null}
      {changed && coords ? <Text style={styles.warn}>{t("mprof.remember")}</Text> : null}
      {error ? <ErrorText>{error}</ErrorText> : null}
      {saved ? <Text style={styles.ok}>✓ {t("pf.saved")}</Text> : null}
      <Button title={t("common.save")} onPress={save} loading={saving} disabled={!changed} />
    </Card>
  );
}

function ProfileEditor() {
  const t = useT();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void getMyProfile().then((res) => {
      if (!alive) return;
      if (res.ok) setProfile(res.data);
      else setError(res.status === 404 ? t("mdash.noProfile") : translateError(t, res.error));
    });
    return () => {
      alive = false;
    };
  }, [t]);

  if (!profile) {
    return error ? (
      <View style={styles.page}>
        <ErrorText>{error}</ErrorText>
      </View>
    ) : (
      <ActivityIndicator color={colors.orange} style={{ marginTop: 40 }} />
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <ShopPhoto profile={profile} onChange={(photoUrl) => setProfile({ ...profile, photoUrl })} />
        <ShopPlace key={`${profile.latitude},${profile.longitude},${profile.area}`} profile={profile} onSaved={setProfile} />
        <Text style={styles.small}>{t("mprof.webNote")}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function ShopProfileScreen() {
  const t = useT();
  return (
    <>
      <Stack.Screen options={{ title: t("mprof.title") }} />
      <ProviderGate>
        <ProfileEditor />
      </ProviderGate>
    </>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 60, backgroundColor: colors.bg, flexGrow: 1, gap: 14 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 19 },
  small: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  row: { flexDirection: "row", gap: 8 },
  photo: { width: "100%", height: 190, borderRadius: radius.md },
  noPhoto: { backgroundColor: "#ffedd5", alignItems: "center", justifyContent: "center" },
  state: { padding: 10, borderRadius: radius.md, overflow: "hidden", fontWeight: "600" },
  set: { backgroundColor: "#f0fdf4", color: colors.green },
  none: { backgroundColor: "#fffbeb", color: "#92400e" },
  warn: { fontSize: 13, color: "#b45309" },
  ok: { color: colors.green, fontWeight: "600" },
});

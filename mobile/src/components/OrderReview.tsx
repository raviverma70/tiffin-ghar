import { useState } from "react";
import { Image, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius } from "@/lib/theme";
import { photoSrc } from "@/lib/photo";
import {
  deleteReviewPhoto,
  MAX_REVIEW_PHOTOS,
  pickPhotos,
  postReview,
  uploadReviewPhoto,
  type ReviewPhoto,
} from "@/lib/reviews";
import { translateError, useT } from "@/i18n";
import { Button, Card, ErrorText } from "@/components/ui";

// Gallery / Camera ke do button. Chuni photos (chhoti ki hui) ke uri onPicked ko
function PhotoButtons({
  room,
  disabled,
  onPicked,
  onError,
}: {
  room: number;
  disabled?: boolean;
  onPicked: (uris: string[]) => void;
  onError: (msg: string) => void;
}) {
  const t = useT();
  async function pick(source: "gallery" | "camera") {
    const res = await pickPhotos(source, room);
    if ("error" in res) onError(res.error === "denied" ? t("mrev.denied") : t("err.photoOpen"));
    else if (res.uris.length > 0) onPicked(res.uris);
  }
  if (room <= 0) return null;
  return (
    <View style={styles.row}>
      <Button title={`🖼️ ${t("mrev.gallery")}`} onPress={() => pick("gallery")} variant="outline" disabled={disabled} style={styles.flex} />
      <Button title={`📷 ${t("mrev.camera")}`} onPress={() => pick("camera")} variant="outline" disabled={disabled} style={styles.flex} />
    </View>
  );
}

function Thumb({ uri, onRemove, label }: { uri: string; onRemove?: () => void; label: string }) {
  const t = useT();
  return (
    <View>
      <Pressable onPress={() => (uri.startsWith("http") ? Linking.openURL(uri) : undefined)} accessibilityLabel={label}>
        <Image source={{ uri }} style={styles.thumb} />
      </Pressable>
      {onRemove && (
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={t("rphoto.remove")} hitSlop={8} style={styles.x}>
          <Text style={styles.xText}>×</Text>
        </Pressable>
      )}
    </View>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  const t = useT();
  return (
    <View style={[styles.row, { gap: 4 }]}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={!onChange}
          onPress={() => onChange?.(n)}
          accessibilityRole={onChange ? "button" : undefined}
          accessibilityLabel={t("review.star", { n })}
          accessibilityState={{ selected: value === n }}
          hitSlop={4}
        >
          <Text style={{ fontSize: onChange ? 38 : 22, color: n <= value ? "#f97316" : "#d1d5db" }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

// Delivered order par review: stars, comment, 3 tak photo. Photos baad me lagti hain (review id chahiye).
export function ReviewForm({ orderId, onDone }: { orderId: number; onDone: (photoFailed: boolean) => void }) {
  const t = useT();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setBusy(true);
    const res = await postReview(orderId, rating, comment);
    if (!res.ok) {
      setBusy(false);
      setError(translateError(t, res.error));
      return;
    }
    // Review ban gaya; koi photo fail ho to review nahi rukta
    let failed = false;
    for (const uri of photos) {
      const up = await uploadReviewPhoto(res.data.id, uri);
      if (!up.ok) failed = true;
    }
    setBusy(false);
    onDone(failed);
  }

  return (
    <Card>
      <Text style={styles.h3}>{t("orders.reviewAsk")}</Text>
      <Stars value={rating} onChange={setRating} />
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder={t("review.placeholder")}
        placeholderTextColor={colors.muted}
        multiline
        maxLength={500}
        style={styles.input}
        accessibilityLabel={t("review.placeholder")}
      />
      <Text style={styles.label}>📷 {t("rphoto.add")}</Text>
      <Text style={styles.small}>{t("rphoto.hint")}</Text>
      {photos.length > 0 && (
        <View style={styles.row}>
          {photos.map((uri, i) => (
            <Thumb
              key={uri}
              uri={uri}
              label={t("rphoto.preview", { n: i + 1 })}
              onRemove={() => setPhotos((list) => list.filter((u) => u !== uri))}
            />
          ))}
        </View>
      )}
      <PhotoButtons
        room={MAX_REVIEW_PHOTOS - photos.length}
        disabled={busy}
        onPicked={(uris) => setPhotos((list) => [...list, ...uris].slice(0, MAX_REVIEW_PHOTOS))}
        onError={setError}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button title={t("review.submit")} onPress={submit} loading={busy} disabled={rating === 0} />
    </Card>
  );
}

// Diya hua review: photos dekho, × se hatao, + se jodo (3 tak)
export function MyReview({
  review,
  photoFailed,
  onChange,
}: {
  review: { id: number; rating: number; comment: string | null; photos: ReviewPhoto[] };
  photoFailed: boolean;
  onChange: () => void;
}) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(uris: string[]) {
    setError("");
    setBusy(true);
    for (const uri of uris) {
      const res = await uploadReviewPhoto(review.id, uri);
      if (!res.ok) setError(translateError(t, res.error));
    }
    setBusy(false);
    onChange();
  }

  async function remove(photoId: number) {
    setBusy(true);
    const res = await deleteReviewPhoto(review.id, photoId);
    setBusy(false);
    if (!res.ok) setError(translateError(t, res.error));
    onChange();
  }

  return (
    <Card>
      <Text style={styles.h3}>{t("orders.reviewMine")}</Text>
      <Stars value={review.rating} />
      {review.comment ? <Text style={styles.text}>{review.comment}</Text> : null}
      {photoFailed && <Text style={styles.warn}>{t("rphoto.someFailed")}</Text>}
      {review.photos.length > 0 && (
        <View style={styles.row}>
          {review.photos.map((p, i) => {
            const src = photoSrc(p.url);
            return src ? (
              <Thumb key={p.id} uri={src} label={t("rphoto.preview", { n: i + 1 })} onRemove={busy ? undefined : () => remove(p.id)} />
            ) : null;
          })}
        </View>
      )}
      {busy && <Text style={styles.small}>{t("mrev.uploading")}</Text>}
      <PhotoButtons room={MAX_REVIEW_PHOTOS - review.photos.length} disabled={busy} onPicked={add} onError={setError} />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  h3: { fontSize: 18, fontWeight: "700", color: colors.text },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  flex: { flex: 1, minHeight: 44 },
  input: {
    minHeight: 84,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: radius.md,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.textSoft },
  small: { fontSize: 12, color: colors.muted },
  text: { fontSize: 15, color: colors.text, lineHeight: 21 },
  warn: { fontSize: 13, color: "#b45309" },
  thumb: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: "#f3f4f6" },
  x: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  xText: { color: "#fff", fontSize: 16, lineHeight: 18, fontWeight: "700" },
});

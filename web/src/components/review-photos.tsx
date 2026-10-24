import { photoSrc } from "@/lib/photo";
import { getT } from "@/i18n/server";

// Review ki photos (chhoti), dabane par badi photo naye tab me
export default async function ReviewPhotos({
  photos,
  customer,
}: {
  photos: { id: number; url: string }[];
  customer: string;
}) {
  if (photos.length === 0) return null;
  const { t } = await getT();

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {photos.map((p) => {
        const src = photoSrc(p.url);
        if (!src) return null;
        return (
          <a key={p.id} href={src} target="_blank" rel="noopener noreferrer" title={t("rphoto.open")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={t("rev.photoAlt", { name: customer })}
              loading="lazy"
              className="h-24 w-24 rounded-xl object-cover ring-1 ring-gray-200 transition hover:opacity-90"
            />
          </a>
        );
      })}
    </div>
  );
}

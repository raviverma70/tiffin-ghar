import { getT } from "@/i18n/server";

export default async function SiteFooter() {
  const { t } = await getT();

  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-gray-500">
        <p className="font-semibold text-gray-700">Tiffin Ghar</p>
        <p className="mt-1">{t("footer.tagline")}</p>
      </div>
    </footer>
  );
}

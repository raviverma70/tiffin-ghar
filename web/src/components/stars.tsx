import { getT } from "@/i18n/server";

export function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span aria-label={`${value} / 5`} className="text-orange-500">
      {"★".repeat(full)}
      <span className="text-gray-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export async function RatingLine({ rating, count }: { rating: number | null; count: number }) {
  const { t } = await getT();

  if (!rating || count === 0) {
    return <span className="text-sm text-gray-500">{t("rating.none")}</span>;
  }
  return (
    <span className="text-sm">
      <Stars value={rating} /> <span className="font-semibold">{rating}</span>{" "}
      <span className="text-gray-500">{t("rating.count", { n: count })}</span>
    </span>
  );
}

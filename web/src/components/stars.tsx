export function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span aria-label={`${value} star`} className="text-orange-500">
      {"★".repeat(full)}
      <span className="text-gray-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function RatingLine({ rating, count }: { rating: number | null; count: number }) {
  if (!rating || count === 0) {
    return <span className="text-sm text-gray-500">Abhi koi rating nahi</span>;
  }
  return (
    <span className="text-sm">
      <Stars value={rating} /> <span className="font-semibold">{rating}</span>{" "}
      <span className="text-gray-500">({count} review)</span>
    </span>
  );
}
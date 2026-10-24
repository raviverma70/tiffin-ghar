// Do jagah ke beech seedhi doori (km), dharti ko gola maan kar (Haversine)
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Customer ki location lagbhag 100 meter tak gol (poori sahi jagah ki zaroorat nahi)
export function roundCoord(value: number) {
  return Math.round(value * 1000) / 1000;
}

// Sort ke liye rating: kam reviews wali dukaan ko beech (3.5) ki taraf kheencho,
// taaki 1 review wali 5.0 dukaan 190 review wali 4.6 se upar na aaye
const PRIOR_RATING = 3.5;
const PRIOR_WEIGHT = 5;

export function ratingScore(ratingSum: number, ratingCount: number) {
  return (PRIOR_RATING * PRIOR_WEIGHT + ratingSum) / (PRIOR_WEIGHT + ratingCount);
}

// Dikhane wali rating: average, ek decimal tak
export function averageRating(ratingSum: number, ratingCount: number) {
  return ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : null;
}

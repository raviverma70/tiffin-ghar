const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 0 = Sunday ... 6 = Saturday, India ke time ke hisaab se
export function todayInIndia() {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  return DAYS.indexOf(short);
}
// Aaj ki tareekh India ke hisaab se: "2026-10-24"
export function todayDateInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

// "2026-10-24" + 5 din -> "2026-10-29"
export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 0 = Sunday ... 6 = Saturday, India ke time ke hisaab se
export function todayInIndia() {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  return DAYS.indexOf(short);
}
export const todayIn = (timezone = "Asia/Manila") =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const parseDate = (s: string) => new Date(`${s}T12:00:00Z`);
export const formatDate = (
  s: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) =>
  new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(
    parseDate(s),
  );
export const daysBetween = (a: string, b: string) =>
  Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000);
export function addDays(s: string, days: number) {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function periodError(
  start: string,
  end: string,
  today: string,
  periods: { id: number; start_date: string; end_date: string | null }[],
  id?: number,
) {
  if (!start || start > today || (end && end > today))
    return "Recorded period dates cannot be in the future.";
  if (end && end < start)
    return "The end date must be on or after the start date.";
  if (
    periods.some(
      (p) =>
        p.id !== id &&
        start <= (p.end_date || "9999-12-31") &&
        (end || "9999-12-31") >= p.start_date,
    )
  )
    return "These dates overlap another period. End an ongoing period or correct the dates first.";
  return "";
}

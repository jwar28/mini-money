import {
    format,
    formatDistanceToNow,
    isThisYear,
    isToday,
    isYesterday,
    parseISO,
} from "date-fns";

export function currentPeriod(): { year: number; month: number } {
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function periodKey(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, "0")}`;
}

export function parsePeriodKey(key: string): { year: number; month: number } {
    const [y, m] = key.split("-").map(Number);
    return { year: y, month: m };
}

export function monthLabel(year: number, month: number): string {
    const d = new Date(year, month - 1, 1);
    return format(d, "MMM yyyy");
}

export function monthShortLabel(year: number, month: number): string {
    const d = new Date(year, month - 1, 1);
    return format(d, "MMM");
}

export function dayHeader(date: Date): string {
    if (isToday(date)) return `Today, ${format(date, "MMM d")}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, "MMM d")}`;
    if (isThisYear(date)) return format(date, "MMM d");
    return format(date, "MMM d, yyyy");
}

export function timeLabel(iso: string): string {
    return format(parseISO(iso), "HH:mm");
}

// ponytail: compact date label for transaction rows — "Today, Jun 30" /
// "Yesterday, Jun 30" / "Jun 30" / "Jun 30, 2026" depending on recency.
export function txDateLabel(iso: string): string {
    const d = parseISO(iso);
    if (isToday(d)) return `Today, ${format(d, "MMM d")}`;
    if (isYesterday(d)) return `Yesterday, ${format(d, "MMM d")}`;
    if (isThisYear(d)) return format(d, "MMM d");
    return format(d, "MMM d, yyyy");
}

export function relativeLabel(iso: string): string {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
}

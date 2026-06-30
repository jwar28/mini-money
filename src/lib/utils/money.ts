const DEFAULT_CURRENCY = "COP";
const DEFAULT_LOCALE = "es-CO";

const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, currency: string, maxFrac: number): Intl.NumberFormat {
    const key = `${locale}|${currency}|${maxFrac}`;
    const cached = formatters.get(key);
    if (cached) return cached;
    const f = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: maxFrac,
        maximumFractionDigits: maxFrac,
    });
    formatters.set(key, f);
    return f;
}

export function formatMoney(
    value: number,
    options: { currency?: string; locale?: string } = {},
): string {
    const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
    return getFormatter(locale, currency, 2).format(value);
}

const compactFormatters = new Map<string, Intl.NumberFormat>();

function getCompactFormatter(locale: string, currency: string): Intl.NumberFormat {
    const key = `${locale}|${currency}|compact`;
    const cached = compactFormatters.get(key);
    if (cached) return cached;
    const f = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
    });
    compactFormatters.set(key, f);
    return f;
}

export function formatMoneyShort(
    value: number,
    options: { currency?: string; locale?: string } = {},
): string {
    const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
        return getCompactFormatter(locale, currency).format(value);
    }
    return formatMoney(value, { currency, locale });
}

export function parseAmountInput(raw: string): number {
    const sanitized = raw.replace(/[^0-9.]/g, "");
    const num = Number(sanitized);
    if (Number.isNaN(num)) return 0;
    return Math.max(0, Math.round(num * 100) / 100);
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Insert thousands separators (dots) into a digits-only string.
 * e.g. "1600000" → "1.600.000", "5" → "5", "" → "".
 * Uses the standard es-CO / European convention with "." as thousands separator.
 */
export function formatWithDots(digits: string): string {
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

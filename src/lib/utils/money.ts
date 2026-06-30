const DEFAULT_CURRENCY = "COP";
const DEFAULT_LOCALE = "es-CO";

export function formatMoney(
    value: number,
    options: { currency?: string; locale?: string } = {},
): string {
    const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

export function formatMoneyShort(
    value: number,
    options: { currency?: string; locale?: string } = {},
): string {
    const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE } = options;
    const abs = Math.abs(value);
    if (abs >= 1_000_000) {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
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

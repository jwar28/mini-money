/**
 * Blur the currently-focused element if it is focusable (anything except
 * the body/html root). Used as a pre-flush before toggling Chakra's dialog
 * open state so that the focus trap's `returnFocus` does not land on an
 * element whose ancestor is still `aria-hidden` by the Zag-js
 * `walkTreeOutside` traversal.
 *
 * React 18 raises a dev-mode warning when a focused element has an
 * `aria-hidden` ancestor — calling .blur() before the open→close transition
 * completes avoids that race entirely.
 *
 * Safe to call when document is undefined (no-op) and when the active
 * element has no `.blur()` method.
 */
export function blurActiveElement(): void {
    if (typeof document === "undefined") return;
    const el = document.activeElement;
    if (!el || el === document.body) return;
    if (el instanceof HTMLElement && typeof el.blur === "function") {
        el.blur();
    }
}

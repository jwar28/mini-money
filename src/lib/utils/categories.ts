export {
    CATEGORY_ICONS,
    resolveCategoryIcon as resolveIcon,
    type CategoryIconEntry,
} from "./category-icons";

export const BUCKET_COLOR: Record<"needs" | "wants" | "savings", string> = {
    needs: "#2563eb",
    wants: "#10b981",
    savings: "#059669",
};

export const TYPE_BADGE_COLOR: Record<"income" | "expense" | "savings", string> = {
    income: "#10b981",
    expense: "#ef4444",
    savings: "#0f766e",
};

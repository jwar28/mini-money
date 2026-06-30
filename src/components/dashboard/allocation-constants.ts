import { FiHome, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import type { IconType } from "react-icons";
import type { BucketName } from "@/types/database";

export const ALLOCATION_ICONS: Record<BucketName, IconType> = {
    needs: FiHome,
    wants: FiShoppingBag,
    savings: FiTrendingUp,
};

export const ALLOCATION_COLORS: Record<BucketName, string> = {
    needs: "#2563eb",
    wants: "#10b981",
    savings: "#059669",
};

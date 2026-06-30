import type { IconType } from "react-icons";
import {
    FiActivity,
    FiAirplay,
    FiBook,
    FiBookmark,
    FiBriefcase,
    FiCamera,
    FiCircle,
    FiCoffee,
    FiCreditCard,
    FiDollarSign,
    FiGift,
    FiHeart,
    FiHome,
    FiMap,
    FiMusic,
    FiPackage,
    FiPhone,
    FiPlusCircle,
    FiSave,
    FiShield,
    FiShoppingBag,
    FiShoppingCart,
    FiSmile,
    FiSun,
    FiTarget,
    FiTool,
    FiTrendingUp,
    FiTruck,
    FiTv,
    FiUmbrella,
    FiWatch,
    FiWifi,
    FiZap,
} from "react-icons/fi";
import { RiCrossFill } from "react-icons/ri";

export interface CategoryIconEntry {
    name: string;
    component: IconType;
}

export const CATEGORY_ICONS: CategoryIconEntry[] = [
    { name: "FiHome", component: FiHome },
    { name: "FiShoppingCart", component: FiShoppingCart },
    { name: "FiCoffee", component: FiCoffee },
    { name: "FiZap", component: FiZap },
    { name: "FiTruck", component: FiTruck },
    { name: "FiHeart", component: FiHeart },
    { name: "FiShoppingBag", component: FiShoppingBag },
    { name: "FiTv", component: FiTv },
    { name: "FiMusic", component: FiMusic },
    { name: "FiSave", component: FiSave },
    { name: "FiTrendingUp", component: FiTrendingUp },
    { name: "FiShield", component: FiShield },
    { name: "FiDollarSign", component: FiDollarSign },
    { name: "FiBriefcase", component: FiBriefcase },
    { name: "FiPlusCircle", component: FiPlusCircle },
    { name: "FiBook", component: FiBook },
    { name: "FiCreditCard", component: FiCreditCard },
    { name: "FiGift", component: FiGift },
    { name: "FiTool", component: FiTool },
    { name: "FiMap", component: FiMap },
    { name: "FiCamera", component: FiCamera },
    { name: "FiWatch", component: FiWatch },
    { name: "FiPhone", component: FiPhone },
    { name: "FiWifi", component: FiWifi },
    { name: "FiUmbrella", component: FiUmbrella },
    { name: "FiAirplay", component: FiAirplay },
    { name: "FiPackage", component: FiPackage },
    { name: "FiSun", component: FiSun },
    { name: "FiBookmark", component: FiBookmark },
    { name: "FiActivity", component: FiActivity },
    { name: "FiSmile", component: FiSmile },
    { name: "FiTarget", component: FiTarget },
    { name: "RiCrossFill", component: RiCrossFill },
];

const ICON_MAP = new Map(CATEGORY_ICONS.map((i) => [i.name, i.component]));

export function resolveCategoryIcon(name: string | null | undefined): IconType {
    if (!name) return FiCircle;
    return ICON_MAP.get(name) ?? FiCircle;
}

export function slugifyCategoryName(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
}

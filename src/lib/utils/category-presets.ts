import type { BucketName, CategoryType } from "@/types/database";

export interface CategoryPreset {
    value: string;
    label: string;
    description: string;
    type: CategoryType;
    bucket: BucketName;
}

export const CATEGORY_PRESETS: CategoryPreset[] = [
    {
        value: "mandatory",
        label: "Mandatory",
        description: "Necesidades — rent, utilities, groceries",
        type: "expense",
        bucket: "needs",
    },
    {
        value: "candies",
        label: "Candies",
        description: "Gustos — entertainment, dining, hobbies",
        type: "expense",
        bucket: "wants",
    },
    {
        value: "savings",
        label: "Savings",
        description: "Ahorro e inversión",
        type: "savings",
        bucket: "savings",
    },
];

const PRESET_MAP = new Map(CATEGORY_PRESETS.map((p) => [p.value, p]));

export function presetFromTypeBucket(
    type: CategoryType,
    bucket: BucketName,
): CategoryPreset | undefined {
    return CATEGORY_PRESETS.find((p) => p.type === type && p.bucket === bucket);
}

export function getPreset(value: string): CategoryPreset | undefined {
    return PRESET_MAP.get(value);
}

"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_ICONS } from "@/lib/utils/category-icons";

const VALID_ICONS = new Set(CATEGORY_ICONS.map((i) => i.name));
const VALID_BUCKETS = new Set(["needs", "wants", "savings"]);
const VALID_TYPES = new Set(["expense", "savings", "income"]);

const CategoryInput = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(40, "Name must be 40 characters or fewer"),
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9-]+$/i, "Slug must be lowercase letters, numbers, or dashes")
        .min(1)
        .max(40),
    icon: z.string().refine((v) => VALID_ICONS.has(v), "Pick a valid icon"),
    type: z.string().refine((v) => VALID_TYPES.has(v)),
    bucket: z.string().refine((v) => VALID_BUCKETS.has(v)),
});

import { slugifyCategoryName } from "@/lib/utils/category-icons";

function slugify(name: string): string {
    return slugifyCategoryName(name);
}

export interface CategoryFormState {
    error?: string;
    success?: boolean;
    fieldErrors?: Partial<Record<"name" | "slug" | "icon" | "type" | "bucket", string>>;
}

export async function createCategoryAction(
    _: CategoryFormState,
    formData: FormData,
): Promise<CategoryFormState> {
    const rawName = (formData.get("name") ?? "").toString().trim();
    const rawSlug = (formData.get("slug") ?? "").toString().trim();
    const parsed = CategoryInput.safeParse({
        name: rawName,
        slug: rawSlug || slugify(rawName),
        icon: formData.get("icon")?.toString(),
        type: formData.get("type")?.toString(),
        bucket: formData.get("bucket")?.toString(),
    });

    if (!parsed.success) {
        const fieldErrors: CategoryFormState["fieldErrors"] = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as keyof NonNullable<CategoryFormState["fieldErrors"]>;
            if (key) fieldErrors[key] = issue.message;
        }
        return { error: parsed.error.issues[0]?.message ?? "Invalid form data", fieldErrors };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in required" };

    const { error } = await supabase.from("categories").insert({
        user_id: user.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        icon: parsed.data.icon,
        type: parsed.data.type,
        bucket: parsed.data.bucket,
    });

    if (error) {
        if (error.code === "23505") {
            return { error: "A category with that slug already exists" };
        }
        return { error: error.message };
    }

    updateTag("categories");
    revalidatePath("/budget");
    revalidatePath("/transactions");
    return { success: true };
}

export async function updateCategoryAction(
    id: string,
    _: CategoryFormState,
    formData: FormData,
): Promise<CategoryFormState> {
    const parsed = CategoryInput.safeParse({
        name: formData.get("name")?.toString() ?? "",
        slug: formData.get("slug")?.toString() ?? "",
        icon: formData.get("icon")?.toString(),
        type: formData.get("type")?.toString(),
        bucket: formData.get("bucket")?.toString(),
    });

    if (!parsed.success) {
        const fieldErrors: CategoryFormState["fieldErrors"] = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as keyof NonNullable<CategoryFormState["fieldErrors"]>;
            if (key) fieldErrors[key] = issue.message;
        }
        return { error: parsed.error.issues[0]?.message ?? "Invalid form data", fieldErrors };
    }

    const supabase = await createClient();
    const { error } = await supabase
        .from("categories")
        .update({
            name: parsed.data.name,
            slug: parsed.data.slug,
            icon: parsed.data.icon,
            type: parsed.data.type,
            bucket: parsed.data.bucket,
        })
        .eq("id", id);

    if (error) {
        if (error.code === "23505") {
            return { error: "Another category already uses that slug" };
        }
        return { error: error.message };
    }

    updateTag("categories");
    revalidatePath("/budget");
    revalidatePath("/transactions");
    return { success: true };
}

export interface DeleteResult {
    error?: string;
    transactionCount?: number;
}

export async function deleteCategoryAction(id: string): Promise<DeleteResult> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in required" };

    // Only the owning user may delete; system categories (user_id IS NULL) are immutable.
    const { data: category } = await supabase
        .from("categories")
        .select("user_id, name")
        .eq("id", id)
        .maybeSingle();

    if (!category) return { error: "Category not found" };
    if (category.user_id !== user.id) {
        return { error: "You can only delete categories you created." };
    }

    const { count: transactionCount } = await supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id);

    if (transactionCount && transactionCount > 0) {
        return {
            error: `Cannot delete "${category.name}": ${transactionCount} transaction${transactionCount === 1 ? "" : "s"} still use it. Reassign or delete them first.`,
            transactionCount,
        };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { error: error.message };

    updateTag("categories");
    revalidatePath("/budget");
    revalidatePath("/transactions");
    return {};
}

export async function slugifyName(name: string): Promise<string> {
    return slugifyCategoryName(name);
}

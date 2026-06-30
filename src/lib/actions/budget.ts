"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const AllocationInput = z.object({
    category_id: z.string().uuid(),
    percentage: z.coerce.number().min(0).max(100),
    is_visual_locked: z.boolean(),
});

const LockSchema = z.object({
    year: z.coerce.number().int().min(2000).max(2100),
    month: z.coerce.number().int().min(1).max(12),
    base_salary: z.coerce.number().min(0).max(10_000_000),
    allocations: z.array(AllocationInput).min(1),
});

export interface LockFormState {
    error?: string;
    success?: boolean;
}

export async function lockBudgetAction(
    _: LockFormState,
    formData: FormData,
): Promise<LockFormState> {
    const allocationsRaw = formData.get("allocations_json")?.toString() ?? "[]";
    let allocationsParsed: unknown;
    try {
        allocationsParsed = JSON.parse(allocationsRaw);
    } catch {
        return { error: "Invalid allocations payload" };
    }

    const raw = {
        year: formData.get("year"),
        month: formData.get("month"),
        base_salary: formData.get("base_salary"),
        allocations: allocationsParsed,
    };

    const parsed = LockSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
    }

    const total = parsed.data.allocations.reduce((s, a) => s + a.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
        return { error: `Allocations must total 100% (got ${total.toFixed(2)}%)` };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in required" };

    const { data: existing } = await supabase
        .from("monthly_budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("year", parsed.data.year)
        .eq("month", parsed.data.month)
        .maybeSingle();

    let budgetId = (existing as { id: string } | null)?.id;
    if (!budgetId) {
        const { data: inserted, error: insertErr } = await supabase
            .from("monthly_budgets")
            .insert({
                user_id: user.id,
                year: parsed.data.year,
                month: parsed.data.month,
                base_salary: parsed.data.base_salary,
                is_locked: true,
            })
            .select("id")
            .single();
        if (insertErr) return { error: insertErr.message };
        budgetId = (inserted as { id: string } | null)?.id ?? "";
    } else {
        const { error: updateErr } = await supabase
            .from("monthly_budgets")
            .update({
                base_salary: parsed.data.base_salary,
                is_locked: true,
            })
            .eq("id", budgetId);
        if (updateErr) return { error: updateErr.message };
    }

    await supabase.from("budget_allocations").delete().eq("monthly_budget_id", budgetId);

    const rows = parsed.data.allocations.map((a) => ({
        monthly_budget_id: budgetId!,
        category_id: a.category_id,
        percentage: a.percentage,
        is_visual_locked: a.is_visual_locked,
    }));
    const { error: allocErr } = await supabase.from("budget_allocations").insert(rows);
    if (allocErr) return { error: allocErr.message };

    // ponytail: materialize the locked-savings amount for this month into
    // `monthly_savings` so the dashboard's pool query is a simple SUM. We
    // need the bucket of each allocation to know which are savings.
    const categoryIds = parsed.data.allocations.map((a) => a.category_id);
    const { data: categoryRows } = await supabase
        .from("categories")
        .select("id, bucket")
        .in("id", categoryIds);
    const bucketByCategoryId = new Map(
        (categoryRows ?? []).map((c) => [c.id as string, c.bucket as string]),
    );
    const lockedSavingsAmount = parsed.data.allocations
        .filter(
            (a) => a.is_visual_locked && bucketByCategoryId.get(a.category_id) === "savings",
        )
        .reduce((s, a) => s + (parsed.data.base_salary * a.percentage) / 100, 0);

    const { error: savingsErr } = await supabase
        .from("monthly_savings")
        .upsert(
            {
                user_id: user.id,
                year: parsed.data.year,
                month: parsed.data.month,
                amount: lockedSavingsAmount,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,year,month" },
        );
    if (savingsErr) return { error: savingsErr.message };

    updateTag(`monthly_budget:${user.id}`);
    updateTag(`monthly_budget:${user.id}:${parsed.data.year}:${parsed.data.month}`);
    updateTag("categories");
    updateTag("monthly_savings");
    revalidatePath("/budget");
    revalidatePath("/transactions");
    revalidatePath("/", "page");
    return { success: true };
}

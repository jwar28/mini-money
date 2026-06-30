"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const TxSchema = z.object({
    type: z.enum(["income", "expense"]),
    amount: z.coerce.number().positive().max(1_000_000),
    category_id: z.string().uuid(),
    description: z.string().max(140).optional().nullable(),
    occurred_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export interface TxFormState {
    error?: string;
    success?: boolean;
}

export async function createTransactionAction(
    _: TxFormState,
    formData: FormData,
): Promise<TxFormState> {
    const raw = {
        type: formData.get("type")?.toString(),
        amount: formData.get("amount")?.toString() ?? "",
        category_id: formData.get("category_id")?.toString(),
        description: formData.get("description")?.toString() || undefined,
        occurred_on: formData.get("occurred_on")?.toString(),
    };
    const parsed = TxSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in to add transactions" };

    const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: parsed.data.type,
        amount: parsed.data.amount,
        category_id: parsed.data.category_id,
        description: parsed.data.description ?? null,
        created_at: new Date(`${parsed.data.occurred_on}T12:00:00Z`).toISOString(),
    });

    if (error) {
        return { error: error.message };
    }

    updateTag(`transactions:${user.id}`);
    revalidatePath("/");
    revalidatePath("/transactions");
    revalidatePath("/budget");
    return { success: true };
}

export async function deleteTransactionAction(formData: FormData): Promise<void> {
    const id = formData.get("id")?.toString();
    if (!id) return;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("transactions").delete().eq("id", id);
    updateTag(`transactions:${user.id}`);
    revalidatePath("/");
    revalidatePath("/transactions");
}

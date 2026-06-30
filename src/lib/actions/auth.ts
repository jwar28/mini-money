"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
    error?: string;
    email?: string;
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
    const email = (formData.get("email") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();
    const next = (formData.get("next") ?? "/").toString();

    if (!email || !password) {
        return { error: "Email and password are required", email };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return { error: error.message, email };
    }

    revalidatePath("/", "layout");
    redirect(next.startsWith("/") ? next : "/");
}

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
    const email = (formData.get("email") ?? "").toString().trim();
    const password = (formData.get("password") ?? "").toString();
    const fullName = (formData.get("full_name") ?? "").toString().trim();

    if (!email || !password) {
        return { error: "Email and password are required", email };
    }
    if (password.length < 8) {
        return { error: "Password must be at least 8 characters", email };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || null } },
    });

    if (error) {
        return { error: error.message, email };
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signOutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

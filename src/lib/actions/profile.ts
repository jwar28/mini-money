"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 2 * 1024 * 1024;

export interface AvatarState {
    error?: string;
    url?: string;
}

// ponytail: avatar URL gets a cache-busting query param so the <img> tag
// in <Avatar.Image> re-fetches after an upload instead of serving a stale
// CDN copy. Cheap, no signed-URL dance needed.
function withCacheBust(url: string): string {
    return `${url}?v=${Date.now()}`;
}

function extForMime(type: string): "jpg" | "png" | "webp" | null {
    if (type === "image/jpeg") return "jpg";
    if (type === "image/png") return "png";
    if (type === "image/webp") return "webp";
    return null;
}

export async function uploadAvatarAction(
    _: AvatarState,
    formData: FormData,
): Promise<AvatarState> {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { error: "No file provided" };
    }
    if (file.size > MAX_BYTES) {
        return { error: "Image too large (max 2 MB)" };
    }
    const ext = extForMime(file.type);
    if (!ext) {
        return { error: "Unsupported image format" };
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in required" };

    const path = `${user.id}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) return { error: upErr.message };

    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    const finalUrl = withCacheBust(publicUrl);

    const { error: dbErr } = await supabase
        .from("profiles")
        .update({
            avatar_url: finalUrl,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    if (dbErr) return { error: dbErr.message };

    revalidatePath("/", "layout");
    return { url: finalUrl };
}

export async function removeAvatarAction(): Promise<AvatarState> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "Sign in required" };

    // Ignore "not found" — bucket might be empty on first remove.
    await supabase.storage
        .from("avatars")
        .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`]);

    const { error } = await supabase
        .from("profiles")
        .update({
            avatar_url: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
}
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const PUBLIC_PATHS = new Set(["/login", "/signup", "/auth/callback"]);

export async function proxy(request: NextRequest) {
    const { pathname, searchParams, origin } = request.nextUrl;
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return response;

    const supabase = createServerClient<Database>(url, key, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                for (const { name, value } of cookiesToSet) {
                    request.cookies.set(name, value);
                }
                response = NextResponse.next({ request });
                for (const { name, value, options } of cookiesToSet) {
                    response.cookies.set(name, value, options);
                }
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const isPublic =
        PUBLIC_PATHS.has(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/") ||
        pathname === "/favicon.ico";

    if (!user && !isPublic) {
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("next", pathname + searchParams.toString());
        return NextResponse.redirect(loginUrl);
    }

    if (user && pathname === "/login") {
        return NextResponse.redirect(new URL("/", origin));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};

import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
    BudgetAllocationRow,
    CategoryRow,
    MonthlyBudgetRow,
    TransactionRow,
} from "@/types/database";
import { currentPeriod } from "@/lib/utils/dates";

export type {
    BudgetAllocationRow,
    CategoryRow,
    MonthlyBudgetRow,
    TransactionRow,
} from "@/types/database";

export type TxWithCategory = TransactionRow & {
    categories: Pick<CategoryRow, "id" | "name" | "icon" | "bucket" | "type" | "slug"> | null;
};

export type BudgetWithAllocations = MonthlyBudgetRow & {
    budget_allocations: (BudgetAllocationRow & {
        categories: Pick<CategoryRow, "id" | "name" | "icon" | "bucket" | "type" | "slug">;
    })[];
};

function monthRangeUtc(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { startIso: start.toISOString(), endIso: end.toISOString() };
}

function trace(label: string) {
    if (process.env.NODE_ENV === "production") return () => {};
    const start = performance.now();
    return () => {
        const ms = Math.round((performance.now() - start) * 100) / 100;
        console.log(`[mm:query] ${label} ${ms}ms`);
    };
}

export const getCurrentUserId = cache(async (): Promise<string | null> => {
    const done = trace("getCurrentUserId");
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    done();
    return user?.id ?? null;
});

export const getProfile = cache(async () => {
    const done = trace("getProfile");
    const userId = await getCurrentUserId();
    if (!userId) {
        done();
        return null;
    }
    const supabase = await createClient();
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
    done();
    return data;
});

// Categories change rarely (CRUD via the CategoryEditor). Without a Supabase
// service_role key we cannot use `unstable_cache` here because the cached
// closure would need to call `createClient()`, which reads cookies —
// forbidden inside a cache scope. We fall back to per-request `React.cache`
// dedup (memoizes by identity within a single render). When a service-role
// key is added we can layer `unstable_cache` on top with explicit `userId`
// arguments and manual `WHERE user_id IS NULL OR user_id = $1` filters.
export const getCategories = cache(async (): Promise<CategoryRow[]> => {
    const done = trace("getCategories");
    const supabase = await createClient();
    const { data } = await supabase
        .from("categories")
        .select("*")
        .order("bucket", { ascending: true })
        .order("name", { ascending: true });
    done();
    return data ?? [];
});

// Per-user, per-period monthly budget. Same caveat as getCategories above —
// no service role key means no cross-request cache here either; we rely on
// per-request React.cache. The "lockBudget Distribution" save calls
// `updateTag(\`monthly_budget:${userId}:${y}:${m}\`)` which is a no-op until
// we add service-role-backed caching.
export const getMonthlyBudget = cache(
    async (year: number, month: number): Promise<BudgetWithAllocations | null> => {
        const userId = await getCurrentUserId();
        if (!userId) return null;
        const done = trace(`getMonthlyBudget ${year}-${month}`);
        const supabase = await createClient();
        const { data } = await supabase
            .from("monthly_budgets")
            .select(
                "*, budget_allocations(*, categories(id, name, icon, bucket, type))",
            )
            .eq("user_id", userId)
            .eq("year", year)
            .eq("month", month)
            .maybeSingle();
        done();
        return (data as unknown as BudgetWithAllocations) ?? null;
    },
);

// High-churn data — DO NOT cache. Stale-while-revalidate is not appropriate
// because users expect fresh numbers immediately after adding a transaction.
export const getMonthTotals = cache(
    async (
        year: number,
        month: number,
    ): Promise<{ income: number; expense: number }> => {
        const done = trace(`getMonthTotals ${year}-${month}`);
        const userId = await getCurrentUserId();
        if (!userId) {
            done();
            return { income: 0, expense: 0 };
        }
        const { startIso, endIso } = monthRangeUtc(year, month);
        const supabase = await createClient();
        const { data } = await supabase
            .from("transactions")
            .select("type, amount")
            .eq("user_id", userId)
            .gte("created_at", startIso)
            .lt("created_at", endIso);
        const tx = (data ?? []) as Array<{ type: "income" | "expense"; amount: number }>;
        let income = 0;
        let expense = 0;
        for (const t of tx) {
            if (t.type === "income") income += Number(t.amount);
            else expense += Number(t.amount);
        }
        done();
        return { income, expense };
    },
);

export const getRecentTransactions = cache(
    async (limit = 5): Promise<TxWithCategory[]> => {
        const done = trace(`getRecentTransactions limit=${limit}`);
        const userId = await getCurrentUserId();
        if (!userId) {
            done();
            return [];
        }
        const supabase = await createClient();
        const { data } = await supabase
            .from("transactions")
            .select(
                "*, categories:category_id(id, name, icon, bucket, type)",
            )
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(limit);
        done();
        return (data ?? []) as unknown as TxWithCategory[];
    },
);

// ponytail: lifetime savings pool. Each month's locked savings categories
// (materialized in `monthly_savings` by `lockBudgetAction`) credit the pool;
// actual expense transactions to savings-bucket categories debit it. Goes
// negative if the user spent more on savings than they ever locked.
export const getTotalSavings = cache(async (): Promise<number> => {
    const done = trace("getTotalSavings");
    const userId = await getCurrentUserId();
    if (!userId) {
        done();
        return 0;
    }
    const supabase = await createClient();
    const [savingsRes, txRes] = await Promise.all([
        supabase
            .from("monthly_savings")
            .select("amount")
            .eq("user_id", userId),
        supabase
            .from("transactions")
            .select("amount, categories!inner(bucket)")
            .eq("user_id", userId)
            .eq("categories.bucket", "savings"),
    ]);
    const locked = ((savingsRes.data ?? []) as Array<{ amount: number }>).reduce(
        (s, r) => s + Number(r.amount),
        0,
    );
    const spent = ((txRes.data ?? []) as Array<{ amount: number }>).reduce(
        (s, t) => s + Number(t.amount),
        0,
    );
    done();
    return locked - spent;
});

export const getTransactionsForPeriod = cache(
    async (year: number, month: number): Promise<TxWithCategory[]> => {
        const done = trace(`getTransactionsForPeriod ${year}-${month}`);
        const userId = await getCurrentUserId();
        if (!userId) {
            done();
            return [];
        }
        const { startIso, endIso } = monthRangeUtc(year, month);
        const supabase = await createClient();
        const { data } = await supabase
            .from("transactions")
            .select("*, categories:category_id(id, name, icon, bucket, type)")
            .eq("user_id", userId)
            .gte("created_at", startIso)
            .lt("created_at", endIso)
            .order("created_at", { ascending: false });
        done();
        return (data ?? []) as unknown as TxWithCategory[];
    },
);

export const getTrendLast6Months = cache(
    async (referenceYear: number, referenceMonth: number) => {
        const done = trace(`getTrendLast6Months ${referenceYear}-${referenceMonth}`);
        const userId = await getCurrentUserId();
        if (!userId) {
            done();
            return [] as Array<{ year: number; month: number; income: number; expense: number }>;
        }
        const supabase = await createClient();
        const start = new Date(Date.UTC(referenceYear, referenceMonth - 7, 1, 0, 0, 0));
        const end = new Date(Date.UTC(referenceYear, referenceMonth, 1, 0, 0, 0));
        const { data } = await supabase
            .from("transactions")
            .select("type, amount, created_at")
            .eq("user_id", userId)
            .gte("created_at", start.toISOString())
            .lt("created_at", end.toISOString());
        const buckets = new Map<string, { income: number; expense: number }>();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(Date.UTC(referenceYear, referenceMonth - 1 - i, 1));
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            buckets.set(key, { income: 0, expense: 0 });
        }
        for (const t of (data ?? []) as Array<{
            type: "income" | "expense";
            amount: number;
            created_at: string;
        }>) {
            const d = new Date(t.created_at);
            const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
            const bucket = buckets.get(key);
            if (!bucket) continue;
            if (t.type === "income") bucket.income += Number(t.amount);
            else bucket.expense += Number(t.amount);
        }
        const result = [...buckets.entries()].map(([key, v]) => {
            const [y, m] = key.split("-").map(Number);
            return { year: y, month: m, income: v.income, expense: v.expense };
        });
        done();
        return result;
    },
);

export function getDefaultPeriod() {
    return currentPeriod();
}

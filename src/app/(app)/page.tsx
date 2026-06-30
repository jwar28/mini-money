import {
    getCategories,
    getMonthlyBudget,
    getMonthTotals,
    getRecentTransactions,
    getTotalSavings,
    getTrendLast6Months,
} from "@/lib/queries";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { AllocationCards } from "@/components/dashboard/AllocationCards";
import { TotalSavingsCard } from "@/components/dashboard/TotalSavingsCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { computeAvailableBalance } from "@/lib/utils/budget";
import { Box, Grid, GridItem, Heading, Stack, Text } from "@chakra-ui/react";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ ym?: string }>;
}

function prevPeriod(year: number, month: number) {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
}

function parseYm(ym?: string) {
    if (!ym) return null;
    const m = /^(\d{4})-(\d{2})$/.exec(ym);
    if (!m) return null;
    return { year: Number(m[1]), month: Number(m[2]) };
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const parsed = parseYm(sp.ym);
    const now = new Date();
    const year = parsed?.year ?? now.getUTCFullYear();
    const month = parsed?.month ?? now.getUTCMonth() + 1;
    const prev = prevPeriod(year, month);

    const [currBudget, prevBudget, totals, prevTotals, recent, trend, categories, totalSavings] = await Promise.all([
        getMonthlyBudget(year, month),
        getMonthlyBudget(prev.year, prev.month),
        getMonthTotals(year, month),
        getMonthTotals(prev.year, prev.month),
        getRecentTransactions(5),
        getTrendLast6Months(year, month),
        getCategories(),
        getTotalSavings(),
    ]);

    const salary = currBudget?.base_salary ?? 0;
    const prevSalary = prevBudget?.base_salary ?? 0;

    const lockedTotal = (currBudget?.budget_allocations ?? [])
        .filter((a) => a.is_visual_locked)
        .reduce((s, a) => s + (salary * Number(a.percentage)) / 100, 0);

    const lockedPrev = (prevBudget?.budget_allocations ?? [])
        .filter((a) => a.is_visual_locked)
        .reduce((s, a) => s + (prevSalary * Number(a.percentage)) / 100, 0);

    // Pool model: income starts at the budget, expenses and locked allocations
    // withdraw from it, additional income transactions add to it.
    // Carryover is the previous month's ending balance; reset to 0 when prior
    // month ended in the red (per user policy).
    const prevBalance = computeAvailableBalance(prevSalary, prevTotals, lockedPrev);
    const carryover = Math.max(0, prevBalance);
    const balance = computeAvailableBalance(salary, totals, lockedTotal, carryover);

    const deltaPct =
        prevBalance === 0
            ? null
            : Math.round(((balance - prevBalance) / Math.max(1, Math.abs(prevBalance))) * 1000) / 10;

    const bucketMap = new Map<string, { sum: number; pct: number; hasData: boolean }>([
        ["needs", { sum: 0, pct: 0, hasData: false }],
        ["wants", { sum: 0, pct: 0, hasData: false }],
        ["savings", { sum: 0, pct: 0, hasData: false }],
    ]);
    for (const a of currBudget?.budget_allocations ?? []) {
        const b = a.categories.bucket as "needs" | "wants" | "savings";
        const entry = bucketMap.get(b);
        if (!entry) continue;
        const amount = (salary * Number(a.percentage)) / 100;
        entry.sum += amount;
        entry.pct += Number(a.percentage);
        entry.hasData = true;
    }
    const buckets = (["needs", "wants", "savings"] as const).map((k) => ({
        key: k,
        // ponytail: labels mirror the CATEGORY_PRESETS the user picks in the
        // CategoryEditor (mandatory→needs, candies→wants, savings→savings)
        // so the card reads as the same vocabulary they used to tag the category.
        label: k === "needs" ? "Mandatory" : k === "wants" ? "Candies" : "Savings",
        amount: bucketMap.get(k)!.sum,
        percentage: bucketMap.get(k)!.pct,
    }));

    const titleText =
        categories.length === 0
            ? "Welcome to Mini Money"
            : `Dashboard`;

    return (
        <Stack gap={6} pb={4}>
            <Box className="show-mobile">
                <Heading size="xl" fontWeight="800">
                    {titleText}
                </Heading>
                {categories.length === 0 ? (
                    <Text color="text.secondary" mt={1}>
                        Configure your categories and budget to begin tracking.
                    </Text>
                ) : (
                    <Text color="text.secondary" mt={1}>
                        A snapshot of your finances for this period.
                    </Text>
                )}
            </Box>

            <BalanceCard
                year={year}
                month={month}
                balance={balance}
                deltaPct={deltaPct}
                expense={totals.expense}
                locked={lockedTotal}
                carryover={carryover}
                budget={salary}
            />

            <AllocationCards buckets={buckets} />

            <TotalSavingsCard total={totalSavings} />

            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                <GridItem>
                    <TrendChart
                        rows={trend}
                        currentPeriod={{ year, month }}
                    />
                </GridItem>
                <GridItem>
                    <RecentTransactions transactions={recent} />
                </GridItem>
            </Grid>
        </Stack>
    );
}

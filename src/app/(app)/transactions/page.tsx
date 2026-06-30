import { Box, Flex, Grid, GridItem, Stack, Text } from "@chakra-ui/react";
import {
    getCategories,
    getMonthlyBudget,
    getMonthTotals,
    getTransactionsForPeriod,
} from "@/lib/queries";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { TotalExpensesCard } from "@/components/transactions/TotalExpensesCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { formatMoney } from "@/lib/utils/money";
import { computeAvailableBalance } from "@/lib/utils/budget";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ ym?: string }>;
}

function parseYm(ym?: string) {
    if (!ym) return null;
    const m = /^(\d{4})-(\d{2})$/.exec(ym);
    if (!m) return null;
    return { year: Number(m[1]), month: Number(m[2]) };
}

function prevPeriod(year: number, month: number) {
    if (month === 1) return { year: year - 1, month: 12 };
    return { year, month: month - 1 };
}

export default async function TransactionsPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const parsed = parseYm(sp.ym);
    // Use UTC for the fallback month so server-rendered HTML matches what the
    // client will produce during hydration regardless of the user's timezone.
    const now = new Date();
    const year = parsed?.year ?? now.getUTCFullYear();
    const month = parsed?.month ?? now.getUTCMonth() + 1;
    const prev = prevPeriod(year, month);

    const [transactions, prevTotals, budget, prevBudget, categories] = await Promise.all([
        getTransactionsForPeriod(year, month),
        getMonthTotals(prev.year, prev.month),
        getMonthlyBudget(year, month),
        getMonthlyBudget(prev.year, prev.month),
        getCategories(),
    ]);

    const currentExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + Number(t.amount), 0);

    const prevExpense = prevTotals.expense;
    const deltaPct =
        prevExpense > 0
            ? Math.round(((currentExpense - prevExpense) / prevExpense) * 1000) / 10
            : null;

    const salary = Number(budget?.base_salary ?? 0);
    const prevSalary = Number(prevBudget?.base_salary ?? 0);

    const lockedTotal = (budget?.budget_allocations ?? [])
        .filter((a) => a.is_visual_locked)
        .reduce((s, a) => s + (salary * Number(a.percentage)) / 100, 0);

    const lockedPrev = (prevBudget?.budget_allocations ?? [])
        .filter((a) => a.is_visual_locked)
        .reduce((s, a) => s + (prevSalary * Number(a.percentage)) / 100, 0);

    const prevBalance = computeAvailableBalance(prevSalary, prevTotals, lockedPrev);
    const carryover = Math.max(0, prevBalance);

    return (
        <Stack gap={6} pb={4}>
            <Flex justify="space-between" align="end" wrap="wrap" gap={3}>
                <Stack gap={1}>
                    <Text fontSize="xs" color="text.muted" letterSpacing="0.06em" textTransform="uppercase">
                        Recent Movements
                    </Text>
                    <Box className="show-mobile">
                        <MonthSelector year={year} month={month} />
                    </Box>
                </Stack>
                <Box className="show-desktop">
                    <MonthSelector year={year} month={month} />
                </Box>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6} alignItems="start">
                <GridItem>
                    <Stack gap={6}>
                        <TotalExpensesCard
                            expense={currentExpense}
                            budget={lockedTotal}
                            deltaPct={deltaPct}
                        />
                        <TransactionList transactions={transactions} categories={categories} />
                    </Stack>
                </GridItem>
                <GridItem className="show-desktop">
                    <SummaryPanel
                        expense={currentExpense}
                        income={computeAvailableBalance(
                            salary,
                            {
                                income: transactions
                                    .filter((t) => t.type === "income")
                                    .reduce((s, t) => s + Number(t.amount), 0),
                                expense: currentExpense,
                            },
                            lockedTotal,
                            carryover,
                        )}
                        count={transactions.length}
                    />
                </GridItem>
            </Grid>
        </Stack>
    );
}

function SummaryPanel({ expense, income, count }: { expense: number; income: number; count: number }) {
    return (
        <Box
            borderRadius="card"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.card"
            p={6}
            position="sticky"
            top="100px"
        >
            <Stack gap={4}>
                <Text fontSize="xs" color="text.muted" letterSpacing="0.06em" textTransform="uppercase">
                    Period summary
                </Text>
                <Stack gap={3}>
                    <SummaryRow label="Income" value={income} tone="success" />
                    <SummaryRow label="Expenses" value={expense} tone="danger" />
                    <SummaryRow label="Net" value={income - expense} tone={income - expense >= 0 ? "success" : "danger"} />
                </Stack>
                <Stack gap={1}>
                    <Text fontSize="xs" color="text.muted" letterSpacing="0.06em" textTransform="uppercase">
                        Activity
                    </Text>
                    <Text fontWeight="700" color="text.primary">
                        {count} transactions
                    </Text>
                </Stack>
            </Stack>
        </Box>
    );
}

function SummaryRow({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" }) {
    const color = tone === "success" ? "#047857" : "#b91c1c";
    return (
        <Flex justify="space-between" align="center">
            <Text color="text.secondary" fontSize="sm" fontWeight="500">
                {label}
            </Text>
            <Text fontWeight="800" color={color}>
                {value >= 0 ? "+" : "-"}
                {formatMoney(Math.abs(value))}
            </Text>
        </Flex>
    );
}

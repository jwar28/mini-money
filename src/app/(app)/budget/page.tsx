import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import { getCategories, getCurrentUserId, getMonthlyBudget } from "@/lib/queries";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { BudgetComposer } from "@/components/budget/BudgetComposer";

interface PageProps {
    searchParams: Promise<{ ym?: string }>;
}

function parseYm(ym?: string) {
    if (!ym) return null;
    const m = /^(\d{4})-(\d{2})$/.exec(ym);
    if (!m) return null;
    return { year: Number(m[1]), month: Number(m[2]) };
}

export default async function BudgetPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const parsed = parseYm(sp.ym);
    // Fallback uses UTC so server and client render the same value, avoiding
    // hydration mismatches when the user's local timezone straddles a month
    // boundary differently from the server.
    const now = new Date();
    const year = parsed?.year ?? now.getUTCFullYear();
    const month = parsed?.month ?? now.getUTCMonth() + 1;

    const [budget, categories, userId] = await Promise.all([
        getMonthlyBudget(year, month),
        getCategories(),
        getCurrentUserId(),
    ]);

    if (!userId) return null;

    return (
        <Stack gap={6} pb={4}>
            <Flex justify="space-between" align="end" wrap="wrap" gap={3}>
                <Stack gap={1}>
                    <Text fontSize="xs" color="text.muted" letterSpacing="0.06em" textTransform="uppercase">
                        Budget Configuration
                    </Text>
                    <Box className="show-mobile">
                        <MonthSelector year={year} month={month} />
                    </Box>
                </Stack>
            </Flex>

            <BudgetComposer
                key={`${year}-${month}`}
                year={year}
                month={month}
                initial={budget}
                categories={categories}
                currentUserId={userId}
            />
        </Stack>
    );
}

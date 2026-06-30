"use client";

import { Card, Flex, Stack, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import type { CategoryRow, TxWithCategory } from "@/lib/queries";
import { FilterTabs } from "@/components/transactions/FilterTabs";
import { CategoryChips } from "@/components/transactions/CategoryChips";
import { TxItem } from "@/components/transactions/TxItem";
import { dayHeader } from "@/lib/utils/dates";

type PeriodFilter = "all" | "income" | "expense";

interface TransactionListProps {
    transactions: TxWithCategory[];
    categories: CategoryRow[];
}

export function TransactionList({ transactions, categories }: TransactionListProps) {
    const [period, setPeriod] = useState<PeriodFilter>("all");
    const [categorySlug, setCategorySlug] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return transactions.filter((tx) => {
            if (period !== "all" && tx.type !== period) return false;
            if (categorySlug && tx.categories?.slug !== categorySlug) return false;
            return true;
        });
    }, [transactions, period, categorySlug]);

    const grouped = useMemo(() => {
        const map = new Map<string, TxWithCategory[]>();
        for (const tx of filtered) {
            const d = new Date(tx.created_at);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const arr = map.get(key);
            if (arr) arr.push(tx);
            else map.set(key, [tx]);
        }
        return [...map.entries()].map(([key, txs]) => ({
            key,
            date: new Date(txs[0]!.created_at),
            items: txs,
        }));
    }, [filtered]);

    return (
        <Stack gap={4} minW={0}>
            <FilterTabs value={period} onChange={setPeriod} />

            {categories.length > 0 ? (
                <CategoryChips
                    categories={categories}
                    selected={categorySlug}
                    onSelect={setCategorySlug}
                />
            ) : null}

            {filtered.length === 0 ? (
                <EmptyState hasAny={transactions.length > 0} />
            ) : (
                <Stack gap={5} minW={0}>
                    {grouped.map(({ key, date, items }) => (
                        <Stack gap={2} key={key}>
                            <Text
                                fontSize="xs"
                                color="text.muted"
                                fontWeight="700"
                                letterSpacing="0.06em"
                                textTransform="uppercase"
                                px={1}
                            >
                                {dayHeader(date)}
                            </Text>
                            {items.map((tx) => (
                                <TxItem key={tx.id} tx={tx} />
                            ))}
                        </Stack>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
    return (
        <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card" w="full" maxW="100%">
            <Card.Body p={{ base: 6, md: 10 }}>
                <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    textAlign="center"
                    gap={2}
                    color="text.secondary"
                    minW={0}
                    w="full"
                >
                    <Text fontSize="4xl" lineHeight="1">
                        💸
                    </Text>
                    <Text fontWeight="700" color="text.primary" fontSize="md" w="full">
                        {hasAny ? "No transactions match these filters" : "No transactions this month yet"}
                    </Text>
                    <Text fontSize="sm" w="full">
                        {hasAny
                            ? "Try a different combination of filters."
                            : "Tap the + button to record your first transaction."}
                    </Text>
                </Flex>
            </Card.Body>
        </Card.Root>
    );
}

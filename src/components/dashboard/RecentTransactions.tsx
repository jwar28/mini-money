import {
    Box,
    Card,
    Flex,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";
import type { TxWithCategory } from "@/lib/queries";
import { formatMoney } from "@/lib/utils/money";
import { resolveIcon } from "@/lib/utils/categories";
import Link from "next/link";

interface RecentTransactionsProps {
    transactions: TxWithCategory[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    return (
        <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
            <Card.Body p={{ base: 4, md: 6 }}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="lg" fontWeight="800">
                        Recent Transactions
                    </Heading>
                    {transactions.length > 0 ? (
                        <Link href="/transactions">
                            <Text fontSize="sm" color="brand.600" fontWeight="700">
                                View all
                            </Text>
                        </Link>
                    ) : null}
                </Flex>
                {transactions.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Stack gap={3}>
                        {transactions.map((tx) => {
                            const IconCmp = resolveIcon(tx.categories?.icon);
                            const positive = tx.type === "income";
                            return (
                                <Flex
                                    key={tx.id}
                                    align="center"
                                    gap={3}
                                    p={3}
                                    borderRadius="button"
                                    bg="surface.subtle"
                                >
                                    <Box
                                        w="40px"
                                        h="40px"
                                        borderRadius="full"
                                        bg="brand.100"
                                        color="brand.700"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        flexShrink={0}
                                    >
                                        <IconCmp size={20} />
                                    </Box>
                                    <Box flex="1" minW={0}>
                                        <Text fontWeight="700" color="text.primary" lineClamp={1}>
                                            {tx.description ?? tx.categories?.name ?? "Transaction"}
                                        </Text>
                                        <Text fontSize="xs" color="text.secondary">
                                            {format(parseISO(tx.created_at), "MMM d, h:mm a")} • {tx.categories?.name ?? "Uncategorized"}
                                        </Text>
                                    </Box>
                                    <Text
                                        fontWeight="800"
                                        color={positive ? "success" : "danger"}
                                        flexShrink={0}
                                    >
                                        {positive ? "+" : "-"}
                                        {formatMoney(tx.amount)}
                                    </Text>
                                </Flex>
                            );
                        })}
                    </Stack>
                )}
            </Card.Body>
        </Card.Root>
    );
}

function EmptyState() {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            py={10}
            textAlign="center"
            gap={2}
            color="text.secondary"
        >
            <Text fontSize="3xl">📊</Text>
            <Text fontWeight="700" color="text.primary">
                No transactions yet
            </Text>
            <Text fontSize="sm">
                Add your first transaction to start tracking.
            </Text>
        </Flex>
    );
}

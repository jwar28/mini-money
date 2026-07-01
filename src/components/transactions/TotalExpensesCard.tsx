import { Box, Card, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import { formatMoney } from "@/lib/utils/money";

interface TotalExpensesCardProps {
    expense: number;
    budget: number;
    deltaPct: number | null;
}

export function TotalExpensesCard({ expense, budget, deltaPct }: TotalExpensesCardProps) {
    const pct = budget > 0 ? Math.min(100, (expense / budget) * 100) : 0;
    const total = Math.max(0, budget);

    return (
        <Card.Root
            borderRadius="card"
            borderColor="border.subtle"
            bg="bg.card"
            position="relative"
            overflow="hidden"
        >
            <Card.Body p={{ base: 5, md: 6 }}>
                <Flex justify="space-between" align="start" gap={3} mb={3}>
                    <Stack gap={1}>
                        <Text fontSize="xs" color="text.muted" letterSpacing="0.06em" textTransform="uppercase">
                            Total Monthly Expenses
                        </Text>
                        <Heading size={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="-0.04em">
                            {formatMoney(expense)}
                        </Heading>
                    </Stack>
                    {deltaPct !== null ? (
                        <Flex
                            align="center"
                            gap={2}
                            bg={deltaPct >= 0 ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)"}
                            color={deltaPct >= 0 ? "#047857" : "#b91c1c"}
                            px={3}
                            py={1.5}
                            borderRadius="pill"
                            fontSize="sm"
                            fontWeight="700"
                        >
                            {deltaPct >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                            {Math.abs(deltaPct).toFixed(1)}%
                        </Flex>
                    ) : null}
                </Flex>

                <Stack gap={2}>
                    <Box h="8px" bg="surface.subtle" borderRadius="pill" overflow="hidden">
                        <Box h="full" w={`${pct}%`} bg="brand.600" transition="width 220ms ease" />
                    </Box>
                    <Flex justify="space-between" fontSize="xs" color="text.secondary">
                        <Text>{pct.toFixed(0)}% of monthly budget utilized</Text>
                        <Text>{formatMoney(total)} total</Text>
                    </Flex>
                </Stack>
            </Card.Body>
        </Card.Root>
    );
}

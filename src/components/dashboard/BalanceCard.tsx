import { Badge, Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import { formatMoney } from "@/lib/utils/money";
import { monthLabel } from "@/lib/utils/dates";

interface BalanceCardProps {
    year: number;
    month: number;
    balance: number;
    deltaPct: number | null;
    expense: number;
    locked: number;
    carryover: number;
    budget: number;
}

export function BalanceCard({
    year,
    month,
    balance,
    deltaPct,
    expense,
    locked,
    carryover,
    budget,
}: BalanceCardProps) {
    const isUp = balance >= 0;

    return (
        <Box
            position="relative"
            borderRadius="card"
            bg="ink.900"
            color="white"
            p={{ base: 6, md: 8 }}
            overflow="hidden"
            boxShadow="0 14px 40px rgba(15, 23, 42, 0.18)"
        >
            <Box
                position="absolute"
                inset="auto auto -40% -10%"
                w="60%"
                h="80%"
                borderRadius="50%"
                bg="brand.700"
                opacity={0.3}
                filter="blur(80px)"
                pointerEvents="none"
            />
            <Stack gap={5} position="relative">
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="brand.100" letterSpacing="0.06em" textTransform="uppercase">
                        Income
                    </Text>
                    <Badge
                        bg="brand.600"
                        color="white"
                        fontWeight="700"
                        px={3}
                        py={1}
                        borderRadius="pill"
                        textTransform="none"
                    >
                        {monthLabel(year, month)}
                    </Badge>
                </Flex>

                <Flex align="baseline" gap={2}>
                    <Heading size={{ base: "3xl", md: "4xl" }} fontWeight="900" letterSpacing="-0.04em">
                        {isUp ? "" : "-"}
                        {formatMoney(Math.abs(balance))}
                    </Heading>
                </Flex>

                <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                    {deltaPct !== null ? (
                        <Flex
                            align="center"
                            gap={2}
                            bg={deltaPct >= 0 ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                            color={deltaPct >= 0 ? "#34d399" : "#fca5a5"}
                            px={3}
                            py={1.5}
                            borderRadius="pill"
                            fontSize="sm"
                            fontWeight="700"
                        >
                            {deltaPct >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                            {deltaPct >= 0 ? "+" : ""}
                            {deltaPct.toFixed(1)}% vs last month
                        </Flex>
                    ) : (
                        <Text fontSize="sm" color="brand.100">
                            No prior month
                        </Text>
                    )}

                    <Flex gap={5} fontSize="xs" color="brand.100" wrap="wrap">
                        <Stat label="Expenses" value={expense} tone="danger" />
                        <Stat label="Locked" value={locked} tone="warning" />
                        {carryover > 0 ? (
                            <Stat label="Carryover" value={carryover} tone="success" />
                        ) : null}
                        <Stat label="Budget" value={budget} tone="muted" />
                    </Flex>
                </Flex>
            </Stack>
        </Box>
    );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "warning" | "muted" }) {
    const colors: Record<typeof tone, string> = {
        success: "#34d399",
        danger: "#fca5a5",
        warning: "#fbbf24",
        muted: "#cbd5e1",
    };
    return (
        <Stack gap={0.5}>
            <Text color="brand.100" letterSpacing="0.04em" textTransform="uppercase">
                {label}
            </Text>
            <Text color={colors[tone]} fontWeight="700" fontSize="sm">
                {formatMoney(value)}
            </Text>
        </Stack>
    );
}

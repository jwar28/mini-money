"use client";

import { Box, Card, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import { FiHome, FiShoppingBag, FiTrendingUp } from "react-icons/fi";
import NextLink from "next/link";
import type { BucketName } from "@/types/database";
import { formatMoney } from "@/lib/utils/money";

const ICONS: Record<BucketName, IconType> = {
    needs: FiHome,
    wants: FiShoppingBag,
    savings: FiTrendingUp,
};

const COLOR: Record<BucketName, string> = {
    needs: "#2563eb",
    wants: "#10b981",
    savings: "#059669",
};

interface BucketSummary {
    key: "needs" | "wants" | "savings";
    label: string;
    amount: number;
    percentage: number;
}

interface AllocationCardsProps {
    buckets: BucketSummary[];
}

export function AllocationCards({ buckets }: AllocationCardsProps) {
    return (
        <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
            <Card.Body p={{ base: 4, md: 6 }}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="lg" fontWeight="800">
                        Allocation
                    </Heading>
                    <NextLink href="/budget" prefetch>
                        <Text
                            fontSize="sm"
                            color="brand.600"
                            fontWeight="700"
                            _hover={{ textDecoration: "underline" }}
                        >
                            View Details
                        </Text>
                    </NextLink>
                </Flex>
                <Stack direction={{ base: "column", md: "row" }} gap={4} align="stretch">
                    {buckets.map((b) => {
                        const Icon = ICONS[b.key];
                        const color = COLOR[b.key];
                        const pct = Math.min(100, Math.max(0, b.percentage));
                        return (
                            <Card.Root
                                key={b.key}
                                flex="1"
                                borderRadius="card"
                                borderColor="border.subtle"
                                bg="bg.card"
                                variant="outline"
                            >
                                <Card.Body p={4}>
                                    <Stack gap={3}>
                                        <Flex justify="space-between" align="center">
                                            <Box
                                                w="36px"
                                                h="36px"
                                                borderRadius="full"
                                                bg={`${color}22`}
                                                color={color}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Icon size={18} />
                                            </Box>
                                            <Text color={color} fontWeight="700" fontSize="md">
                                                {b.percentage.toFixed(0)}%
                                            </Text>
                                        </Flex>
                                        <Box>
                                            <Text
                                                fontWeight="700"
                                                fontSize="md"
                                                color="text.primary"
                                            >
                                                {b.label}
                                            </Text>
                                            <Text
                                                fontWeight="800"
                                                fontSize={{ base: "md", md: "xl" }}
                                                color="text.primary"
                                                whiteSpace="nowrap"
                                            >
                                                {formatMoney(b.amount)}
                                            </Text>
                                        </Box>
                                        <Box
                                            h="6px"
                                            bg="surface.subtle"
                                            borderRadius="pill"
                                            overflow="hidden"
                                        >
                                            <Box
                                                h="full"
                                                w={`${pct}%`}
                                                bg={color}
                                                transition="width 220ms ease"
                                            />
                                        </Box>
                                    </Stack>
                                </Card.Body>
                            </Card.Root>
                        );
                    })}
                </Stack>
            </Card.Body>
        </Card.Root>
    );
}

"use client";

import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import type { TxWithCategory } from "@/lib/queries";
import { formatMoney } from "@/lib/utils/money";
import { resolveIcon } from "@/lib/utils/categories";
import { txDateLabel } from "@/lib/utils/dates";

interface TxItemProps {
    tx: TxWithCategory;
}

export function TxItem({ tx }: TxItemProps) {
    const IconCmp = resolveIcon(tx.categories?.icon);
    const positive = tx.type === "income";
    return (
        <Flex
            align="center"
            gap={3}
            py={3}
            px={4}
            borderRadius="button"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.card"
        >
            <Box
                w="44px"
                h="44px"
                borderRadius="full"
                bg={positive ? "rgba(16, 185, 129, 0.12)" : "brand.50"}
                color={positive ? "#047857" : "brand.700"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                {/* eslint-disable-next-line react-hooks/static-components -- IconCmp is a reference, not a new component */}
                <IconCmp size={20} />
            </Box>
            <Stack flex="1" minW={0} gap={0.5}>
                <Text fontWeight="700" fontSize="md" color="text.primary" lineClamp={1}>
                    {tx.categories?.name ?? "Transaction"}
                </Text>
                <Text fontSize="xs" color="text.secondary" lineClamp={1}>
                    {txDateLabel(tx.created_at)}
                </Text>
                <Text fontSize="xs" color="text.muted" lineClamp={1}>
                    {tx.description?.trim() || "No description"}
                </Text>
            </Stack>
            <Text
                fontWeight="800"
                fontSize="md"
                color={positive ? "success" : "danger"}
                flexShrink={0}
            >
                {positive ? "+" : "-"}
                {formatMoney(tx.amount)}
            </Text>
        </Flex>
    );
}

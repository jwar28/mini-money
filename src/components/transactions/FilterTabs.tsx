"use client";

import { Box, Flex } from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";

interface FilterTabsProps {
    value: "all" | "income" | "expense";
    onChange: (v: "all" | "income" | "expense") => void;
    onOpenFilters?: () => void;
}

export function FilterTabs({ value, onChange, onOpenFilters }: FilterTabsProps) {
    const tabs: Array<{ key: "all" | "income" | "expense"; label: string }> = [
        { key: "all", label: "All" },
        { key: "income", label: "Income" },
        { key: "expense", label: "Expenses" },
    ];

    return (
        <Flex justify="space-between" align="center" gap={2}>
            <Flex
                bg="surface.subtle"
                p={1}
                borderRadius="pill"
                gap={1}
                align="center"
            >
                {tabs.map((t) => (
                    <Box
                        key={t.key}
                        px={4}
                        py={2}
                        borderRadius="pill"
                        bg={value === t.key ? "bg.card" : "transparent"}
                        color={value === t.key ? "text.primary" : "text.secondary"}
                        fontWeight={value === t.key ? "700" : "500"}
                        cursor="pointer"
                        transition="all 0.15s ease"
                        onClick={() => onChange(t.key)}
                        fontSize="sm"
                    >
                        {t.label}
                    </Box>
                ))}
            </Flex>
            {onOpenFilters ? (
                <Box
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    borderWidth="1px"
                    borderColor="border.subtle"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    color="text.secondary"
                    onClick={onOpenFilters}
                >
                    <FiFilter />
                </Box>
            ) : null}
        </Flex>
    );
}

"use client";

import { Box, Flex } from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";

type FilterValue = "all" | "income" | "expense";

interface FilterTabsProps {
    value: FilterValue;
    onChange: (v: FilterValue) => void;
    onOpenFilters?: () => void;
}

const TABS: Array<{ key: FilterValue; label: string }> = [
    { key: "all", label: "All" },
    { key: "income", label: "Income" },
    { key: "expense", label: "Expenses" },
];

export function FilterTabs({ value, onChange, onOpenFilters }: FilterTabsProps) {
    const activeIndex = TABS.findIndex((t) => t.key === value);
    return (
        <Flex justify="space-between" align="center" gap={2}>
            <Box
                bg="surface.subtle"
                p={1}
                borderRadius="pill"
                gap={1}
                display="flex"
                alignItems="center"
                position="relative"
            >
                {TABS.map((t) => {
                    const isActive = t.key === value;
                    return (
                        <Box
                            key={t.key}
                            flex="1"
                            px={4}
                            py={2}
                            borderRadius="pill"
                            color={isActive ? "text.primary" : "text.secondary"}
                            fontWeight={isActive ? "700" : "500"}
                            fontSize="sm"
                            cursor="pointer"
                            position="relative"
                            zIndex={1}
                            transition="color 180ms ease"
                            onClick={() => onChange(t.key)}
                        >
                            {t.label}
                        </Box>
                    );
                })}
                <Box
                    aria-hidden
                    position="absolute"
                    top={1}
                    bottom={1}
                    left={1}
                    width={`calc((100% - 8px) / ${TABS.length})`}
                    borderRadius="pill"
                    bg="bg.card"
                    boxShadow="0 1px 2px rgba(15, 23, 42, 0.06)"
                    transform={`translateX(${activeIndex * 100}%)`}
                    transition="transform 220ms cubic-bezier(0.4, 0, 0.2, 1)"
                    pointerEvents="none"
                />
            </Box>
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

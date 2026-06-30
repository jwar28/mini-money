"use client";

import { Box, Button, NativeSelect } from "@chakra-ui/react";
import type { CategoryRow } from "@/types/database";

interface CategoryChipsProps {
    categories: CategoryRow[];
    selected: string | null;
    onSelect: (slug: string | null) => void;
}

export function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
    return (
        <>
            <Box
                display={{ base: "none", md: "block" }}
                position="relative"
                mx={{ base: -4, md: 0 }}
                px={{ base: 4, md: 0 }}
            >
                <Box
                    display="flex"
                    gap={2}
                    overflowX="auto"
                    pb={2}
                    css={{
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                    }}
                >
                    <Chip
                        label="All Categories"
                        isActive={selected === null}
                        onClick={() => onSelect(null)}
                    />
                    {categories.map((c) => (
                        <Chip
                            key={c.id}
                            label={c.name}
                            isActive={selected === c.slug}
                            onClick={() => onSelect(c.slug)}
                        />
                    ))}
                </Box>
                <Box
                    aria-hidden
                    position="absolute"
                    right={4}
                    top={0}
                    bottom="8px"
                    width="48px"
                    pointerEvents="none"
                    background="linear-gradient(to left, var(--mm-colors-bg-app) 10%, transparent)"
                />
            </Box>

            <Box display={{ base: "block", md: "none" }}>
                <NativeSelect.Root size="md">
                    <NativeSelect.Field
                        value={selected ?? ""}
                        onChange={(e) => onSelect(e.target.value || null)}
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.slug}>
                                {c.name}
                            </option>
                        ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
            </Box>
        </>
    );
}

function Chip({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
    return (
        <Button
            onClick={onClick}
            variant={isActive ? "solid" : "outline"}
          borderRadius="pill"
            size="md"
            fontWeight={isActive ? "700" : "500"}
            colorPalette={isActive ? "blue" : "gray"}
            flexShrink={0}
            whiteSpace="nowrap"
        >
            {label}
        </Button>
    );
}

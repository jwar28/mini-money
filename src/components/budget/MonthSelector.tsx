"use client";

import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { monthLabel } from "@/lib/utils/dates";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

interface MonthSelectorProps {
    year: number;
    month: number;
}

export function MonthSelector({ year, month }: MonthSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [, startTransition] = useTransition();

    const shift = (delta: number) => {
        const d = new Date(year, month - 1 + delta, 1);
        const nextYear = d.getFullYear();
        const nextMonth = d.getMonth() + 1;
        const ym = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
        startTransition(() => {
            router.replace(`${pathname}?ym=${ym}`, { scroll: false });
        });
    };

    return (
        <Flex
            align="center"
            justifyContent="space-between"
            bg="bg.card"
            borderRadius="button"
            borderWidth="1px"
            borderColor="border.subtle"
            px={2}
            py={2}
            maxW="320px"
        >
            <Button
                variant="ghost"
                size="sm"
                onClick={() => shift(-1)}
                aria-label="Previous month"
            >
                <FiChevronLeft />
            </Button>
            <Stack align="center" flex="1" gap={0}>
                <Heading size="md" fontWeight="800" textAlign="center">
                    {monthLabel(year, month)}
                </Heading>
            </Stack>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => shift(1)}
                aria-label="Next month"
            >
                <FiChevronRight />
            </Button>
        </Flex>
    );
}

"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { FiGrid, FiPieChart, FiList } from "react-icons/fi";
import type { ComponentType } from "react";

const NAV: Array<{ href: string; label: string; icon: ComponentType<{ size?: number }> }> = [
    { href: "/", label: "Dashboard", icon: FiGrid },
    { href: "/budget", label: "Budget", icon: FiPieChart },
    { href: "/transactions", label: "Transactions", icon: FiList },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <Box
            display={{ base: "block", md: "none" }}
            position="fixed"
            left={0}
            right={0}
            bottom={0}
            bg="bg.card"
            borderTopWidth="1px"
            borderColor="border.subtle"
            px={2}
            pt={2}
            pb={{ base: 5, md: 3 }}
            zIndex={20}
        >
            <Flex justify="space-around" align="center" gap={2}>
                {NAV.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <NextLink
                            key={item.href}
                            href={item.href}
                            prefetch={!isActive}
                            style={{ textDecoration: "none", flex: 1 }}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {isActive ? (
                                <ActiveItem item={item} Icon={Icon} />
                            ) : (
                                <IdleItem item={item} Icon={Icon} />
                            )}
                        </NextLink>
                    );
                })}
            </Flex>
        </Box>
    );
}

function ActiveItem({
    item,
    Icon,
}: {
    item: { label: string };
    Icon: ComponentType<{ size?: number }>;
}) {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={0.5}
            py={2}
            px={3}
            color="brand.700"
        >
            <Icon size={22} />
            <Text fontSize="xs" fontWeight="700" color="brand.700">
                {item.label}
            </Text>
        </Flex>
    );
}

function IdleItem({
    item,
    Icon,
}: {
    item: { label: string };
    Icon: ComponentType<{ size?: number }>;
}) {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={0.5}
            py={2}
            px={3}
            color="ink.500"
        >
            <Icon size={22} />
            <Text fontSize="xs" fontWeight="500" color="ink.500">
                {item.label}
            </Text>
        </Flex>
    );
}

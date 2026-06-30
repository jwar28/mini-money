"use client";

import { Box, Button, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
    FiGrid,
    FiPieChart,
    FiList,
    FiSettings,
    FiHelpCircle,
    FiPlus,
} from "react-icons/fi";
import { useTxModal } from "@/components/transactions/AddTransactionModalProvider";
import { signOutAction } from "@/lib/actions/auth";

const NAV = [
    { href: "/", label: "Dashboard", icon: FiGrid },
    { href: "/budget", label: "Budget", icon: FiPieChart },
    { href: "/transactions", label: "Transactions", icon: FiList },
];

export function Sidebar() {
    const pathname = usePathname();
    const { open } = useTxModal();

    return (
        <Box
            display={{ base: "none", md: "flex" }}
            position="fixed"
            top={0}
            left={0}
            bottom={0}
            w="260px"
            bg="surface.subtle"
            borderRightWidth="1px"
            borderColor="border.subtle"
            direction="column"
            px={6}
            py={8}
            justifyContent="space-between"
        >
            <Stack gap={8}>
                <Box>
                    <Text fontSize="xl" fontWeight="800" letterSpacing="-0.03em" color="text.primary">
                        Mini Money
                    </Text>
                    <Text fontSize="sm" color="text.secondary">
                        Salary Management
                    </Text>
                </Box>
                <Stack gap={1}>
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Button
                                key={item.href}
                                asChild
                                variant={isActive ? "subtle" : "ghost"}
                                colorPalette={isActive ? "blue" : "gray"}
                                justifyContent="flex-start"
                                size="lg"
                                fontWeight={isActive ? "700" : "500"}
                                borderLeftWidth={isActive ? "3px" : 0}
                                borderLeftColor="brand.600"
                                borderRadius="button"
                                px={4}
                            >
                                <NextLink href={item.href}>
                                    <Icon />
                                    {item.label}
                                </NextLink>
                            </Button>
                        );
                    })}
                </Stack>

                <Button
                    onClick={() => open()}
                    bg="ink.900"
                    color="white"
                    size="lg"
                    _hover={{ bg: "ink.700" }}
                    _active={{ bg: "ink.900" }}
                    justifyContent="flex-start"
                    colorPalette="gray"
                >
                    <FiPlus />
                    Add Transaction
                </Button>
            </Stack>

            <Stack gap={1} borderTopWidth="1px" borderColor="border.subtle" pt={6}>
                <Button
                    asChild
                    variant="ghost"
                    justifyContent="flex-start"
                    size="md"
                    color="text.secondary"
                >
                    <NextLink href="/settings">
                        <FiSettings /> Settings
                    </NextLink>
                </Button>
                <Button
                    asChild
                    variant="ghost"
                    justifyContent="flex-start"
                    size="md"
                    color="text.secondary"
                >
                    <NextLink href="/support">
                        <FiHelpCircle /> Support
                    </NextLink>
                </Button>
                <form action={signOutAction}>
                    <Button
                        type="submit"
                        variant="ghost"
                        justifyContent="flex-start"
                        size="md"
                        color="text.secondary"
                        width="full"
                    >
                        Sign out
                    </Button>
                </form>
            </Stack>
        </Box>
    );
}

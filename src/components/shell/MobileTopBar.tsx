"use client";

import { Box, Flex, IconButton } from "@chakra-ui/react";
import { FiBell } from "react-icons/fi";
import { AvatarButton } from "@/components/shell/AvatarButton";

export function MobileTopBar() {
    return (
        <Flex
            display={{ base: "flex", md: "none" }}
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="bg.card"
            borderBottomWidth="1px"
            borderColor="border.subtle"
        >
            <Flex align="center" gap={3}>
                <AvatarButton size="sm" />
                <Box fontSize="lg" fontWeight="700" letterSpacing="-0.02em">
                    Mini Money
                </Box>
            </Flex>
            <IconButton aria-label="Notifications" variant="ghost" size="sm">
                <FiBell />
            </IconButton>
        </Flex>
    );
}
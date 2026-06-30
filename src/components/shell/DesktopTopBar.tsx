"use client";

import { Flex, IconButton, Input, InputGroup } from "@chakra-ui/react";
import { FiBell, FiSearch, FiRotateCcw } from "react-icons/fi";
import { AvatarButton } from "@/components/shell/AvatarButton";

export function DesktopTopBar() {
    return (
        <Flex
            display={{ base: "none", md: "flex" }}
            align="center"
            justify="space-between"
            gap={4}
            px={8}
            py={5}
            bg="bg.card"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            position="sticky"
            top={0}
            zIndex={5}
        >
            <InputGroup maxW="520px" w="full" startElement={<FiSearch />}>
                <Input placeholder="Search data points..." bg="bg.card" />
            </InputGroup>
            <Flex align="center" gap={2}>
                <IconButton aria-label="Notifications" variant="ghost">
                    <FiBell />
                </IconButton>
                <IconButton aria-label="History" variant="ghost">
                    <FiRotateCcw />
                </IconButton>
                <AvatarButton size="sm" />
            </Flex>
        </Flex>
    );
}
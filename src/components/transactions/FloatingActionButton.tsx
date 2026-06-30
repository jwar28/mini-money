"use client";

import { IconButton } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useTxModal } from "@/components/transactions/AddTransactionModalProvider";

export function FloatingActionButton() {
    const { open } = useTxModal();
    return (
        <IconButton
            aria-label="Add transaction"
            onClick={() => open()}
            position="fixed"
            bottom={{ base: 110, md: 32 }}
            right={{ base: 6, md: 32 }}
            size="lg"
            bg="ink.900"
            color="white"
            borderRadius="full"
            w="56px"
            h="56px"
            boxShadow="0 12px 28px rgba(15, 23, 42, 0.4)"
            _hover={{ bg: "ink.700" }}
            display={{ md: "none" }}
            zIndex={10}
        >
            <FiPlus size={24} />
        </IconButton>
    );
}

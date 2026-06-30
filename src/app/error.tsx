"use client";

import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <Flex minH="100dvh" align="center" justify="center" p={6}>
            <Stack gap={4} maxW="md" textAlign="center">
                <Heading size="2xl" fontWeight="900">
                    Something went wrong
                </Heading>
                <Text color="text.secondary">
                    {error.message || "An unexpected error occurred."}
                </Text>
                <Flex gap={3} justify="center">
                    <Button onClick={reset} colorPalette="blue">
                        Try again
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/">Home</Link>
                    </Button>
                </Flex>
            </Stack>
        </Flex>
    );
}

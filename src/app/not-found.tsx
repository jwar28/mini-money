import { Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";

export default function NotFound() {
    return (
        <Flex minH="100dvh" align="center" justify="center" p={6}>
            <Stack gap={4} maxW="md" textAlign="center">
                <Heading size="4xl" fontWeight="900">
                    404
                </Heading>
                <Text color="text.secondary">The page you’re looking for doesn’t exist.</Text>
                <Flex justify="center">
                    <Button asChild colorPalette="blue">
                        <Link href="/">Back to dashboard</Link>
                    </Button>
                </Flex>
            </Stack>
        </Flex>
    );
}

import { Box, Flex, Stack, Text, Heading } from "@chakra-ui/react";

interface AuthShellProps {
    title: string;
    subtitle: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

export function AuthShell({ title, subtitle, footer, children }: AuthShellProps) {
    return (
        <Flex minH="100dvh" direction={{ base: "column", md: "row" }}>
            <Flex
                display={{ base: "none", md: "flex" }}
                flex="1"
                bg="brand.600"
                color="white"
                direction="column"
                justify="space-between"
                p={{ md: 10, lg: 16 }}
                position="relative"
                overflow="hidden"
            >
                <Box>
                    <Heading size="2xl" fontWeight="900" letterSpacing="-0.04em">
                        Mini Money
                    </Heading>
                    <Text mt={2} color="brand.100" fontSize="lg">
                        Personal finance with surgical precision.
                    </Text>
                </Box>
                <Stack gap={2}>
                    <Heading size="md" color="brand.50">
                        {title}
                    </Heading>
                    <Text color="brand.100">{subtitle}</Text>
                </Stack>
                <Box
                    position="absolute"
                    inset="auto -20% -30% auto"
                    w="60%"
                    h="60%"
                    borderRadius="50%"
                    bg="brand.500"
                    opacity={0.4}
                    filter="blur(80px)"
                />
            </Flex>

            <Flex flex={{ base: 1, md: "0 0 480px" }} align="center" justify="center" p={{ base: 6, md: 10 }}>
                <Box w="full" maxW="md">
                    <Stack gap={6}>
                        {children}
                        {footer}
                    </Stack>
                </Box>
            </Flex>
        </Flex>
    );
}

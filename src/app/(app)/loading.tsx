import { Stack, Skeleton, Box, Flex, Card } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Stack gap={6} pb={4} aria-busy="true" aria-label="Loading">
            <Skeleton height="32px" width="180px" borderRadius="button" />

            <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
                <Card.Body p={{ base: 5, md: 7 }}>
                    <Stack gap={5}>
                        <Skeleton height="20px" width="120px" />
                        <Skeleton height="64px" width="100%" borderRadius="button" />
                        <Skeleton height="14px" width="60%" />
                    </Stack>
                </Card.Body>
            </Card.Root>

            <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
                <Card.Body p={{ base: 5, md: 7 }}>
                    <Stack gap={5}>
                        <Flex justify="space-between" mb={2}>
                            <Skeleton height="20px" width="160px" />
                            <Skeleton height="32px" width="120px" borderRadius="full" />
                        </Flex>
                        {[...Array(4)].map((_, i) => (
                            <Box key={i}>
                                <Flex justify="space-between" mb={3}>
                                    <Flex align="center" gap={3}>
                                        <Skeleton height="44px" width="44px" borderRadius="full" />
                                        <Skeleton height="14px" width="100px" />
                                    </Flex>
                                    <Flex align="center" gap={3}>
                                        <Stack align="end" gap={0}>
                                            <Skeleton height="18px" width="80px" />
                                            <Skeleton height="12px" width="40px" />
                                        </Stack>
                                        <Skeleton height="32px" width="32px" borderRadius="full" />
                                    </Flex>
                                </Flex>
                                <Skeleton height="6px" width="100%" borderRadius="pill" />
                            </Box>
                        ))}
                    </Stack>
                </Card.Body>
            </Card.Root>

            <Skeleton height="64px" width="100%" borderRadius="button" />
        </Stack>
    );
}

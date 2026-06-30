import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

export default function Loading() {
    return (
        <Stack gap={6} pb={4} aria-busy="true" aria-label="Loading">
            <Skeleton height="32px" width="180px" borderRadius="button" />

            <Box
                borderRadius="card"
                bg="ink.900"
                color="white"
                p={{ base: 6, md: 8 }}
                boxShadow="0 14px 40px rgba(15, 23, 42, 0.18)"
            >
                <Stack gap={5}>
                    <Flex justify="space-between" align="center">
                        <Skeleton height="14px" width="80px" bg="rgba(255,255,255,0.1)" />
                        <Skeleton height="22px" width="100px" borderRadius="pill" bg="rgba(255,255,255,0.1)" />
                    </Flex>
                    <Skeleton height="56px" width="60%" bg="rgba(255,255,255,0.08)" />
                    <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                        <Skeleton height="28px" width="180px" borderRadius="pill" bg="rgba(255,255,255,0.1)" />
                        <Flex gap={5} wrap="wrap">
                            {[1, 2, 3, 4].map((i) => (
                                <Stack key={i} gap={1}>
                                    <Skeleton height="10px" width="56px" bg="rgba(255,255,255,0.08)" />
                                    <Skeleton height="14px" width="72px" bg="rgba(255,255,255,0.12)" />
                                </Stack>
                            ))}
                        </Flex>
                    </Flex>
                </Stack>
            </Box>

            {[1, 2].map((i) => (
                <Box
                    key={i}
                    borderRadius="card"
                    borderWidth="1px"
                    borderColor="border.subtle"
                    bg="bg.card"
                    p={{ base: 4, md: 6 }}
                >
                    <Stack gap={4}>
                        <Flex justify="space-between" mb={2}>
                            <Skeleton height="22px" width="160px" />
                            <Skeleton height="22px" width="100px" />
                        </Flex>
                        <Stack gap={3}>
                            {[1, 2, 3].map((j) => (
                                <Flex key={j} justify="space-between" align="center">
                                    <Flex align="center" gap={3}>
                                        <Skeleton height="44px" width="44px" borderRadius="full" />
                                        <Stack gap={1}>
                                            <Skeleton height="14px" width="120px" />
                                            <Skeleton height="10px" width="80px" />
                                        </Stack>
                                    </Flex>
                                    <Skeleton height="18px" width="80px" />
                                </Flex>
                            ))}
                        </Stack>
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
}

import { Box, Card, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { formatMoney } from "@/lib/utils/money";

interface TotalSavingsCardProps {
    total: number;
}

export function TotalSavingsCard({ total }: TotalSavingsCardProps) {
    const isDeficit = total < 0;
    const accent = isDeficit ? "#b91c1c" : "#059669";
    const iconBg = isDeficit ? "rgba(239, 68, 68, 0.12)" : "rgba(5, 150, 105, 0.12)";

    return (
        <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
            <Card.Body p={{ base: 4, md: 6 }}>
                <Flex justify="space-between" align="center" mb={3} gap={3}>
                    <Flex align="center" gap={3} minW={0}>
                        <Box
                            w="44px"
                            h="44px"
                            borderRadius="full"
                            bg={iconBg}
                            color={accent}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                        >
                            {isDeficit ? <FiTrendingDown size={20} /> : <FiTrendingUp size={20} />}
                        </Box>
                        <Stack gap={0} minW={0}>
                            <Heading size="md" fontWeight="800">
                                Total Savings
                            </Heading>
                            <Text fontSize="xs" color="text.secondary">
                                {isDeficit ? "Spent beyond locked savings" : "Across all months"}
                            </Text>
                        </Stack>
                    </Flex>
                    <Text
                        fontWeight="900"
                        fontSize={{ base: "xl", md: "2xl" }}
                        color={accent}
                        whiteSpace="nowrap"
                        letterSpacing="-0.03em"
                    >
                        {formatMoney(Math.abs(total))}
                    </Text>
                </Flex>
            </Card.Body>
        </Card.Root>
    );
}

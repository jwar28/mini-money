"use client";

import { Box, Card, Flex, Heading } from "@chakra-ui/react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { format } from "date-fns";

interface TrendRow {
    year: number;
    month: number;
    income: number;
    expense: number;
}

interface TrendChartProps {
    rows: TrendRow[];
    currentPeriod: { year: number; month: number };
}

export function TrendChart({ rows, currentPeriod }: TrendChartProps) {
    const data = rows.map((r) => {
        const date = new Date(r.year, r.month - 1, 1);
        return {
            label: format(date, "MMM"),
            income: r.income,
            expense: r.expense,
            isCurrent:
                r.year === currentPeriod.year && r.month === currentPeriod.month,
        };
    });

    return (
        <Card.Root
            borderRadius="card"
            borderColor="border.subtle"
            bg="bg.card"
            h="full"
        >
            <Card.Body p={{ base: 4, md: 6 }}>
                <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="lg" fontWeight="800">
                        Monthly Trend
                    </Heading>
                    <Flex gap={4} fontSize="xs" fontWeight="700">
                        <Legend color="#2563eb" label="Income" />
                        <Legend color="#cbd5e1" label="Expenses" />
                    </Flex>
                </Flex>
                <Box h={{ base: "240px", md: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis
                                dataKey="label"
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                fontSize={12}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                stroke="#94a3b8"
                                fontSize={12}
                                width={50}
                                tickFormatter={(v) =>
                                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                                }
                            />
                            <Tooltip
                                cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                                contentStyle={{
                                    borderRadius: 12,
                                    borderColor: "#e5e7eb",
                                    fontSize: 12,
                                }}
                                formatter={(value) =>
                                    new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD",
                                        maximumFractionDigits: 0,
                                    }).format(Number(value))
                                }
                            />
                            <Bar dataKey="income" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="expense" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Card.Body>
        </Card.Root>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <Flex align="center" gap={2} color="text.secondary">
            <Box w="10px" h="10px" bg={color} borderRadius="2px" />
            {label}
        </Flex>
    );
}

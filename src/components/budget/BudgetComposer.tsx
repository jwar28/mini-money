"use client";

import {
    memo,
    useActionState,
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
    type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    Flex,
    Heading,
    IconButton,
    Input,
    Menu,
    Portal,
    Slider,
    Stack,
    Text,
} from "@chakra-ui/react";
import {
    FiEdit3,
    FiLock,
    FiMoreVertical,
    FiPlus,
    FiSave,
    FiTrash2,
    FiUnlock,
} from "react-icons/fi";
import type { ComponentType } from "react";
import type { CategoryRow } from "@/types/database";
import { resolveIcon } from "@/lib/utils/categories";
import { formatMoney, formatWithDots, parseAmountInput } from "@/lib/utils/money";
import { lockBudgetAction, type LockFormState } from "@/lib/actions/budget";
import type { BudgetWithAllocations } from "@/lib/queries";
import { CategoryEditor } from "@/components/budget/CategoryEditor";
import { DeleteCategoryDialog } from "@/components/budget/DeleteCategoryDialog";

interface BudgetComposerProps {
    year: number;
    month: number;
    initial: BudgetWithAllocations | null;
    categories: CategoryRow[];
    currentUserId: string;
}

interface Row {
    percentage: number;
    is_visual_locked: boolean;
}

const DEFAULT_ROW: Row = { percentage: 0, is_visual_locked: false };

const initialFormState: LockFormState = {};

export function BudgetComposer({
    year,
    month,
    initial,
    categories,
    currentUserId,
}: BudgetComposerProps) {
    const router = useRouter();
    const salaryRef = useRef<HTMLInputElement>(null);
    const [salary, setSalary] = useState<string>(
        initial?.base_salary ? String(initial.base_salary) : "",
    );
    const baseSalary = parseAmountInput(salary);

    const onSalaryChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const oldValue = input.value;
        const oldCursor = input.selectionStart ?? oldValue.length;
        const isPaste = (e.nativeEvent as InputEvent).inputType === "insertFromPaste";

        let digitsBefore = 0;
        for (let i = 0; i < oldCursor; i++) {
            if (/\d/.test(oldValue[i])) digitsBefore++;
        }

        const rawDigits = oldValue.replace(/\D/g, "");
        setSalary(rawDigits);

        requestAnimationFrame(() => {
            if (!salaryRef.current) return;
            const displayed = formatWithDots(rawDigits);
            if (isPaste) {
                const pos = displayed.length;
                salaryRef.current.setSelectionRange(pos, pos);
                return;
            }
            let dc = 0;
            for (let i = 0; i <= displayed.length; i++) {
                if (dc === digitsBefore) {
                    salaryRef.current.setSelectionRange(i, i);
                    return;
                }
                if (i < displayed.length && /\d/.test(displayed[i])) dc++;
            }
        });
    };

    const initialAllocMap = useMemo(
        () =>
            new Map(
                (initial?.budget_allocations ?? []).map((a) => [
                    a.category_id,
                    {
                        percentage: Number(a.percentage),
                        is_visual_locked: !!a.is_visual_locked,
                    },
                ]),
            ),
        [initial],
    );

    const [overrides, setOverrides] = useState<Record<string, Row>>({});
    // Defer the merged override view so dragging a slider through many
    // categories doesn't re-derive every percentage label on every frame.
    const deferredOverrides = useDeferredValue(overrides);

    const [state, action, pending] = useActionState(lockBudgetAction, initialFormState);
    const [, startRefresh] = useTransition();

    const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
    const [creating, setCreating] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletePending, startDeleteTransition] = useTransition();

    useEffect(() => {
        if (state?.success) {
            startRefresh(() => {
                router.refresh();
            });
        }
    }, [state?.success, router, startRefresh]);

    const getRow = useCallback(
        (catId: string): Row =>
            deferredOverrides[catId] ?? initialAllocMap.get(catId) ?? DEFAULT_ROW,
        [deferredOverrides, initialAllocMap],
    );

    const setPercentage = useCallback(
        (catId: string, value: number) =>
            setOverrides((o) => ({
                ...o,
                [catId]: {
                    percentage: value,
                    is_visual_locked:
                        o[catId]?.is_visual_locked ??
                        initialAllocMap.get(catId)?.is_visual_locked ??
                        false,
                },
            })),
        [initialAllocMap],
    );

    const toggleLock = useCallback(
        (catId: string) =>
            setOverrides((o) => {
                const current =
                    o[catId]?.is_visual_locked ??
                    initialAllocMap.get(catId)?.is_visual_locked ??
                    false;
                const percentage =
                    o[catId]?.percentage ??
                    initialAllocMap.get(catId)?.percentage ??
                    0;
                return {
                    ...o,
                    [catId]: {
                        percentage,
                        is_visual_locked: !current,
                    },
                };
            }),
        [initialAllocMap],
    );

    // Stable handlers that wire directly to state setters; safe to pass
    // through React.memo without re-creating on each render.
    const handleEdit = useCallback((c: CategoryRow) => setEditingCategory(c), []);
    const handleDeleteAsk = useCallback((c: CategoryRow) => {
        setDeleteError(null);
        setDeletingCategory(c);
    }, []);
    const closeEdit = useCallback(() => setEditingCategory(null), []);
    const closeCreate = useCallback(() => setCreating(false), []);

    const rows = useMemo(
        () =>
            categories.map((c) => {
                const r = getRow(c.id);
                return {
                    cat: c,
                    row: {
                        category_id: c.id,
                        percentage: r.percentage,
                        is_visual_locked: r.is_visual_locked,
                    },
                };
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [categories, deferredOverrides, initialAllocMap],
    );

    const totals = useMemo(
        () => rows.reduce((s, r) => s + r.row.percentage, 0),
        [rows],
    );
    const balanced = Math.abs(totals - 100) < 0.005;
    const hasSalary = baseSalary > 0;

    const allocationsPayload = useMemo(
        () =>
            rows
                .filter((r) => r.row.percentage > 0 || r.row.is_visual_locked)
                .map((r) => ({
                    category_id: r.row.category_id,
                    percentage: r.row.percentage,
                    is_visual_locked: r.row.is_visual_locked,
                })),
        [rows],
    );

    const userCategories = categories.filter((c) => c.user_id === currentUserId);
    const customCount = userCategories.length;

    const handleConfirmDelete = () => {
        if (!deletingCategory) return;
        setDeleteError(null);
        startDeleteTransition(async () => {
            const { deleteCategoryAction } = await import("@/lib/actions/categories");
            const result = await deleteCategoryAction(deletingCategory.id);
            if (result.error) {
                setDeleteError(result.error);
                return;
            }
            setDeletingCategory(null);
            router.refresh();
        });
    };

    const closeDeleteDialog = () => {
        if (deletePending) return;
        setDeletingCategory(null);
        setDeleteError(null);
    };

    return (
        <form action={action}>
            <input type="hidden" name="year" value={year} />
            <input type="hidden" name="month" value={month} />
            <input type="hidden" name="base_salary" value={baseSalary} />
            <input
                type="hidden"
                name="allocations_json"
                value={JSON.stringify(allocationsPayload)}
            />

            <Stack gap={6}>
                <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
                    <Card.Body p={{ base: 5, md: 7 }}>
                        <Stack gap={5}>
                            <Heading size="md" fontWeight="800">
                                Monthly Base Salary
                            </Heading>
                            <Box position="relative" maxW="100%">
                                <Text
                                    position="absolute"
                                    top="50%"
                                    left={4}
                                    transform="translateY(-50%)"
                                    color="text.muted"
                                    fontWeight="800"
                                    fontSize="2xl"
                                    pointerEvents="none"
                                >
                                    $
                                </Text>
                                <Input
                                    ref={salaryRef}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    pl={10}
                                    pr={4}
                                    h="64px"
                                    fontSize="3xl"
                                    fontWeight="800"
                                    bg="surface.subtle"
                                    border="none"
                                    borderRadius="button"
                                    value={formatWithDots(salary)}
                                    onChange={onSalaryChange}
                                    placeholder="0"
                                />
                            </Box>
                        </Stack>
                    </Card.Body>
                </Card.Root>

                <Card.Root borderRadius="card" borderColor="border.subtle" bg="bg.card">
                    <Card.Body p={{ base: 5, md: 7 }}>
                        <Flex justify="space-between" align="center" mb={5} wrap="wrap" gap={3}>
                            <Heading size="md" fontWeight="800">
                                Allocation Rules
                            </Heading>
                            <TotalizerBadge total={totals} />
                        </Flex>
                        {categories.length === 0 ? (
                            <Stack align="center" gap={3} py={6} color="text.secondary">
                                <Text fontSize="3xl">📂</Text>
                                <Text fontWeight="700" color="text.primary">
                                    No categories yet
                                </Text>
                                <Text fontSize="sm">
                                    Add a custom category to start tuning your budget.
                                </Text>
                            </Stack>
                        ) : null}
                        <Stack gap={5}>
                            {rows.map(({ cat, row }) => (
                                <AllocationRow
                                    key={cat.id}
                                    cat={cat}
                                    amount={(baseSalary * row.percentage) / 100}
                                    percentage={row.percentage}
                                    locked={row.is_visual_locked}
                                    isEditable={cat.user_id === currentUserId}
                                    onPercentageChange={setPercentage}
                                    onToggleLock={toggleLock}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteAsk}
                                />
                            ))}
                            <Button
                                type="button"
                                onClick={() => setCreating(true)}
                                variant="outline"
                                borderStyle="dashed"
                                borderWidth="2px"
                                borderColor={categories.length === 0 ? "brand.500" : "border.subtle"}
                                color={categories.length === 0 ? "brand.700" : "text.secondary"}
                                bg="transparent"
                                _hover={{
                                    borderColor: "brand.500",
                                    color: "brand.600",
                                    bg: "brand.50",
                                }}
                                fontWeight="700"
                                h="56px"
                                borderRadius="button"
                            >
                                <Box asChild mr={2}>
                                    <FiPlus />
                                </Box>
                                Add Custom Category
                                {customCount > 0 ? (
                                    <Text as="span" ml={2} color="text.muted" fontWeight="500">
                                        ({customCount} custom)
                                    </Text>
                                ) : null}
                            </Button>
                        </Stack>
                    </Card.Body>
                </Card.Root>

                {state?.error ? (
                    <Text color="danger" fontSize="sm">
                        {state.error}
                    </Text>
                ) : null}

                <Button
                    type="submit"
                    size="xl"
                    h="64px"
                    bg="ink.900"
                    color="white"
                    _hover={{ bg: "ink.700" }}
                    _active={{ bg: "ink.900" }}
                    fontWeight="800"
                    fontSize="lg"
                    loading={pending}
                    loadingText="Saving"
                    disabled={!balanced || !hasSalary}
                >
                    <Box asChild mr={2}>
                        <FiSave />
                    </Box>
                    Lock Budget Distribution
                </Button>
            </Stack>

            <CategoryEditor
                key="category-create"
                mode="create"
                category={null}
                open={creating}
                onClose={closeCreate}
                onSaved={() => router.refresh()}
            />

            <CategoryEditor
                key={
                    editingCategory
                        ? `category-edit-${editingCategory.id}`
                        : "category-edit-closed"
                }
                mode="edit"
                category={editingCategory}
                open={!!editingCategory}
                onClose={closeEdit}
                onSaved={() => router.refresh()}
            />

            <DeleteCategoryDialog
                category={deletingCategory}
                onClose={closeDeleteDialog}
                onConfirm={handleConfirmDelete}
                pending={deletePending}
                error={deleteError}
            />
        </form>
    );
}

interface AllocationRowProps {
    cat: CategoryRow;
    amount: number;
    percentage: number;
    locked: boolean;
    isEditable: boolean;
    onPercentageChange: (catId: string, value: number) => void;
    onToggleLock: (catId: string) => void;
    onEdit: (cat: CategoryRow) => void;
    onDelete: (cat: CategoryRow) => void;
}

const AllocationRow = memo(function AllocationRow({
    cat,
    amount,
    percentage,
    locked,
    isEditable,
    onPercentageChange,
    onToggleLock,
    onEdit,
    onDelete,
}: AllocationRowProps) {
    const IconCmp = useMemo(
        () => resolveIcon(cat.icon) as ComponentType<{ size?: number }>,
        [cat.icon],
    );
    return (
        <Box>
            <Flex justify="space-between" align="center" mb={3} gap={3}>
                <Flex align="center" gap={3} minW={0} flex="1">
                    <Box
                        w="44px"
                        h="44px"
                        borderRadius="full"
                        bg="brand.50"
                        color="brand.700"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                    >
                        <IconCmp size={20} />
                    </Box>
                    <Text fontWeight="700" fontSize="md" color="text.primary" lineClamp={1}>
                        {cat.name}
                    </Text>
                </Flex>
                <Flex align="center" gap={3}>
                    <Stack align="end" gap={0}>
                        <Text fontWeight="800" fontSize="lg">
                            {formatMoney(amount, { decimals: 0 })}
                        </Text>
                        <Text fontSize="xs" color="text.secondary">
                            {percentage.toFixed(0)}%
                        </Text>
                    </Stack>
                    <IconButton
                        aria-label={locked ? "Unlock allocation" : "Lock allocation"}
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleLock(cat.id)}
                        color={locked ? "brand.600" : "ink.400"}
                    >
                        {locked ? <FiLock /> : <FiUnlock />}
                    </IconButton>
                    {isEditable ? (
                        <Menu.Root positioning={{ placement: "bottom-end" }}>
                            <Menu.Trigger asChild>
                                <IconButton
                                    aria-label={`Manage ${cat.name}`}
                                    variant="ghost"
                                    size="sm"
                                    color="ink.400"
                                >
                                    <FiMoreVertical />
                                </IconButton>
                            </Menu.Trigger>
                            <Portal>
                                <Menu.Positioner>
                                    <Menu.Content minW="180px">
                                        <Menu.Item value="edit" onSelect={() => onEdit(cat)}>
                                            <FiEdit3 />
                                            Edit
                                        </Menu.Item>
                                        <Menu.Separator />
                                        <Menu.Item
                                            value="delete"
                                            onSelect={() => onDelete(cat)}
                                            color="danger"
                                        >
                                            <FiTrash2 />
                                            Delete
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu.Positioner>
                            </Portal>
                        </Menu.Root>
                    ) : null}
                </Flex>
            </Flex>
            <Slider.Root
                value={[percentage]}
                min={0}
                max={100}
                step={1}
                onValueChange={(d) => onPercentageChange(cat.id, d.value[0] ?? 0)}
            >
                <Slider.Control>
                    <Slider.Track bg="surface.subtle" h="6px" borderRadius="pill">
                        <Slider.Range bg="brand.600" />
                    </Slider.Track>
                    <Slider.Thumb
                        index={0}
                        boxShadow="0 0 0 4px rgba(37, 99, 235, 0.25)"
                    />
                </Slider.Control>
            </Slider.Root>
        </Box>
    );
});

function TotalizerBadge({ total }: { total: number }) {
    const balanced = Math.abs(total - 100) < 0.005;
    if (balanced) {
        return (
            <Flex
                align="center"
                gap={2}
                bg="rgba(16, 185, 129, 0.12)"
                color="#047857"
                px={3}
                py={1.5}
                borderRadius="pill"
                fontWeight="700"
                fontSize="sm"
            >
                <Flex
                    align="center"
                    justify="center"
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    borderWidth="2px"
                    borderColor="#047857"
                    color="#047857"
                    fontSize="11px"
                    fontWeight="900"
                >
                    ✓
                </Flex>
                Balanced: {total.toFixed(0)}%
            </Flex>
        );
    }
    return (
        <Flex
            align="center"
            gap={2}
            bg="rgba(239, 68, 68, 0.12)"
            color="#b91c1c"
            px={3}
            py={1.5}
            borderRadius="pill"
            fontWeight="700"
            fontSize="sm"
        >
            <Box
                w="16px"
                h="16px"
                borderRadius="full"
                bg="rgba(239, 68, 68, 0.3)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="11px"
                fontWeight="900"
                color="#b91c1c"
            >
                !
            </Box>
            {total > 100 ? `Over ${total.toFixed(0)}%` : `${total.toFixed(0)}% assigned`}
        </Flex>
    );
}

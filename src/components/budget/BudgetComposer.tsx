"use client";

import {
    useActionState,
    useEffect,
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
    Dialog,
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
    FiAlertTriangle,
    FiCheckCircle,
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
import { deleteCategoryAction } from "@/lib/actions/categories";
import type { BudgetWithAllocations } from "@/lib/queries";
import { CategoryEditor } from "@/components/budget/CategoryEditor";
import { blurActiveElement } from "@/lib/utils/focus-utils";

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

    // Live-format salary input: type=number can't show thousands separators,
    // so we keep a digits-only state and render a text input with dots inserted
    // on every keystroke. Cursor position is mapped by digit-count so that
    // newly-inserted dots don't push the caret forward unexpectedly.
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
    const initialAllocMap = new Map(
        (initial?.budget_allocations ?? []).map((a) => [
            a.category_id,
            {
                percentage: Number(a.percentage),
                is_visual_locked: !!a.is_visual_locked,
            },
        ]),
    );
    // Local user input layered over the saved allocations. Newly added
    // categories (after a CRUD refresh) automatically get DEFAULT_ROW from the
    // getRow() helper below, so they never produce an `undefined` row.
    const [overrides, setOverrides] = useState<Record<string, Row>>({});

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

    const getRow = (catId: string): Row =>
        overrides[catId] ?? initialAllocMap.get(catId) ?? DEFAULT_ROW;

    const setPercentage = (catId: string, value: number) =>
        setOverrides((o) => ({
            ...o,
            [catId]: { ...getRow(catId), percentage: value },
        }));

    const toggleLock = (catId: string) =>
        setOverrides((o) => ({
            ...o,
            [catId]: {
                ...getRow(catId),
                is_visual_locked: !getRow(catId).is_visual_locked,
            },
        }));

    // Always derive the full row list from the current categories so renderings
    // reflect newly added ids without needing a remount.
    const rows = categories.map((c) => ({ category_id: c.id, ...getRow(c.id) }));

    const totals = rows.reduce((s, r) => s + r.percentage, 0);
    const balanced = Math.abs(totals - 100) < 0.005;
    const hasSalary = baseSalary > 0;

    const allocationsPayload = rows.filter(
        (r) => r.percentage > 0 || r.is_visual_locked,
    );

    const userCategories = categories.filter((c) => c.user_id === currentUserId);
    const customCount = userCategories.length;

    const handleConfirmDelete = () => {
        if (!deletingCategory) return;
        setDeleteError(null);
        startDeleteTransition(async () => {
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
                value={JSON.stringify(
                    allocationsPayload.map((r) => ({
                        category_id: r.category_id,
                        percentage: r.percentage,
                        is_visual_locked: r.is_visual_locked,
                    })),
                )}
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
                            {categories.map((cat) => {
                                const row = getRow(cat.id);
                                const IconCmp = resolveIcon(cat.icon);
                                const isEditable = cat.user_id === currentUserId;
                                return (
                                    <AllocationRow
                                        key={cat.id}
                                        icon={IconCmp as ComponentType<{ size?: number }>}
                                        name={cat.name}
                                        amount={(baseSalary * row.percentage) / 100}
                                        percentage={row.percentage}
                                        locked={row.is_visual_locked}
                                        isEditable={isEditable}
                                        onPercentageChange={(v) => setPercentage(cat.id, v)}
                                        onToggleLock={() => toggleLock(cat.id)}
                                        onEdit={() => setEditingCategory(cat)}
                                        onDelete={() => {
                                            setDeleteError(null);
                                            setDeletingCategory(cat);
                                        }}
                                    />
                                );
                            })}
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
                onClose={() => setCreating(false)}
                onSaved={() => router.refresh()}
            />

            <CategoryEditor
                key={editingCategory ? `category-edit-${editingCategory.id}` : "category-edit-closed"}
                mode="edit"
                category={editingCategory}
                open={!!editingCategory}
                onClose={() => setEditingCategory(null)}
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

function AllocationRow({
    icon: IconCmp,
    name,
    amount,
    percentage,
    locked,
    isEditable,
    onPercentageChange,
    onToggleLock,
    onEdit,
    onDelete,
}: {
    icon: ComponentType<{ size?: number }>;
    name: string;
    amount: number;
    percentage: number;
    locked: boolean;
    isEditable: boolean;
    onPercentageChange: (v: number) => void;
    onToggleLock: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
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
                        {name}
                    </Text>
                </Flex>
                <Flex align="center" gap={3}>
                    <Stack align="end" gap={0}>
                        <Text fontWeight="800" fontSize="lg">
                            {formatMoney(amount)}
                        </Text>
                        <Text fontSize="xs" color="text.secondary">
                            {percentage.toFixed(0)}%
                        </Text>
                    </Stack>
                    <IconButton
                        aria-label={locked ? "Unlock allocation" : "Lock allocation"}
                        variant="ghost"
                        size="sm"
                        onClick={onToggleLock}
                        color={locked ? "brand.600" : "ink.400"}
                    >
                        {locked ? <FiLock /> : <FiUnlock />}
                    </IconButton>
                    {isEditable ? (
                        <Menu.Root positioning={{ placement: "bottom-end" }}>
                            <Menu.Trigger asChild>
                                <IconButton
                                    aria-label={`Manage ${name}`}
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
                                        <Menu.Item
                                            value="edit"
                                            onSelect={() => onEdit()}
                                        >
                                            <FiEdit3 />
                                            Edit
                                        </Menu.Item>
                                        <Menu.Separator />
                                        <Menu.Item
                                            value="delete"
                                            onSelect={() => onDelete()}
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
                onValueChange={(d) => onPercentageChange(d.value[0] ?? 0)}
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
}

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
                <FiCheckCircle />
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
            <FiAlertTriangle />
            {total > 100 ? `Over ${total.toFixed(0)}%` : `${total.toFixed(0)}% assigned`}
        </Flex>
    );
}

function DeleteCategoryDialog({
    category,
    onClose,
    onConfirm,
    pending,
    error,
}: {
    category: CategoryRow | null;
    onClose: () => void;
    onConfirm: () => void;
    pending: boolean;
    error: string | null;
}) {
    const open = !!category;
    const body = (
        <Stack gap={4}>
            <Text>
                Delete <strong>{category?.name}</strong>? Any budget allocations linked to it will
                also be removed. This action cannot be undone.
            </Text>
            {error ? (
                <Box
                    p={3}
                    borderRadius="button"
                    bg="rgba(239, 68, 68, 0.08)"
                    color="#b91c1c"
                    fontSize="sm"
                >
                    {error}
                </Box>
            ) : null}
            <Flex gap={3} justify="end">
                <Button variant="outline" onClick={onClose} disabled={pending}>
                    Cancel
                </Button>
                <Button colorPalette="red" onClick={onConfirm} loading={pending} loadingText="Deleting">
                    Delete
                </Button>
            </Flex>
        </Stack>
    );

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => {
                if (!d.open) {
                    blurActiveElement();
                    onClose();
                }
            }}
            size="md"
            role="alertdialog"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Delete category</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>{body}</Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

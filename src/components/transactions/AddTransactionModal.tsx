"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import {
    Box,
    Button,
    Dialog,
    Drawer,
    Field,
    Input,
    NativeSelect,
    Portal,
    Stack,
    Text,
    Textarea,
} from "@chakra-ui/react";
import { useTxModal } from "./AddTransactionModalProvider";
import { createClient } from "@/lib/supabase/client";
import {
    createTransactionAction,
    type TxFormState,
} from "@/lib/actions/transactions";
import { blurActiveElement } from "@/lib/utils/focus-utils";
import type { CategoryRow } from "@/types/database";

const initial: TxFormState = {};

function useIsDesktop(): boolean {
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 768px)");
        const onChange = () => setIsDesktop(mq.matches);
        onChange();
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return isDesktop;
}

function handleOpenChange(open: boolean, close: () => void): void {
    if (!open) {
        blurActiveElement();
        close();
    }
}

interface InnerProps {
    isOpen: boolean;
    onClose: () => void;
}

function AddTxInner({ isOpen, onClose }: InnerProps) {
    const [categories, setCategories] = useState<CategoryRow[]>([]);
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [occurredOn, setOccurredOn] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [, startTransition] = useTransition();
    const [state, action, pending] = useActionState(createTransactionAction, initial);

    useEffect(() => {
        if (!isOpen) return;
        const supabase = createClient();
        (async () => {
            const { data } = await supabase
                .from("categories")
                .select("*")
                .order("bucket", { ascending: true })
                .order("name", { ascending: true });
            setCategories(data ?? []);
        })();
    }, [isOpen]);

    useEffect(() => {
        if (state?.success) {
            startTransition(() => {
                setAmount("");
                setDescription("");
                setCategoryId("");
                setOccurredOn(new Date().toISOString().slice(0, 10));
                onClose();
            });
        }
    }, [state?.success, onClose, startTransition]);

    const filtered = categories.filter(
        (c) => c.type === type || (type === "expense" && c.type === "savings"),
    );

    const form = (
        <form action={action}>
            <Stack gap={4}>
                <input type="hidden" name="type" value={type} />
                <Field.Root>
                    <Field.Label>Type</Field.Label>
                    <Box display="flex" gap={2}>
                        {(["expense", "income"] as const).map((t) => (
                            <Button
                                key={t}
                                type="button"
                                variant={type === t ? "solid" : "outline"}
                                colorPalette={t === "income" ? "green" : "blue"}
                                flex="1"
                                onClick={() => {
                                    setType(t);
                                    setCategoryId("");
                                }}
                                fontWeight={type === t ? "700" : "500"}
                            >
                                {t === "income" ? "Income" : "Expense"}
                            </Button>
                        ))}
                    </Box>
                </Field.Root>

                <Field.Root>
                    <Field.Label>Amount</Field.Label>
                    <Input
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Category</Field.Label>
                    <NativeSelect.Root>
                        <NativeSelect.Field
                            name="category_id"
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="" disabled>
                                Select a category
                            </option>
                            {filtered.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Field.Root>

                <Field.Root>
                    <Field.Label>Date</Field.Label>
                    <Input
                        name="occurred_on"
                        type="date"
                        value={occurredOn}
                        onChange={(e) => setOccurredOn(e.target.value)}
                        required
                    />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Description</Field.Label>
                    <Textarea
                        name="description"
                        rows={2}
                        placeholder="Optional note"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Field.Root>

                {state?.error ? (
                    <Text color="danger" fontSize="sm">
                        {state.error}
                    </Text>
                ) : null}

                <Button
                    type="submit"
                    colorPalette="blue"
                    loading={pending}
                    loadingText="Saving"
                    width="full"
                >
                    Save transaction
                </Button>
            </Stack>
        </form>
    );

    return form;
}

function AddTxMobile({ isOpen, onClose }: InnerProps) {
    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={(d) => handleOpenChange(d.open, onClose)}
            placement="bottom"
            size="md"
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content borderTopRadius="24px">
                        <Drawer.Header borderBottomWidth="1px" borderColor="border.subtle">
                            <Drawer.Title>Add transaction</Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body py={4}>
                            <AddTxInner isOpen={isOpen} onClose={onClose} />
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}

function AddTxDesktop({ isOpen, onClose }: InnerProps) {
    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(d) => handleOpenChange(d.open, onClose)}
            size="md"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Add transaction</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body py={4}>
                            <AddTxInner isOpen={isOpen} onClose={onClose} />
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export function AddTransactionModal() {
    const { isOpen, close } = useTxModal();
    const isDesktop = useIsDesktop();
    return isDesktop ? (
        <AddTxDesktop isOpen={isOpen} onClose={close} />
    ) : (
        <AddTxMobile isOpen={isOpen} onClose={close} />
    );
}

"use client";

import {
    useEffect,
    useRef,
    useState,
    useTransition,
    useActionState,
    type ChangeEvent,
} from "react";
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
import {
    createTransactionAction,
    type TxFormState,
} from "@/lib/actions/transactions";
import { blurActiveElement } from "@/lib/utils/focus-utils";
import {
    formatWithDots,
    parseAmountInput,
} from "@/lib/utils/money";

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
    onClose: () => void;
}

function AddTxInner({ onClose }: InnerProps) {
    const { categories } = useTxModal();
    const [type, setType] = useState<"income" | "expense">("expense");
    const [amountRaw, setAmountRaw] = useState("");
    const amountRef = useRef<HTMLInputElement>(null);
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [occurredOn, setOccurredOn] = useState(() =>
        new Date().toISOString().slice(0, 10),
    );
    const [, startTransition] = useTransition();
    const [state, action, pending] = useActionState(createTransactionAction, initial);

    const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const oldValue = input.value;
        const oldCursor = input.selectionStart ?? oldValue.length;
        const isPaste = (e.nativeEvent as InputEvent).inputType === "insertFromPaste";

        let digitsBefore = 0;
        for (let i = 0; i < oldCursor; i++) {
            if (/\d/.test(oldValue[i])) digitsBefore++;
        }

        const rawDigits = oldValue.replace(/\D/g, "");
        setAmountRaw(rawDigits);

        requestAnimationFrame(() => {
            if (!amountRef.current) return;
            const displayed = formatWithDots(rawDigits);
            if (isPaste) {
                const pos = displayed.length;
                amountRef.current.setSelectionRange(pos, pos);
                return;
            }
            let dc = 0;
            for (let i = 0; i <= displayed.length; i++) {
                if (dc === digitsBefore) {
                    amountRef.current.setSelectionRange(i, i);
                    return;
                }
                if (i < displayed.length && /\d/.test(displayed[i])) dc++;
            }
        });
    };

    useEffect(() => {
        if (state?.success) {
            startTransition(() => {
                setAmountRaw("");
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
                        ref={amountRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0"
                        value={formatWithDots(amountRaw)}
                        onChange={onAmountChange}
                        required
                    />
                    <input type="hidden" name="amount" value={parseAmountInput(amountRaw)} />
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

interface WrapperProps {
    isOpen: boolean;
    onClose: () => void;
}

function AddTxMobile({ isOpen, onClose }: WrapperProps) {
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
                            <AddTxInner onClose={onClose} />
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}

function AddTxDesktop({ isOpen, onClose }: WrapperProps) {
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
                            <AddTxInner onClose={onClose} />
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

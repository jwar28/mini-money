"use client";

import {
    Box,
    Button,
    Dialog,
    Flex,
    Portal,
    Stack,
    Text,
} from "@chakra-ui/react";
import { blurActiveElement } from "@/lib/utils/focus-utils";
import type { CategoryRow } from "@/types/database";

interface DeleteCategoryDialogProps {
    category: CategoryRow | null;
    onClose: () => void;
    onConfirm: () => void;
    pending: boolean;
    error: string | null;
}

export function DeleteCategoryDialog({
    category,
    onClose,
    onConfirm,
    pending,
    error,
}: DeleteCategoryDialogProps) {
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

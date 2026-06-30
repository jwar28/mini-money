"use client";

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
} from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import {
    useActionState,
    useEffect,
    useId,
    useState,
    useTransition,
} from "react";
import {
    CATEGORY_ICONS,
    slugifyCategoryName,
} from "@/lib/utils/category-icons";
import {
    CATEGORY_PRESETS,
    getPreset,
    presetFromTypeBucket,
} from "@/lib/utils/category-presets";
import {
    createCategoryAction,
    updateCategoryAction,
    type CategoryFormState,
} from "@/lib/actions/categories";
import { blurActiveElement } from "@/lib/utils/focus-utils";
import type { BucketName, CategoryRow, CategoryType } from "@/types/database";

const initialState: CategoryFormState = {};

export interface CategoryEditorProps {
    mode: "create" | "edit";
    category: CategoryRow | null;
    open: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

interface EditorFormState {
    name: string;
    setName: (v: string) => void;
    slug: string;
    setSlug: (v: string) => void;
    slugTouched: boolean;
    setSlugTouched: (v: boolean) => void;
    icon: string;
    setIcon: (v: string) => void;
    kind: string;
    setKind: (v: string) => void;
}

function useEditorState(category: CategoryRow | null): EditorFormState {
    const isEdit = !!category;
    const [name, setName] = useState(category?.name ?? "");
    const [slug, setSlug] = useState(category?.slug ?? "");
    const [icon, setIcon] = useState(
        category?.icon ?? CATEGORY_ICONS[0]!.name,
    );

    const initialPreset =
        presetFromTypeBucket(
            (category?.type as CategoryType) ?? "expense",
            (category?.bucket as BucketName) ?? "needs",
        )?.value ?? CATEGORY_PRESETS[0]!.value;
    const [kind, setKind] = useState<string>(initialPreset);
    const [slugTouched, setSlugTouched] = useState(isEdit);
    return {
        name,
        setName,
        slug,
        setSlug,
        slugTouched,
        setSlugTouched,
        icon,
        setIcon,
        kind,
        setKind,
    };
}

interface EditorBodyProps {
    mode: "create" | "edit";
    category: CategoryRow | null;
    onClose: () => void;
    onSaved?: () => void;
    state: EditorFormState;
}

function CategoryEditorBody({ mode, category, onClose, onSaved, state }: EditorBodyProps) {
    const isEdit = mode === "edit" && !!category;

    const wrappedAction = (passedState: CategoryFormState, formData: FormData) =>
        isEdit && category
            ? updateCategoryAction(category.id, passedState, formData)
            : createCategoryAction(passedState, formData);

    const [actionState, action, pending] = useActionState(wrappedAction, initialState);
    const [, startRefresh] = useTransition();

    useEffect(() => {
        if (actionState?.success) {
            startRefresh(() => {
                onSaved?.();
                onClose();
            });
        }
    }, [actionState?.success, onClose, onSaved, startRefresh]);

    const nameId = useId();
    const slugId = useId();
    const iconId = useId();
    const kindId = useId();

    const handleNameBlur = () => {
        if (!state.slugTouched) {
            state.setSlug(slugifyCategoryName(state.name));
        }
    };

    const selectedPreset = getPreset(state.kind) ?? CATEGORY_PRESETS[0]!;
    const isIncome = isEdit && category?.type === "income";

    return (
        <form action={action} noValidate>
            <Stack gap={5}>
                <Field.Root invalid={!!actionState?.fieldErrors?.name}>
                    <Field.Label htmlFor={nameId}>Name</Field.Label>
                    <Input
                        id={nameId}
                        name="name"
                        placeholder="e.g. Pet Care"
                        value={state.name}
                        onChange={(e) => state.setName(e.target.value)}
                        onBlur={handleNameBlur}
                        maxLength={40}
                    />
                    {actionState?.fieldErrors?.name ? (
                        <Field.ErrorText>{actionState.fieldErrors.name}</Field.ErrorText>
                    ) : null}
                </Field.Root>

                <Field.Root invalid={!!actionState?.fieldErrors?.slug}>
                    <Field.Label htmlFor={slugId}>Slug</Field.Label>
                    <Input
                        id={slugId}
                        name="slug"
                        placeholder="pet-care"
                        value={state.slug}
                        onChange={(e) => {
                            state.setSlug(e.target.value);
                            state.setSlugTouched(true);
                        }}
                        maxLength={40}
                    />
                    <Field.HelperText>Lowercase letters, numbers and dashes.</Field.HelperText>
                    {actionState?.fieldErrors?.slug ? (
                        <Field.ErrorText>{actionState.fieldErrors.slug}</Field.ErrorText>
                    ) : null}
                </Field.Root>

                <Field.Root invalid={!!actionState?.fieldErrors?.icon}>
                    <Field.Label htmlFor={iconId}>Icon</Field.Label>
                    <input type="hidden" name="icon" value={state.icon} />
                    <Box
                        id={iconId}
                        role="radiogroup"
                        aria-label="Choose an icon"
                        display="grid"
                        gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                        gap="8px"
                        w="full"
                    >
                        {CATEGORY_ICONS.map(({ name: iconName, component: IconCmp }) => {
                            const selected = state.icon === iconName;
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => state.setIcon(iconName)}
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: 48,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderStyle: "solid",
                                        borderColor: selected
                                            ? "var(--mm-colors-brand-500)"
                                            : "var(--mm-colors-border-subtle)",
                                        background: selected
                                            ? "var(--mm-colors-brand-50)"
                                            : "var(--mm-colors-bg-card)",
                                        color: selected
                                            ? "var(--mm-colors-brand-700)"
                                            : "var(--mm-colors-ink-700)",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        outline: "none",
                                    }}
                                >
                                    <IconCmp size={20} />
                                    {selected ? (
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: 2,
                                                right: 4,
                                                color: "var(--mm-colors-brand-600)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <FiCheck size={12} />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </Box>
                    {actionState?.fieldErrors?.icon ? (
                        <Text color="danger" fontSize="xs" mt={1}>
                            {actionState.fieldErrors.icon}
                        </Text>
                    ) : null}
                </Field.Root>

                <Field.Root>
                    <Field.Label htmlFor={kindId}>Category</Field.Label>
                    <input type="hidden" name="type" value={selectedPreset.type} />
                    <input type="hidden" name="bucket" value={selectedPreset.bucket} />
                    {isIncome ? (
                        <Box
                            p={3}
                            borderRadius="button"
                            borderWidth="1px"
                            borderColor="border.subtle"
                            bg="surface.subtle"
                        >
                            <Text fontSize="sm" color="text.secondary">
                                This is an <strong>Income</strong> category. Income
                                categories are read-only here — pick one of the
                                three savings/expense buckets if you want to
                                reclassify it.
                            </Text>
                        </Box>
                    ) : (
                        <NativeSelect.Root>
                            <NativeSelect.Field
                                id={kindId}
                                value={state.kind}
                                onChange={(e) => state.setKind(e.target.value)}
                            >
                                {CATEGORY_PRESETS.map((preset) => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label} — {preset.description}
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                    )}
                    {actionState?.fieldErrors?.type || actionState?.fieldErrors?.bucket ? (
                        <Text color="danger" fontSize="xs" mt={1}>
                            {actionState.fieldErrors.type ?? actionState.fieldErrors.bucket}
                        </Text>
                    ) : null}
                </Field.Root>

                {actionState?.error ? (
                    <Text color="danger" fontSize="sm">
                        {actionState.error}
                    </Text>
                ) : null}

                <Button
                    type="submit"
                    colorPalette="blue"
                    loading={pending}
                    loadingText="Saving"
                    disabled={!state.name || !state.slug || !state.icon || isIncome}
                >
                    {isEdit ? "Save changes" : "Create category"}
                </Button>
            </Stack>
        </form>
    );
}

function useIsDesktop(): boolean {
    // SSR + first client render both yield `false` (mobile-first), avoiding
    // hydration mismatches. Effect runs post-mount and refines to actual
    // viewport. The editor only mounts once the user opens the modal, by
    // which time the effect has resolved.
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

function handleOpenChange(
    open: boolean,
    onClose: () => void,
): void {
    // Blur active element BEFORE close to avoid the Zag-js `walkTreeOutside`
    // race that flags a focused descendant inside an aria-hidden ancestor.
    if (!open) blurActiveElement();
    if (!open) onClose();
}

function CategoryEditorMobile({
    mode,
    category,
    open,
    onClose,
    onSaved,
    state,
}: CategoryEditorProps & { state: EditorFormState }) {
    const title = mode === "edit" ? "Edit category" : "New category";
    return (
        <Drawer.Root
            open={open}
            onOpenChange={(d) => handleOpenChange(d.open, onClose)}
            placement="bottom"
            size="md"
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content borderTopRadius="24px" maxH="90vh" overflowY="auto">
                        <Drawer.Header borderBottomWidth="1px" borderColor="border.subtle">
                            <Drawer.Title>{title}</Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body py={5}>
                            <CategoryEditorBody
                                mode={mode}
                                category={category}
                                onClose={onClose}
                                onSaved={onSaved}
                                state={state}
                            />
                        </Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}

function CategoryEditorDesktop({
    mode,
    category,
    open,
    onClose,
    onSaved,
    state,
}: CategoryEditorProps & { state: EditorFormState }) {
    const title = mode === "edit" ? "Edit category" : "New category";
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(d) => handleOpenChange(d.open, onClose)}
            size="md"
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body py={4}>
                            <CategoryEditorBody
                                mode={mode}
                                category={category}
                                onClose={onClose}
                                onSaved={onSaved}
                                state={state}
                            />
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

export function CategoryEditor(props: CategoryEditorProps) {
    const isDesktop = useIsDesktop();
    const state = useEditorState(props.category);
    return isDesktop ? (
        <CategoryEditorDesktop {...props} state={state} />
    ) : (
        <CategoryEditorMobile {...props} state={state} />
    );
}

"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import {
    Avatar,
    Box,
    Button,
    Dialog,
    Drawer,
    Flex,
    Portal,
    Stack,
    Text,
} from "@chakra-ui/react";
import { FiCamera, FiTrash2 } from "react-icons/fi";
import {
    removeAvatarAction,
    uploadAvatarAction,
    type AvatarState,
} from "@/lib/actions/profile";
import { blurActiveElement } from "@/lib/utils/focus-utils";
import { useProfile } from "@/components/providers/ProfileProvider";

interface AvatarButtonProps {
    size?: "sm" | "md";
}

const initial: AvatarState = {};

const MAX_SIDE = 256;
const JPEG_QUALITY = 0.85;

// ponytail: resize before upload. Mobile camera shots are 3-5 MB; without
// this we'd hit Supabase's free-tier request limits fast. createImageBitmap
// is supported in all modern browsers and handles EXIF rotation.
async function resizeToJpeg(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(MAX_SIDE / bitmap.width, MAX_SIDE / bitmap.height, 1);
    const w = Math.max(1, Math.round(bitmap.width * ratio));
    const h = Math.max(1, Math.round(bitmap.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    bitmap.close?.();
    if (!blob) throw new Error("Failed to encode image");

    return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function AvatarButton({ size = "sm" }: AvatarButtonProps) {
    const { profile, setProfile } = useProfile();
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = useCallback((next: boolean) => {
        if (!next) {
            blurActiveElement();
            setPreviewUrl(null);
            setOpen(false);
        }
    }, []);

    const handleAvatarClick = () => setOpen(true);

    const handlePickFile = () => fileInputRef.current?.click();

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/")) return;

        // Cheap local preview so the user sees what they picked while upload runs.
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);

        try {
            const resized = await resizeToJpeg(file);
            const fd = new FormData();
            fd.append("file", resized);
            const result = await uploadAvatarAction(initial, fd);
            if (result.error) {
                setPreviewUrl(null);
                return;
            }
            setProfile(
                profile ? { ...profile, avatar_url: result.url ?? null } : profile,
            );
            setPreviewUrl(null);
            setOpen(false);
        } catch {
            setPreviewUrl(null);
        } finally {
            URL.revokeObjectURL(localUrl);
        }
    };

    const handleRemove = async () => {
        const result = await removeAvatarAction();
        if (result.error) return;
        setProfile(profile ? { ...profile, avatar_url: null } : profile);
        setOpen(false);
    };

    const previewSrc = previewUrl ?? profile?.avatar_url ?? null;
    const fallback = (profile?.full_name ?? "U").slice(0, 1).toUpperCase();

    return (
        <>
            <button
                type="button"
                onClick={handleAvatarClick}
                aria-label="Change profile photo"
                style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    borderRadius: "9999px",
                    cursor: "pointer",
                    lineHeight: 0,
                }}
            >
                <Avatar.Root size={size}>
                    {profile?.avatar_url ? (
                        <Avatar.Image src={profile.avatar_url} alt={profile.full_name ?? ""} />
                    ) : null}
                    <Avatar.Fallback>{fallback}</Avatar.Fallback>
                </Avatar.Root>
            </button>

            <AvatarModal open={open} onOpenChange={handleOpenChange}>
                <AvatarModalBody
                    previewSrc={previewSrc}
                    fallback={fallback}
                    hasAvatar={!!profile?.avatar_url}
                    onPick={handlePickFile}
                    onRemove={handleRemove}
                />
            </AvatarModal>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handleFileChange}
            />
        </>
    );
}

interface AvatarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

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

function AvatarModal({ open, onOpenChange, children }: AvatarModalProps) {
    const isDesktop = useIsDesktop();
    if (isDesktop) {
        return (
            <Dialog.Root
                open={open}
                onOpenChange={(d) => onOpenChange(d.open)}
                size="sm"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Profile photo</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body py={4}>{children}</Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        );
    }
    return (
        <Drawer.Root
            open={open}
            onOpenChange={(d) => onOpenChange(d.open)}
            placement="bottom"
            size="md"
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content borderTopRadius="24px">
                        <Drawer.Header borderBottomWidth="1px" borderColor="border.subtle">
                            <Drawer.Title>Profile photo</Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body py={5}>{children}</Drawer.Body>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
}

interface AvatarModalBodyProps {
    previewSrc: string | null;
    fallback: string;
    hasAvatar: boolean;
    onPick: () => void;
    onRemove: () => void;
}

function AvatarModalBody({
    previewSrc,
    fallback,
    hasAvatar,
    onPick,
    onRemove,
}: AvatarModalBodyProps) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePick = async () => {
        setError(null);
        onPick();
    };

    const handleRemoveClick = async () => {
        setError(null);
        setPending(true);
        try {
            await onRemove();
        } catch {
            setError("Could not remove photo");
        } finally {
            setPending(false);
        }
    };

    return (
        <Stack gap={5} align="center">
            <Box
                w="160px"
                h="160px"
                borderRadius="full"
                overflow="hidden"
                bg="surface.subtle"
                position="relative"
                borderWidth="2px"
                borderColor="border.subtle"
                flexShrink={0}
            >
                {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- preview URL is a local blob or signed CDN URL
                    <img
                        src={previewSrc}
                        alt="Profile preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <Flex
                        w="full"
                        h="full"
                        align="center"
                        justify="center"
                        color="text.muted"
                        fontWeight="800"
                        fontSize="5xl"
                    >
                        {fallback}
                    </Flex>
                )}
            </Box>

            <Stack gap={2} w="full">
                <Button
                    onClick={handlePick}
                    colorPalette="blue"
                    width="full"
                    loading={pending}
                >
                    <FiCamera />
                    {hasAvatar ? "Replace photo" : "Choose photo"}
                </Button>

                {hasAvatar ? (
                    <Button
                        onClick={handleRemoveClick}
                        variant="outline"
                        colorPalette="red"
                        width="full"
                        disabled={pending}
                    >
                        <FiTrash2 />
                        Remove photo
                    </Button>
                ) : null}
            </Stack>

            {error ? (
                <Text color="danger" fontSize="sm">
                    {error}
                </Text>
            ) : (
                <Text fontSize="xs" color="text.muted" textAlign="center">
                    JPG, PNG or WebP. Up to 2 MB.
                </Text>
            )}
        </Stack>
    );
}
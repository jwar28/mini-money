"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { CategoryRow } from "@/types/database";

export type TxModalCategories = Pick<
    CategoryRow,
    "id" | "name" | "slug" | "icon" | "type" | "bucket"
>[];

interface TxModalContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    categories: TxModalCategories;
}

const Ctx = createContext<TxModalContextValue | null>(null);

interface TxModalProviderProps {
    children: ReactNode;
    categories: TxModalCategories;
}

export function TxModalProvider({ children, categories }: TxModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const value = useMemo(
        () => ({ isOpen, open, close, categories }),
        [isOpen, open, close, categories],
    );
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTxModal(): TxModalContextValue {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error("useTxModal must be used inside TxModalProvider");
    }
    return ctx;
}

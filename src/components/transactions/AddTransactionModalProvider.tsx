"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface TxModalContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const Ctx = createContext<TxModalContextValue | null>(null);

export function TxModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTxModal(): TxModalContextValue {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error("useTxModal must be used inside TxModalProvider");
    }
    return ctx;
}

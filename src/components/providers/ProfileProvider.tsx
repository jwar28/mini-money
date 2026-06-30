"use client";

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { ProfileRow } from "@/types/database";

interface ProfileContextValue {
    profile: ProfileRow | null;
    setProfile: (p: ProfileRow | null) => void;
}

const Ctx = createContext<ProfileContextValue | null>(null);

interface ProfileProviderProps {
    initialProfile: ProfileRow | null;
    children: ReactNode;
}

export function ProfileProvider({ initialProfile, children }: ProfileProviderProps) {
    const [profile, setProfileState] = useState<ProfileRow | null>(initialProfile);

    const setProfile = useCallback((p: ProfileRow | null) => setProfileState(p), []);

    const value = useMemo(() => ({ profile, setProfile }), [profile, setProfile]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileContextValue {
    const ctx = useContext(Ctx);
    if (!ctx) {
        throw new Error("useProfile must be used inside ProfileProvider");
    }
    return ctx;
}
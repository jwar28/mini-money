"use client";

import { Avatar, Box, Flex, IconButton, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FiBell } from "react-icons/fi";
import type { ProfileRow } from "@/types/database";

export function MobileTopBar() {
    const [profile, setProfile] = useState<ProfileRow | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || cancelled) {
                setLoading(false);
                return;
            }
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();
            if (!cancelled) {
                setProfile(data);
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Flex
            display={{ base: "flex", md: "none" }}
            align="center"
            justify="space-between"
            px={4}
            py={3}
            bg="bg.card"
            borderBottomWidth="1px"
            borderColor="border.subtle"
        >
            <Flex align="center" gap={3}>
                {loading ? (
                    <Spinner size="sm" />
                ) : (
                    <Avatar.Root size="sm">
                        {profile?.avatar_url ? (
                            <Avatar.Image src={profile.avatar_url} alt={profile.full_name ?? ""} />
                        ) : null}
                        <Avatar.Fallback>
                            {(profile?.full_name ?? "U").slice(0, 1).toUpperCase()}
                        </Avatar.Fallback>
                    </Avatar.Root>
                )}
                <Box fontSize="lg" fontWeight="700" letterSpacing="-0.02em">
                    Mini Money
                </Box>
            </Flex>
            <IconButton aria-label="Notifications" variant="ghost" size="sm">
                <FiBell />
            </IconButton>
        </Flex>
    );
}

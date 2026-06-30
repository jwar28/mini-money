"use client";

import {
    Avatar,
    Box,
    Flex,
    IconButton,
    Input,
    InputGroup,
} from "@chakra-ui/react";
import { FiBell, FiSearch, FiRotateCcw } from "react-icons/fi";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/types/database";

export function DesktopTopBar() {
    const [profile, setProfile] = useState<ProfileRow | null>(null);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || cancelled) return;
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();
            if (!cancelled) setProfile(data);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <Flex
            display={{ base: "none", md: "flex" }}
            align="center"
            justify="space-between"
            gap={4}
            px={8}
            py={5}
            bg="bg.card"
            borderBottomWidth="1px"
            borderColor="border.subtle"
            position="sticky"
            top={0}
            zIndex={5}
        >
            <InputGroup maxW="520px" w="full" startElement={<FiSearch />}>
                <Input placeholder="Search data points..." bg="bg.card" />
            </InputGroup>
            <Flex align="center" gap={2}>
                <IconButton aria-label="Notifications" variant="ghost">
                    <FiBell />
                </IconButton>
                <IconButton aria-label="History" variant="ghost">
                    <FiRotateCcw />
                </IconButton>
                <Box w="36px" h="36px" borderRadius="full" overflow="hidden" bg="brand.100">
                    {profile?.avatar_url ? (
                        <Avatar.Root size="sm">
                            <Avatar.Image src={profile.avatar_url} alt={profile.full_name ?? ""} />
                            <Avatar.Fallback>
                                {(profile.full_name ?? "U").slice(0, 1).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar.Root>
                    ) : (
                        <Flex w="full" h="full" align="center" justify="center" color="brand.700" fontWeight="700">
                            {(profile?.full_name ?? "U").slice(0, 1).toUpperCase()}
                        </Flex>
                    )}
                </Box>
            </Flex>
        </Flex>
    );
}

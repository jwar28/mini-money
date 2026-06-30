"use client";

import { useActionState } from "react";
import {
    Button,
    Field,
    Heading,
    Input,
    Stack,
    Text,
    Link as ChakraLink,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";

interface LoginFormProps {
    next?: string;
}

const initial: AuthState = {};

export function LoginForm({ next }: LoginFormProps) {
    const [state, formAction, isPending] = useActionState(loginAction, initial);

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Track every dollar with precision."
            footer={
                <Text fontSize="sm" color="text.secondary">
                    New here?{" "}
                    <ChakraLink asChild color="brand.600" fontWeight="semibold">
                        <NextLink href="/signup">Create an account</NextLink>
                    </ChakraLink>
                </Text>
            }
        >
            <form action={formAction}>
                <input type="hidden" name="next" value={next ?? "/"} />
                <Stack gap={4}>
                    <Heading as="h1" size="2xl" fontWeight="800">
                        Sign in
                    </Heading>
                    <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                            defaultValue={state?.email ?? ""}
                            required
                        />
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Password</Field.Label>
                        <Input
                            name="password"
                            type="password"
                            placeholder="At least 8 characters"
                            autoComplete="current-password"
                            required
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
                        size="lg"
                        loading={isPending}
                        loadingText="Signing in"
                        width="full"
                    >
                        Sign in
                    </Button>
                </Stack>
            </form>
        </AuthShell>
    );
}

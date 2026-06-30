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
import { signupAction, type AuthState } from "@/lib/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";

const initial: AuthState = {};

export function SignupForm() {
    const [state, formAction, isPending] = useActionState(signupAction, initial);

    return (
        <AuthShell
            title="Start precise tracking"
            subtitle="Set budgets, log transactions, stay on plan."
            footer={
                <Text fontSize="sm" color="text.secondary">
                    Already have an account?{" "}
                    <ChakraLink asChild color="brand.600" fontWeight="semibold">
                        <NextLink href="/login">Sign in</NextLink>
                    </ChakraLink>
                </Text>
            }
        >
            <form action={formAction}>
                <Stack gap={4}>
                    <Heading as="h1" size="2xl" fontWeight="800">
                        Create your account
                    </Heading>
                    <Field.Root>
                        <Field.Label>Full name</Field.Label>
                        <Input
                            name="full_name"
                            type="text"
                            placeholder="Jane Doe"
                            autoComplete="name"
                        />
                    </Field.Root>
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
                            placeholder="Min. 8 characters"
                            autoComplete="new-password"
                            minLength={8}
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
                        loadingText="Creating account"
                        width="full"
                    >
                        Create account
                    </Button>
                </Stack>
            </form>
        </AuthShell>
    );
}

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
    cssVarsPrefix: "mm",
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: "#eff6ff" },
                    100: { value: "#dbeafe" },
                    200: { value: "#bfdbfe" },
                    300: { value: "#93c5fd" },
                    400: { value: "#60a5fa" },
                    500: { value: "#3b82f6" },
                    600: { value: "#2563eb" },
                    700: { value: "#1d4ed8" },
                    800: { value: "#1e40af" },
                    900: { value: "#1e3a8a" },
                },
                surface: {
                    bg: { value: "#f6f8fb" },
                    card: { value: "#ffffff" },
                    border: { value: "#e5e7eb" },
                    subtle: { value: "#f1f5f9" },
                },
                ink: {
                    900: { value: "#0f172a" },
                    700: { value: "#334155" },
                    500: { value: "#64748b" },
                    400: { value: "#94a3b8" },
                    300: { value: "#cbd5e1" },
                },
                success: { value: "#10b981" },
                danger: { value: "#ef4444" },
                warning: { value: "#f59e0b" },
                savings: { value: "#059669" },
            },
            radii: {
                card: { value: "16px" },
                pill: { value: "999px" },
                button: { value: "12px" },
            },
            fonts: {
                heading: {
                    value: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
                },
                body: {
                    value: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif",
                },
            },
        },
        semanticTokens: {
            colors: {
                "bg.app": { value: "{colors.surface.bg}" },
                "bg.card": { value: "{colors.surface.card}" },
                "border.subtle": { value: "{colors.surface.border}" },
                "text.primary": { value: "{colors.ink.900}" },
                "text.secondary": { value: "{colors.ink.500}" },
                "text.muted": { value: "{colors.ink.400}" },
            },
        },
    },
    globalCss: {
        "html, body": {
            bg: "bg.app",
            color: "text.primary",
            minHeight: "100dvh",
        },
        "*": {
            borderColor: "border.subtle",
        },
    },
});

export const system = createSystem(defaultConfig, config);

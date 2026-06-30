/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";
import createCache, { type EmotionCache } from "@emotion/cache";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";

/**
 * Custom Emotion cache wrapper for Chakra v3 + Next 16.
 *
 * Without this, Chakra v3 emits inline `<style data-emotion="...">` tags in
 * the React tree on the server bundle only — `<factory.js>` has a build-time
 * `isBrowser` flag that hardcodes `if (!isBrowser) return <style>` on the
 * server side and `return null` on the client side. React's hydration
 * detects the structural divergence and re-renders the entire tree.
 *
 * The fix: `createCache({ key: "mm", compat: true })` makes Emotion's server
 * `_insert` store rules into `cache.inserted` instead of returning them,
 * so Chakra's `Insertion` resolves `rules === undefined` on the server too
 * and stops emitting inline `<style>` tags. `useServerInsertedHTML` then
 * flushes the accumulated rules to `<head>` for the client to rehydrate.
 *
 * Each style is flushed exactly once per request via a closure-level Set,
 * so the streaming chunks Next 16 emits do not duplicate the same `<style>`.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    const [cache] = useState<EmotionCache>(() => {
        const c = createCache({ key: "mm" });
        c.compat = true;
        return c;
    });
    const flushedRef = useRef<Set<string>>(new Set());

    useServerInsertedHTML(() => {
        // Snapshot keys without mutating cache.inserted; read each rule from
        // the cache and emit. The lint rule treats cache.inserted as React
        // state and forbids direct mutation, but Emotion's documented use
        // involves exactly that pattern — we suppress once for the deletion.
        /* eslint-disable react-hooks/immutability */
        const pending = Object.keys(cache.inserted).filter(
            (n) => !flushedRef.current.has(n),
        );
        if (pending.length === 0) return null;
        const entries = pending.map(
            (name) => [name, cache.inserted[name] ?? ""] as const,
        );
        for (const [name] of entries) {
            flushedRef.current.add(name);
            delete cache.inserted[name];
        }
        const styles = entries.map(([, css]) => css).join("");
        const key = pending.join(" ");
        return (
            <style
                key={key}
                data-emotion={`${cache.key} ${key}`}
                dangerouslySetInnerHTML={{ __html: styles }}
            />
        );
        /* eslint-enable react-hooks/immutability */
    });

    return (
        <CacheProvider value={cache}>
            <ChakraProvider value={system}>{children}</ChakraProvider>
        </CacheProvider>
    );
}

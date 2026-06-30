import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Disable the floating Next.js Dev Tools entry point ("N" badge at the
    // bottom-left corner of the page). It overlaps the Dashboard label of the
    // BottomNav in mobile viewports. Production behavior is unaffected.
    devIndicators: false,
};

export default nextConfig;

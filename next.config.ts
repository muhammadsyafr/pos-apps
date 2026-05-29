import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    experimental: {
        serverActions: {
            bodySizeLimit: "2mb",
        },
    },
    allowedDevOrigins: ["192.168.1.25"],
};

export default withNextIntl(nextConfig);

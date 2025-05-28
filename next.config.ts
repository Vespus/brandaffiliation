import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
    experimental: {
        authInterrupts: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: "0vnr1azfmv.ufs.sh",
                pathname: "/f/*",
            },
        ]
    }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

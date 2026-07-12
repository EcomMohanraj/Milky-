import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [375, 390, 412, 640, 750, 768, 828, 1024, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;

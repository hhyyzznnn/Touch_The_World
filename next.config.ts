import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // 번들 크기 최적화
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
  webpack: (config, { isServer }) => {
    // twilio는 선택적 의존성이므로 빌드 시점에 외부 모듈로 처리
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        twilio: "commonjs twilio",
      });
    }
    return config;
  },
};

export default nextConfig;


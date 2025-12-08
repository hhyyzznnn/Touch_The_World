import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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


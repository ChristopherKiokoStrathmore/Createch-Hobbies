import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "createch-hobbies.co.ke",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.createch-hobbies.co.ke",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

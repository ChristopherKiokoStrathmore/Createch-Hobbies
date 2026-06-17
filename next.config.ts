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
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "gravatar.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/wp",
        destination: "https://wp.createch-hobbies.co.ke/wp",
        permanent: true,
      },
      {
        source: "/wp/:path*",
        destination: "https://wp.createch-hobbies.co.ke/wp/:path*",
        permanent: true,
      },
      {
        source: "/wp-admin",
        destination: "https://wp.createch-hobbies.co.ke/wp-admin",
        permanent: true,
      },
      {
        source: "/wp-admin/:path*",
        destination: "https://wp.createch-hobbies.co.ke/wp-admin/:path*",
        permanent: true,
      },
      {
        source: "/wp-login.php",
        destination: "https://wp.createch-hobbies.co.ke/wp-login.php",
        permanent: true,
      },
      {
        source: "/wp-json/:path*",
        destination: "https://wp.createch-hobbies.co.ke/wp-json/:path*",
        permanent: true,
      },
      {
        source: "/wp-content/:path*",
        destination: "https://wp.createch-hobbies.co.ke/wp-content/:path*",
        permanent: true,
      },
      {
        source: "/wp-includes/:path*",
        destination: "https://wp.createch-hobbies.co.ke/wp-includes/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

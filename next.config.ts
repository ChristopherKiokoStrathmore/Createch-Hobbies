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
  async headers() {
    // Conservative, non-breaking baseline. CSP allows the inline styles/scripts
    // the Next app router injects for hydration, but locks down object/base/form
    // targets and framing. Tighten script-src to nonces later via middleware if
    // you want to fully neutralise inline-script injection.
    // Next.js dev (React Fast Refresh) evaluates code via eval(), which the
    // production CSP rightly forbids. Allow 'unsafe-eval' in development only —
    // production keeps the locked-down script-src below.
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'";

    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      scriptSrc,
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self' https://payments.ipayafrica.com",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=(self)" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
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

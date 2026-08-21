import type { NextConfig } from 'next';

const allowedDevOrigins = Array.from(
  new Set([
    '127.0.0.1',
    'localhost',
    '192.168.31.203',
    ...(process.env.DEV_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? []),
  ])
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: '/',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/sersdp/login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sersdp/login',
        destination: '/login',
      },
      {
        source: '/sersdp',
        destination: '/admin',
      },
      {
        source: '/sersdp/:path*',
        destination: '/admin/:path*',
      },
    ];
  },
  async headers() {
    const globalSecurityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: "base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      ...(process.env.ENABLE_HSTS === 'true'
        ? [
            {
              key: 'Strict-Transport-Security',
              value: 'max-age=31536000; includeSubDomains',
            },
          ]
        : []),
    ];

    const sparkVueContentSecurityPolicy = [
      "default-src 'self' blob: data:",
      "base-uri 'self'",
      "connect-src 'self' blob: data:",
      "font-src 'self' data:",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "frame-src 'self' blob: data:",
      "img-src 'self' blob: data:",
      "manifest-src 'self'",
      "media-src 'self' blob: data:",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'self' blob:",
    ].join('; ');

    const crossOriginIsolationHeaders = [
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'credentialless',
      },
      {
        key: 'Origin-Agent-Cluster',
        value: '?1',
      },
      {
        key: 'Permissions-Policy',
        value: 'bluetooth=(self), cross-origin-isolated=(self), serial=(self), usb=(self)',
      },
    ];
    const strictResourceSecurityHeaders = [
      ...crossOriginIsolationHeaders,
      {
        key: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'no-referrer',
      },
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'off',
      },
    ];
    const sparkVueSecurityHeaders = [
      ...strictResourceSecurityHeaders,
      {
        key: 'Content-Security-Policy',
        value: sparkVueContentSecurityPolicy,
      },
    ];

    return [
      {
        source: '/:path*',
        headers: globalSecurityHeaders,
      },
      {
        source: '/labs/:path*',
        headers: sparkVueSecurityHeaders,
      },
      {
        source: '/sparkvue/:path*',
        headers: sparkVueSecurityHeaders,
      },
      {
        source: '/whatsnew/:path*',
        headers: sparkVueSecurityHeaders,
      },
      {
        source: '/uploads/:path*',
        headers: [
          ...strictResourceSecurityHeaders,
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  allowedDevOrigins,
};

export default nextConfig;

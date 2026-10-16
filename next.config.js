const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_PROXY_HOST ?? process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

const posthogOrigin = new URL(posthogHost).origin;

const posthogUiHost = "https://eu.posthog.com";

const imageHost = "images.mingyu.dev";

const vercelToolbarSources = {
  "script-src": ["https://vercel.live"],
  "style-src": ["https://vercel.live"],
  "img-src": ["https://vercel.live", "https://vercel.com"],
  "font-src": ["https://vercel.live", "https://assets.vercel.com"],
  "connect-src": ["https://vercel.live", "wss://ws-us3.pusher.com"],
  "frame-src": ["'self'", "https://vercel.live"],
};

const contentSecurityPolicy = () => {
  const directives = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(process.env.NODE_ENV === "development" ? ["'unsafe-eval'"] : []),
      posthogOrigin,
    ],
    "script-src-attr": ["'none'"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", posthogOrigin],
    "img-src": ["'self'", "data:", "blob:", `https://${imageHost}`],
    "font-src": ["'self'", "https://fonts.gstatic.com", posthogOrigin],
    "connect-src": ["'self'", posthogOrigin, posthogUiHost],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'", posthogUiHost],
  };
  if (process.env.VERCEL_ENV === "preview") {
    for (const [directive, sources] of Object.entries(vercelToolbarSources)) {
      directives[directive] = [...(directives[directive] ?? []), ...sources];
    }
  }
  return Object.entries(directives)
    .map(([directive, sources]) => [directive, ...sources].join(" "))
    .join("; ");
};

const nextConfig = {
  poweredByHeader: false,
  experimental: {
    globalNotFound: true,
    prefetchInlining: false,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy() },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: imageHost,
      },
    ],
  },
};

module.exports = withNextIntl(nextConfig);

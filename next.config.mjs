/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.cars24.com",
      },
      {
        protocol: "https",
        hostname: "https://jfswmbbkzetaurhviszl.supabase.co",
      },
      {
        protocol: "https",
        hostname: "jfswmbbkzetaurhviszl.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://iconcars.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

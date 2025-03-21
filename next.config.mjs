/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'media.cars24.com',
            
          },
        ],
      },
};

export default nextConfig;

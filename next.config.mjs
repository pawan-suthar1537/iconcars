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
      async headers(){
        return [
          {
            source:"/embed",
            headers:[
              {key:"Content-Security-Policy",
                value:"frame-src 'self' https://iconcars.created.app;"}
            ]
          }
        ]
      }
};

export default nextConfig;

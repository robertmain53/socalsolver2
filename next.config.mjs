/** @type {import('next').NextConfig} */
const nextConfig = {

   eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

    async headers() {
    return [
      
      {
        source: '/xx/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
      {
        source: '/xx/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
      {
        source: '/xx/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
      },
    ]
  },
  
    async redirects() {
        return [
            {
                source: '/',
                destination: '/it',
                permanent: true,
            },
        ]
    },
};

export default nextConfig;

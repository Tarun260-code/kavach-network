/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/bank/:id/onboard',
        destination: '/bank/:id/screen',
        permanent: false,
      },
      {
        source: '/network/intelligence',
        destination: '/network?tab=intelligence',
        permanent: false,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      readline: false,
    };
    return config;
  },
};

export default nextConfig;


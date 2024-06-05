/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      runtime: 'edge', 
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = { fs: false, module: false };
      }
      return config;
    },
    images: {
      domains: ['127.0.0.1', 'res.cloudinary.com',],
      unoptimized: true 
  },
};

export default nextConfig;

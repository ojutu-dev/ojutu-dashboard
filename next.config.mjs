/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      runtime: 'edge', 
    },
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = { fs: false, module: false };
        config.experiments = {
          asyncWebAssembly: true,
        };
    
        config.module.rules.push({
          test: /\.wasm$/,
          type: "webassembly/async",
        });
      }
      return config;
    },
    images: {
      domains: ['127.0.0.1', 'res.cloudinary.com',],
      unoptimized: true 
  },
};

export default nextConfig;

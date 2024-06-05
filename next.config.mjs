/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    runtime: 'edge',
    images: {
      domains: ['127.0.0.1', 'res.cloudinary.com',],
      unoptimized: true 
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1', 'res.cloudinary.com',],
    unoptimized: true 
},
};

export default nextConfig;
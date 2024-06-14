

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['127.0.0.1', 'res.cloudinary.com'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/cloudinary-images',
        destination: 'https://app.ojutu.co/api/cloudinary-images',
      },
    ];
  },
};

export default nextConfig;

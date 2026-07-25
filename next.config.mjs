/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  env: {
    VITE_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
};

export default nextConfig;

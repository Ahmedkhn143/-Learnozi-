/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env.VITE_API_URL': JSON.stringify(process.env.NEXT_PUBLIC_API_URL || ''),
        'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV !== 'production'),
      })
    );
    return config;
  },
};

export default nextConfig;

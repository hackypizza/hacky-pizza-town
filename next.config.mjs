/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !! Dangerously allow production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disabling on production builds
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

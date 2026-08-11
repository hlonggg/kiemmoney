/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;

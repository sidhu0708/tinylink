// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // If deploying to Vercel with a custom serverless DB, nothing extra required here.
  // Add any rewrites/headers/image domains if you need them later.
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // for static export (GitHub Pages)
  distDir: 'out',
  basePath: process.env.GITHUB_PAGES === 'true' ? '/TechnologyModule' : '', // Only when deploying to GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig; 
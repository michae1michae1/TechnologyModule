/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // for static export (GitHub Pages)
  distDir: 'out',
  basePath: process.env.NODE_ENV === 'production' || process.env.GITHUB_PAGES === 'true' ? '/TechnologyModule' : '',
  assetPrefix: process.env.NODE_ENV === 'production' || process.env.GITHUB_PAGES === 'true' ? '/TechnologyModule/' : '',
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig; 

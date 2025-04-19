/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // for static export (GitHub Pages)
  distDir: 'out',
  basePath: '/TechnologyModule', // Must match the repository name
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig; 
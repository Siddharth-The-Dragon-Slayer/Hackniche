/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Native addons must not be bundled by webpack
  serverExternalPackages: ['@resvg/resvg-js', 'satori'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
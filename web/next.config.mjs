/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.prasadfooddivine.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https', 
        hostname: 'prasadfooddivine.com',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  
};

export default nextConfig;

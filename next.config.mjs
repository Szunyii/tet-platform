/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      // Riport csatolmányok: max 5 × 8 MB + multipart overhead (a limit a nyers body-ra vonatkozik).
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;

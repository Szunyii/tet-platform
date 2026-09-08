/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    serverActions: {
      // Riport csatolmányok: max 5 × 8 MB + multipart overhead (a limit a nyers body-ra vonatkozik).
      bodySizeLimit: '50mb',
    },
    // A proxy.ts miatt a Next a POST body-t klónozza; ennek külön limitje van (alapértelmezés 10 MB), és túllépéskor NÉMÁN csonkol. Együtt kell mozognia a bodySizeLimit-tel.
    proxyClientMaxBodySize: '50mb',
  },
};

export default nextConfig;

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
    // A Turbopack a PostCSS-t (Tailwind) alapból külön node-folyamatban futtatja, amely a 127.0.0.1-en TCP-n kapcsolódik vissza; a Hostinger build-környezetében ez elbukik („node process exited before we could connect to it”). Worker threadben nincs se gyerekfolyamat, se socket.
    turbopackPluginRuntimeStrategy: 'workerThreads',
  },
};

export default nextConfig;

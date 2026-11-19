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
    // A Next 16.4 a 'workerThreads'-et Node >= 24.13.1-en csendben 'childProcesses'-re cseréli (nodejs/node#65100: a worker leállásakor összeomolhat a folyamat, ha egy natív addonnak, pl. a macOS-es fsevents-nek, élő threadsafe függvénye van). A 'forceWorkerThreads' ezt megkerüli, és a 16.3-as viselkedést adja vissza, amellyel a hosting (Linux) buildje működött; macOS-en (fsevents) a helyi build a 'childProcesses'-szel is rendben fut.
    turbopackPluginRuntimeStrategy: process.platform === 'darwin' ? 'childProcesses' : 'forceWorkerThreads',
  },
};

export default nextConfig;

import { getCsatolmany, getCsatolmanyMeta, getRiport } from '../../../../../db/queries/riport';
import { canViewRiport } from '../../../../../lib/riport-jog';
import { getSession } from '../../../../../lib/session';

// Csatolmány letöltése. A proxy csak a cookie meglétét nézi, itt a valódi session és a
// bejegyzés láthatósága dönt; idegen bejegyzés csatolmánya 404 (nem áruljuk el, hogy létezik).
// A jogosultságot a blob (potenciálisan nagy) beolvasása ELŐTT ellenőrizzük: előbb a
// blob nélküli metaadatot (getCsatolmanyMeta) és a bejegyzést nézzük meg, a tényleges
// tartalmat (getCsatolmany) csak ezután olvassuk be.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response('Bejelentkezés szükséges.', { status: 401 });

  const { id } = await params;
  const meta = getCsatolmanyMeta(id);
  if (!meta) return new Response(null, { status: 404 });

  const rip = getRiport(meta.riportId);
  if (!rip || !canViewRiport(session, rip)) return new Response(null, { status: 404 });

  const cs = getCsatolmany(id);
  if (!cs) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(cs.tartalom), {
    headers: {
      'Content-Type': cs.mime,
      'Content-Length': String(cs.tartalom.byteLength),
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(cs.fajlnev)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

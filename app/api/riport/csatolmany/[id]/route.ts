import { getCsatolmany, getCsatolmanyMeta, getRiport } from '../../../../../db/queries/riport';
import { canViewRiport } from '../../../../../lib/riport-jog';
import { getSession } from '../../../../../lib/session';

/**
 * RFC 5987/6266 `Content-Disposition`: `filename` egy ASCII fallback (nem-ASCII, idézőjel,
 * backslash → `_`; CR/LF már nem lehet a névben, a tisztítás kiszedte), `filename*` a teljes,
 * UTF-8-kódolt név. Az `encodeURIComponent` nem kódolja az RFC 5987 `attr-char`-ból kimaradó
 * `'`, `(`, `)`, `*`, `!` karaktereket – ezeket kézzel kell, mert a `'` az `UTF-8''` szintaxis
 * elválasztója, a többi pedig a régi HTTP idézetlen szintaxisban lenne speciális.
 */
function contentDisposition(fajlnev: string): string {
  const ascii = fajlnev.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  const enkodolt = encodeURIComponent(fajlnev).replace(/['()*!]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  return `attachment; filename="${ascii}"; filename*=UTF-8''${enkodolt}`;
}

// Csatolmány letöltése. A proxy csak a cookie meglétét nézi, itt a valódi session és a
// bejegyzés láthatósága dönt; idegen bejegyzés csatolmánya 404 (nem áruljuk el, hogy létezik).
// A jogosultságot a blob (potenciálisan nagy) beolvasása ELŐTT ellenőrizzük: előbb a
// blob nélküli metaadatot (getCsatolmanyMeta) és a bejegyzést nézzük meg, a tényleges
// tartalmat (getCsatolmany) csak ezután olvassuk be.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  // A proxy cookie nélkül már a loginra irányít; ide csak elavult/érvénytelen cookie-val jut
  // a kérés. API-szerű végpont, ezért státuszkódot adunk, nem redirect-elünk.
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
      'Content-Disposition': contentDisposition(cs.fajlnev),
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

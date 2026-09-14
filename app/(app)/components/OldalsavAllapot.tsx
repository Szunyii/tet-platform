import Link from 'next/link';
import { getUtolsoEv, listTerkepAdat } from '../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, profilAllapot, type Allapot } from '../../../lib/orszagprofil-szotar';
import type { AppSession } from '../../../lib/session';

// Az oldalsáv alján megjelenő állapot-kártya. Server Component: a layout rendereli és
// ReactNode-ként adja az AppShell `oldalsavAlja` propjának, így a DB-lekérdezés nem kerül
// a kliens-komponensbe. A színek a térképpel közös szótárból jönnek (ALLAPOT_SZINEK), inline
// style-lal; az AllapotBadge szándékosan nincs újrahasználva, az világos háttérre van hangolva.
//
// Frissülés: a mentBlokkAction, a valasztEvAction és a felhasználó-műveletek
// revalidatePath('/', 'layout')-ot hívnak; kliens-oldali navigációnál a layout nem fut újra
// (ugyanaz az elfogadott késés, mint az olvasatlan-számlálónál).

const SZOVEG = '#8d97a5';
const CIM = '#c3cbd6';
const LINK = '#a3adbb';

function Potty({ allapot }: { allapot: Allapot }) {
  return (
    <span aria-hidden style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: ALLAPOT_SZINEK[allapot], flex: '0 0 8px',
    }} />
  );
}

function Keret({ cim, link, children }: { cim: string; link: { href: string; felirat: string }; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderTop: '1px solid #232c39', fontSize: 11.5, color: SZOVEG, lineHeight: 1.6 }}>
      <div style={{ color: CIM, fontWeight: 600 }}>{cim}</div>
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
      <Link href={link.href} style={{ display: 'inline-block', marginTop: 6, color: LINK, textDecoration: 'none', fontWeight: 500 }}>
        {link.felirat} →
      </Link>
    </div>
  );
}

export default function OldalsavAllapot({ session, ev, most }: { session: AppSession; ev: number; most: number }) {
  if (session.role === 'admin') {
    const szamok: Record<Allapot, number> = { friss: 0, elavult: 0, nincs: 0 };
    for (const o of listTerkepAdat(ev)) szamok[o.allapot] += 1;
    return (
      <Keret cim={`Országprofilok · ${ev}`} link={{ href: '/terkep', felirat: 'Térkép' }}>
        {ALLAPOTOK.map((a) => (
          <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Potty allapot={a} />
            <span>{ALLAPOT_CIMKE[a]}</span>
            <span style={{ marginLeft: 'auto', color: CIM, fontVariantNumeric: 'tabular-nums' }}>{szamok[a]}</span>
          </div>
        ))}
      </Keret>
    );
  }

  const kod = session.orszag;
  if (!kod) return null;
  const utolsoEv = getUtolsoEv(kod, ev);
  const allapot = profilAllapot(utolsoEv, ev);
  const link = canEditProfil(session, kod, ev, most)
    ? { href: `/orszagprofil/${kod}/szerkesztes`, felirat: 'Szerkesztés' }
    : { href: `/orszagprofil/${kod}`, felirat: 'Megnyitás' };
  return (
    <Keret cim={`Országprofil · ${ev}`} link={link}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Potty allapot={allapot} />
        <span>{ALLAPOT_CIMKE[allapot]}{allapot === 'elavult' && utolsoEv ? ` · ${utolsoEv}` : ''}</span>
      </div>
    </Keret>
  );
}

import Link from 'next/link';
import { getUtolsoEv, listTerkepAdat } from '../../../db/queries/orszagprofil';
import { orszagNev } from '../../../lib/orszagok';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, profilAllapot, type Allapot } from '../../../lib/orszagprofil-szotar';
import type { AppSession } from '../../../lib/session';

// Az oldalsáv alján megjelenő állapot-kártya. Server Component: a layout rendereli és
// ReactNode-ként adja az AppShell `oldalsavAlja` propjának, így a DB-lekérdezés nem kerül
// a kliens-komponensbe. A színek a térképpel közös szótárból jönnek (ALLAPOT_SZINEK), inline
// style-lal; az AllapotBadge szándékosan nincs újrahasználva, az világos háttérre van hangolva.
// Attasé: országonként egy sor (székhely elöl); a sor a szerkesztőre visz, ha az attasé az ország
// relációs vezetője és az év szerkeszthető (canEditProfil), különben az olvasó nézetre. A „→” nyíl
// nbsp-vel tapad a szóhoz: a szűk oldalsávban („Elavult profil · 2026 · Szerkesztés →”) ne törjön külön sorba.
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

function Keret({ cim, link, children }: { cim: string; link?: { href: string; felirat: string }; children: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 18px', borderTop: '1px solid #232c39', fontSize: 11.5, color: SZOVEG, lineHeight: 1.6 }}>
      <div style={{ color: CIM, fontWeight: 600 }}>{cim}</div>
      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
      {link && (
        <Link href={link.href} style={{ display: 'inline-block', marginTop: 6, color: LINK, textDecoration: 'none', fontWeight: 500 }}>
          {link.felirat} <span aria-hidden>→</span>
        </Link>
      )}
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

  if (session.orszagok.length === 0) return null;
  return (
    <Keret cim={`${session.orszagok.length > 1 ? 'Országprofilok' : 'Országprofil'} · ${ev}`}>
      {session.orszagok.map((o) => {
        const utolsoEv = getUtolsoEv(o.kod, ev);
        const allapot = profilAllapot(utolsoEv, ev);
        const szerkesztheto = canEditProfil(session, o.kod, ev, most);
        return (
          <Link
            key={o.kod}
            href={szerkesztheto ? `/orszagprofil/${o.kod}/szerkesztes` : `/orszagprofil/${o.kod}`}
            style={{ display: 'flex', flexDirection: 'column', padding: '2px 0', color: SZOVEG, textDecoration: 'none' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: CIM }}>
              <Potty allapot={allapot} />
              {orszagNev(o.kod)}
            </span>
            <span style={{ paddingLeft: 16 }}>
              {ALLAPOT_CIMKE[allapot]}{allapot === 'elavult' && utolsoEv ? ` · ${utolsoEv}` : ''}
              <span style={{ color: LINK, fontWeight: 500 }}> · {szerkesztheto ? 'Szerkesztés' : 'Megnyitás'}&nbsp;<span aria-hidden>→</span></span>
            </span>
          </Link>
        );
      })}
    </Keret>
  );
}

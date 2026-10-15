import Link from 'next/link';
import { getUtolsoEv, listTerkepAdat } from '../../../db/queries/orszagprofil';
import { orszagNev } from '../../../lib/orszagok';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { ALLAPOTOK, ALLAPOT_CIMKE, ALLAPOT_SZINEK, profilAllapot, type Allapot } from '../../../lib/orszagprofil-szotar';
import type { AppSession } from '../../../lib/session';

// Az oldalsáv alján megjelenő állapot-kártya. Server Component: a layout rendereli és
// ReactNode-ként adja az AppShell `oldalsavAlja` propjának, így a DB-lekérdezés nem kerül
// a kliens-komponensbe. A pötty színe a térképpel közös szótárból jön (ALLAPOT_SZINEK, inline style);
// a többi szín az oldalsáv `--sidebar*` tokenjeiből (app/globals.css). Az AllapotBadge szándékosan
// nincs újrahasználva, az világos háttérre van hangolva.
// Attasé: országonként egy sor (székhely elöl); a sor a szerkesztőre visz, ha az attasé az ország
// relációs vezetője és az év szerkeszthető (canEditProfil), különben az olvasó nézetre. Az állapot és
// a művelet két külön elem (flex-wrap): keskeny sorban – pl. „Elavult profil · 2025” mellett – a művelet
// egészben kerül a következő sorba, lógó elválasztó és árva nyíl nélkül.
//
// Frissülés: a mentBlokkAction, a valasztEvAction és a felhasználó-műveletek
// revalidatePath('/', 'layout')-ot hívnak; kliens-oldali navigációnál a layout nem fut újra
// (ugyanaz az elfogadott késés, mint az olvasatlan-számlálónál).

function Potty({ allapot }: { allapot: Allapot }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2 flex-[0_0_8px] rounded-[50%]"
      style={{ background: ALLAPOT_SZINEK[allapot] }}
    />
  );
}

function Keret({ cim, link, children }: { cim: string; link?: { href: string; felirat: string }; children: React.ReactNode }) {
  return (
    <div className="border-t border-t-sidebar-border px-[18px] py-3.5 text-[11.5px] leading-[1.6] text-sidebar-halvany">
      <div className="font-semibold text-sidebar-cim">{cim}</div>
      <div className="mt-1 flex flex-col gap-0.5">{children}</div>
      {link && (
        <Link href={link.href} className="mt-1.5 inline-block font-medium text-sidebar-menu no-underline">
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
          <div key={a} className="flex items-center gap-2">
            <Potty allapot={a} />
            <span>{ALLAPOT_CIMKE[a]}</span>
            <span className="ml-auto text-sidebar-cim tabular-nums">{szamok[a]}</span>
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
            className="flex flex-col py-0.5 text-sidebar-halvany no-underline"
          >
            <span className="flex items-baseline gap-2 text-sidebar-cim">
              <Potty allapot={allapot} />
              {orszagNev(o.kod)}
              <span className="sr-only">: </span>
            </span>
            <span className="flex flex-wrap gap-x-1.5 pl-4">
              <span>{ALLAPOT_CIMKE[allapot]}{allapot === 'elavult' && utolsoEv ? ` · ${utolsoEv}` : ''}</span>
              <span className="ml-auto font-medium whitespace-nowrap text-sidebar-menu">
                {szerkesztheto ? 'Szerkesztés' : 'Megnyitás'} <span aria-hidden>→</span>
              </span>
            </span>
          </Link>
        );
      })}
    </Keret>
  );
}

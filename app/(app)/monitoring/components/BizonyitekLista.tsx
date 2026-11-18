import Link from 'next/link';
import {
  eredmenyReszlet,
  FORRAS_HIANYZIK,
  jelentesReszlet,
  NINCS_TEVEKENYSEGI_ADAT,
  tevekenysegReszlet,
  ticketReszlet,
} from '../../../../lib/ertekeles-megjelenites';
import type { ErtekelesMutatok } from '../../../../lib/ertekeles-mutatok';
import type { SzempontKulcs } from '../../../../lib/ertekeles-szotar';
import { listaUrl } from '../../../../lib/ticket-szotar';

/** Ennyi elem látszik azonnal, a többi egy lenyitható részben. */
const LATHATO = 8;

interface Elem {
  id: string;
  targy: string;
  /** `null`: a tárgy sima szöveg, mert a jelentés, a ticket vagy az ügy már nem létezik, vagy a tevékenységnek nincs saját oldala. */
  url: string | null;
  reszlet: string;
}

const NINCS_LISTA: Partial<Record<SzempontKulcs, string>> = {
  orszagismeret: 'Nincs külön bizonyítéklista: a mutatók az országprofilból jönnek.',
};

const URES_LISTA: Partial<Record<SzempontKulcs, string>> = {
  tajekoztatas: 'Az időszakban nem volt beadott jelentés.',
  kapcsolatepites: 'Az időszakban nem volt ide tartozó jelentés.',
  eredmenyek: 'Az időszakban nem volt ide tartozó ügy.',
  egyuttmukodes: 'Az időszakban nem volt ide tartozó ticket.',
};

const TOROLT = 'már nem elérhető';

function elemek(
  szempont: SzempontKulcs,
  m: ErtekelesMutatok,
  letezoJelentesek: ReadonlySet<string>,
  letezoTicketek: ReadonlySet<string>,
  letezoEredmenyek: ReadonlySet<string>,
): Elem[] | null {
  if (szempont === 'tajekoztatas' || szempont === 'kapcsolatepites') {
    const jelentesek = m[szempont].jelentesek.map((j) => {
      const letezik = letezoJelentesek.has(j.id);
      return {
        id: j.id,
        targy: j.targy,
        url: letezik ? `/jelentesek/${encodeURIComponent(j.id)}` : null,
        reszlet: letezik ? jelentesReszlet(j) : `${jelentesReszlet(j)} · ${TOROLT}`,
      };
    });
    if (szempont === 'tajekoztatas') return jelentesek;
    const tevekenysegek = (m.kapcsolatepites.tevekenyseg?.tevekenysegek ?? []).map((t) => ({
      id: `tevekenyseg-${t.id}`,
      targy: t.megnevezes,
      url: null,
      reszlet: tevekenysegReszlet(t),
    }));
    return [...tevekenysegek, ...jelentesek];
  }
  if (szempont === 'eredmenyek') {
    return (m.eredmenyek?.ugyek ?? []).map((u) => {
      const letezik = letezoEredmenyek.has(u.id);
      return {
        id: u.id,
        targy: u.megnevezes,
        url: letezik ? `/tevekenysegek/eredmeny/${encodeURIComponent(u.id)}` : null,
        reszlet: letezik ? eredmenyReszlet(u) : `${eredmenyReszlet(u)} · ${TOROLT}`,
      };
    });
  }
  if (szempont === 'egyuttmukodes') {
    return m.egyuttmukodes.ticketek.map((t) => {
      const letezik = letezoTicketek.has(t.id);
      return {
        id: t.id,
        targy: t.targy,
        url: letezik ? listaUrl('mind', t.id) : null,
        reszlet: letezik ? ticketReszlet(t) : `${ticketReszlet(t)} · ${TOROLT}`,
      };
    });
  }
  return null;
}

function Elemek({ lista, ujLapon }: { lista: readonly Elem[]; ujLapon: boolean }) {
  return (
    <ul>
      {lista.map((e) => (
        <li key={e.id} className="border-b border-border/60 py-1.5 first:pt-0 last:border-b-0">
          {e.url === null ? (
            <span className="font-medium wrap-anywhere">{e.targy}</span>
          ) : (
            <Link
              href={e.url}
              target={ujLapon ? '_blank' : undefined}
              rel={ujLapon ? 'noopener' : undefined}
              className="rounded-sm font-medium wrap-anywhere text-[#1f4e9c] underline underline-offset-2 outline-none hover:text-[#16376e] focus-visible:ring-2 focus-visible:ring-[#1f4e9c]"
            >
              {e.targy}
              {ujLapon && <span className="sr-only"> (új lapon nyílik)</span>}
            </Link>
          )}
          <div className="text-[11px] text-muted-foreground">{e.reszlet}</div>
        </li>
      ))}
    </ul>
  );
}

/**
 * A szempont mutatóihoz tartozó bizonyítékok, legújabb elöl. A jelentés a `/jelentesek/[id]`, a ticket a
 * kommunikáció megfelelő szálára, az ügy a `/tevekenysegek/eredmeny/[id]` oldalra mutat; ha az azonosító nincs a még
 * létezők között (a lezárás óta törölték), a tárgy link nélküli szöveg, mert a rögzített mutatók a törlés után sem
 * változnak. A Kapcsolatépítés tevékenységei a jelentések előtt állnak, link nélkül. Bővített adat nélküli félévben a
 * `NINCS_TEVEKENYSEGI_ADAT` szöveg jelzi a hiányt: az Eredményeknél a lista helyett, a Kapcsolatépítésnél a megmaradó
 * jelentések fölött. Törölt fiókú attasénál a lista helyett a `FORRAS_HIANYZIK` szöveg áll. `ujLapon`: a munkalapon a
 * linkek új lapon nyílnak, hogy a be nem mentett szöveg ne vesszen el.
 */
export function BizonyitekLista({
  szempont,
  mutatok,
  letezoJelentesek,
  letezoTicketek,
  letezoEredmenyek,
  ujLapon = false,
}: {
  szempont: SzempontKulcs;
  mutatok: ErtekelesMutatok;
  letezoJelentesek: readonly string[];
  letezoTicketek: readonly string[];
  letezoEredmenyek: readonly string[];
  ujLapon?: boolean;
}) {
  if (mutatok.forrasHianyzik) return <p className="text-muted-foreground">{FORRAS_HIANYZIK}</p>;
  if (szempont === 'eredmenyek' && mutatok.eredmenyek === undefined) {
    return <p className="text-muted-foreground">{NINCS_TEVEKENYSEGI_ADAT}</p>;
  }
  const lista = elemek(szempont, mutatok, new Set(letezoJelentesek), new Set(letezoTicketek), new Set(letezoEredmenyek));
  if (lista === null) {
    return <p className="text-muted-foreground">{NINCS_LISTA[szempont] ?? 'Nincs bizonyíték.'}</p>;
  }
  const tevekenysegNelkul = szempont === 'kapcsolatepites' && mutatok.kapcsolatepites.tevekenyseg === undefined;
  const jelzes = tevekenysegNelkul && <p className="mb-1.5 text-muted-foreground">{NINCS_TEVEKENYSEGI_ADAT}</p>;
  if (lista.length === 0) {
    const ures =
      szempont === 'kapcsolatepites' && !tevekenysegNelkul
        ? 'Az időszakban nem volt ide tartozó tevékenység vagy jelentés.'
        : (URES_LISTA[szempont] ?? 'Nincs bizonyíték.');
    return (
      <>
        {jelzes}
        <p className="text-muted-foreground">{ures}</p>
      </>
    );
  }
  const tobb = lista.slice(LATHATO);
  return (
    <>
      {jelzes}
      <Elemek lista={lista.slice(0, LATHATO)} ujLapon={ujLapon} />
      {tobb.length > 0 && (
        <details className="mt-1.5 border-t border-border/60 pt-1.5">
          <summary className="cursor-pointer rounded-sm text-[11.5px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#1f4e9c]">
            További {tobb.length} elem
          </summary>
          <div className="mt-1.5">
            <Elemek lista={tobb} ujLapon={ujLapon} />
          </div>
        </details>
      )}
    </>
  );
}

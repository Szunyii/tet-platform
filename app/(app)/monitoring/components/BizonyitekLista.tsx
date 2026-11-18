import Link from 'next/link';
import { jelentesReszlet, ticketReszlet } from '../../../../lib/ertekeles-megjelenites';
import type { ErtekelesMutatok } from '../../../../lib/ertekeles-mutatok';
import type { SzempontKulcs } from '../../../../lib/ertekeles-szotar';
import { listaUrl } from '../../../../lib/ticket-szotar';

/** Ennyi elem látszik azonnal, a többi egy lenyitható részben. */
const LATHATO = 8;

interface Elem {
  id: string;
  targy: string;
  /** `null`: a jelentés vagy a ticket már nem létezik, a tárgy sima szöveg. */
  url: string | null;
  reszlet: string;
}

const NINCS_LISTA: Partial<Record<SzempontKulcs, string>> = {
  orszagismeret: 'Nincs külön bizonyítéklista: a mutatók az országprofilból jönnek.',
  eredmenyek: 'Az 1. szakaszban a rendszer még nem rögzít bizonyítékot.',
};

const URES_LISTA: Partial<Record<SzempontKulcs, string>> = {
  tajekoztatas: 'Az időszakban nem volt beadott jelentés.',
  kapcsolatepites: 'Az időszakban nem volt ide tartozó jelentés.',
  egyuttmukodes: 'Az időszakban nem volt ide tartozó ticket.',
};

const TOROLT = 'már nem elérhető';

function elemek(
  szempont: SzempontKulcs,
  m: ErtekelesMutatok,
  letezoJelentesek: ReadonlySet<string>,
  letezoTicketek: ReadonlySet<string>,
): Elem[] | null {
  if (szempont === 'tajekoztatas' || szempont === 'kapcsolatepites') {
    return m[szempont].jelentesek.map((j) => {
      const letezik = letezoJelentesek.has(j.id);
      return {
        id: j.id,
        targy: j.targy,
        url: letezik ? `/jelentesek/${encodeURIComponent(j.id)}` : null,
        reszlet: letezik ? jelentesReszlet(j) : `${jelentesReszlet(j)} · ${TOROLT}`,
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

function Elemek({ lista }: { lista: readonly Elem[] }) {
  return (
    <ul>
      {lista.map((e) => (
        <li key={e.id} className="border-b border-border/60 py-1.5 first:pt-0 last:border-b-0">
          {e.url === null ? (
            <span className="font-medium wrap-anywhere">{e.targy}</span>
          ) : (
            <Link href={e.url} className="font-medium text-foreground wrap-anywhere hover:underline">
              {e.targy}
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
 * kommunikáció megfelelő szálára mutat; ha az azonosító nincs a még létezők között (a lezárás óta törölték),
 * a tárgy link nélküli szöveg, mert a rögzített mutatók a törlés után sem változnak.
 */
export function BizonyitekLista({
  szempont,
  mutatok,
  letezoJelentesek,
  letezoTicketek,
}: {
  szempont: SzempontKulcs;
  mutatok: ErtekelesMutatok;
  letezoJelentesek: readonly string[];
  letezoTicketek: readonly string[];
}) {
  const lista = elemek(szempont, mutatok, new Set(letezoJelentesek), new Set(letezoTicketek));
  if (lista === null) {
    return <p className="text-muted-foreground">{NINCS_LISTA[szempont] ?? 'Nincs bizonyíték.'}</p>;
  }
  if (lista.length === 0) {
    return <p className="text-muted-foreground">{URES_LISTA[szempont] ?? 'Nincs bizonyíték.'}</p>;
  }
  const tobb = lista.slice(LATHATO);
  return (
    <>
      <Elemek lista={lista.slice(0, LATHATO)} />
      {tobb.length > 0 && (
        <details className="mt-1.5 border-t border-border/60 pt-1.5">
          <summary className="cursor-pointer text-[11.5px] font-medium text-muted-foreground hover:text-foreground">
            További {tobb.length} elem
          </summary>
          <div className="mt-1.5">
            <Elemek lista={tobb} />
          </div>
        </details>
      )}
    </>
  );
}

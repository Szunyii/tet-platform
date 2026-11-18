import { ChevronRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AdatlapNezet, SzempontMinosites } from '../../../../db/queries/ertekeles';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../../components/ui/collapsible';
import { formatDatumIdo } from '../../../../lib/datum';
import {
  EREDMENYEK_URES,
  kulcsMutato,
  mutatoKartyak,
  mutatoKorlat,
} from '../../../../lib/ertekeles-megjelenites';
import type { ErtekelesMutatok } from '../../../../lib/ertekeles-mutatok';
import { AUTOMATIKUS_ERTEKELO, MEGFELEL, SZEMPONTOK, type Szempont } from '../../../../lib/ertekeles-szotar';
import { BizonyitekLista } from './BizonyitekLista';
import { MinositesJelveny } from './FokozatJelveny';
import { MutatoRacs } from './MutatoRacs';

function Oszlop({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <h5 className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{cim}</h5>
      {children}
    </div>
  );
}

function Indoklas({ minosites }: { minosites: SzempontMinosites | undefined }) {
  if (minosites === undefined) return <p className="text-muted-foreground">Ehhez a szemponthoz nincs rögzített minősítés.</p>;
  const automatikus = minosites.ertekeloNev === AUTOMATIKUS_ERTEKELO;
  const szoveg =
    minosites.indoklas ??
    (automatikus
      ? 'Az attasé egyetlen országnak sem relációs vezetője, ezért a szempont automatikusan nem értékelhető.'
      : minosites.fokozat === MEGFELEL
        ? 'Nincs indoklás, a „Megfelel” fokozatnál nem kötelező.'
        : 'Nincs indoklás.');
  return (
    <>
      <p className={minosites.indoklas === null ? 'text-muted-foreground' : 'whitespace-pre-line wrap-anywhere'}>{szoveg}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Értékelő: {minosites.ertekeloNev}, {formatDatumIdo(minosites.updatedAt)}
      </p>
    </>
  );
}

/** A szempont mutatói; az Eredményeknek nincs rendszeradata, ott a rövid magyarázat áll. */
export function Meres({ szempont, mutatok }: { szempont: Szempont; mutatok: ErtekelesMutatok | null }) {
  if (mutatok === null) return <p className="text-muted-foreground">Nincs rögzített mutató.</p>;
  const kartyak = mutatoKartyak(szempont.kulcs, mutatok);
  if (kartyak.length === 0) return <p className="text-muted-foreground">{EREDMENYEK_URES}</p>;
  return <MutatoRacs kartyak={kartyak} korlat={mutatoKorlat(szempont.kulcs, mutatok)} />;
}

/**
 * Szempontonként egy lenyitható sor: zárva a fokozat (szöveggel) és egy kulcsmutató látszik, lenyitva a
 * mutatók, a bizonyítékok, az admin indoklása, az értékelő neve és az időpont. A sor gombja `aria-expanded`
 * állapotú (Base UI Collapsible). A mutatók a lezáráskori pillanatképből jönnek.
 */
export function SzempontSorok({
  mutatok,
  minositesek,
  letezoJelentesek,
  letezoTicketek,
}: Pick<AdatlapNezet, 'mutatok' | 'minositesek' | 'letezoJelentesek' | 'letezoTicketek'>) {
  return (
    <section className="@container">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h3 className="text-[13px] font-semibold">Szempontok</h3>
        {mutatok !== null && (
          <p className="text-[11px] text-muted-foreground">
            A mutatók a lezáráskori állapotot mutatják (rögzítve: {formatDatumIdo(new Date(mutatok.szamitvaAt))}).
          </p>
        )}
      </div>
      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {SZEMPONTOK.map((szempont) => {
          const minosites = minositesek[szempont.kulcs];
          return (
            <li key={szempont.kulcs}>
              <Collapsible>
                <h4>
                  <CollapsibleTrigger className="group/sor grid w-full grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-2.5 gap-y-0.5 px-2.5 py-2.5 text-left @md:px-3.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset @md:grid-cols-[1.25rem_minmax(0,1fr)_auto] @3xl:grid-cols-[1.25rem_minmax(0,1fr)_minmax(0,1.4fr)_8.5rem]">
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="row-span-3 size-4 text-muted-foreground transition-transform group-data-[panel-open]/sor:rotate-90 @md:row-span-2 @3xl:row-span-1"
                    />
                    <span className="col-start-2 text-[13px] font-semibold wrap-anywhere">{szempont.nev}</span>
                    <span className="col-start-2 text-[12px] font-normal text-muted-foreground wrap-anywhere @3xl:col-start-3">
                      {mutatok === null ? '–' : kulcsMutato(szempont.kulcs, mutatok)}
                    </span>
                    {/* Keskeny helyen a fokozat a sor alján áll, és tördelhető, hogy ne lógjon ki. */}
                    <span className="col-start-2 mt-0.5 justify-self-start @md:col-start-3 @md:row-span-2 @md:row-start-1 @md:mt-0 @md:justify-self-end @3xl:col-start-4 @3xl:row-span-1 [&>span]:whitespace-normal">
                      <MinositesJelveny fokozat={minosites?.fokozat} />
                    </span>
                  </CollapsibleTrigger>
                </h4>
                <CollapsibleContent>
                  <div className="grid gap-4 px-3.5 pt-1 pb-3.5 text-[12.5px] @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] @4xl:pl-[2.75rem]">
                    <Oszlop cim="Mérés">
                      <Meres szempont={szempont} mutatok={mutatok} />
                    </Oszlop>
                    <Oszlop cim="Bizonyítékok">
                      {mutatok === null ? (
                        <p className="text-muted-foreground">Nincs rögzített mutató.</p>
                      ) : (
                        <BizonyitekLista
                          szempont={szempont.kulcs}
                          mutatok={mutatok}
                          letezoJelentesek={letezoJelentesek}
                          letezoTicketek={letezoTicketek}
                        />
                      )}
                    </Oszlop>
                    <Oszlop cim="Admin indoklása">
                      <Indoklas minosites={minosites} />
                    </Oszlop>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

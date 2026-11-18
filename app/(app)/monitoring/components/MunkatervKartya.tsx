import Link from 'next/link';
import { NINCS_TEVEKENYSEGI_ADAT } from '../../../../lib/ertekeles-megjelenites';
import type { MunkatervMutato } from '../../../../lib/ertekeles-mutatok';
import { SZEMPONTOK } from '../../../../lib/ertekeles-szotar';
import { CEL_ALLAPOTOK, type CelAllapot } from '../../../../lib/munkaterv-szotar';

const DARAB: Record<CelAllapot, 'folyamatbanDb' | 'teljesultDb' | 'reszbenDb' | 'elmaradtDb'> = {
  folyamatban: 'folyamatbanDb',
  teljesult: 'teljesultDb',
  reszben: 'reszbenDb',
  elmaradt: 'elmaradtDb',
};

const allapotCimke = (k: CelAllapot) => CEL_ALLAPOTOK.find((a) => a.kulcs === k)?.cimke ?? k;
// A rögzített pillanatkép a szótár későbbi változását is túléli: ismeretlen kulcsnál a nyers érték látszik.
const szempontNev = (k: string) => SZEMPONTOK.find((s) => s.kulcs === k)?.nev ?? k;

/**
 * A félév évének éves munkaterve az adatlapon és a munkalapon. `munkaterv`: hiányzik, ha a félévhez nincs bővített
 * adat; `null`, ha nincs jóváhagyott terv; különben a pillanatkép (nyitott félévben az élő állapot). Tájékoztató adat,
 * fokozat nem számolódik belőle. `ujLapon`: a munkalapon a link új lapon nyílik, hogy a be nem mentett szöveg ne vesszen el.
 */
export function MunkatervKartya({
  munkaterv,
  attaseId,
  ujLapon = false,
}: {
  munkaterv: MunkatervMutato | null | undefined;
  attaseId: string;
  ujLapon?: boolean;
}) {
  return (
    <section aria-labelledby="munkaterv-kartya-cim" className="min-w-0 rounded-xl border border-border bg-card p-3.5 text-[12.5px]">
      <h3 id="munkaterv-kartya-cim" className="mb-1 text-[11px] font-semibold text-muted-foreground">
        Éves munkaterv{munkaterv ? ` (${munkaterv.ev})` : ''}
      </h3>
      {munkaterv === undefined ? (
        <p className="text-muted-foreground">{NINCS_TEVEKENYSEGI_ADAT}</p>
      ) : munkaterv === null ? (
        <p className="text-muted-foreground">Nincs jóváhagyott munkaterv.</p>
      ) : (
        <>
          <p className="text-[14px] font-semibold">
            {munkaterv.teljesultDb} / {munkaterv.celDb} cél teljesült
          </p>
          <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11.5px] text-muted-foreground">
            {CEL_ALLAPOTOK.map((a) => (
              <div key={a.kulcs} className="flex gap-1">
                <dt>{a.cimke}:</dt>
                <dd className="font-medium text-foreground">{munkaterv[DARAB[a.kulcs]]}</dd>
              </div>
            ))}
          </dl>
          <ul className="mt-2 border-t border-border/60">
            {munkaterv.celok.map((c, i) => (
              <li key={i} className="border-b border-border/60 py-1.5 last:border-b-0">
                <span className="block font-medium wrap-anywhere">{c.megnevezes}</span>
                <span className="block text-[11px] text-muted-foreground wrap-anywhere">
                  {szempontNev(c.szempont)} · <span className="font-medium text-foreground">{allapotCimke(c.allapot)}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={`/munkaterv/${encodeURIComponent(attaseId)}?ev=${munkaterv.ev}`}
            target={ujLapon ? '_blank' : undefined}
            rel={ujLapon ? 'noopener' : undefined}
            className="mt-1.5 inline-block rounded-sm font-medium wrap-anywhere text-[#1f4e9c] underline underline-offset-2 outline-none hover:text-[#16376e] focus-visible:ring-2 focus-visible:ring-[#1f4e9c]"
          >
            A {munkaterv.ev}. évi terv megnyitása
            {ujLapon && <span className="sr-only"> (új lapon nyílik)</span>}
          </Link>
        </>
      )}
    </section>
  );
}

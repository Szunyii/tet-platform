'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { ALLAPOT_CIMKE, ALLAPOT_SZINEK, ALLAPOTOK } from '../../../../lib/orszagprofil-szotar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

/** A térkép melletti panel, ha nincs kiválasztott ország: állapot-összesítő és a legutóbb frissített profilok. */
export function TerkepUres({ adatok, onSelect }: { adatok: TerkepOrszag[]; onSelect: (kod: string) => void }) {
  // A rendezés a frissitveMs (ezredmásodperc) mezőn; a frissitve csak megjelenítésre szolgál.
  const legutobbi = adatok
    .filter((o) => o.frissitveMs !== null)
    .sort((a, b) => (b.frissitveMs ?? 0) - (a.frissitveMs ?? 0))
    .slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Válassz országot a térképen</CardTitle>
        <CardDescription>
          A pontok a TéT attasé-posztokat jelölik. Kattintásra megnyílik az ország profiljának kivonata.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Profilok állapota</p>
          <ul className="flex flex-col gap-1.5">
            {ALLAPOTOK.map((a) => (
              <li key={a} className="flex items-center gap-2 text-sm">
                {/* Inline style szándékosan: a szín a térképpel közös szótárból jön. */}
                <span className="size-2.5 shrink-0 rounded-sm" style={{ background: ALLAPOT_SZINEK[a] }} />
                {ALLAPOT_CIMKE[a]}
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {adatok.filter((o) => o.allapot === a).length} ország
                </span>
              </li>
            ))}
          </ul>
        </div>
        {legutobbi.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Legutóbb frissített profilok
            </p>
            <ul className="divide-y divide-border">
              {legutobbi.map((o) => (
                <li key={o.kod}>
                  <button
                    type="button"
                    onClick={() => onSelect(o.kod)}
                    className="flex w-full items-center gap-2 py-2 text-left text-sm hover:bg-muted/50"
                  >
                    <span className="font-medium">{o.nev}</span>
                    <span className="truncate text-muted-foreground">{o.attase ?? ''}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{o.frissitve}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

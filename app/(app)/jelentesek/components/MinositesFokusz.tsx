'use client';

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';

/** A lista soronkénti minősítés-gombja (a `MinositesSzerkeszto` `cella` változata jelöli). */
const CELLA = '[data-minosites-cella]';
/** Az üres állapot (a táblázat helyén álló doboz) fókuszálható eleme, ha egyetlen sor sem maradt. */
const CEL = '[data-fokusz-cel]';

/** A legutóbb megnyitott minősítés-gomb és a szomszédai (a megnyitáskori sorrendben). */
interface Rekord {
  gomb: HTMLElement;
  kovetkezo: HTMLElement | null;
  elozo: HTMLElement | null;
}

/**
 * A jelentéslista burka a központnak. Szűrt listában (`?minosites=nincs`, vagy egy fokozat szűrőjénél a fokozat
 * módosításakor) a minősítés mentése után a sor kikerül a listából, vele a kiváltó gomb és a dialógus is, a fókusz
 * pedig a `body`-ra esne: billentyűzetes és képernyőolvasós felhasználó minden mentés után a lap tetejéről
 * kezdhetné újra. Ezért a burok a gomb megnyomásakor megjegyzi a következő és az előző sor gombját, és ha a lista
 * frissülése után az eredeti gomb már nincs a DOM-ban, a következő sor gombjára viszi a fókuszt (az utolsó sornál
 * az előzőére; ha egyetlen sor sem maradt, az üres állapot dobozára).
 *
 * Nem vesz el fókuszt, ha a sor a listában marad (ott a dialógus magától a gombra adja vissza), és akkor sem, ha a
 * felhasználó közben máshová vitte (pl. a szűrőre): csak akkor dolgozik, ha a fókusz a `body`-n van. Nem kap
 * minősítés-adatot, csak a szerver-renderelt tartalmat.
 */
export function MinositesFokusz({ children }: { children: ReactNode }) {
  const gyoker = useRef<HTMLDivElement>(null);
  const rekord = useRef<Rekord | null>(null);

  // Minden renderelés után: a szerver új listája után a burok is újrarenderel. Passzív effekt, ezért a kieső sor
  // dialógusának (Base UI) fókuszvisszaadó takarítása már lefutott.
  useEffect(() => {
    const r = rekord.current;
    if (!r || r.gomb.isConnected) return;
    rekord.current = null;
    const aktiv = document.activeElement;
    if (aktiv && aktiv !== document.body) return;
    const cel =
      [r.kovetkezo, r.elozo].find((el) => el?.isConnected) ??
      gyoker.current?.querySelector<HTMLElement>(CELLA) ??
      gyoker.current?.querySelector<HTMLElement>(CEL);
    cel?.focus();
  });

  // Capture-fázis, hogy a gomb saját kattintás-kezelője (a dialógus nyitása) előtt, a még érintetlen sorrendben jegyezzük meg.
  function gombNyomas(e: MouseEvent<HTMLDivElement>) {
    const gomb = e.target instanceof Element ? e.target.closest<HTMLElement>(CELLA) : null;
    if (!gomb || !gyoker.current) return;
    const gombok = Array.from(gyoker.current.querySelectorAll<HTMLElement>(CELLA));
    const i = gombok.indexOf(gomb);
    rekord.current = { gomb, kovetkezo: gombok[i + 1] ?? null, elozo: i > 0 ? gombok[i - 1] : null };
  }

  return (
    <div ref={gyoker} onClickCapture={gombNyomas} className="contents">
      {children}
    </div>
  );
}

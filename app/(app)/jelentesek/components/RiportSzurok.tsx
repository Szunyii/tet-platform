'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { RiportSzerzo } from '../../../../db/queries/riport';
import { orszagNev } from '../../../../lib/orszagok';
import { KATEGORIAK, KULCSSZAVAK } from '../../../../lib/riport-szotar';
import type { SzuroErtekek } from '../../../../lib/riport-szuro';
import { CimkesSelect, type SelectOpcio } from '../../../../components/form/CimkesSelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';

/** A „Mind" és az üres érték (törlés: a `CimkesSelect` a Select `null`-ját üres stringként adja) egyaránt „nincs szűrő". */
function szuroErtek(v: string): string {
  return v === MIND ? '' : v;
}

/** A „Mind" opció: a szűrő-legördülők első eleme. */
const MIND_OPCIO: SelectOpcio = { ertek: MIND, cimke: 'Mind' };

const KATEGORIA_OPCIOK: SelectOpcio[] = [MIND_OPCIO, ...KATEGORIAK.map((k) => ({ ertek: k.kulcs, cimke: k.rovid }))];
const KULCSSZO_OPCIOK: SelectOpcio[] = [MIND_OPCIO, ...KULCSSZAVAK.map((k) => ({ ertek: k, cimke: k }))];

export function RiportSzurok({
  ertekek,
  orszagok,
  szerzok,
  admin,
}: {
  ertekek: SzuroErtekek;
  orszagok: string[];
  /** Az attasé-szűrő opciói (csak adminnak, egyébként üres). */
  szerzok: RiportSzerzo[];
  admin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(ertekek.q);

  // A legfrissebb URL-szűrők és keresőszöveg, hogy a `frissit` referenciája stabil maradjon
  // (így a debounce effekt nem indul újra minden szülő-renderre).
  const ertekekRef = useRef(ertekek);
  const qRef = useRef(q);
  // Amit legutóbb magunk küldtünk az URL-be: ehhez mérjük, hogy az `ertekek.q` változása
  // a saját navigációnk visszhangja-e, vagy valódi külső változás.
  const kuldottQRef = useRef(ertekek.q);

  // Render közben nem írunk refet; ez az effekt a debounce effekt ELŐTT van deklarálva,
  // ezért ugyanabban a commitban már a friss értékeket látja.
  useEffect(() => {
    ertekekRef.current = ertekek;
    qRef.current = q;
  });

  const frissit = useCallback(
    (valtozas: Partial<SzuroErtekek>) => {
      const uj = { ...ertekekRef.current, q: qRef.current, ...valtozas };
      kuldottQRef.current = uj.q;
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(uj)) if (v) sp.set(k, v);
      const qs = sp.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router],
  );

  // Csak a valóban külső URL-változást – vissza gomb, „Szűrők törlése" – írjuk vissza a
  // mezőbe; a saját, közben elavult navigációnk visszhangját nem, különben a szerver
  // válaszáig begépelt karaktereket elnyelné a mező.
  useEffect(() => {
    if (ertekek.q === kuldottQRef.current) return;
    kuldottQRef.current = ertekek.q;
    setQ(ertekek.q);
  }, [ertekek.q]);

  // Keresőmező: 300 ms debounce, csak ha tényleg eltér az URL-ben lévőtől. A guard és a
  // függőség szándékosan a propra (`ertekek.q`) megy, nem refre: ha a mező és az URL
  // bármi miatt szétcsúszik (pl. a válasz megérkezése előtt kiürítjük a mezőt), az effekt
  // a válasz beérkezésekor újraindul és helyrehozza.
  useEffect(() => {
    if (q === ertekek.q) return;
    const t = setTimeout(() => {
      if (q !== ertekek.q) frissit({ q });
    }, 300);
    return () => clearTimeout(t);
  }, [q, ertekek.q, frissit]);

  const vanAktiv = Object.values(ertekek).some(Boolean);

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3"
      aria-busy={pending}
    >
      <div className="flex min-w-56 flex-1 flex-col gap-1.5">
        <Label htmlFor="szuro-q">Keresés</Label>
        <Input
          id="szuro-q"
          placeholder="Tárgy vagy összefoglaló…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <CimkesSelect
        id="szuro-kategoria"
        cimke="Kategória"
        value={ertekek.kategoria || MIND}
        opciok={KATEGORIA_OPCIOK}
        onChange={(v) => frissit({ kategoria: szuroErtek(v) })}
        className="w-44"
      />
      <CimkesSelect
        id="szuro-kulcsszo"
        cimke="Kulcsszó"
        value={ertekek.kulcsszo || MIND}
        opciok={KULCSSZO_OPCIOK}
        onChange={(v) => frissit({ kulcsszo: szuroErtek(v) })}
        className="w-56"
      />
      {admin && (
        <>
          <CimkesSelect
            id="szuro-orszag"
            cimke="Ország"
            value={ertekek.orszag || MIND}
            opciok={[MIND_OPCIO, ...orszagok.map((o) => ({ ertek: o, cimke: orszagNev(o) }))]}
            onChange={(v) => frissit({ orszag: szuroErtek(v) })}
            className="w-44"
          />
          <CimkesSelect
            id="szuro-attase"
            cimke="Attasé"
            value={ertekek.attase || MIND}
            opciok={[MIND_OPCIO, ...szerzok.map((s) => ({ ertek: s.id, cimke: s.nev }))]}
            onChange={(v) => frissit({ attase: szuroErtek(v) })}
            className="w-56"
          />
        </>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="szuro-tol">Beadva ettől</Label>
        <Input
          id="szuro-tol"
          type="date"
          value={ertekek.tol}
          onChange={(e) => frissit({ tol: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="szuro-ig">eddig</Label>
        <Input
          id="szuro-ig"
          type="date"
          value={ertekek.ig}
          onChange={(e) => frissit({ ig: e.target.value })}
        />
      </div>
      {vanAktiv && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setQ('');
            kuldottQRef.current = '';
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
        >
          Szűrők törlése
        </Button>
      )}
    </div>
  );
}

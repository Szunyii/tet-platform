'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { KATEGORIAK, KULCSSZAVAK } from '../../lib/riport-szotar';
import type { SzuroErtekek } from '../../lib/riport-szuro';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';

/** A Select `onValueChange` értéke `null` is lehet (törlés); a „Mind" és a `null` egyaránt „nincs szűrő". */
function szuroErtek(v: string | null): string {
  return v === null || v === MIND ? '' : v;
}

interface SzuroOpcio {
  ertek: string;
  cimke: string;
}

/**
 * Egy szűrő-legördülő „Mind" opcióval. A trigger `role=combobox` gomb, amire a `<label for>`
 * nem minden AT-nél számít névnek, ezért `aria-labelledby`: a címke id-ja + a sajátja
 * (így a név a „címke + aktuális érték").
 */
function SzuroSelect({
  id,
  cimke,
  ertek,
  opciok,
  onChange,
  className,
}: {
  id: string;
  cimke: string;
  ertek: string;
  opciok: readonly SzuroOpcio[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>
        {cimke}
      </Label>
      <Select
        value={ertek || MIND}
        onValueChange={(v) => onChange(szuroErtek(v))}
        items={{ [MIND]: 'Mind', ...Object.fromEntries(opciok.map((o) => [o.ertek, o.cimke])) }}
      >
        <SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MIND}>Mind</SelectItem>
          {opciok.map((o) => (
            <SelectItem key={o.ertek} value={o.ertek}>
              {o.cimke}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const KATEGORIA_OPCIOK: SzuroOpcio[] = KATEGORIAK.map((k) => ({ ertek: k.kulcs, cimke: k.rovid }));
const KULCSSZO_OPCIOK: SzuroOpcio[] = KULCSSZAVAK.map((k) => ({ ertek: k, cimke: k }));

export function RiportSzurok({
  ertekek,
  orszagok,
  admin,
}: {
  ertekek: SzuroErtekek;
  orszagok: string[];
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
          placeholder="Tárgy vagy leírás…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <SzuroSelect
        id="szuro-kategoria"
        cimke="Kategória"
        ertek={ertekek.kategoria}
        opciok={KATEGORIA_OPCIOK}
        onChange={(v) => frissit({ kategoria: v })}
        className="w-44"
      />
      <SzuroSelect
        id="szuro-kulcsszo"
        cimke="Kulcsszó"
        ertek={ertekek.kulcsszo}
        opciok={KULCSSZO_OPCIOK}
        onChange={(v) => frissit({ kulcsszo: v })}
        className="w-56"
      />
      {admin && (
        <SzuroSelect
          id="szuro-orszag"
          cimke="Ország"
          ertek={ertekek.orszag}
          opciok={orszagok.map((o) => ({ ertek: o, cimke: o }))}
          onChange={(v) => frissit({ orszag: v })}
          className="w-44"
        />
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

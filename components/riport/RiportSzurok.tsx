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
  ertekekRef.current = ertekek;
  const qRef = useRef(q);
  qRef.current = q;

  const frissit = useCallback(
    (valtozas: Partial<SzuroErtekek>) => {
      const uj = { ...ertekekRef.current, q: qRef.current, ...valtozas };
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(uj)) if (v) sp.set(k, v);
      startTransition(() => router.replace(sp.size ? `${pathname}?${sp}` : pathname));
    },
    [pathname, router],
  );

  // Ha az URL más úton változik (vissza gomb, „Szűrők törlése"), a kereső kövesse.
  useEffect(() => {
    setQ(ertekek.q);
  }, [ertekek.q]);

  // Keresőmező: 300 ms debounce, csak ha tényleg eltér az URL-ben lévőtől. A `frissit`
  // és az `ertekekRef` stabil, ezért a `q` az egyetlen valódi kiváltó ok.
  useEffect(() => {
    if (q === ertekekRef.current.q) return;
    const t = setTimeout(() => {
      if (q !== ertekekRef.current.q) frissit({ q });
    }, 300);
    return () => clearTimeout(t);
  }, [q, frissit]);

  const vanAktiv = Object.values(ertekek).some(Boolean);
  const kategoriaCimke = Object.fromEntries(KATEGORIAK.map((k) => [k.kulcs, k.rovid]));
  const kulcsszoCimke = Object.fromEntries(KULCSSZAVAK.map((k) => [k, k]));
  const orszagCimke = Object.fromEntries(orszagok.map((o) => [o, o]));

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
      <div className="flex flex-col gap-1.5">
        <Label id="szuro-kategoria-label" htmlFor="szuro-kategoria">
          Kategória
        </Label>
        <Select
          value={ertekek.kategoria || MIND}
          onValueChange={(v) => frissit({ kategoria: szuroErtek(v) })}
          items={{ [MIND]: 'Mind', ...kategoriaCimke }}
        >
          <SelectTrigger
            id="szuro-kategoria"
            aria-labelledby="szuro-kategoria-label szuro-kategoria"
            className="w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MIND}>Mind</SelectItem>
            {KATEGORIAK.map((k) => (
              <SelectItem key={k.kulcs} value={k.kulcs}>
                {k.rovid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label id="szuro-kulcsszo-label" htmlFor="szuro-kulcsszo">
          Kulcsszó
        </Label>
        <Select
          value={ertekek.kulcsszo || MIND}
          onValueChange={(v) => frissit({ kulcsszo: szuroErtek(v) })}
          items={{ [MIND]: 'Mind', ...kulcsszoCimke }}
        >
          <SelectTrigger
            id="szuro-kulcsszo"
            aria-labelledby="szuro-kulcsszo-label szuro-kulcsszo"
            className="w-56"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MIND}>Mind</SelectItem>
            {KULCSSZAVAK.map((k) => (
              <SelectItem key={k} value={k}>
                {k}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {admin && (
        <div className="flex flex-col gap-1.5">
          <Label id="szuro-orszag-label" htmlFor="szuro-orszag">
            Ország
          </Label>
          <Select
            value={ertekek.orszag || MIND}
            onValueChange={(v) => frissit({ orszag: szuroErtek(v) })}
            items={{ [MIND]: 'Mind', ...orszagCimke }}
          >
            <SelectTrigger
              id="szuro-orszag"
              aria-labelledby="szuro-orszag-label szuro-orszag"
              className="w-44"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={MIND}>Mind</SelectItem>
              {orszagok.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
            startTransition(() => router.replace(pathname));
          }}
        >
          Szűrők törlése
        </Button>
      )}
    </div>
  );
}

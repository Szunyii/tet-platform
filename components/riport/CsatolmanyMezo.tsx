'use client';

import { PaperclipIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { CSATOLMANY_ACCEPT, CSATOLMANY_LIMIT, formatMeret } from '../../lib/riport-szotar';
import type { MezoHibak } from '../../lib/urlap';
import type { CsatolmanyMeta } from '../../db/queries/riport';

/** Ugyanaz a fájl van-e már a listában (a File objektum azonossága nem elég: minden választás új példány). */
function ugyanaz(a: File, b: File): boolean {
  return a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
}

/** Listabeli kulcs: a fájl azonossága, nem az index (így az eltávolítás nem kever meg más sorokat). */
function fajlKulcs(f: File): string {
  return `${f.name}-${f.size}-${f.lastModified}`;
}

export function CsatolmanyMezo({
  fajlok,
  onFajlok,
  meglevok = [],
  torlendo = [],
  onTorlendo,
  errors,
  elocheckHiba,
}: {
  fajlok: File[];
  onFajlok: (f: File[]) => void;
  meglevok?: CsatolmanyMeta[];
  torlendo?: string[];
  onTorlendo?: (idk: string[]) => void;
  errors: MezoHibak;
  elocheckHiba: string | null;
}) {
  const rejtett = useRef<HTMLInputElement>(null);
  const valaszto = useRef<HTMLInputElement>(null);

  // A beküldött fájlok forrása a state: a rejtett file-inputot ebből töltjük (DataTransfer).
  // A rejtett file-inputot minden render után újratöltjük: a React a <form action> beküldése
  // után form.reset()-et hív, ami a files listát kiüríti, a `fajlok` referencia viszont
  // változatlan – egy [fajlok] dependency nem elég. Legfeljebb 5 elem, olcsó művelet.
  useEffect(() => {
    if (!rejtett.current) return;
    const dt = new DataTransfer();
    for (const f of fajlok) dt.items.add(f);
    rejtett.current.files = dt.files;
  });

  const megmaradoDb = meglevok.length - torlendo.length;
  const hiba = elocheckHiba ?? errors.csatolmany;

  return (
    <div className="flex flex-col gap-2">
      <Label id="csatolmany-label">
        Csatolmány (max. {CSATOLMANY_LIMIT.maxDarab} fájl, egyenként {formatMeret(CSATOLMANY_LIMIT.maxMeret)}; PDF, Word,
        Excel, PowerPoint, PNG, JPG)
      </Label>
      <input ref={rejtett} type="file" name="csatolmany" multiple hidden tabIndex={-1} aria-hidden />
      <input
        ref={valaszto}
        id="csatolmany-valaszto"
        type="file"
        multiple
        accept={CSATOLMANY_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const ujak = Array.from(e.target.files ?? []).filter((u) => !fajlok.some((m) => ugyanaz(m, u)));
          e.target.value = '';
          if (ujak.length > 0) onFajlok([...fajlok, ...ujak]);
        }}
      />
      <div
        id="csatolmany"
        role="group"
        aria-labelledby="csatolmany-label"
        tabIndex={-1}
        aria-invalid={hiba ? true : undefined}
        aria-describedby={hiba ? 'csatolmany-hiba' : undefined}
        className="rounded-xl border border-dashed border-border p-3 outline-none"
      >
        <Button type="button" variant="outline" size="sm" onClick={() => valaszto.current?.click()}>
          <PaperclipIcon /> Fájl hozzáadása
        </Button>
        <span className="ml-3 text-xs text-muted-foreground">
          {megmaradoDb + fajlok.length}/{CSATOLMANY_LIMIT.maxDarab}
        </span>
        {(meglevok.length > 0 || fajlok.length > 0) && (
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {meglevok.map((m) => {
              const jelolt = torlendo.includes(m.id);
              return (
                <li key={m.id} className="flex items-center gap-2">
                  {jelolt && <input type="hidden" name="torlendoCsatolmany" value={m.id} />}
                  <a
                    href={`/api/riport/csatolmany/${m.id}`}
                    className={jelolt ? 'line-through text-muted-foreground' : 'underline underline-offset-2'}
                  >
                    {m.fajlnev}
                  </a>
                  <span className="text-xs text-muted-foreground">{formatMeret(m.meret)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="ml-auto"
                    onClick={() => onTorlendo?.(jelolt ? torlendo.filter((x) => x !== m.id) : [...torlendo, m.id])}
                  >
                    {jelolt ? 'Mégse' : 'Törlésre jelöl'}
                  </Button>
                </li>
              );
            })}
            {fajlok.map((f, i) => (
              <li key={fajlKulcs(f)} className="flex items-center gap-2">
                <span>{f.name}</span>
                <span className="text-xs text-muted-foreground">{formatMeret(f.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="ml-auto"
                  aria-label={`${f.name} eltávolítása`}
                  onClick={() => onFajlok(fajlok.filter((_, j) => j !== i))}
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {hiba && (
        <p id="csatolmany-hiba" role="status" className="text-xs text-destructive">
          {hiba}
        </p>
      )}
    </div>
  );
}

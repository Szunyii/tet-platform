'use client';

import { PaperclipIcon, XIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { CSATOLMANY_ACCEPT, CSATOLMANY_LIMIT, formatMeret, mimeFromFajlnev } from '../../lib/riport-szotar';
import type { CsatolmanyMeta } from '../../db/queries/riport';

export function csatolmanyElocheck(uj: File[], osszesDb: number): string | null {
  if (osszesDb > CSATOLMANY_LIMIT.maxDarab) return `Legfeljebb ${CSATOLMANY_LIMIT.maxDarab} csatolmány lehet egy bejegyzésen.`;
  for (const f of uj) {
    if (!mimeFromFajlnev(f.name)) return `Nem engedélyezett fájltípus: ${f.name}.`;
    if (f.size > CSATOLMANY_LIMIT.maxMeret) return `Túl nagy fájl: ${f.name} (max. 8 MB).`;
  }
  return null;
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
  errors: Record<string, string>;
  elocheckHiba: string | null;
}) {
  const rejtett = useRef<HTMLInputElement>(null);
  const valaszto = useRef<HTMLInputElement>(null);

  // A beküldött fájlok forrása a state: a rejtett file-inputot ebből töltjük (DataTransfer).
  useEffect(() => {
    if (!rejtett.current) return;
    const dt = new DataTransfer();
    for (const f of fajlok) dt.items.add(f);
    rejtett.current.files = dt.files;
  }, [fajlok]);

  const megmaradoDb = meglevok.length - torlendo.length;
  const hiba = elocheckHiba ?? errors.csatolmany;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="csatolmany-valaszto">Csatolmány (max. 5 fájl, egyenként 8 MB; PDF, Word, Excel, PowerPoint, PNG, JPG)</Label>
      <input ref={rejtett} type="file" name="csatolmany" multiple hidden tabIndex={-1} aria-hidden />
      <input
        ref={valaszto}
        id="csatolmany-valaszto"
        type="file"
        multiple
        accept={CSATOLMANY_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const ujak = Array.from(e.target.files ?? []);
          e.target.value = '';
          onFajlok([...fajlok, ...ujak]);
        }}
      />
      <div
        id="csatolmany"
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
              <li key={`${f.name}-${i}`} className="flex items-center gap-2">
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
        <p id="csatolmany-hiba" className="text-xs text-destructive">
          {hiba}
        </p>
      )}
    </div>
  );
}

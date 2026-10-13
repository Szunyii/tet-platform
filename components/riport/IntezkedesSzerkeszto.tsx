'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { FormAction } from '../form/useMuveletForm';
import { buttonVariants } from '../ui/button';
import { IntezkedesDialog } from './IntezkedesDialog';

/**
 * A „Megtett intézkedés” kiváltó eleme és a dialógus nyitás-állapota; csak a központnak
 * renderelődik. `cella`: a lista cellája – a meglévő szöveg két sorra vágva maga a gomb,
 * szöveg nélkül „Intézkedés rögzítése”. `gomb`: a részletoldal gombja.
 */
export function IntezkedesSzerkeszto({
  targy,
  ertek,
  action,
  valtozat,
}: {
  targy: string;
  ertek: string | null;
  action: FormAction;
  valtozat: 'cella' | 'gomb';
}) {
  const [open, setOpen] = useState(false);
  // Nyitásonként új key: a dialógus mezője és hibái mindig friss állapotból indulnak.
  const [nyitas, setNyitas] = useState(0);
  const nyit = () => {
    setNyitas((n) => n + 1);
    setOpen(true);
  };
  const szovegGomb = valtozat === 'cella' && Boolean(ertek);

  return (
    <>
      {/* Egyetlen natív <button> minden állapotra: ha a szöveg megjelenésekor vagy törlésekor
          másik elemtípusra váltana, a React új DOM-elemet tenne a helyére, és a dialógus
          bezárásakor a fókusz nem tudna visszatérni a kiváltó elemre. */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={nyit}
        title={szovegGomb ? 'Megtett intézkedés módosítása' : undefined}
        // A listában soronként van ilyen gomb: a név a tárggyal együtt egyedi.
        aria-label={valtozat === 'cella' && !ertek ? `Intézkedés rögzítése: ${targy}` : undefined}
        className={cn(
          szovegGomb
            ? 'block w-full cursor-pointer rounded-sm text-left underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'
            : buttonVariants({ variant: 'outline', size: 'sm' }),
        )}
      >
        {szovegGomb ? (
          // Előnézet: a sortörések itt összeesnek, hogy a két sorba több tartalom férjen.
          <span className="line-clamp-2 break-words">{ertek}</span>
        ) : ertek ? (
          'Módosítás'
        ) : (
          'Intézkedés rögzítése'
        )}
      </button>
      {/* Az első nyitásig nincs mit mountolni (soronként egy dialógus-állapot és useActionState). */}
      {nyitas > 0 && (
        <IntezkedesDialog
          key={nyitas}
          targy={targy}
          ertek={ertek}
          action={action}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}

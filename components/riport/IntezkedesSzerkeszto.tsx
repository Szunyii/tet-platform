'use client';

import { useState } from 'react';
import type { FormAction } from '../form/useMuveletForm';
import { Button } from '../ui/button';
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

  return (
    <>
      {valtozat === 'cella' && ertek ? (
        <button
          type="button"
          onClick={nyit}
          title="Megtett intézkedés módosítása"
          className="block w-full rounded-sm text-left underline-offset-2 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="line-clamp-2 break-words whitespace-pre-wrap">{ertek}</span>
        </button>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={nyit}>
          {ertek ? 'Módosítás' : 'Intézkedés rögzítése'}
        </Button>
      )}
      <IntezkedesDialog
        key={nyitas}
        targy={targy}
        ertek={ertek}
        action={action}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

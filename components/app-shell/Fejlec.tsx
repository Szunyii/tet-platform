'use client';

import { usePathname } from 'next/navigation';
import type { Szerepkor } from '../../lib/felhasznalo-validacio';
import { titleFor } from '../../lib/navigacio';
import { CiklusValaszto, type ValasztEvAction } from './CiklusValaszto';

/** A tartalom fölötti, ragadós fejléc: az útvonal címe és alcíme (lib/navigacio.ts), jobbra a ciklusválasztó. */
export function Fejlec({ szerep, ev, evek, valasztEvAction }: {
  szerep: Szerepkor;
  ev: number;
  evek: readonly number[];
  valasztEvAction: ValasztEvAction;
}) {
  const [cim, alcim] = titleFor(usePathname(), szerep);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-5 border-b border-b-[#dde1e7] bg-white px-[26px] py-[13px]">
      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold tracking-[-.01em]">{cim}</h1>
        <div className="mt-0.5 text-[11.5px] text-[#6b7684]">{alcim}</div>
      </div>
      <div className="ml-auto flex items-center gap-3.5">
        <CiklusValaszto ev={ev} evek={evek} action={valasztEvAction} />
      </div>
    </header>
  );
}

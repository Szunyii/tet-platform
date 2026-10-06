import type { ReactNode } from 'react';

/** Egy űrlap-blokk a felhasználó-dialógusokban: felső elválasztó vonal, a cím a vonalon ül (fieldset + legend). */
export function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-t border-border pt-3">
      <legend className="pr-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{cim}</legend>
      {children}
    </fieldset>
  );
}

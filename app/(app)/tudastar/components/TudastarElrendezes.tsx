import type { ReactNode } from 'react';
import type { Kartya, KategoriaSlug } from '../../../../lib/tudastar-szotar';
import { KategoriaMenu } from './KategoriaMenu';
import { KategoriaValto } from './KategoriaValto';

/**
 * A kategória- és a részletoldal váza: a tartalom mellett jobb oldalt a kategória-menü (`xl` fölött – szűkebben
 * a 238 px-es oldalsáv mellett a tartalomnak nem maradna hely), keskenyebb ablakban a tartalom fölött a
 * kategória-választó. A `kartyak` az aktív kategóriáéi.
 */
export function TudastarElrendezes({
  aktivKategoria, kartyak, aktivSlug, children,
}: { aktivKategoria: KategoriaSlug; kartyak: readonly Kartya[]; aktivSlug?: string; children: ReactNode }) {
  return (
    <div className="grid max-w-6xl items-start gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <KategoriaValto aktiv={aktivKategoria} />
        {children}
      </div>
      <KategoriaMenu aktivKategoria={aktivKategoria} kartyak={kartyak} aktivSlug={aktivSlug} />
    </div>
  );
}

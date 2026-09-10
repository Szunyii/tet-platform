'use client';

import { useState } from 'react';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import { MEZO_CIMKEK, type Rendezvenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm } from '../BlokkForm';
import { RendezvenySorok } from '../RendezvenySorok';

const B = 'rendezvenyek';

export function RendezvenyekMezok({
  kod, ev, initial, mentve, action,
}: { kod: string; ev: number; initial: Rendezvenyek; mentve: string | null; action: FormAction }) {
  const [lista, setLista] = useState(initial.lista);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <p className="text-xs text-muted-foreground">{MEZO_CIMKEK.rendezvenyek.lista.sugo}</p>
          <RendezvenySorok value={lista} onChange={setLista} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

'use client';

import { SugoGomb } from '../../../../../components/form/SugoGomb';
import { MEZO_CIMKEK, type Rendezvenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';
import { kezdoRendezvenySorok, RendezvenySorok } from '../RendezvenySorok';

const B = 'rendezvenyek';
const L = MEZO_CIMKEK.rendezvenyek.lista;

export function RendezvenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Rendezvenyek>) {
  const { e, set } = useBlokkAllapot(B, { ...initial, lista: kezdoRendezvenySorok(initial.lista) });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <div className="flex items-center gap-1 text-sm font-medium">
            <span>{L.cimke}</span>
            <SugoGomb cimke={L.cimke} magyarazat={L.magyarazat} pelda={L.pelda} />
          </div>
          <RendezvenySorok value={e.lista} onChange={set('lista')} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

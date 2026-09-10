'use client';

import { MEZO_CIMKEK, type Rendezvenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';
import { RendezvenySorok } from '../RendezvenySorok';

const B = 'rendezvenyek';

export function RendezvenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Rendezvenyek>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <p className="text-xs text-muted-foreground">{MEZO_CIMKEK.rendezvenyek.lista.sugo}</p>
          <RendezvenySorok value={e.lista} onChange={set('lista')} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

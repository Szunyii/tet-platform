'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, SZOVEGES_MEZOK, type Intezmenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.intezmenyek;
const B = 'intezmenyek';

export function IntezmenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Intezmenyek>) {
  const { mezo } = useBlokkAllapot(B, initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => SZOVEGES_MEZOK[B].map((k) => <SzovegMezo key={k} {...mezo(k)} {...C[k]} max={SZOVEG_MAX} errors={errors} />)}
    </BlokkForm>
  );
}

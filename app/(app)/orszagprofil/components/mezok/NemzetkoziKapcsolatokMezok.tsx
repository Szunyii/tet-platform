'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, SZOVEGES_MEZOK, type NemzetkoziKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.nemzetkoziKapcsolatok;
const B = 'nemzetkoziKapcsolatok';

export function NemzetkoziKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<NemzetkoziKapcsolatok>) {
  const { mezo } = useBlokkAllapot(B, initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => SZOVEGES_MEZOK[B].map((k) => <SzovegMezo key={k} {...mezo(k)} {...C[k]} max={SZOVEG_MAX} errors={errors} />)}
    </BlokkForm>
  );
}

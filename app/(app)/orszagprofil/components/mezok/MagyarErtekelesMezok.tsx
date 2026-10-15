'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import {
  MEZO_CIMKEK, OSSZEGZES_MAX, SZOVEG_MAX, SZOVEGES_MEZOK, type MagyarErtekeles,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarErtekeles;
const B = 'magyarErtekeles';
// Az összegzés a térkép panelén is megjelenik: rövidebb korlát, kisebb mező.
const OSSZEGZES = { max: OSSZEGZES_MAX, sorok: 3 };

export function MagyarErtekelesMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarErtekeles>) {
  const { mezo } = useBlokkAllapot(B, initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => SZOVEGES_MEZOK[B].map((k) => (
        <SzovegMezo key={k} {...mezo(k)} {...C[k]} max={SZOVEG_MAX} {...(k === 'osszegzes' ? OSSZEGZES : {})} errors={errors} />
      ))}
    </BlokkForm>
  );
}

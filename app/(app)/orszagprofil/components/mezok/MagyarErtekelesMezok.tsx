'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import {
  MEZO_CIMKEK, OSSZEGZES_MAX, SZOVEG_MAX, SZOVEGES_MEZOK, type MagyarErtekeles,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarErtekeles;
const B = 'magyarErtekeles';

export function MagyarErtekelesMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarErtekeles>) {
  const { mezo } = useBlokkAllapot(B, initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => SZOVEGES_MEZOK[B].map((k) => (
        // Az összegzés a térkép panelén is megjelenik: rövidebb korlát, kisebb mező.
        <SzovegMezo key={k} {...mezo(k)} {...C[k]} max={k === 'osszegzes' ? OSSZEGZES_MAX : SZOVEG_MAX}
          sorok={k === 'osszegzes' ? 3 : undefined} errors={errors} />
      ))}
    </BlokkForm>
  );
}

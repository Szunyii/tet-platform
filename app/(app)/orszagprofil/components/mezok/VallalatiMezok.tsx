'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import {
  AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, TOP_VALLALAT_MAX, type Vallalati,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.vallalati;
const B = 'vallalati';

export function VallalatiMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Vallalati>) {
  // A top vállalatok soronként egy név: a textarea-ban '\n'-nel elválasztva, a validátor bontja.
  const { mezo } = useBlokkAllapot(B, { ...initial, topVallalatok: initial.topVallalatok.join('\n') });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <CimkeValaszto {...mezo('kiemeltAgazatok')} {...C.kiemeltAgazatok} items={AGAZATOK} errors={errors}
            egyeb={{ ...mezo('agazatEgyeb'), ...C.agazatEgyeb, max: ROVID_MAX }} />
          <SzovegMezo {...mezo('topVallalatok')} {...C.topVallalatok}
            max={ROVID_MAX * TOP_VALLALAT_MAX + TOP_VALLALAT_MAX} sorok={10} errors={errors} />
          <SzovegMezo {...mezo('startupok')} {...C.startupok} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo {...mezo('klaszterek')} {...C.klaszterek} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo {...mezo('inkubatorok')} {...C.inkubatorok} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo {...mezo('technologiatranszfer')} {...C.technologiatranszfer} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

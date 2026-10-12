'use client';

import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import {
  AGAZATOK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, TOP_VALLALAT_MAX, type Vallalati,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.vallalati;
const B = 'vallalati';

export function VallalatiMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Vallalati>) {
  // A top vállalatok soronként egy név: a textarea-ban '\n'-nel elválasztva, a validátor bontja.
  const [e, set] = useBlokkAllapot({ ...initial, topVallalatok: initial.topVallalatok.join('\n') });
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <CimkeValaszto id={mezoId(B, 'kiemeltAgazatok')} name="kiemeltAgazatok" {...C.kiemeltAgazatok} items={AGAZATOK} value={e.kiemeltAgazatok} onChange={set('kiemeltAgazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', ...C.agazatEgyeb, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'topVallalatok')} name="topVallalatok" {...C.topVallalatok} value={e.topVallalatok} onChange={set('topVallalatok')}
            max={ROVID_MAX * TOP_VALLALAT_MAX + TOP_VALLALAT_MAX} sorok={10} errors={errors} />
          <SzovegMezo id={mezoId(B, 'startupok')} name="startupok" {...C.startupok} value={e.startupok} onChange={set('startupok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'klaszterek')} name="klaszterek" {...C.klaszterek} value={e.klaszterek} onChange={set('klaszterek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'technologiatranszfer')} name="technologiatranszfer" {...C.technologiatranszfer} value={e.technologiatranszfer} onChange={set('technologiatranszfer')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

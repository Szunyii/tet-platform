'use client';

import { useState } from 'react';
import { CimkeValaszto } from '../../../../../components/form/CimkeValaszto';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import {
  IPARAGAK, MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, TOP_VALLALAT_MAX, type Vallalati,
} from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId } from '../BlokkForm';

const C = MEZO_CIMKEK.vallalati;
const B = 'vallalati';

export function VallalatiMezok({
  kod, ev, initial, mentve, action,
}: { kod: string; ev: number; initial: Vallalati; mentve: string | null; action: FormAction }) {
  // A top vállalatok soronként egy név: a textarea-ban '\n'-nel elválasztva, a validátor bontja.
  const [e, setE] = useState({ ...initial, topVallalatok: initial.topVallalatok.join('\n') });
  const set = <K extends keyof typeof e>(k: K) => (v: (typeof e)[K]) => setE((p) => ({ ...p, [k]: v }));
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <CimkeValaszto id={mezoId(B, 'kiemeltAgazatok')} name="kiemeltAgazatok" cimke={C.kiemeltAgazatok.cimke} items={IPARAGAK} value={e.kiemeltAgazatok} onChange={set('kiemeltAgazatok')} errors={errors}
            egyeb={{ id: mezoId(B, 'agazatEgyeb'), name: 'agazatEgyeb', cimke: C.agazatEgyeb.cimke, value: e.agazatEgyeb, onChange: set('agazatEgyeb'), max: ROVID_MAX }} />
          <SzovegMezo id={mezoId(B, 'topVallalatok')} name="topVallalatok" cimke={C.topVallalatok.cimke} sugo={C.topVallalatok.sugo} value={e.topVallalatok} onChange={set('topVallalatok')}
            max={ROVID_MAX * TOP_VALLALAT_MAX + TOP_VALLALAT_MAX} sorok={10} errors={errors} />
          <SzovegMezo id={mezoId(B, 'startupok')} name="startupok" cimke={C.startupok.cimke} value={e.startupok} onChange={set('startupok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'klaszterek')} name="klaszterek" cimke={C.klaszterek.cimke} value={e.klaszterek} onChange={set('klaszterek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'technologiatranszfer')} name="technologiatranszfer" cimke={C.technologiatranszfer.cimke} value={e.technologiatranszfer} onChange={set('technologiatranszfer')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

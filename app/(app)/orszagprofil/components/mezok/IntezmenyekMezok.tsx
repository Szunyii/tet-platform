'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type Intezmenyek } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.intezmenyek;
const B = 'intezmenyek';

export function IntezmenyekMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Intezmenyek>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'iranyitoSzervek')} name="iranyitoSzervek" {...C.iranyitoSzervek} value={e.iranyitoSzervek} onChange={set('iranyitoSzervek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'egyetemek')} name="egyetemek" {...C.egyetemek} value={e.egyetemek} onChange={set('egyetemek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kutatokozpontok')} name="kutatokozpontok" {...C.kutatokozpontok} value={e.kutatokozpontok} onChange={set('kutatokozpontok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'infrastrukturak')} name="infrastrukturak" {...C.infrastrukturak} value={e.infrastrukturak} onChange={set('infrastrukturak')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

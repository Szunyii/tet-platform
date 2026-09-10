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
          <SzovegMezo id={mezoId(B, 'iranyitoSzervek')} name="iranyitoSzervek" cimke={C.iranyitoSzervek.cimke} sugo={C.iranyitoSzervek.sugo} value={e.iranyitoSzervek} onChange={set('iranyitoSzervek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'egyetemek')} name="egyetemek" cimke={C.egyetemek.cimke} value={e.egyetemek} onChange={set('egyetemek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'kutatokozpontok')} name="kutatokozpontok" cimke={C.kutatokozpontok.cimke} value={e.kutatokozpontok} onChange={set('kutatokozpontok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'infrastrukturak')} name="infrastrukturak" cimke={C.infrastrukturak.cimke} value={e.infrastrukturak} onChange={set('infrastrukturak')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

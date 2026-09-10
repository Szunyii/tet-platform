'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, OSSZEGZES_MAX, SZOVEG_MAX, type MagyarErtekeles } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarErtekeles;
const B = 'magyarErtekeles';

export function MagyarErtekelesMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarErtekeles>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'osszegzes')} name="osszegzes" cimke={C.osszegzes.cimke} sugo={C.osszegzes.sugo} value={e.osszegzes} onChange={set('osszegzes')} max={OSSZEGZES_MAX} sorok={3} errors={errors} />
          <SzovegMezo id={mezoId(B, 'egyuttmukodesiLehetosegek')} name="egyuttmukodesiLehetosegek" cimke={C.egyuttmukodesiLehetosegek.cimke} value={e.egyuttmukodesiLehetosegek} onChange={set('egyuttmukodesiLehetosegek')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'joGyakorlatok')} name="joGyakorlatok" cimke={C.joGyakorlatok.cimke} value={e.joGyakorlatok} onChange={set('joGyakorlatok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'diplomaciaiPrioritasok')} name="diplomaciaiPrioritasok" cimke={C.diplomaciaiPrioritasok.cimke} value={e.diplomaciaiPrioritasok} onChange={set('diplomaciaiPrioritasok')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

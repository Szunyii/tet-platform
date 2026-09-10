'use client';

import { useState } from 'react';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import { MEZO_CIMKEK, OSSZEGZES_MAX, SZOVEG_MAX, type MagyarErtekeles } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarErtekeles;
const B = 'magyarErtekeles';

export function MagyarErtekelesMezok({
  kod, ev, initial, mentve, action,
}: { kod: string; ev: number; initial: MagyarErtekeles; mentve: string | null; action: FormAction }) {
  const [e, setE] = useState(initial);
  const set = <K extends keyof typeof e>(k: K) => (v: (typeof e)[K]) => setE((p) => ({ ...p, [k]: v }));
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

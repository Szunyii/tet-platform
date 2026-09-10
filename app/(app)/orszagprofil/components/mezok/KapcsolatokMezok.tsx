'use client';

import { useState } from 'react';
import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import { MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, type Kapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId } from '../BlokkForm';

const C = MEZO_CIMKEK.kapcsolatok;
const B = 'kapcsolatok';

export function KapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: { kod: string; ev: number; initial: Kapcsolatok; mentve: string | null; action: FormAction }) {
  const [e, setE] = useState(initial);
  const set = <K extends keyof typeof e>(k: K) => (v: (typeof e)[K]) => setE((p) => ({ ...p, [k]: v }));
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'euMultilateralis')} name="euMultilateralis" cimke={C.euMultilateralis.cimke} value={e.euMultilateralis} onChange={set('euMultilateralis')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'partnerorszagok')} name="partnerorszagok" cimke={C.partnerorszagok.cimke} value={e.partnerorszagok} onChange={set('partnerorszagok')} max={SZOVEG_MAX} errors={errors} />
          <RovidMezo id={mezoId(B, 'egyezmeny')} name="egyezmeny" cimke={C.egyezmeny.cimke} sugo={C.egyezmeny.sugo} value={e.egyezmeny} onChange={set('egyezmeny')} max={ROVID_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'ketoldalu')} name="ketoldalu" cimke={C.ketoldalu.cimke} value={e.ketoldalu} onChange={set('ketoldalu')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'mobilitas')} name="mobilitas" cimke={C.mobilitas.cimke} sugo={C.mobilitas.sugo} value={e.mobilitas} onChange={set('mobilitas')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

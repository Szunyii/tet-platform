'use client';

import { useState } from 'react';
import { SzovegMezo } from '../../../../../components/form/Mezo';
import type { FormAction } from '../../../../../components/form/useMuveletForm';
import { MEZO_CIMKEK, SZOVEG_MAX, type Programok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId } from '../BlokkForm';

const C = MEZO_CIMKEK.programok;
const B = 'programok';

export function ProgramokMezok({
  kod, ev, initial, mentve, action,
}: { kod: string; ev: number; initial: Programok; mentve: string | null; action: FormAction }) {
  const [e, setE] = useState(initial);
  const set = <K extends keyof typeof e>(k: K) => (v: (typeof e)[K]) => setE((p) => ({ ...p, [k]: v }));
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'palyazatok')} name="palyazatok" cimke={C.palyazatok.cimke} value={e.palyazatok} onChange={set('palyazatok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'tamogatasiProgramok')} name="tamogatasiProgramok" cimke={C.tamogatasiProgramok.cimke} value={e.tamogatasiProgramok} onChange={set('tamogatasiProgramok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'finanszirozasiEszkozok')} name="finanszirozasiEszkozok" cimke={C.finanszirozasiEszkozok.cimke} value={e.finanszirozasiEszkozok} onChange={set('finanszirozasiEszkozok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'nemzetkoziReszvetel')} name="nemzetkoziReszvetel" cimke={C.nemzetkoziReszvetel.cimke} value={e.nemzetkoziReszvetel} onChange={set('nemzetkoziReszvetel')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

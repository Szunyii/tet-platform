'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type Programok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.programok;
const B = 'programok';

export function ProgramokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<Programok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'palyazatok')} name="palyazatok" {...C.palyazatok} value={e.palyazatok} onChange={set('palyazatok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'tamogatasiProgramok')} name="tamogatasiProgramok" {...C.tamogatasiProgramok} value={e.tamogatasiProgramok} onChange={set('tamogatasiProgramok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'finanszirozasiEszkozok')} name="finanszirozasiEszkozok" {...C.finanszirozasiEszkozok} value={e.finanszirozasiEszkozok} onChange={set('finanszirozasiEszkozok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'nemzetkoziReszvetel')} name="nemzetkoziReszvetel" {...C.nemzetkoziReszvetel} value={e.nemzetkoziReszvetel} onChange={set('nemzetkoziReszvetel')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

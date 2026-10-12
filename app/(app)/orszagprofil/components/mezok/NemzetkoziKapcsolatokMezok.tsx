'use client';

import { SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, SZOVEG_MAX, type NemzetkoziKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.nemzetkoziKapcsolatok;
const B = 'nemzetkoziKapcsolatok';

export function NemzetkoziKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<NemzetkoziKapcsolatok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <SzovegMezo id={mezoId(B, 'partnerorszagok')} name="partnerorszagok" {...C.partnerorszagok} value={e.partnerorszagok} onChange={set('partnerorszagok')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'euMultilateralis')} name="euMultilateralis" {...C.euMultilateralis} value={e.euMultilateralis} onChange={set('euMultilateralis')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

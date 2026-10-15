'use client';

import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, type MagyarKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarKapcsolatok;
const B = 'magyarKapcsolatok';

export function MagyarKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarKapcsolatok>) {
  const { mezo } = useBlokkAllapot(B, initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <RovidMezo {...mezo('egyezmeny')} {...C.egyezmeny} max={ROVID_MAX} errors={errors} />
          <SzovegMezo {...mezo('ketoldalu')} {...C.ketoldalu} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo {...mezo('mobilitas')} {...C.mobilitas} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

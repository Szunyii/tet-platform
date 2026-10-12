'use client';

import { RovidMezo, SzovegMezo } from '../../../../../components/form/Mezo';
import { MEZO_CIMKEK, ROVID_MAX, SZOVEG_MAX, type MagyarKapcsolatok } from '../../../../../lib/orszagprofil-szotar';
import { BlokkForm, mezoId, useBlokkAllapot, type BlokkMezokProps } from '../BlokkForm';

const C = MEZO_CIMKEK.magyarKapcsolatok;
const B = 'magyarKapcsolatok';

export function MagyarKapcsolatokMezok({
  kod, ev, initial, mentve, action,
}: BlokkMezokProps<MagyarKapcsolatok>) {
  const [e, set] = useBlokkAllapot(initial);
  return (
    <BlokkForm kod={kod} ev={ev} blokk={B} mentve={mentve} action={action}>
      {(errors) => (
        <>
          <RovidMezo id={mezoId(B, 'egyezmeny')} name="egyezmeny" {...C.egyezmeny} value={e.egyezmeny} onChange={set('egyezmeny')} max={ROVID_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'ketoldalu')} name="ketoldalu" {...C.ketoldalu} value={e.ketoldalu} onChange={set('ketoldalu')} max={SZOVEG_MAX} errors={errors} />
          <SzovegMezo id={mezoId(B, 'mobilitas')} name="mobilitas" {...C.mobilitas} value={e.mobilitas} onChange={set('mobilitas')} max={SZOVEG_MAX} errors={errors} />
        </>
      )}
    </BlokkForm>
  );
}

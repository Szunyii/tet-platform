'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { KozpontiCelSor } from '../../../../db/queries/munkaterv';
import { SZEMPONTOK } from '../../../../lib/ertekeles-szotar';
import { KOZPONTI_MAX, MEGNEVEZES_MAX, MERCE_MAX, type Hatokor } from '../../../../lib/munkaterv-szotar';
import { ORSZAG_REGIOK } from '../../../../lib/orszagok';
import { mentKozpontiCelAction } from '../actions';

export const HATOKOR_OPCIOK: readonly { kulcs: Hatokor; cimke: string }[] = [
  { kulcs: 'halozat', cimke: 'Teljes hálózat' },
  ...ORSZAG_REGIOK,
];

/** Központi cél felvétele vagy módosítása közzététel előtt. */
export function KozpontiCelDialog({
  ev,
  cel,
  open,
  onOpenChange,
}: {
  ev: number;
  cel?: KozpontiCelSor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    mentKozpontiCelAction.bind(null, ev, cel?.id ?? null),
    cel ? 'Központi cél módosítva.' : 'Központi cél felvéve.',
    () => onOpenChange(false),
  );
  const errors = state.errors ?? {};
  const [megnevezes, setMegnevezes] = useState(cel?.megnevezes ?? '');
  const [szempont, setSzempont] = useState<string>(cel?.szempont ?? '');
  const [merce, setMerce] = useState(cel?.merce ?? '');
  const [hatokor, setHatokor] = useState<string>(cel?.hatokor ?? 'halozat');

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={cel ? 'Központi cél módosítása' : 'Új központi cél'}
      leiras={`A(z) ${ev}. évi célok közzétételig szabadon módosíthatók. Egy attaséra legfeljebb ${KOZPONTI_MAX} központi cél vonatkozhat.`}
      gomb={cel ? 'Mentés' : 'Felvétel'}
      formAction={formAction}
      errors={errors}
      szeles
    >
      <Mezo id="megnevezes" cimke="Megnevezés" errors={errors}>
        <Input
          id="megnevezes"
          name="megnevezes"
          required
          maxLength={MEGNEVEZES_MAX}
          autoComplete="off"
          value={megnevezes}
          onChange={(e) => setMegnevezes(e.target.value)}
          {...hibaAttr(errors, 'megnevezes')}
        />
      </Mezo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="hatokor" cimke="Hatókör" errors={errors} className="min-w-0">
          <NativeSelect
            id="hatokor"
            name="hatokor"
            required
            value={hatokor}
            onChange={(e) => setHatokor(e.target.value)}
            {...hibaAttr(errors, 'hatokor')}
          >
            {HATOKOR_OPCIOK.map((h) => (
              <option key={h.kulcs} value={h.kulcs}>
                {h.cimke}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
        <Mezo id="szempont" cimke="Kapcsolódó értékelési szempont" errors={errors} className="min-w-0">
          <NativeSelect
            id="szempont"
            name="szempont"
            required
            value={szempont}
            onChange={(e) => setSzempont(e.target.value)}
            {...hibaAttr(errors, 'szempont')}
          >
            <option value="">Válassz szempontot</option>
            {SZEMPONTOK.map((s) => (
              <option key={s.kulcs} value={s.kulcs}>
                {s.nev}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
      </div>
      <Mezo id="merce" cimke="Mérce" errors={errors}>
        <Textarea
          id="merce"
          name="merce"
          rows={3}
          required
          maxLength={MERCE_MAX}
          value={merce}
          onChange={(e) => setMerce(e.target.value)}
          {...hibaAttr(errors, 'merce')}
        />
      </Mezo>
    </MuveletDialog>
  );
}

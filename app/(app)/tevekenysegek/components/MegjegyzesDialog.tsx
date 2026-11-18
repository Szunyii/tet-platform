'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Textarea } from '../../../../components/ui/textarea';
import { SZOVEG_MAX } from '../../../../lib/tevekenyseg-szotar';

/** Kötelező megjegyzéssel járó művelet párbeszédablaka. A verzió a megnyitáskor rögzül: elavult lapról nem lehet dönteni. */
export function MegjegyzesDialog({
  action,
  verzio,
  cim,
  leiras,
  gomb,
  siker,
  open,
  onOpenChange,
}: {
  action: FormAction;
  verzio: number;
  cim: string;
  leiras: string;
  gomb: string;
  siker: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(action, siker, () => onOpenChange(false));
  const [nyitoVerzio] = useState(verzio);
  const [megjegyzes, setMegjegyzes] = useState('');
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={cim}
      leiras={leiras}
      gomb={gomb}
      formAction={formAction}
      errors={errors}
    >
      <input type="hidden" name="verzio" value={nyitoVerzio} />
      <Mezo id="megjegyzes" cimke="Megjegyzés" errors={errors}>
        <Textarea
          id="megjegyzes"
          name="megjegyzes"
          rows={4}
          required
          maxLength={SZOVEG_MAX}
          value={megjegyzes}
          onChange={(e) => setMegjegyzes(e.target.value)}
          {...hibaAttr(errors, 'megjegyzes')}
        />
      </Mezo>
    </MuveletDialog>
  );
}

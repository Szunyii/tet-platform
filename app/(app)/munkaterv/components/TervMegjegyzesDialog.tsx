'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Textarea } from '../../../../components/ui/textarea';
import { MEGJEGYZES_MAX } from '../../../../lib/munkaterv-szotar';

/**
 * Kötelező szöveggel járó tervdöntés (visszaküldés, módosítás kérése, elutasítása, visszanyitás). Az action a terv
 * verziójával együtt a megnyitáskor rögzül: a közben frissülő lap nem fedheti el a más által végzett módosítást.
 */
export function TervMegjegyzesDialog({
  action,
  cim,
  leiras,
  gomb,
  siker,
  open,
  onOpenChange,
}: {
  action: FormAction;
  cim: string;
  leiras: string;
  gomb: string;
  siker: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [nyitoAction] = useState(() => action);
  const [state, formAction, pending] = useMuveletForm(nyitoAction, siker, () => onOpenChange(false));
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
      <Mezo id="megjegyzes" cimke="Megjegyzés" errors={errors}>
        <Textarea
          id="megjegyzes"
          name="megjegyzes"
          rows={4}
          required
          maxLength={MEGJEGYZES_MAX}
          value={megjegyzes}
          onChange={(e) => setMegjegyzes(e.target.value)}
          {...hibaAttr(errors, 'megjegyzes')}
        />
      </Mezo>
    </MuveletDialog>
  );
}

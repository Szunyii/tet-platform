'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Textarea } from '../../../../components/ui/textarea';
import type { CelSor } from '../../../../db/queries/munkaterv';
import { CEL_ALLAPOTOK, MEGJEGYZES_MAX } from '../../../../lib/munkaterv-szotar';
import { allitCelAllapotAction } from '../actions';

/** A jóváhagyott terv egy céljának állapota: az attasé állítja, a központ felülírhatja (`felulir`). */
export function CelAllapotDialog({
  cel,
  felulir,
  open,
  onOpenChange,
}: {
  cel: CelSor;
  felulir: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    allitCelAllapotAction.bind(null, cel.id),
    felulir ? 'A cél állapota felülírva.' : 'A cél állapota mentve.',
    () => onOpenChange(false),
  );
  const errors = state.errors ?? {};
  const [allapot, setAllapot] = useState<string>(cel.allapot);
  const [megjegyzes, setMegjegyzes] = useState(cel.allapotMegjegyzes ?? '');

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={felulir ? 'A cél állapotának felülírása' : 'A cél állapota'}
      leiras={
        felulir
          ? `„${cel.megnevezes}”. A felülírás után az attasé ennek a célnak az állapotát már nem módosíthatja.`
          : `„${cel.megnevezes}”`
      }
      gomb={felulir ? 'Felülírás' : 'Mentés'}
      formAction={formAction}
      errors={errors}
    >
      <Mezo id="allapot" cimke="Állapot" errors={errors}>
        <NativeSelect
          id="allapot"
          name="allapot"
          required
          value={allapot}
          onChange={(e) => setAllapot(e.target.value)}
          {...hibaAttr(errors, 'allapot')}
        >
          {CEL_ALLAPOTOK.map((a) => (
            <option key={a.kulcs} value={a.kulcs}>
              {a.cimke}
            </option>
          ))}
        </NativeSelect>
      </Mezo>
      <Mezo id="megjegyzes" cimke="Megjegyzés" opcionalis errors={errors}>
        <Textarea
          id="megjegyzes"
          name="megjegyzes"
          rows={3}
          maxLength={MEGJEGYZES_MAX}
          value={megjegyzes}
          onChange={(e) => setMegjegyzes(e.target.value)}
          {...hibaAttr(errors, 'megjegyzes')}
        />
      </Mezo>
    </MuveletDialog>
  );
}

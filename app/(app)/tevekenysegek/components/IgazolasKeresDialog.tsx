'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { LINK_MAX, SZOVEG_MAX, szakaszCimke, type Szakasz } from '../../../../lib/tevekenyseg-szotar';
import { kerIgazolastAction } from '../actions';
import type { RiportOpcio } from './TevekenysegDialog';

/** A következő szakasz igazolásának kérése: kötelező indoklás, opcionális link és saját jelentés. */
export function IgazolasKeresDialog({
  ugyId,
  verzio,
  kertSzakasz,
  riportOpciok,
  open,
  onOpenChange,
}: {
  ugyId: string;
  verzio: number;
  kertSzakasz: Szakasz;
  riportOpciok: readonly RiportOpcio[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    kerIgazolastAction.bind(null, ugyId),
    'Az igazolási kérés elküldve.',
    () => onOpenChange(false),
  );
  const [nyitoVerzio] = useState(verzio);
  const [indoklas, setIndoklas] = useState('');
  const [link, setLink] = useState('');
  const [riportId, setRiportId] = useState('');
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={`Igazolás kérése: ${szakaszCimke(kertSzakasz)}`}
      leiras="A központ igazolja a szakaszváltást, vagy megjegyzéssel visszaküldi. A döntésig az ügy adatai zárolva vannak."
      gomb="Kérés elküldése"
      gombFolyamatban="Küldés…"
      formAction={formAction}
      errors={errors}
    >
      <input type="hidden" name="verzio" value={nyitoVerzio} />
      <Mezo id="indoklas" cimke="Indoklás" errors={errors}>
        <Textarea
          id="indoklas"
          name="indoklas"
          rows={4}
          required
          maxLength={SZOVEG_MAX}
          value={indoklas}
          onChange={(e) => setIndoklas(e.target.value)}
          {...hibaAttr(errors, 'indoklas')}
        />
      </Mezo>
      <Mezo id="link" cimke="Link" opcionalis errors={errors}>
        <Input
          id="link"
          name="link"
          type="url"
          inputMode="url"
          maxLength={LINK_MAX}
          autoComplete="off"
          placeholder="https://"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          {...hibaAttr(errors, 'link')}
        />
      </Mezo>
      <Mezo id="riportId" cimke="Kapcsolódó jelentés" opcionalis errors={errors}>
        <NativeSelect id="riportId" name="riportId" value={riportId} onChange={(e) => setRiportId(e.target.value)}>
          <option value="">Nincs</option>
          {riportOpciok.map((r) => (
            <option key={r.id} value={r.id}>
              {r.targy}
            </option>
          ))}
        </NativeSelect>
      </Mezo>
    </MuveletDialog>
  );
}

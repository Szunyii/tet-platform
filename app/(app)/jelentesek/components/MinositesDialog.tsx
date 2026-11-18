'use client';

import { useState } from 'react';
import { FOKOZATOK, INDOKLAS_MAX, isOsszFokozat, type OsszFokozat } from '../../../../lib/ertekeles-szotar';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Textarea } from '../../../../components/ui/textarea';

/** A választható fokozatok a megjelenítés sorrendjében (4–1; a „nem értékelhető” a jelentésnél nem választható). */
const FOKOZAT_OPCIOK = FOKOZATOK.filter((f) => isOsszFokozat(f.ertek));

/**
 * A jelentés központi minősítésének felugró űrlapja (csak a központnak renderelődik). A hívó
 * (MinositesSzerkeszto) nyitásonként új `key`-jel mountolja, így a mezők mindig a mentett értékből, hiba nélkül
 * indulnak. A megjegyzés-mező fokozat mellett mindig elmegy a FormData-ban (nincs `disabled`): a validátor a
 * hiányzó mezőt hibás kérésnek veszi, mert különben a mentés némán törölné a tárolt megjegyzést. A „Nincs
 * minősítve” törli a minősítést, ekkor a megjegyzés-mező rejtett (a validátor a törlésnél nem olvassa).
 */
export function MinositesDialog({
  targy,
  fokozat: tarolt,
  megjegyzes: taroltMegjegyzes,
  action,
  open,
  onOpenChange,
}: {
  /** A jelentés tárgya, a dialógus leírásába. */
  targy: string;
  /** A most mentett fokozat, vagy `null` (nincs minősítve). */
  fokozat: OsszFokozat | null;
  /** A most mentett megjegyzés, vagy `null`. */
  megjegyzes: string | null;
  action: FormAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Vezérelt mezők, hogy hibánál ne ürüljenek (React 19 a <form action> után resetel; a NativeSelect a `value`-hoz
  // igazítja az opciók `defaultSelected`-jét, a Textarea `defaultValue`-szinkronját a React maga végzi).
  const [fokozat, setFokozat] = useState(tarolt === null ? '' : String(tarolt));
  const [megjegyzes, setMegjegyzes] = useState(taroltMegjegyzes ?? '');
  // Fokozat nélkül mentve a meglévő minősítés törlődik: a visszajelzés is ezt mondja.
  const siker = fokozat === '' && tarolt !== null ? 'Minősítés törölve.' : 'Minősítés mentve.';
  const [state, formAction, pending] = useMuveletForm(action, siker, () => onOpenChange(false));
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Központi minősítés"
      leiras={`A(z) „${targy}” jelentéshez. Az attasé a minősítést nem látja. A „Nincs minősítve” választásával a minősítés törlődik.`}
      gomb="Mentés"
      formAction={formAction}
      errors={errors}
      szeles
    >
      <Mezo id="fokozat" cimke="Fokozat" errors={errors}>
        <NativeSelect
          id="fokozat"
          name="fokozat"
          value={fokozat}
          onChange={(e) => setFokozat(e.target.value)}
          {...hibaAttr(errors, 'fokozat')}
        >
          <option value="">Nincs minősítve</option>
          {FOKOZAT_OPCIOK.map((f) => (
            <option key={f.ertek} value={String(f.ertek)}>
              {f.nev}
            </option>
          ))}
        </NativeSelect>
      </Mezo>
      {fokozat !== '' && (
        <Mezo id="megjegyzes" cimke="Megjegyzés" opcionalis errors={errors}>
          <Textarea
            id="megjegyzes"
            name="megjegyzes"
            maxLength={INDOKLAS_MAX}
            rows={5}
            className="max-h-[45dvh] min-h-24 overflow-y-auto"
            value={megjegyzes}
            onChange={(e) => setMegjegyzes(e.target.value)}
            {...hibaAttr(errors, 'megjegyzes')}
          />
          <p className="text-xs text-muted-foreground">
            {megjegyzes.length}/{INDOKLAS_MAX}
          </p>
        </Mezo>
      )}
    </MuveletDialog>
  );
}

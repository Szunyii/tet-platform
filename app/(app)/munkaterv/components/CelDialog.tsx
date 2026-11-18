'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { CelSor } from '../../../../db/queries/munkaterv';
import { SZEMPONTOK, szempontByKulcs } from '../../../../lib/ertekeles-szotar';
import { CEL_MAX, MEGNEVEZES_MAX, MERCE_MAX } from '../../../../lib/munkaterv-szotar';
import { orszagNev } from '../../../../lib/orszagok';
import { mentCelAction } from '../actions';

const ZAROLT = 'bg-muted text-muted-foreground';

function leirasSzoveg(kozponti: boolean, uj: boolean, tele: boolean): string {
  if (kozponti) return 'Központi cél: csak az országa módosítható.';
  if (uj && tele) return `A terven már ${CEL_MAX} cél van, ennél több nem menthető.`;
  return 'A cél a mércével együtt a jóváhagyásra küldött terv része lesz.';
}

/**
 * Cél felvétele vagy módosítása. A központi cél zárolt mezői `readOnly` vagy rejtett mezőként mennek el: a letiltott
 * mező hiányozna az űrlapadatból, és a validátor elutasítaná a mentést. A zárolt mezők kimaradnak a tabulálási
 * sorrendből, így a fókusz az egyetlen módosítható mezőre, az országra kerül.
 */
export function CelDialog({
  tervId,
  verzio,
  cel,
  celDb,
  orszagok,
  open,
  onOpenChange,
}: {
  tervId: string;
  verzio: number;
  cel?: CelSor;
  celDb: number;
  /** Az attasé országainak kódjai, a székhely elöl. */
  orszagok: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // A verzió a megnyitáskor rögzül: a közben frissülő lap nem fedheti el a más által végzett módosítást.
  const [nyitoVerzio] = useState(verzio);
  const [state, formAction, pending] = useMuveletForm(
    mentCelAction.bind(null, tervId, nyitoVerzio, cel?.id ?? null),
    cel ? 'Cél módosítva.' : 'Cél felvéve.',
    () => onOpenChange(false),
  );
  const errors = state.errors ?? {};

  const kozponti = cel?.kozpontiCelId != null;
  const [megnevezes, setMegnevezes] = useState(cel?.megnevezes ?? '');
  const [orszag, setOrszag] = useState(cel?.orszagKod ?? orszagok[0] ?? '');
  const [szempont, setSzempont] = useState<string>(cel?.szempont ?? '');
  const [merce, setMerce] = useState(cel?.merce ?? '');

  // A már nem saját ország is látszik, hogy a mentés ne cserélje le csendben; a szerver hibát ad rá.
  const orszagOpciok = orszagok.includes(orszag) || orszag === '' ? orszagok : [orszag, ...orszagok];

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={cel ? (kozponti ? 'Központi cél országa' : 'Cél módosítása') : 'Új cél'}
      leiras={leirasSzoveg(kozponti, !cel, celDb >= CEL_MAX)}
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
          readOnly={kozponti}
          tabIndex={kozponti ? -1 : undefined}
          maxLength={MEGNEVEZES_MAX}
          autoComplete="off"
          className={kozponti ? ZAROLT : undefined}
          value={megnevezes}
          onChange={(e) => setMegnevezes(e.target.value)}
          {...hibaAttr(errors, 'megnevezes')}
        />
      </Mezo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="orszag" cimke="Ország" errors={errors} className="min-w-0">
          <NativeSelect
            id="orszag"
            name="orszag"
            required
            value={orszag}
            onChange={(e) => setOrszag(e.target.value)}
            {...hibaAttr(errors, 'orszag')}
          >
            {orszagOpciok.map((kod) => (
              <option key={kod} value={kod}>
                {orszagNev(kod)}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
        <Mezo id="szempont" cimke="Kapcsolódó értékelési szempont" errors={errors} className="min-w-0">
          {kozponti && cel ? (
            <>
              <input type="hidden" name="szempont" value={cel.szempont} />
              <Input id="szempont" readOnly tabIndex={-1} className={ZAROLT} value={szempontByKulcs(cel.szempont).nev} />
            </>
          ) : (
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
          )}
        </Mezo>
      </div>
      <Mezo id="merce" cimke="Mérce" errors={errors}>
        <Textarea
          id="merce"
          name="merce"
          rows={3}
          required
          readOnly={kozponti}
          tabIndex={kozponti ? -1 : undefined}
          maxLength={MERCE_MAX}
          className={kozponti ? ZAROLT : undefined}
          value={merce}
          onChange={(e) => setMerce(e.target.value)}
          {...hibaAttr(errors, 'merce')}
        />
      </Mezo>
    </MuveletDialog>
  );
}

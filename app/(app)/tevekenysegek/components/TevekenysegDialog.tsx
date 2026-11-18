'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { TevekenysegSor } from '../../../../db/queries/tevekenyseg';
import { orszagNev } from '../../../../lib/orszagok';
import {
  MAGYAR_SZEREPLO_MAX,
  MEGNEVEZES_MAX,
  PARTNER_MAX,
  SZOVEG_MAX,
  TEVEKENYSEG_TIPUSOK,
} from '../../../../lib/tevekenyseg-szotar';
import { mentTevekenysegAction } from '../actions';

export interface RiportOpcio {
  id: string;
  targy: string;
}

export interface EredmenyOpcio {
  id: string;
  megnevezes: string;
}

/** A jelentésből indított tevékenység kezdőértékei. */
export interface TevekenysegElotoltes {
  riportId: string;
  megnevezes: string;
  datum: string;
  orszagKod: string;
}

/** Az űrlap választólistái és a mai nap: a nézet egyszer tölti be, minden párbeszédablak ezt kapja. */
export interface TevekenysegUrlapAdat {
  /** Az attasé országainak kódjai, a székhely elöl. */
  orszagok: readonly string[];
  eredmenyOpciok: readonly EredmenyOpcio[];
  riportOpciok: readonly RiportOpcio[];
  /** A mai naptári nap (`YYYY-MM-DD`). */
  ma: string;
}

/** A már hozzákapcsolt, de a listából kikerült érték is választható marad, hogy a mentés ne dobja el csendben. */
function bovitett<T extends { id: string }>(lista: readonly T[], meglevo: T | null): readonly T[] {
  return meglevo && !lista.some((e) => e.id === meglevo.id) ? [meglevo, ...lista] : lista;
}

/** Új tevékenység rögzítése vagy a meglévő módosítása (`tevekenyseg`). */
export function TevekenysegDialog({
  tevekenyseg,
  elotoltes,
  adat,
  open,
  onOpenChange,
}: {
  tevekenyseg?: TevekenysegSor;
  elotoltes?: TevekenysegElotoltes | null;
  adat: TevekenysegUrlapAdat;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    mentTevekenysegAction.bind(null, tevekenyseg?.id ?? null),
    tevekenyseg ? 'Tevékenység módosítva.' : 'Tevékenység rögzítve.',
    () => onOpenChange(false),
  );
  const errors = state.errors ?? {};

  // A verzió a megnyitáskor rögzül: a közben frissülő lap nem fedheti el a más által végzett módosítást.
  const [verzio] = useState(tevekenyseg?.verzio);
  const [tipus, setTipus] = useState<string>(tevekenyseg?.tipus ?? '');
  const [datum, setDatum] = useState(tevekenyseg?.datum ?? elotoltes?.datum ?? adat.ma);
  const [orszag, setOrszag] = useState(tevekenyseg?.orszagKod ?? elotoltes?.orszagKod ?? adat.orszagok[0] ?? '');
  const [megnevezes, setMegnevezes] = useState(tevekenyseg?.megnevezes ?? elotoltes?.megnevezes ?? '');
  const [partner, setPartner] = useState(tevekenyseg?.partner ?? '');
  const [magyarSzereplo, setMagyarSzereplo] = useState(tevekenyseg?.magyarSzereplo ?? '');
  const [leiras, setLeiras] = useState(tevekenyseg?.leiras ?? '');
  const [riportId, setRiportId] = useState(tevekenyseg?.riportId ?? elotoltes?.riportId ?? '');
  const [eredmenyId, setEredmenyId] = useState(tevekenyseg?.eredmenyId ?? '');

  const orszagOpciok = adat.orszagok.includes(orszag) || orszag === '' ? adat.orszagok : [orszag, ...adat.orszagok];
  const riportok = bovitett(
    adat.riportOpciok,
    tevekenyseg?.riportId && tevekenyseg.riportTargy
      ? { id: tevekenyseg.riportId, targy: tevekenyseg.riportTargy }
      : elotoltes
        ? { id: elotoltes.riportId, targy: elotoltes.megnevezes }
        : null,
  );
  const eredmenyek = bovitett(
    adat.eredmenyOpciok,
    tevekenyseg?.eredmenyId && tevekenyseg.eredmenyNev
      ? { id: tevekenyseg.eredmenyId, megnevezes: tevekenyseg.eredmenyNev }
      : null,
  );

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={tevekenyseg ? 'Tevékenység módosítása' : 'Új tevékenység'}
      leiras={
        tevekenyseg?.kifogas
          ? 'A módosítással a központ kifogása megszűnik.'
          : 'Delegáció, B2B-találkozó vagy partnerközvetítés rögzítése.'
      }
      gomb={tevekenyseg ? 'Mentés' : 'Rögzítés'}
      formAction={formAction}
      errors={errors}
      szeles
    >
      {verzio !== undefined && <input type="hidden" name="verzio" value={verzio} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="tipus" cimke="Típus" errors={errors}>
          <NativeSelect
            id="tipus"
            name="tipus"
            required
            value={tipus}
            onChange={(e) => setTipus(e.target.value)}
            {...hibaAttr(errors, 'tipus')}
          >
            <option value="">Válassz típust</option>
            {TEVEKENYSEG_TIPUSOK.map((t) => (
              <option key={t.kulcs} value={t.kulcs}>
                {t.cimke}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
        <Mezo id="datum" cimke="Dátum" errors={errors}>
          <Input
            id="datum"
            name="datum"
            type="date"
            required
            max={adat.ma}
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            {...hibaAttr(errors, 'datum')}
          />
        </Mezo>
      </div>
      <Mezo id="orszag" cimke="Ország" errors={errors}>
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
        <Mezo id="partner" cimke="Partner" errors={errors}>
          <Input
            id="partner"
            name="partner"
            required
            maxLength={PARTNER_MAX}
            autoComplete="off"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            {...hibaAttr(errors, 'partner')}
          />
        </Mezo>
        <Mezo id="magyarSzereplo" cimke="Magyar szereplő" opcionalis={tipus !== 'partnerkozvetites'} errors={errors}>
          <Input
            id="magyarSzereplo"
            name="magyarSzereplo"
            required={tipus === 'partnerkozvetites'}
            maxLength={MAGYAR_SZEREPLO_MAX}
            autoComplete="off"
            value={magyarSzereplo}
            onChange={(e) => setMagyarSzereplo(e.target.value)}
            {...hibaAttr(errors, 'magyarSzereplo')}
          />
        </Mezo>
      </div>
      <Mezo id="leiras" cimke="Leírás" opcionalis errors={errors}>
        <Textarea
          id="leiras"
          name="leiras"
          rows={3}
          maxLength={SZOVEG_MAX}
          value={leiras}
          onChange={(e) => setLeiras(e.target.value)}
          {...hibaAttr(errors, 'leiras')}
        />
      </Mezo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="riportId" cimke="Kapcsolódó jelentés" opcionalis errors={errors} className="min-w-0">
          <NativeSelect id="riportId" name="riportId" value={riportId} onChange={(e) => setRiportId(e.target.value)}>
            <option value="">Nincs</option>
            {riportok.map((r) => (
              <option key={r.id} value={r.id}>
                {r.targy}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
        <Mezo id="eredmenyId" cimke="Kapcsolódó eredmény" opcionalis errors={errors} className="min-w-0">
          <NativeSelect id="eredmenyId" name="eredmenyId" value={eredmenyId} onChange={(e) => setEredmenyId(e.target.value)}>
            <option value="">Nincs</option>
            {eredmenyek.map((u) => (
              <option key={u.id} value={u.id}>
                {u.megnevezes}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
      </div>
    </MuveletDialog>
  );
}

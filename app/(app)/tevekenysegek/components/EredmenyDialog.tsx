'use client';

import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { orszagNev } from '../../../../lib/orszagok';
import { mezokZarolvaE } from '../../../../lib/tevekenyseg-allapot';
import {
  HOZZAJARULASOK,
  MAGYAR_SZEREPLO_MAX,
  MEGNEVEZES_MAX,
  PARTNER_MAX,
  SZAKASZOK,
  SZOVEG_MAX,
} from '../../../../lib/tevekenyseg-szotar';
import { mentEredmenyAction } from '../actions';

const KEZDO_SZAKASZOK = SZAKASZOK.filter((s) => s.kulcs === 'lehetoseg' || s.kulcs === 'kapcsolat');

/**
 * Új eredmény rögzítése vagy a meglévő módosítása (`ugy`). Zárolt ügynél a törzsadatok letiltva látszanak, az
 * ok ki van írva, és csak a leírás menthető; a tárolt értékeket az action veszi az adatbázisból.
 */
export function EredmenyDialog({
  ugy,
  orszagok,
  open,
  onOpenChange,
}: {
  ugy?: EredmenySor;
  /** Az attasé országainak kódjai, a székhely elöl. */
  orszagok: readonly string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    mentEredmenyAction.bind(null, ugy?.id ?? null),
    ugy ? 'Eredmény módosítva.' : 'Eredmény rögzítve.',
    () => onOpenChange(false),
  );
  const errors = state.errors ?? {};

  // A verzió és a zárolás a megnyitáskor rögzül: a közben frissülő lap nem fedheti el a más által végzett módosítást.
  const [verzio] = useState(ugy?.verzio);
  const [zarolt] = useState(ugy ? mezokZarolvaE(ugy) : false);
  const [megnevezes, setMegnevezes] = useState(ugy?.megnevezes ?? '');
  const [orszag, setOrszag] = useState(ugy?.orszagKod ?? orszagok[0] ?? '');
  const [partner, setPartner] = useState(ugy?.partner ?? '');
  const [magyarSzereplo, setMagyarSzereplo] = useState(ugy?.magyarSzereplo ?? '');
  const [hozzajarulas, setHozzajarulas] = useState<string>(ugy?.hozzajarulas ?? '');
  const [leiras, setLeiras] = useState(ugy?.leiras ?? '');
  const [kezdoSzakasz, setKezdoSzakasz] = useState('lehetoseg');

  const orszagOpciok = orszagok.includes(orszag) || orszag === '' ? orszagok : [orszag, ...orszagok];

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim={ugy ? 'Eredmény módosítása' : 'Új eredmény'}
      leiras={ugy?.kifogas ? 'A módosítással a központ kifogása megszűnik.' : 'Az ügy szakaszról szakaszra követhető az adatlapján.'}
      gomb={ugy ? 'Mentés' : 'Rögzítés'}
      formAction={formAction}
      errors={errors}
      szeles
    >
      {verzio !== undefined && <input type="hidden" name="verzio" value={verzio} />}
      {zarolt && (
        <p className="rounded-md bg-muted px-3 py-2 text-xs">
          Az ügynek függő igazoláskérése vagy igazolt szakasza van, ezért a megnevezés, az ország, a partner, a magyar szereplő és a
          hozzájárulás nem módosítható. A leírás szerkeszthető.
        </p>
      )}
      <Mezo id="megnevezes" cimke="Megnevezés" errors={errors}>
        <Input
          id="megnevezes"
          name="megnevezes"
          required
          disabled={zarolt}
          maxLength={MEGNEVEZES_MAX}
          autoComplete="off"
          value={megnevezes}
          onChange={(e) => setMegnevezes(e.target.value)}
          {...hibaAttr(errors, 'megnevezes')}
        />
      </Mezo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="orszag" cimke="Ország" errors={errors}>
          <NativeSelect
            id="orszag"
            name="orszag"
            required
            disabled={zarolt}
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
        <Mezo id="hozzajarulas" cimke="Hozzájárulás" errors={errors}>
          <NativeSelect
            id="hozzajarulas"
            name="hozzajarulas"
            required
            disabled={zarolt}
            value={hozzajarulas}
            onChange={(e) => setHozzajarulas(e.target.value)}
            {...hibaAttr(errors, 'hozzajarulas')}
          >
            <option value="">Válassz</option>
            {HOZZAJARULASOK.map((h) => (
              <option key={h.kulcs} value={h.kulcs}>
                {h.cimke}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="partner" cimke="Partner" errors={errors}>
          <Input
            id="partner"
            name="partner"
            required
            disabled={zarolt}
            maxLength={PARTNER_MAX}
            autoComplete="off"
            value={partner}
            onChange={(e) => setPartner(e.target.value)}
            {...hibaAttr(errors, 'partner')}
          />
        </Mezo>
        <Mezo id="magyarSzereplo" cimke="Magyar szereplő" opcionalis errors={errors}>
          <Input
            id="magyarSzereplo"
            name="magyarSzereplo"
            disabled={zarolt}
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
      {!ugy && (
        <Mezo id="kezdoSzakasz" cimke="Kezdő szakasz" errors={errors}>
          <NativeSelect
            id="kezdoSzakasz"
            name="kezdoSzakasz"
            value={kezdoSzakasz}
            onChange={(e) => setKezdoSzakasz(e.target.value)}
            {...hibaAttr(errors, 'kezdoSzakasz')}
          >
            {KEZDO_SZAKASZOK.map((s) => (
              <option key={s.kulcs} value={s.kulcs}>
                {s.cimke}
              </option>
            ))}
          </NativeSelect>
        </Mezo>
      )}
    </MuveletDialog>
  );
}

'use client';

import { hibaAttr } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { Input } from '../../../../components/ui/input';
import { EMAIL_MAX, TELEFON_MAX } from '../../../../lib/felhasznalo-validacio';
import type { MezoHibak } from '../../../../lib/urlap';
import { Blokk } from './Blokk';

/** A dialógusok vezérelt elérhetőség-mezői (mindkét szerepkörnél; az űrlap nyers értéke). */
export interface ElerhetosegErtekek {
  telefon: string;
  kapcsolatEmail: string;
}

export const URES_ELERHETOSEG: ElerhetosegErtekek = { telefon: '', kapcsolatEmail: '' };

/** Telefon és kapcsolattartási e-mail; a mező id-ja = name = a validátor hibakulcsa. */
export function ElerhetosegMezok({
  ertekek,
  onChange,
  errors,
}: {
  ertekek: ElerhetosegErtekek;
  onChange: (ertekek: ElerhetosegErtekek) => void;
  errors: MezoHibak;
}) {
  return (
    <Blokk cim="Elérhetőség">
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="telefon" cimke="Telefon" errors={errors}>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            inputMode="tel"
            maxLength={TELEFON_MAX}
            autoComplete="off"
            placeholder="pl. +49 30 1234 5678"
            value={ertekek.telefon}
            onChange={(e) => onChange({ ...ertekek, telefon: e.target.value })}
            {...hibaAttr(errors, 'telefon')}
          />
        </Mezo>
        <Mezo id="kapcsolatEmail" cimke="Kapcsolattartási e-mail" errors={errors}>
          <Input
            id="kapcsolatEmail"
            name="kapcsolatEmail"
            type="email"
            maxLength={EMAIL_MAX}
            autoComplete="off"
            value={ertekek.kapcsolatEmail}
            onChange={(e) => onChange({ ...ertekek, kapcsolatEmail: e.target.value })}
            {...hibaAttr(errors, 'kapcsolatEmail')}
          />
        </Mezo>
      </div>
    </Blokk>
  );
}

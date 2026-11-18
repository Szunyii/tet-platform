'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { CimkesSelect, type SelectOpcio } from '../../../../components/form/CimkesSelect';
import { Button } from '../../../../components/ui/button';
import type { FelevSzam } from '../../../../lib/ertekeles-idoszak';
import { ORSZAG_REGIOK, orszagNev, orszagRegio, type RegioKulcs } from '../../../../lib/orszagok';
import { isSzakasz, SZAKASZOK, type Szakasz } from '../../../../lib/tevekenyseg-szotar';
import { tevekenysegUrl } from '../../../../lib/tevekenyseg-szuro';
import { SzuroLink } from './AttaseNezet';

/** A „Mind” opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const MIND_OPCIO: SelectOpcio = { ertek: MIND, cimke: 'Mind' };

const REGIO_OPCIOK: SelectOpcio[] = ORSZAG_REGIOK.map((r) => ({ ertek: r.kulcs, cimke: r.cimke }));
const SZAKASZ_OPCIOK: SelectOpcio[] = SZAKASZOK.map((s) => ({ ertek: s.kulcs, cimke: s.cimke }));

export interface AdminSzuroErtekek {
  attase?: string;
  regio?: RegioKulcs;
  orszag?: string;
  szakasz?: Szakasz;
  felev: FelevSzam | null;
}

function SzuroSelect({
  id,
  cimke,
  ertek,
  opciok,
  onChange,
}: {
  id: string;
  cimke: string;
  ertek: string | undefined;
  opciok: readonly SelectOpcio[];
  onChange: (v: string | undefined) => void;
}) {
  return (
    <CimkesSelect
      id={id}
      cimke={cimke}
      value={ertek ?? MIND}
      opciok={[MIND_OPCIO, ...opciok]}
      onChange={(v) => onChange(v === MIND || v === '' ? undefined : v)}
      className="w-48"
      errors={null}
    />
  );
}

/** Az Eredmények és a Tevékenységek fül szűrői; az állapot az URL-ben él. */
export function AdminSzurok({
  ful,
  ertekek,
  attasek,
  orszagok,
}: {
  ful: 'eredmenyek' | 'tevekenysegek';
  ertekek: AdminSzuroErtekek;
  attasek: readonly { id: string; nev: string }[];
  orszagok: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function frissit(valtozas: Partial<AdminSzuroErtekek>) {
    startTransition(() => router.replace(tevekenysegUrl({ ful, ...ertekek, ...valtozas }), { scroll: false }));
  }

  function regioValt(v: string | undefined) {
    const regio = ORSZAG_REGIOK.find((r) => r.kulcs === v)?.kulcs;
    // A régión kívüli ország nem maradhat kiválasztva: a két szűrő együtt üres listát adna.
    const orszag = regio && orszagRegio(ertekek.orszag) !== regio ? undefined : ertekek.orszag;
    frissit({ regio, orszag });
  }

  const orszagOpciok = orszagok
    .filter((k) => !ertekek.regio || orszagRegio(k) === ertekek.regio)
    .map((k) => ({ ertek: k, cimke: orszagNev(k) }));
  const vanAktiv = Boolean(ertekek.attase || ertekek.regio || ertekek.orszag || ertekek.szakasz || ertekek.felev);

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label="Szűrők"
        aria-busy={pending}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-3"
      >
        <SzuroSelect
          id="admin-szuro-attase"
          cimke="Attasé"
          ertek={ertekek.attase}
          opciok={attasek.map((a) => ({ ertek: a.id, cimke: a.nev }))}
          onChange={(attase) => frissit({ attase })}
        />
        <SzuroSelect id="admin-szuro-regio" cimke="Régió" ertek={ertekek.regio} opciok={REGIO_OPCIOK} onChange={regioValt} />
        <SzuroSelect
          id="admin-szuro-orszag"
          cimke="Ország"
          ertek={ertekek.orszag}
          opciok={orszagOpciok}
          onChange={(orszag) => frissit({ orszag })}
        />
        {ful === 'eredmenyek' && (
          <SzuroSelect
            id="admin-szuro-szakasz"
            cimke="Szakasz"
            ertek={ertekek.szakasz}
            opciok={SZAKASZ_OPCIOK}
            onChange={(v) => frissit({ szakasz: v && isSzakasz(v) ? v : undefined })}
          />
        )}
        {vanAktiv && (
          <Button type="button" variant="ghost" onClick={() => startTransition(() => router.replace(tevekenysegUrl({ ful }), { scroll: false }))}>
            Szűrők törlése
          </Button>
        )}
      </div>

      {ful === 'tevekenysegek' && (
        <div role="group" aria-label="Félév szűrése" className="flex flex-wrap gap-1.5">
          <SzuroLink href={tevekenysegUrl({ ful, ...ertekek, felev: null })} aktiv={ertekek.felev === null}>
            Mind
          </SzuroLink>
          <SzuroLink href={tevekenysegUrl({ ful, ...ertekek, felev: 1 })} aktiv={ertekek.felev === 1}>
            1. félév
          </SzuroLink>
          <SzuroLink href={tevekenysegUrl({ ful, ...ertekek, felev: 2 })} aktiv={ertekek.felev === 2}>
            2. félév
          </SzuroLink>
        </div>
      )}
    </div>
  );
}

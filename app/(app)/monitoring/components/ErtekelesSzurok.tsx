'use client';

import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { CimkesSelect, type SelectOpcio } from '../../../../components/form/CimkesSelect';
import { Button } from '../../../../components/ui/button';
import { parseFelevSzam, type FelevSzam } from '../../../../lib/ertekeles-idoszak';
import { FOKOZATOK, isFokozat, isSzempontKulcs, SZEMPONTOK } from '../../../../lib/ertekeles-szotar';
import { szuroUrl, type ErtekelesSzuro } from '../../../../lib/ertekeles-szuro';
import { ORSZAG_REGIOK } from '../../../../lib/orszagok';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const MIND_OPCIO: SelectOpcio = { ertek: MIND, cimke: 'Mind' };

const FELEV_OPCIOK: SelectOpcio[] = [
  { ertek: '1', cimke: '1. félév' },
  { ertek: '2', cimke: '2. félév' },
];
const SZEMPONT_OPCIOK: SelectOpcio[] = SZEMPONTOK.map((s) => ({ ertek: s.kulcs, cimke: s.rovid }));

/** Szűrő-legördülő: a „Mind” az első opció; az `undefined` érték és a „Mind” választása = nincs szűrő. */
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
      className="w-full"
      errors={null}
    />
  );
}

/** A hálózati nézet szűrői: minden változás az URL-be kerül, a szűrést a szerver végzi. */
export function ErtekelesSzurok({
  szuro,
  felev,
  regiok,
  orszagok,
  attasek,
}: {
  /** A szerveren megtisztított szűrő. */
  szuro: ErtekelesSzuro;
  /** A megjelenített félév (`?felev=` nélkül az év alapértelmezett féléve). */
  felev: FelevSzam;
  regiok: readonly SelectOpcio[];
  orszagok: readonly SelectOpcio[];
  attasek: readonly SelectOpcio[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Az optimista érték az alapja a következő változásnak is: két gyors választás nem írja felül egymást.
  const [aktualis, setAktualis] = useOptimistic(szuro);

  function navigal(uj: ErtekelesSzuro) {
    startTransition(() => {
      setAktualis(uj);
      router.replace(szuroUrl(uj), { scroll: false });
    });
  }

  function frissit(valtozas: Partial<ErtekelesSzuro>) {
    const uj = { ...aktualis, ...valtozas };
    // A „nem értékelhető” csak szempontnál érvényes: összminősítésnek nincs ilyen értéke.
    if (uj.szempont === undefined && uj.minosites === 0) uj.minosites = undefined;
    navigal(uj);
  }

  function torol() {
    // A gomb a törléssel eltűnik: a fókusz ne vesszen el a lap elejére.
    document.getElementById('szuro-felev')?.focus();
    navigal({ felev: aktualis.felev });
  }

  const vanAktiv = [aktualis.regio, aktualis.orszag, aktualis.attase, aktualis.szempont, aktualis.minosites].some(
    (v) => v !== undefined,
  );
  const minositesOpciok: SelectOpcio[] = FOKOZATOK.filter((f) => f.ertek !== 0 || aktualis.szempont !== undefined).map(
    (f) => ({ ertek: String(f.ertek), cimke: f.nev }),
  );

  return (
    <div
      role="group"
      aria-label="Szűrők"
      aria-busy={pending}
      className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,10rem),1fr))] items-end gap-3 rounded-xl border border-border bg-card p-3"
    >
      <CimkesSelect
        id="szuro-felev"
        cimke="Félév"
        value={String(aktualis.felev ?? felev)}
        opciok={FELEV_OPCIOK}
        onChange={(v) => {
          const szam = parseFelevSzam(v);
          if (szam !== null) frissit({ felev: szam });
        }}
        className="w-full"
        errors={null}
      />
      {attasek.length > 0 && (
        <>
          <SzuroSelect
            id="szuro-regio"
            cimke="Régió"
            ertek={aktualis.regio}
            opciok={regiok}
            onChange={(v) => frissit({ regio: ORSZAG_REGIOK.find((r) => r.kulcs === v)?.kulcs })}
          />
          <SzuroSelect
            id="szuro-orszag"
            cimke="Ország"
            ertek={aktualis.orszag}
            opciok={orszagok}
            onChange={(v) => frissit({ orszag: v })}
          />
          <SzuroSelect
            id="szuro-attase"
            cimke="Attasé"
            ertek={aktualis.attase}
            opciok={attasek}
            onChange={(v) => frissit({ attase: v })}
          />
          <SzuroSelect
            id="szuro-szempont"
            cimke="Szempont"
            ertek={aktualis.szempont}
            opciok={SZEMPONT_OPCIOK}
            onChange={(v) => frissit({ szempont: v !== undefined && isSzempontKulcs(v) ? v : undefined })}
          />
          <SzuroSelect
            id="szuro-minosites"
            cimke="Minősítés"
            ertek={aktualis.minosites === undefined ? undefined : String(aktualis.minosites)}
            opciok={minositesOpciok}
            onChange={(v) => {
              const szam = v === undefined ? NaN : Number(v);
              frissit({ minosites: isFokozat(szam) ? szam : undefined });
            }}
          />
        </>
      )}
      {vanAktiv && (
        <Button type="button" variant="ghost" className="justify-self-start" onClick={torol}>
          Szűrők törlése
        </Button>
      )}
    </div>
  );
}

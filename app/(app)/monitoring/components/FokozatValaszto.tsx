'use client';

import { useId, useLayoutEffect, useRef } from 'react';
import { leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { FOKOZATOK, fokozatNev, NEM_ERTEKELHETO, type Szempont } from '../../../../lib/ertekeles-szotar';
import type { MezoHibak } from '../../../../lib/urlap';
import { cn } from '../../../../lib/utils';

/** A „Nem értékelhető” lehetőség magyarázata (spec 5.3.): a fokozatoknak van leírása, ennek a szótárban nincs. */
const NEM_ERTEKELHETO_LEIRAS = 'Indoklást kér, és nem számít gyenge eredménynek.';

/**
 * Egy választógomb a címkéjével. A teljes kártya kattintható, de a rádió neve csak a fokozat, a leírás a
 * rádió leírása, hogy a felolvasó ne a teljes szöveget mondja névként. A `defaultChecked` render után a vezérelt
 * értéket követi: a React 19 a `<form action>` után `form.reset()`-et hív, és a rádió enélkül visszaugrana.
 */
function Opcio({
  id,
  ertek,
  nev,
  leiras,
  kivalasztva,
  kulon = false,
  onValaszt,
}: {
  id: string;
  ertek: string;
  nev: string;
  leiras?: string;
  kivalasztva: boolean;
  /** A többitől elkülönített lehetőség (Nem értékelhető). */
  kulon?: boolean;
  onValaszt: (ertek: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const azonosito = useId();
  const nevId = `${azonosito}-nev`;
  const leirasId = `${azonosito}-leiras`;
  useLayoutEffect(() => {
    if (ref.current && ref.current.defaultChecked !== kivalasztva) ref.current.defaultChecked = kivalasztva;
  });
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer gap-2 rounded-md border border-input px-2.5 py-2 hover:bg-muted/50',
        'has-checked:border-[#1f4e9c] has-checked:bg-[#f3f7fd] has-checked:shadow-[inset_0_0_0_1px_#1f4e9c]',
        'has-focus-visible:ring-2 has-focus-visible:ring-[#1f4e9c] has-focus-visible:ring-offset-1',
        kulon && 'mt-1 border-dashed',
      )}
    >
      <input
        ref={ref}
        id={id}
        type="radio"
        name="fokozat"
        value={ertek}
        checked={kivalasztva}
        onChange={() => onValaszt(ertek)}
        aria-labelledby={nevId}
        aria-describedby={leiras ? leirasId : undefined}
        className="mt-0.5 size-3.5 shrink-0 accent-[#1f4e9c] outline-none"
      />
      <span className="min-w-0">
        <span id={nevId} className="block text-[12.5px] leading-snug font-semibold">
          {nev}
        </span>
        {leiras && (
          <span id={leirasId} className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
            {leiras}
          </span>
        )}
      </span>
    </label>
  );
}

/**
 * A fokozat kiválasztása natív rádiógomb-csoportként: a négy fokozat a leírásával, szempontnál külön
 * lehetőségként a „Nem értékelhető”. Az első rádió id-ja `fokozat`, erre ugrik a fókusz a fokozat hibájánál.
 */
export function FokozatValaszto({
  legend,
  ertek,
  onChange,
  leirasok,
  nemErtekelheto = false,
  errors,
}: {
  legend: string;
  /** A kiválasztott fokozat szövegként; üres: még nincs választás. */
  ertek: string;
  onChange: (ertek: string) => void;
  /** A szempont fokozatleírásai; az összminősítésnek nincs ilyen. */
  leirasok?: Szempont['fokozatok'];
  /** Választható-e a „Nem értékelhető” (az összminősítésnél nem). */
  nemErtekelheto?: boolean;
  errors: MezoHibak;
}) {
  const negyFokozat = FOKOZATOK.filter((f) => f.ertek !== NEM_ERTEKELHETO);
  return (
    <fieldset role="radiogroup" className="flex min-w-0 flex-col gap-1.5" {...leiroAttr(errors, 'fokozat')}>
      <legend className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{legend}</legend>
      {negyFokozat.map((f, i) => (
        <Opcio
          key={f.ertek}
          id={i === 0 ? 'fokozat' : `fokozat-${f.ertek}`}
          ertek={String(f.ertek)}
          nev={f.nev}
          leiras={leirasok?.[f.ertek as keyof Szempont['fokozatok']]}
          kivalasztva={ertek === String(f.ertek)}
          onValaszt={onChange}
        />
      ))}
      {nemErtekelheto && (
        <Opcio
          id={`fokozat-${NEM_ERTEKELHETO}`}
          ertek={String(NEM_ERTEKELHETO)}
          nev={fokozatNev(NEM_ERTEKELHETO)}
          leiras={NEM_ERTEKELHETO_LEIRAS}
          kivalasztva={ertek === String(NEM_ERTEKELHETO)}
          kulon
          onValaszt={onChange}
        />
      )}
      <MezoHiba mezo="fokozat" errors={errors} />
    </fieldset>
  );
}

'use client';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '../ui/combobox';
import { KULCSSZAVAK, KULCSSZO_MAX, type Kulcsszo } from '../../lib/riport-szotar';

export function KulcsszoValaszto({
  value,
  onChange,
  invalid = false,
}: {
  value: Kulcsszo[];
  onChange: (v: Kulcsszo[]) => void;
  invalid?: boolean;
}) {
  const anchor = useComboboxAnchor();
  const tele = value.length >= KULCSSZO_MAX;

  return (
    <Combobox
      multiple
      items={KULCSSZAVAK as readonly Kulcsszo[]}
      value={value}
      onValueChange={(v) => {
        if (v.length <= KULCSSZO_MAX) onChange(v);
      }}
    >
      <input type="hidden" name="kulcsszavak" value={JSON.stringify(value)} />
      <ComboboxChips ref={anchor} id="kulcsszavak-doboz" tabIndex={-1} className="cursor-text">
        <ComboboxValue>
          {(kivalasztott: Kulcsszo[]) => (
            <>
              {kivalasztott.map((k) => (
                <ComboboxChip
                  key={k}
                  aria-label={k}
                  aria-description="Backspace vagy Delete az eltávolításhoz"
                  removeLabel={`${k} eltávolítása`}
                >
                  {k}
                </ComboboxChip>
              ))}
              {/* Az id és az aria-* a valódi beviteli mezőn: ide ugrik a hook fókusza, és a
                  shadcn ComboboxChips `has-aria-invalid:` stílusa leszármazottat vár. */}
              <ComboboxChipsInput
                id="kulcsszavak"
                placeholder={kivalasztott.length === 0 ? 'Kezdj el gépelni a kereséshez…' : tele ? `Legfeljebb ${KULCSSZO_MAX} kulcsszó` : ''}
                aria-labelledby="kulcsszavak-label"
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? 'kulcsszavak-hiba' : undefined}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Nincs ilyen kulcsszó.</ComboboxEmpty>
        <ComboboxList>
          {(k: Kulcsszo) => (
            <ComboboxItem key={k} value={k} disabled={tele && !value.includes(k)}>
              {k}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
      <p className="mt-1 text-xs text-muted-foreground">
        {value.length}/{KULCSSZO_MAX} kulcsszó
      </p>
    </Combobox>
  );
}

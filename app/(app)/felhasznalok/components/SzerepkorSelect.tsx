'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { SZEREPKOR_CIMKE, SZEREPKOROK, type Szerepkor } from '../../../../lib/felhasznalo-validacio';

// A Base UI Select a `name` miatt rejtett inputot rendel, így a FormData-ban `szerepkor`
// néven megjelenik. Az `items` a SelectValue címkéjéhez kell. A trigger <button
// role=combobox>, amire a <label for> nem minden AT-nél számít névnek, ezért
// aria-labelledby: a label id + a saját id (név + aktuális érték).
export function SzerepkorSelect({
  value,
  onChange,
  invalid = false,
}: {
  value: Szerepkor;
  onChange: (v: Szerepkor) => void;
  invalid?: boolean;
}) {
  return (
    <Select name="szerepkor" value={value} onValueChange={(v) => onChange(v ?? 'attase')} items={SZEREPKOR_CIMKE}>
      <SelectTrigger
        id="szerepkor"
        aria-labelledby="szerepkor-label szerepkor"
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'szerepkor-hiba' : undefined}
        className="w-full"
      >
        <SelectValue placeholder="Válassz szerepkört" />
      </SelectTrigger>
      <SelectContent>
        {SZEREPKOROK.map((k) => (
          <SelectItem key={k} value={k}>
            {SZEREPKOR_CIMKE[k]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

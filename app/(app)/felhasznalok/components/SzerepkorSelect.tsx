'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { SZEREPKOR_CIMKE, SZEREPKOROK, type Szerepkor } from '../../../../lib/felhasznalo-validacio';

export function SzerepkorSelect({
  value,
  onChange,
}: {
  value: Szerepkor;
  onChange: (v: Szerepkor) => void;
}) {
  return (
    <Select
      name="szerepkor"
      value={value}
      onValueChange={(v) => onChange((v ?? 'attase') as Szerepkor)}
      items={SZEREPKOR_CIMKE}
    >
      <SelectTrigger id="szerepkor" className="w-full">
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

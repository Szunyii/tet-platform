'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

/** Évválasztó a szerkesztő fejlécében: `?ev=` navigáció (csak nem üres értékek). */
export function EvValaszto({ evek, ertek }: { evek: number[]; ertek: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = Object.fromEntries(evek.map((e) => [String(e), String(e)]));
  return (
    <div className="flex items-center gap-2">
      <Label id="ev-label" htmlFor="ev">Év</Label>
      <Select value={String(ertek)} items={items} onValueChange={(v) => { if (v) router.push(`${pathname}?ev=${v}`); }}>
        <SelectTrigger id="ev" aria-labelledby="ev-label ev" className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          {evek.map((e) => <SelectItem key={e} value={String(e)}>{e}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

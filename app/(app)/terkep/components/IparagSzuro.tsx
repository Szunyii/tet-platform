'use client';

import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AGAZATOK } from '../../../../lib/orszagprofil-szotar';
import { IPARAG_CIMKEK } from '../../../../lib/terkep-mutatok';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const IPARAG_ITEMS: Record<string, string> = { [MIND]: 'Mind', ...IPARAG_CIMKEK };

/** Iparág-szűrő a térképhez; '' = nincs szűrő. */
export function IparagSzuro({ iparag, onChange }: { iparag: string; onChange: (iparag: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
      {/* A Select onValueChange null-t is adhat (törlés); a „Mind" és a null egyaránt „nincs szűrő". */}
      <Select value={iparag || MIND} onValueChange={(v) => onChange(!v || v === MIND ? '' : v)} items={IPARAG_ITEMS}>
        <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={MIND}>Mind</SelectItem>
          {AGAZATOK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

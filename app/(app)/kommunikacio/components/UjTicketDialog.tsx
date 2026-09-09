'use client';

import { useState } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import {
  PRIORITASOK,
  TARGY_MAX,
  TIPUSOK,
  UZENET_MAX,
  type CimzettJelolt,
  type PrioKulcs,
  type TipusKulcs,
} from '../../../../lib/ticket-szotar';
import type { MezoHibak } from '../../../../lib/urlap';
import { createTicketAction } from '../actions';

export function UjTicketDialog({ jeloltek }: { jeloltek: CimzettJelolt[] }) {
  const [open, setOpen] = useState(false);
  // Minden nyitás új key: a modal (és benne az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  return (
    <>
      <Button
        className="w-full"
        onClick={() => {
          setNyitas((n) => n + 1);
          setOpen(true);
        }}
      >
        Új ticket
      </Button>
      <UjTicketModal key={nyitas} open={open} onOpenChange={setOpen} jeloltek={jeloltek} />
    </>
  );
}

/**
 * Legördülő a form-mintához: a Base UI Select a `name` miatt rejtett inputot rendel, így a
 * FormData-ban megjelenik. A trigger `role=combobox` gomb, ezért aria-labelledby a címke
 * id-jával + a sajátjával. Üres érték = nincs kiválasztva (placeholder).
 */
function Valaszto({
  id,
  cimke,
  value,
  onChange,
  items,
  placeholder,
  errors,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  items: Record<string, string>;
  placeholder: string;
  errors: MezoHibak;
}) {
  const invalid = Boolean(errors[id]);
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>
        {cimke}
      </Label>
      <Select name={id} value={value === '' ? null : value} onValueChange={(v) => onChange(v ?? '')} items={items}>
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label ${id}`}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-hiba` : undefined}
          className="w-full"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(items).map(([k, c]) => (
            <SelectItem key={k} value={k}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

function UjTicketModal({
  open,
  onOpenChange,
  jeloltek,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jeloltek: CimzettJelolt[];
}) {
  // Sikernél az action redirectel (?t=<új id>), ezért nincs siker-toast és nincs onKesz.
  const [state, formAction, pending] = useMuveletForm(createTicketAction);
  const errors = state.errors ?? {};
  // Vezérelt mezők: a React 19 a <form action> után (hibánál is) reseteli a nem vezérelt inputokat.
  const [cimzettId, setCimzettId] = useState('');
  const [tipus, setTipus] = useState<TipusKulcs | ''>('');
  const [prio, setPrio] = useState<PrioKulcs>('kozepes');
  const [hatarido, setHatarido] = useState('');
  const [targy, setTargy] = useState('');
  const [szoveg, setSzoveg] = useState('');

  const cimzettItems = Object.fromEntries(jeloltek.map((j) => [j.id, `${j.nev} · ${j.orszag}`]));

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Új ticket"
      leiras="Kérés vagy feladat egy TéT attasénak. Az első üzenet a ticket nyitó szövege."
      gomb="Létrehozás"
      gombFolyamatban="Létrehozás…"
      formAction={formAction}
      errors={errors}
    >
      {jeloltek.length === 0 && (
        <p className="text-sm text-muted-foreground" role="status">
          Nincs címezhető attasé: a Felhasználók oldalon hozz létre attasét országgal.
        </p>
      )}
      <Valaszto
        id="cimzettId"
        cimke="Címzett attasé"
        value={cimzettId}
        onChange={setCimzettId}
        items={cimzettItems}
        placeholder="Válassz attasét"
        errors={errors}
      />
      <div className="grid grid-cols-2 gap-3">
        <Valaszto
          id="tipus"
          cimke="Típus"
          value={tipus}
          onChange={(v) => setTipus(v as TipusKulcs | '')}
          items={TIPUSOK}
          placeholder="Válassz típust"
          errors={errors}
        />
        <Valaszto
          id="prio"
          cimke="Prioritás"
          value={prio}
          onChange={(v) => setPrio((v || 'kozepes') as PrioKulcs)}
          items={PRIORITASOK}
          placeholder="Prioritás"
          errors={errors}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hatarido">Határidő (opcionális)</Label>
        <Input
          id="hatarido"
          name="hatarido"
          type="date"
          value={hatarido}
          onChange={(e) => setHatarido(e.target.value)}
          {...hibaAttr(errors, 'hatarido')}
        />
        <MezoHiba mezo="hatarido" errors={errors} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="targy">Tárgy</Label>
        <Input
          id="targy"
          name="targy"
          required
          maxLength={TARGY_MAX}
          autoComplete="off"
          value={targy}
          onChange={(e) => setTargy(e.target.value)}
          {...hibaAttr(errors, 'targy')}
        />
        <MezoHiba mezo="targy" errors={errors} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="szoveg">Első üzenet</Label>
        <Textarea
          id="szoveg"
          name="szoveg"
          required
          maxLength={UZENET_MAX}
          rows={4}
          value={szoveg}
          onChange={(e) => setSzoveg(e.target.value)}
          {...hibaAttr(errors, 'szoveg')}
        />
        <MezoHiba mezo="szoveg" errors={errors} />
      </div>
    </MuveletDialog>
  );
}

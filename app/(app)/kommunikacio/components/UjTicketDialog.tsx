'use client';

import { useState } from 'react';
import { CimkesSelect } from '../../../../components/form/CimkesSelect';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { useNyitas } from '../../../../components/form/useNyitas';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import {
  isPrioKulcs,
  isTipusKulcs,
  PRIORITASOK,
  TARGY_MAX,
  TIPUSOK,
  UZENET_MAX,
  type CimzettJelolt,
  type PrioKulcs,
  type TipusKulcs,
} from '../../../../lib/ticket-szotar';
import { createTicketAction } from '../actions';
import { CimzettValaszto } from './CimzettValaszto';

export function UjTicketDialog({ jeloltek }: { jeloltek: CimzettJelolt[] }) {
  const { open, setOpen, kulcs, nyit } = useNyitas();
  return (
    <>
      <Button className="w-full" onClick={nyit}>
        Új ticket
      </Button>
      {kulcs > 0 && <UjTicketModal key={kulcs} open={open} onOpenChange={setOpen} jeloltek={jeloltek} />}
    </>
  );
}

const TIPUS_OPCIOK = Object.entries(TIPUSOK).map(([ertek, cimke]) => ({ ertek, cimke }));
const PRIO_OPCIOK = Object.entries(PRIORITASOK).map(([ertek, cimke]) => ({ ertek, cimke }));

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
  const [kijelolt, setKijelolt] = useState<string[]>([]);
  const [tipus, setTipus] = useState<TipusKulcs | ''>('');
  const [prio, setPrio] = useState<PrioKulcs>('kozepes');
  const [hatarido, setHatarido] = useState('');
  const [targy, setTargy] = useState('');
  const [szoveg, setSzoveg] = useState('');

  // A gomb felirata csak a még választható kijelölteket számolja (revalidálás után a lista szűkülhet).
  const darab = jeloltek.filter((j) => kijelolt.includes(j.id)).length;

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      szeles
      cim="Új ticket"
      leiras="Kérés vagy feladat egy vagy több TéT attasénak. Több címzettnél mindenki külön ticketet kap, a válaszokat csak a központ látja. Az első üzenet a ticket nyitó szövege."
      gomb={darab > 1 ? `Létrehozás (${darab} címzett)` : 'Létrehozás'}
      gombFolyamatban="Létrehozás…"
      formAction={formAction}
      errors={errors}
    >
      {jeloltek.length === 0 && (
        <p className="text-sm text-muted-foreground" role="status">
          Nincs címezhető attasé: a Felhasználók oldalon hozz létre attasét székhellyel.
        </p>
      )}
      {jeloltek.length > 0 && (
        <CimzettValaszto jeloltek={jeloltek} kijelolt={kijelolt} onChange={setKijelolt} errors={errors} />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CimkesSelect
          id="tipus"
          name="tipus"
          cimke="Típus"
          value={tipus}
          onChange={(v) => setTipus(isTipusKulcs(v) ? v : '')}
          opciok={TIPUS_OPCIOK}
          placeholder="Válassz típust"
          errors={errors}
          required
          className="w-full"
        />
        {/* A prioritásnak mindig van értéke (alapértelmezés: közepes), így a placeholder sosem látszik. */}
        <CimkesSelect
          id="prio"
          name="prio"
          cimke="Prioritás"
          value={prio}
          onChange={(v) => setPrio(isPrioKulcs(v) ? v : 'kozepes')}
          opciok={PRIO_OPCIOK}
          placeholder="Prioritás"
          errors={errors}
          required
          className="w-full"
        />
      </div>
      <Mezo id="hatarido" cimke="Határidő (opcionális)" errors={errors}>
        <Input
          id="hatarido"
          name="hatarido"
          type="date"
          min="2000-01-01"
          max="2100-12-31"
          value={hatarido}
          onChange={(e) => setHatarido(e.target.value)}
          {...hibaAttr(errors, 'hatarido')}
        />
      </Mezo>
      <Mezo id="targy" cimke="Tárgy" errors={errors}>
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
      </Mezo>
      <Mezo id="szoveg" cimke="Első üzenet" errors={errors}>
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
      </Mezo>
    </MuveletDialog>
  );
}

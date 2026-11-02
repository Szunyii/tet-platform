import { SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { Button } from '../../../../components/ui/button';
import { tudastarUrl } from '../../../../lib/routes';
import { KeresoBemenet } from './KeresoBemenet';

/**
 * Keresés a tudástárban: GET űrlap a nyitólapra (`?q=`), a Next `Form`-jával kliens-oldali navigációval. A
 * találati lista így linkelhető, és a Vissza gomb is működik. `kompakt`: a kategória-menü keskeny változata
 * (ikon-gomb).
 */
export function KeresoMezo({ id, q = '', kompakt = false }: { id: string; q?: string; kompakt?: boolean }) {
  return (
    <Form action={tudastarUrl()} role="search" className="flex gap-2">
      <label htmlFor={id} className="sr-only">
        Keresés a tudástárban
      </label>
      <KeresoBemenet id={id} q={q} placeholder={kompakt ? 'Keresés…' : 'Keresés: intézmény, program, kulcsszó…'} />
      {kompakt ? (
        <Button type="submit" variant="outline" size="icon" aria-label="Keresés">
          <SearchIcon aria-hidden />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
          Keresés
        </Button>
      )}
    </Form>
  );
}

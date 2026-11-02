import { SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { tudastarUrl } from '../../../../lib/routes';
import { KERESES_MAX } from '../../../../lib/tudastar-kereses';

/**
 * Keresés a tudástárban: GET űrlap a nyitólapra (`?q=`), a Next `Form`-jával kliens-oldali navigációval. A
 * találati lista így linkelhető, és a Vissza gomb is működik. Az input `key`-e a `q`: a „Keresés törlése”
 * után üresen indul. `kompakt`: a kategória-menü keskeny változata (ikon-gomb).
 */
export function KeresoMezo({ id, q = '', kompakt = false }: { id: string; q?: string; kompakt?: boolean }) {
  return (
    <Form action={tudastarUrl()} role="search" className="flex gap-2">
      <label htmlFor={id} className="sr-only">
        Keresés a tudástárban
      </label>
      <Input
        key={q}
        id={id}
        name="q"
        type="search"
        defaultValue={q}
        maxLength={KERESES_MAX}
        placeholder={kompakt ? 'Keresés…' : 'Keresés: intézmény, program, kulcsszó…'}
        className="min-w-0 flex-1"
      />
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

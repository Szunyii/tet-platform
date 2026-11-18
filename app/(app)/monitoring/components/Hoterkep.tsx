import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { FelevSzam } from '../../../../lib/ertekeles-idoszak';
import { haladas, type ErtekelesSor, type regionkent } from '../../../../lib/ertekeles-osszesites';
import { SZEMPONTOK, type Fokozat } from '../../../../lib/ertekeles-szotar';
import { szuroUrl, type ErtekelesSzuro } from '../../../../lib/ertekeles-szuro';
import { orszagNev } from '../../../../lib/orszagok';
import { cn } from '../../../../lib/utils';
import { FokozatJelveny } from './FokozatJelveny';
import { ValtozasJelzes } from './ValtozasJelzes';

/** A név, az öt szempont, az összminősítés és a változás. */
const OSZLOPOK_SZAMA = 8;

const KIEMELT_FEJLEC = 'bg-[#e8eefa] text-[#1f4e9c] shadow-[inset_0_-2px_0_#1f4e9c]';
const KIEMELT_CELLA = 'bg-[#f1f5fc]';

/** A poszt egy sorban: város, majd a székhely országa, vagy több országnál a további országok száma. */
function posztFelirat(sor: ErtekelesSor): string {
  const tovabbi = sor.orszagok.filter((o) => !o.szekhely).length;
  const orszag = orszagNev(sor.szekhelyKod);
  const lefedes = tovabbi > 0 ? `+${tovabbi} ország` : null;
  if (sor.varos) return `${sor.varos} · ${lefedes ?? orszag}`;
  return lefedes ? `${orszag} · ${lefedes}` : orszag;
}

function NincsMinositve() {
  return (
    <span className="text-[11.5px] text-muted-foreground">
      <span aria-hidden="true">–</span>
      <span className="sr-only">Nincs minősítve</span>
    </span>
  );
}

function SzempontCella({ fokozat }: { fokozat: Fokozat | undefined }) {
  return fokozat === undefined ? <NincsMinositve /> : <FokozatJelveny fokozat={fokozat} rovid />;
}

function AttaseSor({
  sor,
  szuro,
  nyitott,
}: {
  sor: ErtekelesSor;
  szuro: ErtekelesSzuro;
  nyitott: boolean;
}) {
  const { kesz, osszes } = haladas(sor);
  return (
    <TableRow className="relative">
      <TableHead scope="row" className="h-auto py-1.5 pr-2 pl-3 font-normal whitespace-normal">
        {/* A link ::after rétege a teljes sort lefedi (a <tr> a pozicionálási alap), így az egész sor kattintható. */}
        <Link
          href={szuroUrl(szuro, `/monitoring/${encodeURIComponent(sor.attaseId)}`)}
          className="text-[12.5px] font-medium text-foreground no-underline outline-none after:absolute after:inset-0 after:rounded-[3px] hover:underline focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-inset"
        >
          {sor.nev}
        </Link>
        <div className="text-[11px] text-muted-foreground">{posztFelirat(sor)}</div>
        {nyitott && !sor.kimarad && (
          <div className="text-[11px] text-muted-foreground">
            {kesz} / {osszes}
            <span className="sr-only"> szempont minősítve</span>
          </div>
        )}
      </TableHead>
      {sor.kimarad ? (
        <TableCell colSpan={OSZLOPOK_SZAMA - 1} className="px-3 py-1.5 text-[12px] whitespace-normal text-muted-foreground">
          {sor.kimaradasOka ? `Nem értékelt: ${sor.kimaradasOka}` : 'Nem értékelt'}
        </TableCell>
      ) : (
        <>
          {SZEMPONTOK.map((s) => (
            <TableCell
              key={s.kulcs}
              className={cn('p-0.5 text-center', szuro.szempont === s.kulcs && KIEMELT_CELLA)}
            >
              <SzempontCella fokozat={sor.fokozatok[s.kulcs]} />
            </TableCell>
          ))}
          <TableCell className="p-0.5 text-center">
            {sor.osszFokozat === null ? <NincsMinositve /> : <FokozatJelveny fokozat={sor.osszFokozat} />}
          </TableCell>
          <TableCell className="p-0.5 text-center">
            <ValtozasJelzes valtozas={sor.valtozas} />
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

/**
 * A hőtérkép: soronként egy attasé, régiónként csoportosítva, azon belül magyar névsorban. Pontszám szerinti
 * rendezés nincs. A tábla keskeny ablakban a saját dobozában görget.
 */
export function Hoterkep({
  csoportok,
  szuro,
  felev,
  nyitott,
}: {
  csoportok: ReturnType<typeof regionkent>;
  szuro: ErtekelesSzuro;
  /** A megjelenített félév: az adatlap linkje ezt viszi tovább akkor is, ha az URL-ben nincs `?felev=`. */
  felev: FelevSzam;
  nyitott: boolean;
}) {
  if (csoportok.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Nincs a szűrőknek megfelelő attasé.
      </p>
    );
  }
  const linkSzuro: ErtekelesSzuro = { ...szuro, felev };
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table aria-label="Az attasék minősítése szempontonként" className="min-w-[900px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead scope="col" className="pl-3 text-[11px] font-semibold text-muted-foreground">
              Attasé és poszt
            </TableHead>
            {SZEMPONTOK.map((s) => {
              const kiemelt = szuro.szempont === s.kulcs;
              return (
                <TableHead
                  key={s.kulcs}
                  scope="col"
                  className={cn(
                    'w-24 px-1 text-center text-[11px] font-semibold text-muted-foreground',
                    kiemelt && KIEMELT_FEJLEC,
                  )}
                >
                  {s.rovid}
                  {kiemelt && <span className="sr-only"> (kiválasztott szempont)</span>}
                </TableHead>
              );
            })}
            <TableHead scope="col" className="w-[136px] px-1 text-center text-[11px] font-semibold text-muted-foreground">
              Összminősítés
            </TableHead>
            <TableHead scope="col" className="w-[84px] px-1 text-center text-[11px] font-semibold text-muted-foreground">
              Változás
            </TableHead>
          </TableRow>
        </TableHeader>
        {csoportok.map((csoport) => (
          <TableBody key={csoport.regio}>
            <tr className="border-b">
              <th
                scope="rowgroup"
                colSpan={OSZLOPOK_SZAMA}
                className="bg-muted/60 px-3 py-1.5 text-left text-[11px] font-semibold text-muted-foreground"
              >
                {csoport.cimke}
              </th>
            </tr>
            {csoport.sorok.map((sor) => (
              <AttaseSor key={sor.ertekelesId} sor={sor} szuro={linkSzuro} nyitott={nyitott} />
            ))}
          </TableBody>
        ))}
      </Table>
    </div>
  );
}

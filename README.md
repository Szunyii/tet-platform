# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
A képernyők adatai egyelőre statikus dummy adatok (`lib/data.ts`); az auth és az adatbázis-réteg már valódi (lásd lent).

## Indítás

```bash
npm install
cp .env.example .env.local   # majd állítsd be a BETTER_AUTH_SECRET és SEED_ADMIN_* értékeket
npm run db:migrate           # létrehozza a data/tet.db-t a táblákkal
npm run db:seed              # első admin felhasználó a .env.local alapján
npm run dev
```

Ezután nyisd meg: http://localhost:3000

### Adatbázis és auth

- Drizzle ORM + SQLite (`better-sqlite3`), DB fájl: `data/tet.db` (gitignore-olva)
- Better Auth, Drizzle adapterrel; email + jelszó, nyilvános regisztráció tiltva; admin plugin (`role`: `admin` | `attase`)
- Séma: `db/schema/`, migrációk: `drizzle/`, auth végpont: `/api/auth/*`
- Scriptek: `db:generate` (migráció generálás séma-változás után), `db:migrate`, `db:studio`, `db:seed`, `auth:generate` (auth séma újragenerálás a Better Auth config változásakor)

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Átirányítás az Országprofil (`/terkep`) képernyőre |
| `/terkep` | Térkép és országprofil (d3-geo világtérkép, kattintható posztok) |
| `/riportok` | Riportlista + aggregált kimutatás |
| `/uj-riport` | Új riport kitöltése (7 blokkos varázsló, nem perzisztens) |
| `/kommunikacio` | Ticketek és üzenetszálak |
| `/tudastar` | Tudástár – Magyarországról ajánlható programok, partnerek, együttműködési formák |
| `/monitoring` | Hálózati rangsor + 14 szempontos részletes értékelés |

## Felépítés

- `lib/data.ts` – demóadatok: 14 poszt, 3 kategória, 14 értékelési szempont, 7 riportblokk, ticketek
- `lib/knowledge.ts` – tudástár demóadatok: 6 program, 6 ökoszisztéma-elem, 5 együttműködési forma
- `lib/score.ts` – determinisztikus dummy pontszámok és státuszok (a doksi logikája szerint)
- `components/AppShell.tsx` – sidebar, fejléc, szerepkör- és ciklusváltó (React context)
- `public/tet-world-map.js` – `<tet-world-map>` webkomponens (d3 + world-atlas, CDN-ről töltődik)

Megjegyzés: a térkép internetkapcsolatot igényel (d3, topojson és a world-atlas TopoJSON CDN-ről jön).
# tet-platform

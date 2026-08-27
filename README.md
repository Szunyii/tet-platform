# NIÜ · TéT Platform – Next.js dummy demó

Egyszerű Next.js (App Router, TypeScript) demóprojekt a „TéT Platform" design-doksi alapján.
Minden adat statikus dummy adat (`lib/data.ts`), backend nincs.

## Indítás

```bash
npm install
npm run dev
```

Ezután nyisd meg: http://localhost:3000

## Képernyők

| Útvonal | Képernyő |
| --- | --- |
| `/` | Áttekintés (admin és attasé nézet, a fejlécben váltható) |
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

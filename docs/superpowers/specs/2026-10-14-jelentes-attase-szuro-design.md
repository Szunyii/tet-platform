# Jelentések: szűrés attaséra – tervezési spec

Dátum: 2026-10-14
Állapot: megvalósítva és átnézve (taskonként spec- és minőségi review, záró review), a böngészős próba kész (2026-10-14, a futó dev szerveren, ideiglenes QA-bejegyzésekkel, utána törölve). Az eltéréseket lásd a „Megvalósítási eltérések” szakaszban.
Ág: `jelentes-attase-szuro` (a `kommunikacio-korlevel` ág tetején)

## Cél

A központ (admin) a Jelentések listáját egy adott attasé bejegyzéseire szűkíthesse, a meglévő
szűrőkkel (keresés, kategória, kulcsszó, ország, dátum) együtt.

## Kiinduló állapot

- A szűrősáv `components/riport/RiportSzurok.tsx` (kliens): keresőmező, `SzuroSelect`-ek
  (Kategória, Kulcsszó, adminnak Ország) „Mind” opcióval (`__mind`), két dátummező, „Szűrők
  törlése”. Minden változás `router.replace`-szel az URL-be kerül.
- Az URL ↔ szűrő fordító `lib/riport-szuro.ts`: `szuroFromSearchParams` (`SearchParams` →
  `RiportFilter`, az ismeretlen/érvénytelen értéket eldobja) és `szuroErtekek` (`RiportFilter` →
  `SzuroErtekek`, a kliensnek való nyers értékek, üres string = nincs).
- A `RiportFilter` már tartalmaz `szerzoId` mezőt, a `listRiportok` szűr is rá. Ma csak az
  attasé saját nézete használja: a page nem adminnál `szuro.szerzoId = session.userId`-t állít és
  az `orszag`-ot törli, és a `szuroErtekek`-et ezután számolja.
- Az Ország-szűrő opcióit a `listOrszagok()` adja: a bejegyzésekben előforduló országkódok, név
  szerint rendezve.
- Bejegyzést csak országgal rendelkező felhasználó adhat be (`createRiportAction`), az adminnak
  nincs országa, ezért a szerzők a gyakorlatban attasék.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| Ki látja | Csak az admin. Az attasé csak a saját bejegyzéseit látja, neki a szűrő értelmetlen. |
| Opciólista | Csak akinek van bejegyzése (mint az Ország-szűrőnél); így a szűrő önmagában sosem ad üres listát. |
| Felirat | A legördülő címkéje „Attasé”, az opciók felirata a szerző neve, magyar névsorban (`localeCompare(…, 'hu')`). |
| Viszony az Ország-szűrőhöz | Független, ÉS kapcsolat. Találat nélküli párosításnál a meglévő „Nincs a szűrőknek megfelelő bejegyzés.” szöveg jelenik meg. |
| URL | `?attase=<felhasználó-id>` |
| Ismeretlen id | Az admin page a `listSzerzok()` listáján nem szereplő id-t eldobja (szűrő nélkülinek veszi), így a legördülőben sem jelenik meg nyers id. |

## Hatókörön kívül

- Az Ország- és az Attasé-szűrő egymáshoz igazítása (az egyik választása szűkítené a másik opcióit).
- A táblázat szerzőnevének kattintható szűrő-linkké tétele; a szerző nevének elrejtése aktív
  szűrőnél.
- A bejegyzés nélküli attasék megjelenítése a listában.

## Megoldás

### Lekérdezés – `db/queries/riport.ts`

Új `listSzerzok(): RiportSzerzo[]` a `listOrszagok()` mellé, `RiportSzerzo = { id: string; nev: string }`:
a `riport` és a `user` join-jából a különböző szerzők (`selectDistinct` a `user.id`-re és a
`user.name`-re), JS-ben magyar névsorba rendezve. A `listRiportok` nem változik.

### URL-fordító – `lib/riport-szuro.ts`

- `szuroFromSearchParams`: az `attase` paraméter nem üres, levágott értéke (`slice(0, 100)`, mint
  az `orszag`-nál) a `RiportFilter.szerzoId`-ba kerül.
- `SzuroErtekek` új mezője `attase`; a `szuroErtekek` a `szerzoId`-ből tölti.

### Page – `app/(app)/jelentesek/page.tsx`

- **Admin:** `const szerzok = listSzerzok()`; ha a `szuro.szerzoId` nincs a `szerzok` id-i között,
  törli. A szűrőértékek és a lekérdezés ugyanabból a `szuro`-ból jönnek.
- **Attasé:** előbb az URL-ből jövő `orszag` és `szerzoId` kerül ki a `szuro`-ból, ebből számolódnak
  a szűrőértékek (és a `vanSzuro`), a lekérdezés pedig `listRiportok({ ...szuro, szerzoId: session.userId })`.
  Így a kényszerített saját-szűrő nem látszik aktív szűrőnek (nincs „Szűrők törlése” gomb, üres
  listánál nem „Nincs a szűrőknek megfelelő bejegyzés.” jelenik meg), és a kézzel beírt
  `?attase=<más id>` sem mutat idegen bejegyzést.
- A `RiportSzurok` új `szerzok` propot kap (adminnak a lista, attasénak `[]`, mint az `orszagok`).

### Szűrősáv – `components/riport/RiportSzurok.tsx`

Új `SzuroSelect` (`id="szuro-attase"`, címke „Attasé”, `className="w-56"`) közvetlenül az Ország
után, csak `admin` esetén; opciók `szerzok.map((s) => ({ ertek: s.id, cimke: s.nev }))`, változáskor
`frissit({ attase: v })`. A „Szűrők törlése” és a `vanAktiv` a `SzuroErtekek` minden mezőjét nézi,
ezért külön teendő nincs.

### Dokumentáció

A CLAUDE.md Riportok-szakaszában az ország-szűrő mondata mellé: az admin attasé-szűrője
(`?attase=` → `RiportFilter.szerzoId`, opciók a `listSzerzok()`-ből, ismeretlen id eldobva), és hogy
az attasé nézetében a saját-szűrő nem szűrőérték.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- Böngészős QA a futó dev szerveren (ideiglenes QA-bejegyzésekkel legalább két attasétól, a végén
  törölve):
  - admin: az Attasé-legördülő a bejegyzéssel rendelkező szerzőket mutatja névsorban; választásra a
    lista szűkül és az URL-ben `attase=` jelenik meg; az Ország-szűrővel kombinálva ÉS; találat nélküli
    párosításnál a „Nincs a szűrőknek megfelelő bejegyzés.” szöveg; a „Szűrők törlése” ezt is törli;
    ismeretlen `?attase=` → teljes lista, a legördülőn „Mind”;
  - attasé: nincs Attasé- és Ország-legördülő; a kézzel beírt `?attase=<más id>` és `?orszag=` nem
    hat, nincs „Szűrők törlése” gomb.

## Megvalósítási eltérések

- A README `/jelentesek` sora is frissült („admin: mind, ország- és attasé-szűrővel”).
- A `szuroErtekek` JSDoc-figyelmeztetést kapott: csak az URL-ből jövő szűrő mehet bele, a
  jogosultságból kényszerített szerző-szűrő csak a `listRiportok` hívásba.
- A CLAUDE.md kimondja, hogy a `listRiportok` nem ellenőriz jogot, ezért a `szuroFromSearchParams`
  eredménye attasénál csak felülírt `szerzoId`-vel mehet a lekérdezésbe.
- Az első kódcommit (`bcf41c8`, adatréteg) önmagában nem bisect-tiszta: ott az attasé nézetében a
  kényszerített saját-szűrő még aktív szűrőnek látszik; a következő commit (`b769b52`) javítja.

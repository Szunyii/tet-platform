# Országprofil-szerkesztő: nem szerkeszthető év – tervezési spec

Dátum: 2026-10-14
Állapot: jóváhagyva
Ág: `szerkeszto-evvaltas`
Előzmény: `2026-09-14-ciklus-ev-vezerles-design.md` (a fejléc éve vezérli a szerkesztőt; ott a
múltbeli év a szerkesztőben még 404 volt).

## A hiba

Böngészőben reprodukálva (a futó dev szerveren, `ferencz.csanad@demo.test`, Japán relációs
vezetője; a fejléc évlistája neki 2026, 2025):

1. Az attasé a szerkesztőben (`/orszagprofil/JP/szerkesztes`) a fejléc „Ciklus” választóján
   2025-öt választ → „Az oldal nem található” (404). A nem mentett beírások elvesznek.
2. Visszaváltva 2026-ra a 404 marad (a fejléc 2026-ot mutat); csak a teljes újratöltés hozza
   vissza a szerkesztőt.

Adminnál a váltás jól működik: az évlistája (`EV_MIN`..aktuális év) csak szerkeszthető évet
tartalmaz.

## Gyökérok

- A szerkesztő page a cookie-ból jövő évre `canEditProfil`-t számol, és hiba esetén
  `notFound()`-ot hív. Attasénál csak az aktuális év szerkeszthető, a fejléc viszont a szerkesztő
  oldalon is felkínálja a múltbeli profil-éveket – a választás tehát közvetlenül 404-be visz.
- A Next a `notFound()`-ot egy kliens-oldali határon (`HTTPAccessFallbackErrorBoundary`,
  `node_modules/next/dist/client/components/http-access-fallback/error-boundary.js`) jeleníti meg,
  amely csak útvonal-változáskor (`pathname`) áll vissza. Az évváltás cookie-t ír és revalidál,
  az útvonal nem változik, ezért a következő (már jogos) render sem tünteti el a 404-et.

## Döntések

| Kérdés | Döntés |
| --- | --- |
| Mi legyen a nem szerkeszthető, de olvasható évvel | A felhasználó döntése: a szerkesztő oldalon marad, az űrlapok helyén tájékoztató kártya áll (nem átirányítás és nem az évlista szűkítése). |
| Mikor jelenik meg a kártya | Ha a választott év nem szerkeszthető (`canEditProfil(session, kod, ev, most)` hamis), de az aktuális igen (`canEditProfil(session, kod, most, most)` igaz). Gyakorlatban: relációs vezető attasé múltbeli évvel – ide tartozik a kézzel beírt URL 2025-ös cookie-val és a nyitva hagyott szerkesztő január 1-jén is. |
| Mikor marad a 404 | Ha az aktuális év sem szerkeszthető (nem vezető attasé, nincs jog az országhoz), illetve ismeretlen országkódnál. Ez egyik szerepkörnél sem függ a választott évtől, ezért nem ragadhat be évváltáskor. |
| A kártya szövege | „A(z) 2025. évi profil csak megtekinthető; szerkeszteni a(z) 2026. évi profilt lehet.” (A jóváhagyott „a 2026-os évet” ragja évenként változna – 2027-ben „-es” –, toldalék-segéd pedig nincs; a „2026. évi” alak minden évre helyes, és a profil oldal „Ugrás a(z) 2025. évi profilra” gombjához igazodik.) |
| A kártya gombjai | „Vissza a szerkesztéshez (2026)” – a meglévő `SzerkesztesGomb` form-ága (`valasztEvAction`: cookie az aktuális évre, átirányítás a szerkesztőre, `KuldGomb` pendinggel); „A(z) 2025. évi profil megtekintése” – link az olvasó nézetre (`/orszagprofil/<kod>`). |
| A fejléc-sor | Változatlan: „<ország> – profil szerkesztése”, „Év: 2025”, „Megtekintés” link. |
| Nem mentett beírások | Évváltáskor elvesznek (a `<Fragment key={ev}>` eddig is újramountolt; a kártya-ágban az űrlapok nincsenek a DOM-ban). A felhasználó elfogadta. |

## Hatókörön kívül

- A fejléc évlistájának route-függő szűkítése; figyelmeztetés nem mentett változásoknál.
- A `mentBlokkAction` (a jog-hibája továbbra is form-szintű `NINCS_JOG`), az olvasó nézet, a
  térkép és az admin viselkedése.

## Megvalósítás

- Új Server Component `app/(app)/orszagprofil/components/NemSzerkeszthetoEv.tsx`, propjai:
  `kod`, `ev` (a választott, nem szerkeszthető év), `most`, `action` (a `valasztEvAction`, mint a
  `SzerkesztesGomb`-nál). Tartalma egy `Card` a szöveggel és a két gombbal (a link
  `Link` + `buttonVariants({ variant: 'outline' })`, a CLAUDE.md link-gomb mintája szerint).
- `app/(app)/orszagprofil/[kod]/szerkesztes/page.tsx`: `szerkeszthet = canEditProfil(session, kod, ev, most)`;
  ha hamis és `canEditProfil(session, kod, most, most)` is hamis → `notFound()`; ha hamis, de az
  aktuális év szerkeszthető → a fejléc-sor + `NemSzerkeszthetoEv`, a profil lekérdezése nélkül;
  különben a mai 9 blokk. A page doc-kommentje frissül.
- CLAUDE.md, Országprofil: a szerkesztő route leírásában a jog-hiba helyett a fenti három eset;
  az „Amire figyelni kell” listába új pont: a cookie-ból jövő évtől függő `notFound()` a Next
  404-határán az útvonal változásáig beragad, ezért évfüggő jog-hibára ne 404 legyen a válasz.

## Ellenőrzés

- `npx tsc --noEmit`, `npm run build`.
- gstack, a futó dev szerveren:
  - JP-attasé (`ferencz.csanad`): szerkesztő 2026-ban → fejléc 2025 → kártya a szöveggel, a fejléc
    2025; „Vissza a szerkesztéshez (2026)” → a fejléc 2026, a 9 blokk a mentett adatokkal;
    újra 2025 → kártya → fejléc 2026 → a 9 blokk (nincs beragadt állapot); 2025-ös cookie-val a
    szerkesztő URL-je közvetlenül → kártya; „A(z) 2025. évi profil megtekintése” → olvasó nézet 2025.
  - Nem vezető DE-attasé (`komma.krisztian`): `/orszagprofil/DE/szerkesztes` → 404 2026-ban és
    2025-ben is.
  - Admin: a szerkesztőben 2025 → üres űrlapok, 2026 → a mentett adatok (változatlan).
  - A QA végén kijelentkezés; a DB-t nem commitoljuk.

// Demóadatok a TéT Platform doksiból (14 poszt, 3 kategória, 14 szempont, 7 riportblokk, ticketek)

export const FIELDS = [
  'Mesterséges intelligencia',
  'Kvantumtechnológia',
  'Biotechnológia és élettudomány',
  'Félvezetők és mikroelektronika',
  'Energetika és fenntarthatóság',
  'Űrtechnológia',
  'Agrár- és élelmiszertechnológia',
  'Digitális egészségügy',
  'Anyagtudomány',
  'Mobilitás és autonóm rendszerek',
] as const;

export const FIELD_COLORS: Record<string, string> = {
  'Mesterséges intelligencia': '#1f4e9c',
  'Kvantumtechnológia': '#6b46c1',
  'Biotechnológia és élettudomány': '#0f7a68',
  'Félvezetők és mikroelektronika': '#b45309',
  'Energetika és fenntarthatóság': '#2f7d32',
  'Űrtechnológia': '#0e7490',
  'Agrár- és élelmiszertechnológia': '#8a6d1f',
  'Digitális egészségügy': '#a8326f',
  'Anyagtudomány': '#525c6b',
  'Mobilitás és autonóm rendszerek': '#9a3412',
};

export interface Cat { n: number; nev: string; rovid: string; color: string }
export const CATS: Cat[] = [
  { n: 1, nev: '1. Általános együttműködés', rovid: 'Együttműködés', color: '#1f4e9c' },
  { n: 2, nev: '2. Piacra lépési támogatás (XPAND)', rovid: 'XPAND', color: '#6b46c1' },
  { n: 3, nev: '3. Információs tevékenység', rovid: 'Információ', color: '#0f7a68' },
];

export interface Criterion {
  id: number; kat: number; szempont: string; meres: string;
  adatforras: string; fajl: string; gyakorisag: string;
}
export const CRITERIA: Criterion[] = [
  { id: 1, kat: 1, szempont: 'Kapcsolattartás rendszeressége', meres: '5 fokozatú skála', adatforras: 'NIÜ kapcsolattartói napló', fajl: 'Excel / Google Sheets', gyakorisag: 'Negyedéves' },
  { id: 2, kat: 1, szempont: 'Reagálási gyorsaság és együttműködési hajlandóság', meres: '5 fokozatú skála', adatforras: 'E-mail/levelezés elemzés', fajl: 'E-mail napló', gyakorisag: 'Negyedéves' },
  { id: 3, kat: 1, szempont: 'Proaktív megkeresések száma és minősége', meres: 'Kombinált (szám + skála)', adatforras: 'NIÜ kapcsolattartói napló', fajl: 'Excel / Google Sheets', gyakorisag: 'Negyedéves' },
  { id: 4, kat: 1, szempont: 'Információmegosztás rendszeressége', meres: '5 fokozatú skála', adatforras: 'NIÜ kapcsolattartói napló', fajl: 'Excel / Google Sheets', gyakorisag: 'Havi' },
  { id: 5, kat: 1, szempont: 'Nemzetközi konferenciákhoz kapcsolódó aktivitás', meres: 'Szám (darab)', adatforras: 'Rendezvénynyilvántartás', fajl: 'Excel / Google Sheets', gyakorisag: 'Éves' },
  { id: 6, kat: 2, szempont: 'XPAND Programhoz kapcsolódó aktivitások (Go tréning, side eventek)', meres: 'Szám (darab)', adatforras: 'Rendezvénynyilvántartás', fajl: 'Excel / Google Sheets', gyakorisag: 'Negyedéves' },
  { id: 7, kat: 2, szempont: 'Partnerazonosítás, B2B találkozók, matchmaking, együttműködések elősegítése', meres: 'Kombinált (szám + skála)', adatforras: 'CRM/ügyfélkezelő rendszer', fajl: 'CRM export (CSV/XLSX)', gyakorisag: 'Negyedéves' },
  { id: 8, kat: 2, szempont: 'Delegációk fogadása, program szervezése és helyszíni támogatása', meres: 'Szám (darab)', adatforras: 'Delegációs jelentés', fajl: 'Jelentés (DOCX/PDF)', gyakorisag: 'Eseményenkénti' },
  { id: 9, kat: 3, szempont: 'Küldött szakmai anyagok, jelentések, piaci információk', meres: 'Szám (darab)', adatforras: 'Attasé önértékelése', fajl: 'Jelentés (DOCX/PDF)', gyakorisag: 'Havi' },
  { id: 10, kat: 3, szempont: 'Technológiai és innovációs trendek megosztása', meres: '5 fokozatú skála', adatforras: 'Attasé önértékelése', fajl: 'Jelentés (DOCX/PDF)', gyakorisag: 'Negyedéves' },
  { id: 11, kat: 3, szempont: 'Lehetséges együttműködések vagy pályázati lehetőségek jelzése', meres: 'Szám (darab)', adatforras: 'Attasé önértékelése', fajl: 'Jelentés (DOCX/PDF)', gyakorisag: 'Negyedéves' },
  { id: 12, kat: 3, szempont: 'A megosztott információk hasznossága és relevanciája', meres: '5 fokozatú skála', adatforras: 'NIÜ szakmai visszajelzés', fajl: 'Excel / Google Sheets', gyakorisag: 'Negyedéves' },
  { id: 13, kat: 3, szempont: 'A NIÜ által kezdeményezett feladatok támogatása', meres: '5 fokozatú skála', adatforras: 'NIÜ kapcsolattartói napló', fajl: 'Excel / Google Sheets', gyakorisag: 'Negyedéves' },
  { id: 14, kat: 3, szempont: 'Kérésekre adott válaszok minősége, határidők betartása', meres: '5 fokozatú skála', adatforras: 'E-mail/levelezés elemzés', fajl: 'E-mail napló', gyakorisag: 'Negyedéves' },
];

export interface Intezmeny { n: string; t: string; ter: string; ny: number }
export interface Palyazat { ki: string; pr: string; keret: string; hat: string; rel: string }
export interface Esemeny { n: string; t: string; d: string; rel: string }
export interface Politika { irany: string; kockazat: string; megj: string }

export interface Post {
  id: number; attase: string; orszag: string; geo: string; varos: string; regio: string;
  lonlat: [number, number]; base: number; riportok: number; nyitott: number; utolso: string;
  fokusz: string[]; kf: string; intezmenyek: Intezmeny[]; palyazatok: Palyazat[];
  esemenyek: Esemeny[]; politika: Politika; tanulsag: string;
}

export const POSTS: Post[] = [
  {
    id: 1, attase: 'Kovács Dániel', orszag: 'Amerikai Egyesült Államok', geo: 'United States of America', varos: 'Washington D.C.', regio: 'Észak-Amerika', lonlat: [-77.03, 38.9], base: 4.5, riportok: 24, nyitott: 2, utolso: '2026-06-14',
    fokusz: ['Mesterséges intelligencia', 'Félvezetők és mikroelektronika', 'Biotechnológia és élettudomány'],
    kf: 'Rekordszintű szövetségi K+F költés az AI és a félvezetőgyártás körül; a CHIPS-programhoz kötődő egyetemi konzorciumok nyitottak külső partnerekre.',
    intezmenyek: [{ n: 'NIST', t: 'Állami kutatóintézet', ter: 'Mérésügy, AI-biztonság', ny: 4 }, { n: 'Georgia Tech IEN', t: 'Egyetemi labor', ter: 'Mikroelektronika', ny: 3 }],
    palyazatok: [{ ki: 'NSF', pr: 'Global Centers', keret: '2,5 M USD', hat: '2026-10-15', rel: 'Magas' }],
    esemenyek: [{ n: 'SEMICON West', t: 'Szakkiállítás', d: '2026-07-07', rel: 'Magas' }],
    politika: { irany: 'Szigorító', kockazat: 'Közepes', megj: 'Az exportkontroll szigorítása közvetlenül érinti a félvezető-együttműködéseket, előzetes jogi átvilágítás szükséges.' },
    tanulsag: 'Amerikai konzorciumba csak intézményi partnerrel érdemes belépni; egyéni vállalati jelentkezés rendre elakad.',
  },
  {
    id: 2, attase: 'Halász Réka', orszag: 'Németország', geo: 'Germany', varos: 'Berlin', regio: 'Nyugat-Európa', lonlat: [13.4, 52.52], base: 4.2, riportok: 21, nyitott: 1, utolso: '2026-06-09',
    fokusz: ['Mobilitás és autonóm rendszerek', 'Anyagtudomány', 'Energetika és fenntarthatóság'],
    kf: 'Az ipari K+F lassul, az állami programok viszont az akkumulátor- és hidrogéntechnológia felé tolódnak.',
    intezmenyek: [{ n: 'Fraunhofer IZM', t: 'Alkalmazott kutatóintézet', ter: 'Elektronikai csomagolás', ny: 5 }, { n: 'RWTH Aachen', t: 'Egyetem', ter: 'Járműtechnika', ny: 4 }],
    palyazatok: [{ ki: 'BMBF', pr: '2+2 magyar–német call', keret: '1,5 M €', hat: '2026-09-30', rel: 'Magas' }],
    esemenyek: [{ n: 'Hannover Messe előkészítő', t: 'Workshop', d: '2026-09-18', rel: 'Közepes' }],
    politika: { irany: 'Semleges', kockazat: 'Alacsony', megj: 'Költségvetési viták miatt a kiírások csúszhatnak, a szakmai irány stabil.' },
    tanulsag: 'A 2+2 formátum (2 vállalat + 2 kutatóhely) a legjobb belépő – érdemes előre magyar párokat összeállítani.',
  },
  {
    id: 3, attase: 'Szabó Márton', orszag: 'Kína', geo: 'China', varos: 'Peking', regio: 'Kelet-Ázsia', lonlat: [116.4, 39.9], base: 3.4, riportok: 18, nyitott: 3, utolso: '2026-05-28',
    fokusz: ['Energetika és fenntarthatóság', 'Mesterséges intelligencia'],
    kf: 'Az akkumulátor- és napelemipari kutatás továbbra is dominál; a nemzetközi együttműködés adminisztratív úton lassul.',
    intezmenyek: [{ n: 'Tsinghua University', t: 'Egyetem', ter: 'Energiatárolás', ny: 3 }],
    palyazatok: [{ ki: 'MOST', pr: 'Bilaterális TéT alap', keret: '0,8 M USD', hat: '2026-11-20', rel: 'Közepes' }],
    esemenyek: [{ n: 'Zhongguancun Forum', t: 'Konferencia', d: '2026-10-12', rel: 'Közepes' }],
    politika: { irany: 'Szigorító', kockazat: 'Magas', megj: 'Adatkiviteli és kutatásbiztonsági szabályok szigorodnak; minden együttműködés előtt jogi ellenőrzés kell.' },
    tanulsag: 'A hivatalos kormányzati csatorna nélkül induló kapcsolat nem tartható fenn; a személyes jelenlét pótolhatatlan.',
  },
  {
    id: 4, attase: 'Tóth Bence', orszag: 'Japán', geo: 'Japan', varos: 'Tokió', regio: 'Kelet-Ázsia', lonlat: [139.69, 35.69], base: 4.0, riportok: 16, nyitott: 0, utolso: '2026-06-11',
    fokusz: ['Anyagtudomány', 'Mobilitás és autonóm rendszerek'],
    kf: 'A vállalati alapkutatás erős, az egyetemi nyitás lassú, de a JST programjai kifejezetten keresik az európai partnereket.',
    intezmenyek: [{ n: 'NIMS', t: 'Állami kutatóintézet', ter: 'Anyagtudomány', ny: 4 }, { n: 'AIST', t: 'Állami kutatóintézet', ter: 'Ipari technológia', ny: 3 }],
    palyazatok: [{ ki: 'JST', pr: 'SICORP EU-Japán', keret: '40 M JPY', hat: '2026-12-05', rel: 'Magas' }],
    esemenyek: [{ n: 'CEATEC', t: 'Szakkiállítás', d: '2026-10-20', rel: 'Közepes' }],
    politika: { irany: 'Nyitó', kockazat: 'Alacsony', megj: 'Kiszámítható szabályozás, hosszú előkészítési idővel kell számolni.' },
    tanulsag: 'A japán partnerek a harmadik találkozó után döntenek – a tempót nem érdemes sürgetni.',
  },
  {
    id: 5, attase: 'Farkas Judit', orszag: 'Koreai Köztársaság', geo: 'South Korea', varos: 'Szöul', regio: 'Kelet-Ázsia', lonlat: [126.98, 37.57], base: 3.8, riportok: 14, nyitott: 1, utolso: '2026-06-02',
    fokusz: ['Félvezetők és mikroelektronika', 'Digitális egészségügy'],
    kf: 'A félvezetőipari beszállítói lánc bővül, a kormány külön keretet nyitott a közép-európai partnerségekre.',
    intezmenyek: [{ n: 'KIST', t: 'Állami kutatóintézet', ter: 'Elektronika, egészségtechnológia', ny: 4 }],
    palyazatok: [{ ki: 'NRF', pr: 'Korea–V4 Joint Research', keret: '1,0 M USD', hat: '2026-09-15', rel: 'Magas' }],
    esemenyek: [{ n: 'K-Semicon Match', t: 'B2B esemény', d: '2026-08-26', rel: 'Magas' }],
    politika: { irany: 'Nyitó', kockazat: 'Alacsony', megj: 'Erős állami támogatás a beszállítói diverzifikációra.' },
    tanulsag: 'A V4-es közös fellépés érezhetően több figyelmet kap, mint az önálló magyar megjelenés.',
  },
  {
    id: 6, attase: 'Nagy Ádám', orszag: 'Izrael', geo: 'Israel', varos: 'Tel-Aviv', regio: 'Közel-Kelet', lonlat: [34.78, 32.08], base: 4.4, riportok: 22, nyitott: 1, utolso: '2026-06-16',
    fokusz: ['Digitális egészségügy', 'Mesterséges intelligencia'],
    kf: 'Sűrű startup-ökoszisztéma, a korai fázisú együttműködés gyors; az egyetemi transzferirodák döntési joga nagy.',
    intezmenyek: [{ n: 'Weizmann Institute', t: 'Kutatóintézet', ter: 'Élettudomány, AI', ny: 4 }, { n: 'Technion', t: 'Egyetem', ter: 'Mérnöki tudományok', ny: 5 }],
    palyazatok: [{ ki: 'Israel Innovation Authority', pr: 'Bilaterális ipari K+F', keret: '1,2 M USD', hat: '2026-08-31', rel: 'Magas' }],
    esemenyek: [{ n: 'DLD Tel Aviv', t: 'Konferencia', d: '2026-09-08', rel: 'Magas' }],
    politika: { irany: 'Semleges', kockazat: 'Közepes', megj: 'A regionális biztonsági helyzet miatt a delegációs programok rövid határidővel változhatnak.' },
    tanulsag: 'Itt a gyors döntés a belépő: kétheti válaszidő fölött a partner továbbáll.',
  },
  {
    id: 7, attase: 'Molnár Eszter', orszag: 'India', geo: 'India', varos: 'Újdelhi', regio: 'Dél-Ázsia', lonlat: [77.21, 28.61], base: 3.1, riportok: 11, nyitott: 2, utolso: '2026-04-30',
    fokusz: ['Agrár- és élelmiszertechnológia', 'Digitális egészségügy'],
    kf: 'Gyorsan bővülő állami kutatási keret, erősen árérzékeny piac; az agrártechnológia iránt konkrét érdeklődés van.',
    intezmenyek: [{ n: 'IIT Delhi', t: 'Egyetem', ter: 'Agrár- és vízgazdálkodás', ny: 3 }],
    palyazatok: [{ ki: 'DST', pr: 'India–Hungary TéT call', keret: '0,5 M USD', hat: '2026-10-31', rel: 'Közepes' }],
    esemenyek: [{ n: 'Bengaluru Tech Summit', t: 'Konferencia', d: '2026-11-18', rel: 'Közepes' }],
    politika: { irany: 'Nyitó', kockazat: 'Közepes', megj: 'Az engedélyeztetési folyamat hosszú, tartományi szinten nagyon eltérő.' },
    tanulsag: 'Tartományi szintre kell lebontani a célzást – országos megközelítéssel nem jutunk döntéshozóhoz.',
  },
  {
    id: 8, attase: 'Balogh Péter', orszag: 'Egyesült Királyság', geo: 'United Kingdom', varos: 'London', regio: 'Nyugat-Európa', lonlat: [-0.13, 51.51], base: 4.1, riportok: 19, nyitott: 0, utolso: '2026-06-12',
    fokusz: ['Kvantumtechnológia', 'Biotechnológia és élettudomány'],
    kf: 'A nemzeti kvantumprogram második szakasza indul, a Horizon-visszatérés után újra nyitottak az EU-s konzorciumok.',
    intezmenyek: [{ n: 'NPL', t: 'Állami kutatóintézet', ter: 'Kvantummetrológia', ny: 4 }, { n: 'Francis Crick Institute', t: 'Kutatóintézet', ter: 'Élettudomány', ny: 3 }],
    palyazatok: [{ ki: 'UKRI', pr: 'International Science Partnerships', keret: '1,8 M GBP', hat: '2026-09-22', rel: 'Magas' }],
    esemenyek: [{ n: 'Quantum.Tech London', t: 'Konferencia', d: '2026-09-29', rel: 'Magas' }],
    politika: { irany: 'Nyitó', kockazat: 'Alacsony', megj: 'Stabil szabályozás, a vízumeljárás viszont költséges a kutatói mobilitásnál.' },
    tanulsag: 'A brit pályázatokhoz brit vezető partner kell; magyar koordinációval nagyon alacsony a nyerési arány.',
  },
  {
    id: 9, attase: 'Varga Anna', orszag: 'Franciaország', geo: 'France', varos: 'Párizs', regio: 'Nyugat-Európa', lonlat: [2.35, 48.86], base: 3.6, riportok: 15, nyitott: 1, utolso: '2026-06-05',
    fokusz: ['Űrtechnológia', 'Energetika és fenntarthatóság'],
    kf: 'Az űripari beszállítói program és a nukleáris kutatás kapja a legnagyobb állami forrást.',
    intezmenyek: [{ n: 'CNES', t: 'Ügynökség / kutatóintézet', ter: 'Űrtechnológia', ny: 3 }, { n: 'CEA', t: 'Állami kutatóintézet', ter: 'Energetika', ny: 4 }],
    palyazatok: [{ ki: 'ANR', pr: 'PRCI nemzetközi projektek', keret: '0,9 M €', hat: '2026-10-08', rel: 'Közepes' }],
    esemenyek: [{ n: 'Space Tech Expo Europe', t: 'Szakkiállítás', d: '2026-11-17', rel: 'Magas' }],
    politika: { irany: 'Semleges', kockazat: 'Alacsony', megj: 'Erős nemzeti preferencia a beszállítói döntésekben.' },
    tanulsag: 'Francia nyelvű anyag nélkül a megkeresések nagy része megválaszolatlan marad.',
  },
  {
    id: 10, attase: 'Illés Gábor', orszag: 'Svájc', geo: 'Switzerland', varos: 'Bern', regio: 'Nyugat-Európa', lonlat: [7.45, 46.95], base: 4.3, riportok: 20, nyitott: 0, utolso: '2026-06-13',
    fokusz: ['Kvantumtechnológia', 'Anyagtudomány'],
    kf: 'Magas egy főre jutó K+F ráfordítás, az ETH-domén nyitott a strukturált intézményi partnerségre.',
    intezmenyek: [{ n: 'ETH Zürich', t: 'Egyetem', ter: 'Kvantumtechnológia', ny: 4 }, { n: 'EMPA', t: 'Kutatóintézet', ter: 'Anyagtudomány', ny: 5 }],
    palyazatok: [{ ki: 'SNSF', pr: 'Bilateral Programmes', keret: '0,7 M CHF', hat: '2026-12-01', rel: 'Közepes' }],
    esemenyek: [{ n: 'Swiss Quantum Days', t: 'Workshop', d: '2026-10-01', rel: 'Közepes' }],
    politika: { irany: 'Semleges', kockazat: 'Alacsony', megj: 'Az EU-s asszociációs tárgyalások kimenete határozza meg a közös projektek kereteit.' },
    tanulsag: 'Az intézményi MoU itt tényleg működik: az aláírás után érdemben gyorsul minden ügy.',
  },
  {
    id: 11, attase: 'Kiss Zsófia', orszag: 'Szingapúr', geo: 'Singapore', varos: 'Szingapúr', regio: 'Délkelet-Ázsia', lonlat: [103.82, 1.35], base: 3.9, riportok: 13, nyitott: 1, utolso: '2026-06-07',
    fokusz: ['Digitális egészségügy', 'Mesterséges intelligencia'],
    kf: 'Központilag tervezett, ötéves kutatási ciklus; regionális belépési kapu az egész ASEAN-piacra.',
    intezmenyek: [{ n: 'A*STAR', t: 'Állami kutatóintézet', ter: 'Biomedika, AI', ny: 4 }],
    palyazatok: [{ ki: 'A*STAR', pr: 'International Joint Labs', keret: '1,1 M SGD', hat: '2026-09-05', rel: 'Magas' }],
    esemenyek: [{ n: 'SWITCH Singapore', t: 'Konferencia', d: '2026-10-27', rel: 'Magas' }],
    politika: { irany: 'Nyitó', kockazat: 'Alacsony', megj: 'Kiszámítható, gyors adminisztráció; erős elvárás a mérhető eredményre.' },
    tanulsag: 'Regionális hubként érdemes kezelni: egy szingapúri partner négy-öt piacra nyit kaput.',
  },
  {
    id: 12, attase: 'Pintér Levente', orszag: 'Egyesült Arab Emírségek', geo: 'United Arab Emirates', varos: 'Abu-Dzabi', regio: 'Közel-Kelet', lonlat: [54.37, 24.45], base: 3.3, riportok: 10, nyitott: 2, utolso: '2026-05-21',
    fokusz: ['Energetika és fenntarthatóság', 'Űrtechnológia'],
    kf: 'Nagy állami beruházások a megújuló energiába és az űrprogramba; a kutatói bázis még épül.',
    intezmenyek: [{ n: 'Khalifa University', t: 'Egyetem', ter: 'Energetika, űrtechnológia', ny: 4 }],
    palyazatok: [{ ki: 'ASPIRE', pr: 'Research Challenge', keret: '2,0 M AED', hat: '2026-11-10', rel: 'Közepes' }],
    esemenyek: [{ n: 'ADIPEC', t: 'Szakkiállítás', d: '2026-11-02', rel: 'Közepes' }],
    politika: { irany: 'Nyitó', kockazat: 'Közepes', megj: 'A döntések személyközpontúak, a formális pályázati út mellett a közvetlen kapcsolat is szükséges.' },
    tanulsag: 'Enélkül nem megy: minden ügyet magas szintű személyes találkozó nyit meg, e-mailben nem indul el semmi.',
  },
  {
    id: 13, attase: 'Deák Orsolya', orszag: 'Törökország', geo: 'Turkey', varos: 'Ankara', regio: 'Közel-Kelet', lonlat: [32.86, 39.93], base: 2.9, riportok: 8, nyitott: 3, utolso: '2026-03-27',
    fokusz: ['Agrár- és élelmiszertechnológia', 'Mobilitás és autonóm rendszerek'],
    kf: 'Az ipari K+F a járműgyártás és az agrárfeldolgozás körül koncentrálódik, az egyetemi kapacitás egyenetlen.',
    intezmenyek: [{ n: 'TÜBITAK MAM', t: 'Állami kutatóintézet', ter: 'Élelmiszer- és anyagtechnológia', ny: 3 }],
    palyazatok: [{ ki: 'TÜBITAK', pr: '2509 bilaterális program', keret: '0,4 M USD', hat: '2026-10-20', rel: 'Közepes' }],
    esemenyek: [{ n: 'Teknofest', t: 'Rendezvény', d: '2026-09-12', rel: 'Alacsony' }],
    politika: { irany: 'Semleges', kockazat: 'Közepes', megj: 'Az árfolyam- és inflációs kockázat érdemben befolyásolja a projektköltségvetéseket.' },
    tanulsag: 'Devizában rögzített költségvetés nélkül a közös projekt év közben ellenőrizhetetlenné válik.',
  },
  {
    id: 14, attase: 'Fekete Tamás', orszag: 'Brazília', geo: 'Brazil', varos: 'São Paulo', regio: 'Latin-Amerika', lonlat: [-46.63, -23.55], base: 2.7, riportok: 7, nyitott: 1, utolso: '2026-03-12',
    fokusz: ['Agrár- és élelmiszertechnológia', 'Biotechnológia és élettudomány'],
    kf: 'Erős agrárkutatási bázis (EMBRAPA), a finanszírozás viszont ciklikus és tartományonként eltérő.',
    intezmenyek: [{ n: 'EMBRAPA', t: 'Állami kutatóintézet', ter: 'Agrárkutatás', ny: 4 }],
    palyazatok: [{ ki: 'FAPESP', pr: 'SPRINT nemzetközi', keret: '0,3 M BRL', hat: '2026-09-26', rel: 'Alacsony' }],
    esemenyek: [{ n: 'Agrishow előkészítő', t: 'Workshop', d: '2026-12-03', rel: 'Közepes' }],
    politika: { irany: 'Semleges', kockazat: 'Közepes', megj: 'A szövetségi és tartományi szabályozás eltér, a szerződéskötés hosszú.' },
    tanulsag: 'A tartományi ügynökségek (pl. FAPESP) gyorsabbak, mint a szövetségi csatorna – ott kell kezdeni.',
  },
];

export interface BlockDef {
  k: string; nev: string; hint: string; ph: string;
  selects?: { l: string; o: string[] }[];
  cols?: string[]; rowPh?: string[];
  chips?: boolean;
}
export const BLOCKS: BlockDef[] = [
  {
    k: 'kf', nev: 'K+F helyzetkép', hint: 'Az adott ország kutatás-fejlesztési helyzetének strukturált értékelése a ciklusban.',
    selects: [
      { l: 'K+F intenzitás trend', o: ['Növekvő', 'Stagnáló', 'Csökkenő'] },
      { l: 'Állami K+F prioritás', o: ['Kiemelt', 'Közepes', 'Alacsony'] },
      { l: 'Magyar jelenlét szintje', o: ['Erős', 'Kialakuló', 'Nincs'] },
    ],
    ph: 'Fő szereplők, K+F ráfordítás alakulása, változások az elmúlt ciklushoz képest.',
  },
  {
    k: 'int', nev: 'Ajánlott kutatóintézmények', hint: 'Konkrét intézmények, akikkel a NIÜ-nek érdemes felvennie a kapcsolatot.',
    cols: ['Intézmény', 'Típus', 'Terület', 'Nyitottság 1–5'], rowPh: ['pl. Fraunhofer IZM', 'Kutatóintézet', 'Mikroelektronika', '4'],
    ph: 'Miért ők, milyen belépési ponton és kinek a közvetítésével.',
  },
  {
    k: 'pal', nev: 'Pályázati és finanszírozási lehetőségek', hint: 'Nyitott vagy várható kiírások, magyar részvételi feltételekkel.',
    cols: ['Kiíró', 'Program', 'Keret', 'Határidő'], rowPh: ['pl. BMBF', '2+2 call', '1,5 M €', '2026-09-30'],
    ph: 'Részvételi feltételek, javasolt konzorciumi partnerek, előkészítési igény.',
  },
  {
    k: 'tech', nev: 'Technológiai fókuszterületek', hint: 'Mely területeken van reális magyar belépési pont az adott országban.',
    chips: true, ph: 'Miért ezek a területek, milyen magyar kapacitásra épülhet a belépés.',
  },
  {
    k: 'ev', nev: 'Események, workshopok, konferenciák', hint: 'Ciklusban releváns rendezvények, ahol magyar jelenlét indokolt.',
    cols: ['Esemény', 'Típus', 'Dátum', 'NIÜ-relevancia'], rowPh: ['pl. SEMICON West', 'Szakkiállítás', '2026-07-07', 'Magas'],
    ph: 'Javasolt magyar részvétel formája, várható kimenet.',
  },
  {
    k: 'pol', nev: 'Politikai és szabályozási környezet', hint: 'Amit a helyi politikáról és szabályozásról tudni kell a döntés előtt.',
    selects: [
      { l: 'Szabályozási irány', o: ['Nyitó', 'Semleges', 'Szigorító'] },
      { l: 'Kockázati szint', o: ['Alacsony', 'Közepes', 'Magas'] },
      { l: 'Változás valószínűsége 12 hónapon belül', o: ['Kicsi', 'Közepes', 'Nagy'] },
    ],
    ph: 'Konkrét szabályozási tételek, várható változások, ezek hatása a magyar szereplőkre.',
  },
  {
    k: 'tan', nev: 'Tanulási javaslatok', hint: 'Átadható tanulság: mit tegyen másképp a NIÜ vagy egy másik poszt.',
    selects: [
      { l: 'Javaslat típusa', o: ['Szakpolitikai', 'Intézményi', 'Vállalati', 'Finanszírozási'] },
      { l: 'Címzett', o: ['NIÜ vezetés', 'XPAND program', 'Szakmai főosztály', 'Másik TéT poszt'] },
      { l: 'Sürgősség', o: ['Azonnali', 'Ciklus közbeni', 'Következő ciklus'] },
    ],
    ph: 'Egy-két mondatban a tanulság, és hogy pontosan mit javasolsz.',
  },
];

export const TICKET_TYPES = ['Adatkérés', 'Feladatkiosztás', 'Riport-visszajelzés', 'Egyeztetés'];

export interface TicketMsg { ki: string; role: string; ido: string; own: boolean; txt: string }
export interface Ticket {
  id: string; targy: string; orszag: string; attase: string; tipus: string;
  prio: string; statusz: string; hatarido: string; nyitva: string; msgs: TicketMsg[];
}

export const TICKETS: Ticket[] = [
  {
    id: 'TKT-2041', targy: 'Félvezető-beszállítói lista pontosítása a koreai matchmakinghez', orszag: 'Koreai Köztársaság', attase: 'Farkas Judit', tipus: 'Adatkérés', prio: 'Magas', statusz: 'Válaszra vár', hatarido: '2026-08-28', nyitva: '6 napja',
    msgs: [
      { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: '08-19 09:12', own: true, txt: 'A K-Semicon Match előtt kérnénk egy szűkített listát: 8–10 koreai beszállító, akiknél reális a magyar belépés. A CRM-ben lévő 34 kontaktból melyik a valóban aktív?' },
      { ki: 'Farkas Judit', role: 'TéT · Szöul', ido: '08-20 14:40', own: false, txt: 'A 34-ből 11 aktív, ebből 8-nál volt idén személyes találkozó. A listát a riport 2. blokkjához csatolom, hogy az aggregált kimutatásban is látszódjon.' },
      { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: '08-24 11:05', own: true, txt: 'Rendben. Kérlek, a nyitottsági pontszámot is tedd mellé, mert a delegációs sorrendet ez alapján állítjuk.' },
    ],
  },
  {
    id: 'TKT-2038', targy: '2026 Q2 riport 3. és 5. blokkja hiányos', orszag: 'Törökország', attase: 'Deák Orsolya', tipus: 'Riport-visszajelzés', prio: 'Magas', statusz: 'Nyitott', hatarido: '2026-08-30', nyitva: '9 napja',
    msgs: [
      { ki: 'Barna Gergő', role: 'NIÜ · Riportkezelés', ido: '08-16 10:02', own: true, txt: 'A beadott riportból hiányzik a pályázati és az esemény blokk. A TÜBITAK 2509 határidejét mindenképp rögzítsd, mert az aggregált kimutatásba ez kerül be.' },
    ],
  },
  {
    id: 'TKT-2035', targy: 'Exportkontroll hatása a NIST-együttműködésre – jogi állásfoglalás', orszag: 'Amerikai Egyesült Államok', attase: 'Kovács Dániel', tipus: 'Egyeztetés', prio: 'Közepes', statusz: 'Folyamatban', hatarido: '2026-09-04', nyitva: '12 napja',
    msgs: [
      { ki: 'Kovács Dániel', role: 'TéT · Washington', ido: '08-13 16:30', own: false, txt: 'A NIST-tel tervezett közös mérési projektnél az új exportkontroll-lista érintheti a mérőeszközök kivitelét. Kérek jogi állásfoglalást, mielőtt aláírjuk az MoU-t.' },
      { ki: 'Halmi Réka', role: 'NIÜ · Jogi', ido: '08-18 09:44', own: true, txt: 'Átnéztük, a mérésügyi rész nem érintett, a félvezető-tesztberendezések viszont igen. A szűkített MoU-tervezetet küldjük a héten.' },
    ],
  },
  {
    id: 'TKT-2030', targy: 'Delegációs program véglegesítése – Abu-Dzabi, ADIPEC', orszag: 'Egyesült Arab Emírségek', attase: 'Pintér Levente', tipus: 'Feladatkiosztás', prio: 'Közepes', statusz: 'Folyamatban', hatarido: '2026-09-12', nyitva: '15 napja',
    msgs: [
      { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: '08-10 13:20', own: true, txt: 'Hat magyar cég jelezte a részvételt. Kérem a helyszíni program vázlatát, három B2B blokkal.' },
      { ki: 'Pintér Levente', role: 'TéT · Abu-Dzabi', ido: '08-14 08:05', own: false, txt: 'Két blokk biztos, a harmadikhoz a Khalifa University visszajelzésére várok. A delegációs jelentést eseményenként töltöm majd.' },
    ],
  },
  {
    id: 'TKT-2026', targy: 'Kvantum-workshop közös szervezése Bernnel és Londonnal', orszag: 'Svájc', attase: 'Illés Gábor', tipus: 'Egyeztetés', prio: 'Alacsony', statusz: 'Nyitott', hatarido: '2026-10-01', nyitva: '21 napja',
    msgs: [
      { ki: 'Illés Gábor', role: 'TéT · Bern', ido: '08-04 11:15', own: false, txt: 'Az EMPA és az NPL is nyitott egy közös őszi workshopra. Balogh Péterrel egyeztetünk, de kellene egy NIÜ-oldali költségkeret.' },
    ],
  },
  {
    id: 'TKT-2019', targy: 'Havi információmegosztás elmaradása – Q2', orszag: 'Brazília', attase: 'Fekete Tamás', tipus: 'Riport-visszajelzés', prio: 'Magas', statusz: 'Nyitott', hatarido: '2026-08-29', nyitva: '25 napja',
    msgs: [
      { ki: 'Barna Gergő', role: 'NIÜ · Riportkezelés', ido: '07-31 15:50', own: true, txt: 'A 4. szempont (információmegosztás rendszeressége) havi adatbevitel, három hónapja nincs rögzítés. Kérem a pótlást, különben a monitoringban automatikusan 1-es pont kerül be.' },
    ],
  },
  {
    id: 'TKT-2012', targy: 'India: tartományi célzás – melyik három államra fókuszáljunk?', orszag: 'India', attase: 'Molnár Eszter', tipus: 'Adatkérés', prio: 'Közepes', statusz: 'Lezárt', hatarido: '2026-08-01', nyitva: 'lezárva 08-06',
    msgs: [
      { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: '07-22 10:00', own: true, txt: 'Az agrártechnológiai fókuszhoz kérünk három javasolt tartományt, indoklással.' },
      { ki: 'Molnár Eszter', role: 'TéT · Újdelhi', ido: '07-29 07:35', own: false, txt: 'Maharashtra, Gujarat és Telangana. Mindháromnál van működő tartományi innovációs ügynökség és konkrét vízgazdálkodási igény.' },
      { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: '08-06 09:10', own: true, txt: 'Elfogadva, bekerült a Q3 tervbe. Lezárom a ticketet.' },
    ],
  },
];

export const CYCLES = ['2025 Q4', '2026 Q1', '2026 Q2', '2026 Q3'];
export const DEFAULT_CYCLE = '2026 Q2';
export const DEADLINE = '2026-08-31';
export const SCORE_THRESHOLD = 3.5;
export const ME_ID = 5; // attasé nézetben: Farkas Judit (Szöul)

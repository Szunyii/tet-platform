// Demóadatok a TéT Platform doksiból (14 poszt, 3 kategória, 14 szempont) – csak a /monitoring használja.

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

export interface Post { id: number; attase: string; orszag: string; base: number }

export const POSTS: Post[] = [
  { id: 1, attase: 'Kovács Dániel', orszag: 'Amerikai Egyesült Államok', base: 4.5 },
  { id: 2, attase: 'Halász Réka', orszag: 'Németország', base: 4.2 },
  { id: 3, attase: 'Szabó Márton', orszag: 'Kína', base: 3.4 },
  { id: 4, attase: 'Tóth Bence', orszag: 'Japán', base: 4.0 },
  { id: 5, attase: 'Farkas Judit', orszag: 'Koreai Köztársaság', base: 3.8 },
  { id: 6, attase: 'Nagy Ádám', orszag: 'Izrael', base: 4.4 },
  { id: 7, attase: 'Molnár Eszter', orszag: 'India', base: 3.1 },
  { id: 8, attase: 'Balogh Péter', orszag: 'Egyesült Királyság', base: 4.1 },
  { id: 9, attase: 'Varga Anna', orszag: 'Franciaország', base: 3.6 },
  { id: 10, attase: 'Illés Gábor', orszag: 'Svájc', base: 4.3 },
  { id: 11, attase: 'Kiss Zsófia', orszag: 'Szingapúr', base: 3.9 },
  { id: 12, attase: 'Pintér Levente', orszag: 'Egyesült Arab Emírségek', base: 3.3 },
  { id: 13, attase: 'Deák Orsolya', orszag: 'Törökország', base: 2.9 },
  { id: 14, attase: 'Fekete Tamás', orszag: 'Brazília', base: 2.7 },
];

export const SCORE_THRESHOLD = 3.5;

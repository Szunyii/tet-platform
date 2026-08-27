// Tudástár demóadatok: Magyarországról ajánlható programok, partnerek és együttműködési formák.
// Minden tartalom dummy demóadat, a lib/data.ts-hez hasonlóan.

export type KbSection = 'program' | 'okoszisztema' | 'egyuttmukodes';

export interface KbSectionMeta {
  id: KbSection;
  nev: string;
  leiras: string;
  color: string;
}

export const KB_SECTIONS: KbSectionMeta[] = [
  {
    id: 'program',
    nev: 'Magyar programok és ajánlatok',
    leiras: 'Amit a TéT attasé a helyszínen konkrétan felajánlhat a partnernek',
    color: '#1f4e9c',
  },
  {
    id: 'okoszisztema',
    nev: 'Magyar innovációs ökoszisztéma',
    leiras: 'Kikkel lehet Magyarországon együttműködni – intézmények, hálózatok, cégek',
    color: '#0f7a68',
  },
  {
    id: 'egyuttmukodes',
    nev: 'Együttműködési formák',
    leiras: 'Milyen konstrukcióban valósulhat meg az együttműködés – lépések és buktatók',
    color: '#6b46c1',
  },
];

export interface KbMeta { l: string; v: string }

export interface KbItem {
  id: string;
  sekcio: KbSection;
  nev: string;
  gazda: string;
  kinek: string;
  mit: string;
  meta: KbMeta[];
  teruletek: string[];
  kapcsolat: string;
}

export const KB_ITEMS: KbItem[] = [
  // ---------- Magyar programok és ajánlatok ----------
  {
    id: 'xpand',
    sekcio: 'program',
    nev: 'XPAND Piacra lépési Program',
    gazda: 'NIÜ',
    kinek: 'Exportra kész magyar KKV-k és scale-upok, illetve a helyi partner, aki magyar beszállítót keres.',
    mit: 'Piackutatás, Go tréning, helyi mentorhálózat, B2B matchmaking és side eventek a célpiacon, a TéT attasé helyszíni támogatásával.',
    meta: [
      { l: 'Forma', v: 'Programrészvétel (nem vissza nem térítendő támogatás)' },
      { l: 'Ciklus', v: 'Évi 2 kohorsz, tavaszi és őszi indulás' },
      { l: 'Jelentkezés', v: '2026-09-30' },
    ],
    teruletek: ['Mesterséges intelligencia', 'Digitális egészségügy', 'Energetika és fenntarthatóság'],
    kapcsolat: 'NIÜ XPAND programiroda',
  },
  {
    id: 'niu-kf',
    sekcio: 'program',
    nev: 'NIÜ K+F+I pályázatok',
    gazda: 'NIÜ / Kulturális és Innovációs Minisztérium',
    kinek: 'Magyarországon bejegyzett vállalkozás vagy kutatóhely; külföldi fél konzorciumi partnerként.',
    mit: 'Vissza nem térítendő támogatás vállalati K+F projektekre, prototípus-fejlesztésre és piaci bevezetésre.',
    meta: [
      { l: 'Keret', v: '50–800 M HUF / projekt' },
      { l: 'Önerő', v: 'Vállalatméret szerint 25–50%' },
      { l: 'Beadás', v: 'Folyamatos, keretkimerülésig' },
    ],
    teruletek: ['Biotechnológia és élettudomány', 'Anyagtudomány', 'Félvezetők és mikroelektronika'],
    kapcsolat: 'NIÜ pályázatkezelési igazgatóság',
  },
  {
    id: 'ket-oldalu-tet',
    sekcio: 'program',
    nev: 'Kétoldalú TéT pályázatok',
    gazda: 'NIÜ – partnerország innovációs ügynöksége',
    kinek: 'Magyar és partnerországi kutatócsoportok párban; kötelező a kétoldalú konzorcium.',
    mit: 'Mobilitási és közös kutatási támogatás: utazás, szállás, kisebb kutatási költségek 2 éves projektciklusban.',
    meta: [
      { l: 'Keret', v: '6–12 M HUF / magyar fél / 2 év' },
      { l: 'Feltétel', v: 'Mindkét fél a saját ügynökségénél pályázik' },
      { l: 'Következő kiírás', v: '2026-11-15' },
    ],
    teruletek: ['Kvantumtechnológia', 'Anyagtudomány', 'Agrár- és élelmiszertechnológia'],
    kapcsolat: 'NIÜ nemzetközi kapcsolatok',
  },
  {
    id: 'kf-adokedvezmeny',
    sekcio: 'program',
    nev: 'K+F adókedvezmény és beruházási ösztönzők',
    gazda: 'Nemzetgazdasági Minisztérium',
    kinek: 'Magyarországon K+F tevékenységet vagy leányvállalatot indító külföldi vállalat.',
    mit: 'A K+F ráfordítás adóalap-kedvezménye, kutatói bérköltség-kedvezmény és egyedi kormánydöntéses beruházási támogatás nagyobb projekteknél.',
    meta: [
      { l: 'Forma', v: 'Adókedvezmény + készpénzes támogatás' },
      { l: 'Küszöb', v: 'Egyedi döntéshez jellemzően 10 M EUR beruházás felett' },
      { l: 'Átfutás', v: '3–6 hónap' },
    ],
    teruletek: ['Félvezetők és mikroelektronika', 'Mobilitás és autonóm rendszerek', 'Energetika és fenntarthatóság'],
    kapcsolat: 'HIPA befektetésösztönzési tanácsadó',
  },
  {
    id: 'inkubacio',
    sekcio: 'program',
    nev: 'Startup inkubáció és soft landing',
    gazda: 'NIÜ akkreditált inkubátorhálózat',
    kinek: 'Korai fázisú külföldi startup, amely magyarországi jelenlétet vagy régiós belépőt keres.',
    mit: 'Inkubációs férőhely, mentorprogram, befektetői kapcsolatok és 3 hónapos soft landing csomag Budapesten.',
    meta: [
      { l: 'Forma', v: 'Inkubációs szerződés, opcionális magvető tőke' },
      { l: 'Magvető tőke', v: 'akár 150 000 EUR' },
      { l: 'Felvétel', v: 'Negyedéves szelekció' },
    ],
    teruletek: ['Mesterséges intelligencia', 'Digitális egészségügy', 'Mobilitás és autonóm rendszerek'],
    kapcsolat: 'NIÜ startup ökoszisztéma csoport',
  },
  {
    id: 'delegacio-tamogatas',
    sekcio: 'program',
    nev: 'Delegációs és kiállítási támogatás',
    gazda: 'NIÜ',
    kinek: 'Magyar cégcsoportok és intézmények, akik célpiaci kiállításon vagy üzleti misszión vennének részt.',
    mit: 'Közös magyar stand, delegációs program szervezése, helyszíni tolmács és protokoll, a TéT attasé által előkészített B2B naptárral.',
    meta: [
      { l: 'Forma', v: 'Természetbeni támogatás (szervezés + stand)' },
      { l: 'Előkészítés', v: 'Legalább 4 hónap a rendezvény előtt' },
      { l: 'Kapacitás', v: '6–10 cég / delegáció' },
    ],
    teruletek: ['Agrár- és élelmiszertechnológia', 'Űrtechnológia', 'Energetika és fenntarthatóság'],
    kapcsolat: 'NIÜ rendezvényszervezés',
  },

  // ---------- Magyar innovációs ökoszisztéma ----------
  {
    id: 'hun-ren',
    sekcio: 'okoszisztema',
    nev: 'HUN-REN Magyar Kutatási Hálózat',
    gazda: 'Állami kutatóhálózat',
    kinek: 'Alapkutatási és alkalmazott kutatási partnert kereső egyetemek, intézetek és vállalati K+F egységek.',
    mit: 'Mintegy 150 kutatócsoport 11 kutatóközpontban; közös projektek, vendégkutatói program és nagyműszeres infrastruktúra-hozzáférés.',
    meta: [
      { l: 'Típus', v: 'Állami kutatóhálózat' },
      { l: 'Nyitottság', v: '5/5 – aktívan keres nemzetközi partnert' },
      { l: 'Belépés', v: 'Intézményi együttműködési megállapodás' },
    ],
    teruletek: ['Biotechnológia és élettudomány', 'Anyagtudomány', 'Kvantumtechnológia'],
    kapcsolat: 'HUN-REN nemzetközi iroda',
  },
  {
    id: 'bme',
    sekcio: 'okoszisztema',
    nev: 'Budapesti Műszaki és Gazdaságtudományi Egyetem',
    gazda: 'Egyetem',
    kinek: 'Mérnöki fejlesztéshez, közös laborhoz vagy duális képzéshez partnert kereső vállalatok.',
    mit: 'Ipari tanszékek, közös vállalati laborok, mikroelektronikai és járműipari tesztkörnyezet, hallgatói projektcsapatok.',
    meta: [
      { l: 'Típus', v: 'Műszaki egyetem' },
      { l: 'Nyitottság', v: '4/5' },
      { l: 'Tipikus forma', v: 'Ipari tanszék vagy megbízásos kutatás' },
    ],
    teruletek: ['Félvezetők és mikroelektronika', 'Mobilitás és autonóm rendszerek', 'Anyagtudomány'],
    kapcsolat: 'BME Tudás- és Technológiatranszfer Iroda',
  },
  {
    id: 'szte-elte',
    sekcio: 'okoszisztema',
    nev: 'SZTE és ELTE élettudományi műhelyek',
    gazda: 'Egyetemek',
    kinek: 'Gyógyszer-, diagnosztikai és biotechnológiai fejlesztésben gondolkodó partnerek.',
    mit: 'Szegedi biotechnológiai és lézeres kutatási bázis, ELTE bioinformatikai és adatelemzési kapacitás, klinikai kutatási hozzáférés.',
    meta: [
      { l: 'Típus', v: 'Egyetemi kutatóközpontok' },
      { l: 'Nyitottság', v: '4/5' },
      { l: 'Tipikus forma', v: 'Közös publikáció, licenc, klinikai együttműködés' },
    ],
    teruletek: ['Biotechnológia és élettudomány', 'Digitális egészségügy'],
    kapcsolat: 'SZTE / ELTE innovációs igazgatóság',
  },
  {
    id: 'klaszterek',
    sekcio: 'okoszisztema',
    nev: 'Technológiai klaszterek és science parkok',
    gazda: 'Klaszterszervezetek',
    kinek: 'Beszállítói hálózatot vagy régiós telephelyet kereső vállalatok.',
    mit: 'Járműipari, elektronikai, agrár- és egészségipari klaszterek Győr, Debrecen, Szeged és Miskolc térségében; iparipark-kapacitás és beszállítói adatbázis.',
    meta: [
      { l: 'Típus', v: 'Klaszter / ipari park' },
      { l: 'Nyitottság', v: '4/5' },
      { l: 'Belépés', v: 'Klasztertagság vagy egyedi bemutatkozás' },
    ],
    teruletek: ['Mobilitás és autonóm rendszerek', 'Agrár- és élelmiszertechnológia', 'Energetika és fenntarthatóság'],
    kapcsolat: 'NIÜ regionális kapcsolattartó',
  },
  {
    id: 'deep-tech-cegek',
    sekcio: 'okoszisztema',
    nev: 'Kiemelt magyar deep tech vállalatok',
    gazda: 'Vállalati kör',
    kinek: 'Technológiai beszállítót, közös fejlesztőt vagy licencpartnert kereső külföldi cégek.',
    mit: 'Referencialista kvantumszoftver, űripari alkatrész, ipari AI és orvostechnikai területről, felkészített angol nyelvű cégprofilokkal.',
    meta: [
      { l: 'Típus', v: 'Vállalati referencia-adatbázis' },
      { l: 'Frissítés', v: 'Félévente' },
      { l: 'Anyag', v: 'Kétoldalas cégprofil, angol' },
    ],
    teruletek: ['Kvantumtechnológia', 'Űrtechnológia', 'Mesterséges intelligencia'],
    kapcsolat: 'NIÜ vállalati kapcsolatok',
  },
  {
    id: 'tesztkornyezetek',
    sekcio: 'okoszisztema',
    nev: 'Tesztkörnyezetek és nagyműszeres infrastruktúra',
    gazda: 'Intézményi konzorciumok',
    kinek: 'Validációra, mérésre vagy pilotra infrastruktúrát kereső fejlesztők.',
    mit: 'Járműipari tesztpálya, szuperszámítógépes kapacitás, lézeres kutatóinfrastruktúra és agrár-kísérleti telepek nyitott hozzáféréssel.',
    meta: [
      { l: 'Típus', v: 'Kutatási infrastruktúra' },
      { l: 'Hozzáférés', v: 'Pályázatos vagy térítéses' },
      { l: 'Átfutás', v: '1–3 hónap ütemezés' },
    ],
    teruletek: ['Mobilitás és autonóm rendszerek', 'Mesterséges intelligencia', 'Agrár- és élelmiszertechnológia'],
    kapcsolat: 'NIÜ infrastruktúra-koordináció',
  },

  // ---------- Együttműködési formák ----------
  {
    id: 'kozos-kf',
    sekcio: 'egyuttmukodes',
    nev: 'Közös K+F projekt',
    gazda: 'Együttműködési forma',
    kinek: 'Két vagy több fél, akik egy konkrét technológiai problémán dolgoznának együtt.',
    mit: 'Lépések: szándéknyilatkozat → munkaterv és költségvetés → IP-megállapodás → finanszírozás (kétoldalú TéT vagy NIÜ K+F pályázat) → indulás.',
    meta: [
      { l: 'Átfutás', v: '6–12 hónap az indulásig' },
      { l: 'Buktató', v: 'A szellemi tulajdon megosztását a pályázat beadása ELŐTT kell rendezni' },
      { l: 'Kritikus dokumentum', v: 'Consortium Agreement' },
    ],
    teruletek: ['Mesterséges intelligencia', 'Biotechnológia és élettudomány', 'Anyagtudomány'],
    kapcsolat: 'NIÜ projektkoordináció',
  },
  {
    id: 'licenc',
    sekcio: 'egyuttmukodes',
    nev: 'Licenc és technológiatranszfer',
    gazda: 'Együttműködési forma',
    kinek: 'Kész, védett technológiát átvenni vagy átadni kívánó felek.',
    mit: 'Lépések: technológiai adatlap → due diligence → értékelés → licencszerződés (területi és iparági kizárólagosság tisztázásával).',
    meta: [
      { l: 'Átfutás', v: '3–9 hónap' },
      { l: 'Buktató', v: 'Egyetemi találmánynál az intézményi TTO jóváhagyása kötelező' },
      { l: 'Kritikus dokumentum', v: 'Titoktartási szerződés (NDA) az első érdemi tárgyalás előtt' },
    ],
    teruletek: ['Félvezetők és mikroelektronika', 'Digitális egészségügy', 'Anyagtudomány'],
    kapcsolat: 'Intézményi technológiatranszfer iroda',
  },
  {
    id: 'delegacio-forma',
    sekcio: 'egyuttmukodes',
    nev: 'Delegáció és tanulmányút',
    gazda: 'Együttműködési forma',
    kinek: 'Intézményi vagy vállalati csoportok az első, felderítő fázisban.',
    mit: 'Lépések: célok és résztvevői kör rögzítése → attasé által előkészített program → helyszíni látogatások → utókövetés 30 napon belül.',
    meta: [
      { l: 'Átfutás', v: '3–4 hónap előkészítés' },
      { l: 'Buktató', v: 'Utókövetés nélkül a delegációk 70%-a nem hoz megállapodást' },
      { l: 'Kritikus dokumentum', v: 'Delegációs jelentés és feladatlista' },
    ],
    teruletek: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszertechnológia', 'Űrtechnológia'],
    kapcsolat: 'TéT attasé + NIÜ rendezvényszervezés',
  },
  {
    id: 'matchmaking',
    sekcio: 'egyuttmukodes',
    nev: 'B2B matchmaking és partnerkeresés',
    gazda: 'Együttműködési forma',
    kinek: 'Konkrét beszállítót, ügyfelet vagy fejlesztőpartnert kereső cégek.',
    mit: 'Lépések: igényprofil felvétele → szűrt partnerlista → előminősítő hívások → helyszíni vagy online B2B találkozók → CRM-ben rögzített utókövetés.',
    meta: [
      { l: 'Átfutás', v: '4–8 hét' },
      { l: 'Buktató', v: 'Túl tág igényprofil esetén a találkozók nagy része érdemi folytatás nélkül marad' },
      { l: 'Kritikus dokumentum', v: 'Egyoldalas, angol nyelvű cégprofil' },
    ],
    teruletek: ['Mesterséges intelligencia', 'Mobilitás és autonóm rendszerek', 'Digitális egészségügy'],
    kapcsolat: 'NIÜ XPAND programiroda',
  },
  {
    id: 'horizon',
    sekcio: 'egyuttmukodes',
    nev: 'Horizon Europe konzorcium',
    gazda: 'Együttműködési forma',
    kinek: 'Kutatóhelyek és vállalatok, akik uniós keretprogramban vennének részt.',
    mit: 'Lépések: releváns call kiválasztása → koordinátor vagy partneri szerep tisztázása → konzorciumépítés → beadás → grant agreement.',
    meta: [
      { l: 'Átfutás', v: '9–15 hónap a beadástól a szerződésig' },
      { l: 'Buktató', v: 'Magyar fél későn, kitöltött konzorciumba érkezik – 6 hónappal a deadline előtt kell belépni' },
      { l: 'Kritikus dokumentum', v: 'Partner Search profil és PIC-regisztráció' },
    ],
    teruletek: ['Kvantumtechnológia', 'Energetika és fenntarthatóság', 'Űrtechnológia'],
    kapcsolat: 'NIÜ Nemzeti Kapcsolattartói (NCP) hálózat',
  },
];

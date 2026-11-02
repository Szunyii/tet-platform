/**
 * 3. Innovációs szolgáltatások és vállalkozásfejlesztés – a TéT Tudástár kezdő tartalma.
 *
 * Források (lekérve: 2026-11-02):
 * - NIÜ, főoldal (kiemelt szolgáltatások, hírek, elérhetőségek): https://niu.hu/
 * - NIÜ, Misszió: https://niu.hu/pages/rolunk ; Impresszum: https://niu.hu/pages/impresszum
 * - NIÜ, szolgáltatásoldalak: https://niu.hu/service/xpand-program, …/enterprise-horizon, …/hsup-doctorate,
 *   …/hsup-growth-fund, …/startup-rendezvenyek-tamogatasa-rendezvenytamogatasi-program-2026, …/innovacios-voucher-program,
 *   …/mentoralasi-szolgaltatas, …/projektfejlesztesi-szolgaltatas, …/minositett-innovacios-tanacsadok,
 *   …/teruleti-innovacios-platform, …/innovacios-trening
 * - NIÜ, projektoldalak: https://niu.hu/project/hungarian-startup-university-program, …/science-park-projekt,
 *   …/technology-transfer-company-ttc-projekt, …/kfi-okoszisztema-fejlesztese,
 *   …/vallalkozasok-innovacios-tevekenysegenek-tamogatasa-2024-1-3-1-ak-innov-2024-00002
 * - NIÜ, Hungarian Startup Ecosystem portál: https://startup.niu.hu/
 * - NKFIH, A NIÜ bemutatása: https://nkfih.gov.hu/palyazoknak/innovacios-okoszisztema/nemzeti-innovacios-ugynokseg/ugynokseg-bemutatasa
 * - NKFIH, Startup Factory (2023-1.1.3-STARTUP) támogatott projektjei (mód. 2023. 12. 20.):
 *   https://nkfih.gov.hu/english/nrdi-fund/startup-factory-2023-113-startup
 * - NKFIH, 2026-1.1.2-TTC felhívás: https://nkfih.gov.hu/palyazoknak/nkfi-alap/technologia-transzfer-vallalatok-halozatanak-fejlesztese-2026-112-ttc/palyazati-felhivas
 * - 2/2026. (IX. 21.) TTM utasítás (SZMSZ): https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N – NIÜ szakmai felügyelete,
 *   Innovációs és Startup Főosztály (kapcsolattartás kamarákkal, szövetségekkel, inkubátorokkal, akcelerátorokkal)
 * - 90/2026. (V. 13.) Korm. rendelet: https://njt.jog.gov.hu/jogszabaly/2026-90-20-22 – 75. § 15. pont, 82. § (vállalkozásfejlesztés)
 * - kormany.hu, TTM közlemények: https://kormany.hu/hirek/innovacios-voucher-program (2026. 09. 02.),
 *   https://kormany.hu/hirek/uj-program-a-doktoranduszoknak (2026. 08. 31.),
 *   https://kormany.hu/hirek/hild-imre-lett-a-nemzeti-innovacios-ugynokseg-uj-megbizott-vezerigazgatoja (2026. 10. 28.)
 * - MGFÜ: https://mgfu.hu/hu/page/about-us ; https://mgfu.hu/hu/page/contact ; https://mgfu.hu/hu/page/modem4
 * - MKIK: https://mkik.hu/ ; IVSZ: https://ivsz.hu/ ; Magyar Innovációs Szövetség: https://innovacio.hu/
 * - Inkubátorok saját oldala: https://www.startupcampus.hu/ ; https://creativeaccelerator.hu/ ; https://www.whiteunicorn.hu/ ;
 *   https://nesprit.vc/
 * - Klaszterek saját oldala: https://pharmapolis.unideb.hu/ ; https://nohac.hu/ ; https://www.archenerg.eu/
 * - European Cluster Collaboration Platform (Európai Bizottság, EISMEA): https://www.clustercollaboration.eu/
 *
 * ELLENŐRIZENDŐ:
 * - A NIÜ központi telefonszáma (a honlap csak e-mail-címet és címet közöl), és az új vezérigazgató kiválasztása (az NKFIH
 *   2026. október 30-án írt ki pályázatot; addig megbízott vezérigazgató vezeti).
 * - A Startup Factory 2023 inkubátorainak jelenlegi működése (a projektek 2024–2026-ra szólnak); a Lunar Program, a Virgo
 *   Ventures, az Első Közép-Európai Hardver Akcelerátor, a STRT Invest, a BNL Start Partners, az OXO Labs és a GUKA Energetikai
 *   saját honlapját nem azonosítottam biztosan, ezért ezek a sorok link nélkül szerepelnek.
 * - A hazai klaszterminősítés aktuális rendszere és a minősített klaszterek hivatalos listája (hivatalos, olvasható forrást
 *   nem találtam); a klaszterlista ezért csak szemléltető.
 * - A Magyar Exportfejlesztési Ügynökség (HEPA) és a Nemzeti Befektetési Ügynökség (HIPA) jelenlegi neve, felügyelete és
 *   honlapja (a lekérés nem sikerült) – ha igazolható, a vállalkozásfejlesztési listára kerülhetnek.
 * - A 2026-1.1.2-TTC felhívás eredménye, illetve a NIÜ TTC- és Science Park-projektjének folytatása 2026 után.
 */
import type { ForrasKategoria } from './tipusok';

const STARTUP_FACTORY = 'https://nkfih.gov.hu/english/nrdi-fund/startup-factory-2023-113-startup';

const kategoria: ForrasKategoria = {
  leiras: 'A Nemzeti Innovációs Ügynökség programjai, vállalkozásfejlesztési szervezetek, inkubátorok, klaszterek.',
  bevezeto:
    'Az innovatív vállalkozásokat és startupokat segítő szervezetek: a Nemzeti Innovációs Ügynökség (NIÜ) és programjai, az országos vállalkozásfejlesztési szervezetek, az állami inkubátorprogramban támogatott inkubátorok, a klaszterek és a startup- és technológiai szervezetek. Az attasé itt találja meg, hová irányíthat egy külföldi startupot, akcelerátort vagy befektetőt, és milyen programokkal jut ki a magyar startup a fogadó ország piacára. A vállalati innovációs központokról és nyílt innovációs programokról bővebben a 8. kategória szól.',
  kartyak: [
    {
      slug: 'niu',
      tipus: 'intezmeny',
      nev: 'Nemzeti Innovációs Ügynökség',
      rovidites: 'NIÜ',
      osszefoglalo:
        'Az innovációs ökoszisztéma szereplőivel folyamatos kapcsolatot tartó állami ügynökség: az NKFI Hivatal finanszírozói munkáját egészíti ki. Startupoknak, kkv-knak, hallgatóknak és kutatóknak kínál képzést, mentorálást, külpiaci és Horizont Európa-felkészítést, és működteti a hazai startup-ökoszisztéma portálját. Tulajdonosi joggyakorlója az NKFI Hivatal, szakmai felügyeletét a Tudományos és Technológiai Minisztérium látja el.',
      honlap: 'https://niu.hu/',
      profil:
        'A Nemzeti Innovációs Ügynökség Nonprofit Zrt. célja Magyarország innovációs képességének erősítése: támogatást nyújt az innovációs ökoszisztéma változó szükségleteire, kapcsolatot teremt a szereplők között, és terjeszti az innovációs kultúrát. Fő céljai:\n' +
        '- az innovatív vállalkozói és kutatói utánpótlás erősítése;\n' +
        '- az innovatív vállalatok és startupok hazai és külpiacra jutásának támogatása;\n' +
        '- az innováció kultúrájának megteremtése és az ökoszisztéma nemzetközi láthatóságának növelése.\n\n' +
        'Az NKFI Hivatal bemutatása szerint az ügynökség azért jött létre, hogy a finanszírozó hivatal munkáját az ökoszisztémával aktív kapcsolatot ápoló ügynökségként egészítse ki; segít az innovátoroknak eligazodni a támogató szervezetek és források között, és adatalapú információt ad az ökoszisztémáról.\n\n' +
        'Tulajdonosi joggyakorlója az NKFI Hivatal; a TTM SZMSZ-e szerint felette a szakmai felügyeletet a tudománypolitikai és innovációs államtitkár gyakorolja. 2026 októberében vezetőváltás történt: a végleges vezérigazgató kiválasztásáig megbízott vezérigazgató irányítja.',
      tevekenyseg:
        'Oktatás és utánpótlás:\n' +
        '- Hungarian Startup University Program (HSUP) egyetemi hallgatóknak, HSUP Doctorate doktoranduszoknak;\n' +
        '- Selye János Diáklabor-hálózat és MTMI Innovációs Műhely az általános és középiskolásoknak.\n\n' +
        'Startupok és kkv-k:\n' +
        '- XPAND külpiaci program és Enterprise Horizon Horizont Európa-felkészítés;\n' +
        '- Innovációs Voucher Program, mentorálás, projektfejlesztési szolgáltatás, innovációs tréning, minősített innovációs tanácsadók adatbázisa.\n\n' +
        'Ökoszisztéma és technológiatranszfer:\n' +
        '- Területi Innovációs Platform (TIP) hálózat, startup-rendezvények támogatása;\n' +
        '- az egyetemi Science Park és technológiatranszfer-cég (TTC) projektek szakmai támogatása és monitorozása;\n' +
        '- Hungarian Startup Ecosystem portál (startup.niu.hu) startup-adatbázissal;\n' +
        '- nemzetközi projektek (pl. BEAMING, DALIA, RInnoValleys, ClimaPannonia), az EIT Regional Innovation Booster-felhívás népszerűsítése.\n\n' +
        'A honlap szerint az ügynökség programjaival eddig több mint 2000 vállalkozást és több mint 57 000 diákot ért el.',
      kapcsolat: {
        email: 'info@niu.hu',
        cim: '1077 Budapest, Kéthly Anna tér 1., 1. emelet',
      },
      programok: [
        {
          nev: 'XPAND Program',
          leiras: 'Startupok és kkv-k külpiacra lépésének támogatása: képzés, mentorálás, kapcsolatépítés, megjelenés nemzetközi vásárokon és üzleti utakon.',
          url: 'https://niu.hu/service/xpand-program',
        },
        {
          nev: 'Enterprise Horizon',
          leiras: 'Innovatív vállalkozások felkészítése a Horizont Európa-pályázatokra és a nemzetközi konzorciumépítésre.',
          url: 'https://niu.hu/service/enterprise-horizon',
        },
        {
          nev: 'Hungarian Startup University Program (HSUP)',
          leiras: 'Egyetemi startup- és innovációs kurzus mentorálással; a 2026/2027-es tanévben 33 hazai és 1 határon túli felsőoktatási intézményben.',
          url: 'https://niu.hu/project/hungarian-startup-university-program',
        },
        {
          nev: 'HSUP Doctorate',
          leiras: 'Doktoranduszok kutatási eredményeinek innovációvá, akár startuppá alakítása: képzés, mentorálás, ösztöndíj és projektfinanszírozás.',
          url: 'https://niu.hu/service/hsup-doctorate',
        },
        {
          nev: 'HSUP Growth Fund',
          leiras: 'HSUP-alumni alapította startupok vissza nem térítendő támogatása (10–20 MFt, 80 MFt keret) a befektetésre érett állapotig.',
          url: 'https://niu.hu/service/hsup-growth-fund',
        },
        {
          nev: 'Startup-rendezvények támogatása (Rendezvénytámogatási program) 2026',
          leiras: 'Hazai innovációs és startup-rendezvények támogatása 20 MFt kerettel, rendezvényenként legfeljebb 1, 3 vagy 5 MFt.',
          url: 'https://niu.hu/service/startup-rendezvenyek-tamogatasa-rendezvenytamogatasi-program-2026',
        },
        {
          nev: 'Innovációs Voucher Program',
          leiras: 'Startupok és kkv-k innovációs szolgáltatásokat vehetnek igénybe minősített szolgáltatóktól; a díjat a NIÜ közvetlenül a szolgáltatónak fizeti.',
          url: 'https://niu.hu/service/innovacios-voucher-program',
        },
        {
          nev: 'Science Park projekt',
          leiras: 'Tudományos és Innovációs Parkok szakmai koncepciójának támogatása és monitorozása hat egyetemen: Debreceni, Óbudai, Pannon, Semmelweis, Széchenyi István és Szegedi Tudományegyetem.',
          url: 'https://niu.hu/project/science-park-projekt',
        },
        {
          nev: 'Technology Transfer Company (TTC) projekt',
          leiras: 'Öt egyetem technológiatranszfer-cégének létrehozása és 2024–2026-os működése; a NIÜ szakmai támogatást ad és monitoroz.',
          url: 'https://niu.hu/project/technology-transfer-company-ttc-projekt',
        },
        {
          nev: 'Mentorálási szolgáltatás',
          leiras: 'Innovatív vállalkozások KFI-projektjeinek díjmentes (csekély összegű támogatásnak minősülő) mentorálása a GINOP Plusz KFI-ökoszisztéma projektben.',
          url: 'https://niu.hu/service/mentoralasi-szolgaltatas',
        },
        {
          nev: 'Projektfejlesztési szolgáltatás',
          leiras: 'Vállalati KFI-projektjavaslatok tudományos-technológiai és üzleti szakértői vizsgálata, továbbfejlesztési javaslatokkal.',
          url: 'https://niu.hu/service/projektfejlesztesi-szolgaltatas',
        },
        {
          nev: 'Minősített innovációs tanácsadók',
          leiras: 'Minősítési eljáráson átesett innovációs tanácsadó vállalkozások nyilvános adatbázisa (termelési, marketing-, logisztikai és szervezeti innováció).',
          url: 'https://niu.hu/service/minositett-innovacios-tanacsadok',
        },
        {
          nev: 'Területi Innovációs Platform (TIP)',
          leiras: 'Az egyetemekre épülő regionális innovációs együttműködési hálózat; 2019-ben az NKFIH indította, 2024 óta a NIÜ működteti.',
          url: 'https://niu.hu/service/teruleti-innovacios-platform',
        },
        {
          nev: 'Innovációs tréning',
          leiras: 'Díjmentes, négymodulos online tréning vállalati munkavállalók innovációmenedzsment-ismereteinek fejlesztésére.',
          url: 'https://niu.hu/service/innovacios-trening',
        },
      ],
      linkek: [
        { felirat: 'Szolgáltatások célcsoportonként', url: 'https://niu.hu/services' },
        { felirat: 'Hungarian Startup Ecosystem portál', url: 'https://startup.niu.hu/' },
        { felirat: 'A NIÜ bemutatása az NKFIH oldalán', url: 'https://nkfih.gov.hu/palyazoknak/innovacios-okoszisztema/nemzeti-innovacios-ugynokseg/ugynokseg-bemutatasa' },
      ],
    },
    {
      slug: 'vallalkozasfejlesztesi-szervezetek',
      tipus: 'lista',
      nev: 'Országos vállalkozásfejlesztési szervezetek',
      osszefoglalo:
        'A vállalkozásfejlesztés kormányzati felelőse a Gazdasági és Energetikai Minisztérium (a mesterséges intelligenciával kapcsolatos vállalkozásfejlesztés a TTM-é). Mellette országos ügynökség és a kamarai rendszer kínál programokat a kkv-knak.',
      sorok: [
        {
          nev: 'Gazdasági és Energetikai Minisztérium (GEM)',
          megjegyzes: 'A vállalkozásfejlesztésért felelős tárca: kkv-szabályozás, beruházásösztönzés, állami hitel-, tőke- és garanciaprogramok.',
          url: 'https://kormany.hu/kormanyzat/gazdasagi-es-energetikai-miniszterium',
        },
        {
          nev: 'Magyar Gazdaságfejlesztési Ügynökség (MGFÜ)',
          megjegyzes: 'Közhasznú ügynökség a kkv-k versenyképességéért: vállalkozásfejlesztési programok, Modern Mintaüzem Program, ESG-tudás; info@mgfu.hu.',
          url: 'https://mgfu.hu/',
        },
        {
          nev: 'Magyar Kereskedelmi és Iparkamara (MKIK)',
          megjegyzes: 'Országos gazdasági kamara a területi kamarák hálózatával; vállalkozói programjai közt a Beszállítói Program és a Tőkeprogram.',
          url: 'https://mkik.hu/',
        },
        {
          nev: 'Nemzeti Innovációs Ügynökség (NIÜ)',
          megjegyzes: 'Innovációs szolgáltatások startupoknak és kkv-knak (voucher, mentorálás, XPAND); lásd a NIÜ kártyáját.',
          url: 'https://niu.hu/',
        },
      ],
    },
    {
      slug: 'inkubatorok-akceleratorok',
      tipus: 'lista',
      nev: 'Inkubátorok és akcelerátorok (Startup Factory)',
      osszefoglalo:
        'Az NKFI Alapból finanszírozott Startup Factory inkubátorprogram az izraeli mintára épülő köz–magán társbefektetési modell: a technológiai inkubátorok korai fázisú startupokba fektetnek, és szakmai, üzleti támogatást adnak. A lista a 2023-1.1.3-STARTUP felhíváson 2023 decemberében támogatott inkubátorokat sorolja fel (projektek 2024–2026); nem teljes piaci áttekintés.',
      sorok: [
        { nev: 'Startup Campus Inkubator Zrt.', megjegyzes: 'Debrecen; nemzetközi innovációs központ és startup-inkubátor', url: 'https://www.startupcampus.hu/' },
        { nev: 'Creative Accelerator Kft.', megjegyzes: 'Szeged; élettudományi fókuszú specializált inkubátor', url: 'https://creativeaccelerator.hu/' },
        { nev: 'White Unicorn Befektetési és Tanácsadó Kft.', megjegyzes: 'Budapest; egészségügyi, medtech és IT-fókuszú inkubátor', url: 'https://www.whiteunicorn.hu/' },
        { nev: 'Nesprit Ventures Zrt.', megjegyzes: 'Budapest; pre-seed és seed befektetések, jellemzően klímatechnológia', url: 'https://nesprit.vc/' },
        { nev: 'GUKA Energetikai Zrt.', megjegyzes: 'Békéscsaba; informatikai és zöld innovációk' },
        { nev: 'Virgo Ventures Technológiai Inkubátor Kft.', megjegyzes: 'Budapest' },
        { nev: 'OXO Labs Kft.', megjegyzes: 'Budapest' },
        { nev: 'STRT Invest Kft.', megjegyzes: 'Budapest' },
        { nev: 'Lunar Program Zrt.', megjegyzes: 'Budapest' },
        { nev: 'BNL Start Partners Kft.', megjegyzes: 'Miskolc; kezdő ötletgazdáknak és haladó innovatív vállalkozóknak' },
        { nev: 'Első Közép-Európai Hardver Akcelerátor Kft.', megjegyzes: 'Bonyhád; hardverfókuszú akcelerátor' },
        { nev: 'Védelmi Innovációs Kutatóintézet Nonprofit Zrt. – VIRTUS', megjegyzes: 'Budapest; védelmi innovációs venture studio' },
      ],
      linkek: [{ felirat: 'A Startup Factory 2023 felhívás és a támogatott projektek (NKFIH, angol)', url: STARTUP_FACTORY }],
    },
    {
      slug: 'innovacios-klaszterek',
      tipus: 'lista',
      nev: 'Klaszterek',
      osszefoglalo:
        'Ágazati klaszterek: vállalatokat, egyetemeket és kamarákat összefogó együttműködési hálózatok, jó belépési pontok ágazati partnerkereséshez. A lista szemléltető, nem teljes; az uniós klaszteradatbázis, a European Cluster Collaboration Platform további magyar klasztereket is mutat.',
      sorok: [
        {
          nev: 'Pharmapolis Innovatív Gyógyszeripari Klaszter',
          megjegyzes: 'Gyógyszeripari klaszter a Debreceni Egyetem keretében.',
          url: 'https://pharmapolis.unideb.hu/',
        },
        {
          nev: 'Észak-magyarországi Autóipari Klaszter (NOHAC)',
          megjegyzes: 'Autóipari klaszter; alapítói között autóipari vállalatok, a Miskolci Egyetem és a térség kereskedelmi és iparkamarái.',
          url: 'https://nohac.hu/',
        },
        {
          nev: 'ArchEnerg Nemzetközi Megújuló Energetikai és Építőipari Klaszter',
          megjegyzes: 'Megújuló energia és energiatudatos építés; projektgenerálás és forráshoz jutás a tagoknak.',
          url: 'https://www.archenerg.eu/',
        },
      ],
      linkek: [{ felirat: 'European Cluster Collaboration Platform (Európai Bizottság)', url: 'https://www.clustercollaboration.eu/' }],
    },
    {
      slug: 'startup-technologiai-szervezetek',
      tipus: 'lista',
      nev: 'Startup- és technológiai szervezetek, vállalati és nyílt innovációs programok',
      osszefoglalo:
        'A startup-ökoszisztéma és a technológiai ágazatok országos szervezetei, valamint olyan programok, amelyek a vállalati innovációt és az egyetem–vállalat együttműködést nyitják meg. A TTM a startup-ügyekben a kamarákkal, szakmai szövetségekkel, inkubátorokkal és akcelerátorokkal is kapcsolatot tart. A jelentős KFI-központtal rendelkező és nyílt innovációs programot működtető vállalatokat a 8. kategória sorolja fel.',
      sorok: [
        {
          nev: 'Hungarian Startup Ecosystem (NIÜ)',
          megjegyzes: 'A NIÜ angol nyelvű startup-ökoszisztéma portálja startup-adatbázissal, finanszírozási és jogi tudnivalókkal; külföldi partnereknek is.',
          url: 'https://startup.niu.hu/',
        },
        {
          nev: 'Magyar Innovációs Szövetség (MISZ)',
          megjegyzes: 'Országos innovációs szövetség; szolgáltatások nagyvállalatoknak, kkv-knak és startupoknak, Magyar Innovációs Nagydíj, ifjúsági innovációs versenyek.',
          url: 'https://innovacio.hu/',
        },
        {
          nev: 'IVSZ – Digitális Vállalkozások Szövetsége',
          megjegyzes: 'Az infokommunikációs ágazat szövetsége; munkacsoportok többek között kvantumtechnológia, e-egészség, kiberbiztonság és vállalati digitalizáció témában.',
          url: 'https://ivsz.hu/',
        },
        {
          nev: 'Egyetemi technológiatranszfer-cégek (TTC-hálózat)',
          megjegyzes: 'Egyetemi tulajdonú TT-cégek; fejlesztésüket a NIÜ TTC-projektje és az NKFIH 2026-1.1.2-TTC felhívása (6 Mrd Ft) támogatja.',
          url: 'https://niu.hu/project/technology-transfer-company-ttc-projekt',
        },
        {
          nev: 'Tudományos és Innovációs Parkok (Science Park)',
          megjegyzes: 'Egyetemek, kutatóintézetek, high-tech cégek és startupok közös terei hat egyetemen; a koncepciót a NIÜ támogatja.',
          url: 'https://niu.hu/project/science-park-projekt',
        },
        {
          nev: 'Modern Mintaüzem Program (MGFÜ)',
          megjegyzes: 'Vállalati mintaüzemek nyitják meg kapuikat cégvezetőknek technológiaváltási és innovációs tapasztalatcserére; évente Modern Gyárak Éjszakája.',
          url: 'https://mgfu.hu/hu/page/modem4',
        },
      ],
    },
  ],
};

export default kategoria;

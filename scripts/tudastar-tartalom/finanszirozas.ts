/**
 * 2. Kutatás-fejlesztési és innovációs finanszírozás – a TéT Tudástár kezdő tartalma.
 *
 * Források (lekérve: 2026-11-02):
 * - NKFIH, A Hivatal küldetése (mód. 2025. 05. 29.): https://nkfih.gov.hu/hivatalrol/hivatalrol – feladat, célcsoportok
 * - NKFIH, ügyfélszolgálat, kapcsolat: https://nkfih.gov.hu/palyazoknak/ugyfelszolgalat/kapcsolat – e-mail, telefon, cím
 * - NKFIH, Az NKFI Alap felépítése (mód. 2026. 04. 08.): https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/nkfi-alap-felepitese
 * - NKFIH, Programstratégia 2026 (mód. 2025. 11. 27.): https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026
 * - NKFIH, aktuális felhívások (NKFI Alap, Széchenyi Terv Plusz, egyéb): https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok
 * - NKFIH, felhívásoldalak: 2026-1.2.3-NETWORKING (pályázói kör, „önállóan tagdíj nem támogatható”), 2025-1.1.1-IPARJOG,
 *   2025-1.2.2-EUREKA (mód. 2026. 10. 20.; támogatásra jogosultak köre, határnapok 2027. október 15-ig), WIDERA Travel Grants
 *   („Egyéb támogatás”, az NCP_WIDERA.NET projekt forrásából), 2026-1.2.2-TÉT, 2026-4.1.2-HU-RIZONT, 2024-1.2.1-HE_PARTNERSÉG,
 *   2024-1.2.2-ERA_NET, 2024-1.2.4-KDT (beadás 2026. október 30-ig), 2026-1.1.2-TTC (beadás 2026. április 16-ig; „2026. május
 *   14. napjától a Tudományos és Technológiai Minisztérium a Támogató”): https://nkfih.gov.hu/palyazoknak/…
 * - NKFIH, Misszióvezérelt Nemzeti Laboratóriumok továbbfejlesztése (2026-4.1.1-MISSZIÓK; döntés 2026. 08. 27., 14 projekt,
 *   20,92 Mrd Ft): https://nkfih.gov.hu/palyazoknak/nkfi-alap/missziovezerelt-nemzeti-laboratoriumok-tovabbfejlesztese-2026-411-missziok
 * - NKFIH, Kormányzati Önerő Alap (mód. 2026. 03. 19.): https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap
 * - NKFIH, Horizont Jogsegély Hotline: https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap/horizont-jogsegely-hotline
 * - NKFIH, „Megszűnt a korlátozás” (mód. 2026. 11. 02.): https://nkfih.gov.hu/hivatalrol/hivatal-hirei/megszunt-korlatozas –
 *   a Kormányzati Önerő Alap 2027-ben (a TTM tervei szerint; új felhívás csak a 2027. évi költségvetési törvény és
 *   programstratégia után), a szerződésmódosítás nem visszamenőleges
 * - NKFIH, „Még igényelhető a WIDERA Travel Grants” (mód. 2026. 10. 15.):
 *   https://nkfih.gov.hu/hivatalrol/hivatal-hirei/meg-igeneyelheto-a-widera-travel-grants
 * - NKFIH Horizont Európa portál, Európai Partnerségek – gyakorlati útmutató (mód. 2026. 05. 20.; 2026-ban 19 konstrukció,
 *   2,7 Mrd Ft; éves keretösszegek, köztük EUROSTARS 1 000 000 EUR):
 *   https://horizonteuropa.nkfih.gov.hu/horizont-europa-program/partnersegek/partnerseg-attekintes
 * - NKFIH, Horizont Európa NCP-k (mód. 2026. 10. 15.; programterületek, ncp@nkfih.gov.hu, +36 70 680 6421):
 *   https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok
 * - NKFIH, Horizont Európa (keretösszeg, pillérek): https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa
 * - NKFIH Horizont Európa honlap: https://horizonteuropa.nkfih.gov.hu/ ; Partnerkeresés:
 *   https://horizonteuropa.nkfih.gov.hu/hogyan-palyazzak/partnerkereses
 * - MTA, ERC nemzeti kapcsolattartó pont: https://mta.hu/mta_erc
 * - COST, Hungary (COST National Coordinator): https://www.cost.eu/about/members/hungary/
 * - 2014. évi LXXVI. törvény (KFI tv.), hatályos szöveg: https://njt.jog.gov.hu/jogszabaly/2014-76-00-00 – 11. § (3) és (6)
 *   (az NKFI Alap kezeléséért felelős miniszter; Innovációs, Kutatási és Missziók Alaprész), 12. § (2) (programstratégia
 *   jóváhagyása), 13. § (2) a) (támogatási döntés az Innovációs és a Missziók Alaprészben)
 * - NKFIH SZMSZ (1/2026. (I. 22.) KIM utasítás): https://njt.jog.gov.hu/jogszabaly/2026-1-B0-8O – a Svájci Finanszírozási
 *   Mechanizmusok „Kétoldalú kutatási együttműködések” programterületének programoperátora az NKFI Hivatal
 * - 90/2026. (V. 13.) Korm. rendelet: https://njt.jog.gov.hu/jogszabaly/2026-90-20-22 – 1. melléklet 15. pont (NKFIH: TTM
 *   irányítás), 92/A. § (GEM: kkv-finanszírozás, állami hitel-, tőke- és garanciaprogramok, állami pénzintézetek
 *   stratégiája), 106. § m) (KBM, uniós források), 179. § 3. pont és 184. § (1) k)–m) (VTM: uniós források felhasználása,
 *   közvetlen uniós források, önerő- és előkészítésiköltség-támogatási mechanizmus)
 * - 2/2026. (IX. 21.) TTM utasítás (SZMSZ): https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N – NKFI Alap feletti rendelkezés,
 *   TéT-főosztály (egyezmények, munkatervek, vegyes bizottsági képviselet, a Svájci Finanszírozási Mechanizmusok kétoldalú
 *   kutatási együttműködései az NKFIH-val), Űrpolitikai Főosztály (ESA)
 * - kormany.hu, Vidék- és Településfejlesztési Minisztérium: https://kormany.hu/kormanyzat/videk-es-telepulesfejlesztesi-miniszterium ;
 *   „Kereshető adatbázis készült az uniós projektekben részt vevő cégekről” (2026. 10. 02.):
 *   https://kormany.hu/hirek/keresheto-adatbazis-keszult-az-unios-projektekben-reszt-vevo-cegekrol
 * - NIÜ, Álláspályázat a vezérigazgatói tisztségre (2026. 10. 30.): https://niu.hu/ – az NKFIH a NIÜ tulajdonosi joggyakorlója
 * - NIÜ, HSUP Growth Fund (határidő 2026. 01. 09.): https://niu.hu/service/hsup-growth-fund ; Rendezvénytámogatási program
 *   2026 (beadás 2026. 05. 29-ig): https://niu.hu/service/startup-rendezvenyek-tamogatasa-rendezvenytamogatasi-program-2026
 * - kormany.hu, TTM közlemény (2026. 08. 31.): https://kormany.hu/hirek/uj-program-a-doktoranduszoknak – az NKFI Alap tervezett bővítése
 * - EU-oldalak: https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home ; https://eic.ec.europa.eu/index_en ;
 *   https://eismea.ec.europa.eu/index_en ; https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en
 *
 * ELLENŐRIZENDŐ:
 * - A GINOP Plusz (Széchenyi Terv Plusz) 2026-os irányító hatósága: az uniós források felhasználásáért a VTM felel (Statútum
 *   179. § 3. pont, 184. §), a TTM SZMSZ-e a Nemzeti Fejlesztési Központ (NFK) „megfelelő irányító hatóságával” való
 *   egyeztetést említi; a GINOP Plusz irányító hatóságát név szerint nem találtam, ezért a lista nem nevezi meg.
 * - Az NKFI Alap 2027. évi programstratégiája és a bejelentett forrásbővítés (TTM: három év alatt kb. 225 Mrd Ft): az NKFIH
 *   2026. november 2-i közlése szerint a 2027. évi költségvetési törvény és programstratégia elfogadása még hátravan
 *   (az új Önerő Alap-felhívás ezek után jelenhet meg); a forrásbővítés továbbra is csak bejelentés.
 * - Módosította-e a TTM az NKFI Alap 2026. évi programstratégiáját, amelyet még az előző miniszter hagyott jóvá
 *   (módosításról nem találtam forrást).
 * - A 2026-1.1.2-TTC felhívás eredménye (a beadás 2026. április 16-án lezárult, eredményt még nem közöltek).
 * - Eurostars: a hazai támogatás 2026-os pályázati formája (a partnerségi útmutató évi 1 M EUR keretet közöl, külön nyitott
 *   felhívást nem találtam; a legutóbbi önálló felhívás 2024-1.2.7-EUROSTARS volt).
 * - Az EUREKA-hálózat saját oldalán a magyar nemzeti iroda adatai (az eurekanetwork.org 403-at ad); az NKFIH NCP-oldala az
 *   EUREKA és a Eurostars kapcsolattartóját az NKFI Hivatalnál nevezi meg, a felhívás „magyar EUREKA Nemzeti Projekt
 *   Koordinátor”-ra hivatkozik.
 * - Az NKFI Hivatal hatályos SZMSZ-e (1/2026. (I. 22.) KIM utasítás) a kormányváltás előtti, a Külgazdasági és
 *   Külügyminisztériumra (KKM) és a Kulturális és Innovációs Minisztériumra (KIM) hivatkozik: lesz-e új SZMSZ, és változnak-e
 *   a szervezeti egységek (a tartalom ezért egységnevet nem közöl).
 * - A VTM „közvetlen európai uniós források önerő és előkészítési költségének támogatási mechanizmusa”: milyen eszköz, és
 *   hogyan viszonyul a Kormányzati Önerő Alaphoz.
 */
import type { ForrasKategoria } from './tipusok';

const NCP_OLDAL = 'https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok';
const PARTNERSEG_OLDAL = 'https://horizonteuropa.nkfih.gov.hu/horizont-europa-program/partnersegek/partnerseg-attekintes';

const kategoria: ForrasKategoria = {
  leiras: 'Az NKFI Hivatal és az NKFI Alap, a hazai és uniós források kezelői, a nemzeti kapcsolattartók.',
  bevezeto:
    'A hazai KFI-források legnagyobb kezelője a Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal: az NKFI Alapból pályázatokat ír ki, és itt működnek a Horizont Európa nemzeti kapcsolattartói, valamint az EUREKA, a Eurostars és a COST hazai pontjai. Az attasé itt találja, milyen hazai pályázatokkal kapcsolódhat be egy külföldi partner, hol kaphat egy magyar szervezet társfinanszírozást a nemzetközi projektekhez, és kihez irányíthatja a pályázati kérdéseket. Az uniós kohéziós források felhívásai a Széchenyi Terv Plusz portálján jelennek meg.',
  kartyak: [
    {
      slug: 'nkfih',
      tipus: 'intezmeny',
      nev: 'Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal',
      rovidites: 'NKFIH',
      osszefoglalo:
        'A KFI-törvény alapján 2015-ben létrehozott központi hivatal a Tudományos és Technológiai Minisztérium irányítása alatt működik, és a legjelentősebb állami KFI-finanszírozó: kezeli a Nemzeti Kutatási, Fejlesztési és Innovációs Alapot (NKFI Alap). Működteti a Horizont Európa nemzeti kapcsolattartói hálózatát, kiírja a nemzetközi együttműködéseket támogató hazai pályázatokat, és kezeli a Kormányzati Önerő Alapot.',
      honlap: 'https://nkfih.gov.hu/',
      profil:
        'Az NKFI Hivatalt a tudományos kutatásról, fejlesztésről és innovációról szóló 2014. évi LXXVI. törvény hozta létre, hogy a kutatás-fejlesztés és innováció kormányzati koordinációjának és kiszámítható finanszírozásának stabil intézményi rendszere legyen. A Statútum rendelet szerint a hivatalt a tudományos és technológiai miniszter irányítja; a minisztériumban ezt a tudománypolitikai és innovációs államtitkár gyakorolja.\n\n' +
        'A hivatal saját bemutatása szerint több mint 200 munkatárssal a legjelentősebb állami közfinanszírozó a KFI területén. Az NKFI Alap forrásainak felhasználására többszintű pályázatértékelési rendszert működtet akadémiai és üzleti szakértőkkel, ellenőrzi a támogatások felhasználását, és méri a projektek hatását.\n\n' +
        'Az NKFI Hivatal a Nemzeti Innovációs Ügynökség tulajdonosi joggyakorlója. A TTM SZMSZ-e szerint a minisztérium TéT-attasé hálózatot koordináló főosztálya az NKFI Hivatallal együttműködve látja el a tudományos és technológiai szakdiplomata-hálózattal kapcsolatos minisztériumi feladatokat.',
      tevekenyseg:
        '- Az NKFI Alap felhívásainak kiírása, értékelése, a szerződések és projektek követése.\n' +
        '- A Horizont Európa nemzeti kapcsolattartói (NCP) hálózatának működtetése, a magyar álláspont képviselete a programbizottságokban.\n' +
        '- A magyar részvétel koordinálása a társfinanszírozott nemzetközi programokban (EUREKA, Eurostars, európai partnerségek, ERA-NET-ek); a COST nemzeti koordinátora is a hivatalnál működik.\n' +
        '- A Kutatási Kiválósági Tanács titkárságának ellátása.\n' +
        '- Közreműködés a KFI-stratégiák összeállításában és megvalósításában, az innovációs ökoszisztéma fejlesztésében (pl. a GINOP Plusz „KFI ökoszisztéma fejlesztése” kiemelt projekt konzorciumvezetőjeként, a NIÜ-vel).\n' +
        '- A Kormányzati Önerő Alap és a Horizont Jogsegély Hotline működtetése.',
      kapcsolat: {
        email: 'nkfihivatal@nkfih.gov.hu',
        telefon: '+36 1 795 9500',
        cim: '1077 Budapest, Kéthly Anna tér 1.',
      },
      szakaszok: [
        {
          cim: 'Feladat- és hatáskör',
          szoveg:
            'Az NKFI Hivatal elsődlegesen az NKFI Alapból finanszírozott versenypályázatok rendszerével támogatja a KFI-t. Kiemelt célterületei:\n' +
            '- a piaci szereplők innovációs tevékenysége és az eredmények piaci hasznosítása;\n' +
            '- a KFI-ökoszisztéma szereplőinek összekapcsolása szakmai együttműködésekkel;\n' +
            '- a kutatói utánpótlás hosszú távú biztosítása;\n' +
            '- a hazai kutatók bekapcsolása a nemzetközi tudományos vérkeringésbe.\n\n' +
            'A pályázati rendszeren túl közreműködik a KFI-stratégiákban, az innovációs ökoszisztéma fejlesztésében és a KFI-fókuszú nemzetközi és európai együttműködések szakmai feladataiban. Pályázati ügyekben az ügyfélszolgálat elérhetősége: nkfialap@nkfih.gov.hu, +36 1 795 9500; hivatali ügyekben: nkfihivatal@nkfih.gov.hu.',
        },
        {
          cim: 'Az NKFI Alap programstratégiája',
          szoveg:
            'Az NKFI Alap a KFI-törvény szerint három alaprészből áll:\n' +
            '- Innovációs Alaprész: vállalati innováció és piacorientált, részben üzleti–tudományos együttműködésben megvalósuló K+F; itt jelennek meg a nemzetközi programok is;\n' +
            '- Kutatási Alaprész: kiszámítható kutatásfinanszírozás, a kutatói pálya elején járók támogatása; a kiválósági alapú felhívásokra a Kutatási Kiválósági Tanács tesz javaslatot;\n' +
            '- Missziók Alaprész (2025 óta): stratégiailag fontos területeken nagy társadalmi vagy gazdasági hatású K+F-programok; 2026-ban ebből hirdették meg a nemzeti laboratóriumok misszióvezérelt továbbfejlesztését és a HU-rizont programot.\n\n' +
            'A nemzeti laboratóriumok 2022-ben még külön alaprészből indultak.\n\n' +
            'Az NKFI Alap kezeléséért a tudománypolitika koordinációjáért felelős miniszter – ma a tudományos és technológiai miniszter – felel: ő hagyja jóvá az éves programstratégiát, és ő dönt az Innovációs és a Missziók Alaprész támogatásairól. A felhívásokban 2026. május 14. óta a Tudományos és Technológiai Minisztérium a Támogató.\n\n' +
            'Az éves programstratégia határozza meg a meghirdetendő felhívásokat és kereteiket. A 2026. évi programstratégiát még 2025 novemberében, a kormányváltás előtt fogadták el; mintegy 120 Mrd Ft-tal számol, céljai a vállalatok és egyetemek együttműködése, a kutatói létszám növelése, a szabadalmi bejelentések megduplázása és az innovatív vállalkozások arányának emelése, harmadik nagy célterületként a missziókkal. Újdonságként a vissza nem térítendő támogatások mellett állami társfinanszírozású kockázatitőke-alapokat is tervez.\n\n' +
            'A TTM 2026. augusztusi közleménye szerint a kormány három év alatt megduplázná az NKFI Alap forrásait; ez egyelőre bejelentés.',
        },
        {
          cim: 'Aktuális hazai és nemzetközi pályázatok',
          szoveg:
            'Nyitott felhívások a 2026. november 2-i állapot szerint (NKFI Alap):\n' +
            '- Európai kutatási-innovációs szakmai szervezetekben való részvétel (2026-1.2.3-NETWORKING): 2–6 MFt, felsőoktatási és kutatóintézményeknek, határidő 2026. november 20.;\n' +
            '- szellemitulajdon-védelem (2025-1.1.1-IPARJOG): 0,01–7,5 MFt, határidő 2026. december 18.;\n' +
            '- magyar részvétel az EUREKA-programban (2025-1.2.2-EUREKA): 20–70 MFt, negyedéves beadási határnapokkal 2027. október 15-ig.\n\n' +
            'Az NKFI Hivatal az NCP_WIDERA.NET uniós projekt forrásából hirdeti a WIDERA Travel Grants támogatást: legfeljebb 1000 euró a Horizont Európa partnerkereső rendezvényeinek útiköltségére, 2027. január 31-ig.\n\n' +
            'A Széchenyi Terv Plusz programjai közül az NKFI Hivatal felhívásai között szerepel a Korai fázisú kutatás-fejlesztési kockázati tőkeprogram (GINOP Plusz-2.5.1-25) és a Technológiaspecifikus Kockázati Tőkeprogram (GINOP Plusz-2.5.2-26).\n\n' +
            'A 2026-ban meghirdetett, beadási határidejük szerint már lezárult pályázatok közül kiemelendő a HU-rizont nemzetközi kiválósági kutatási együttműködési program (8 Mrd Ft), a kétoldalú TéT-pályázat (kínai és francia reláció), a Misszióvezérelt Nemzeti Laboratóriumok továbbfejlesztése (2026. augusztus 27-i döntés: 14 projekt, összesen 20,92 Mrd Ft) és a technológiatranszfer-cégek hálózatának fejlesztése (6 Mrd Ft; eredményét még nem közölték).\n\n' +
            'A Horizont Európa nyitott és várható felhívásait az NKFI Hivatal kereshető listában is közli.',
        },
        {
          cim: 'A pályázatok célcsoportjai',
          szoveg:
            'Az NKFI Hivatal támogatásainak fő célcsoportjai:\n' +
            '- innovatív vállalkozások (kkv-k és nagyvállalatok) a magasabb hozzáadott érték és a piaci hasznosítás érdekében;\n' +
            '- egyetemek és más kutatóhelyek a KFI-kapacitás bővítésére;\n' +
            '- kutatók és kutatói közösségek kiválósági alapon, köztük egyetemi és doktori hallgatók, posztdoktorok és fiatal kutatók.\n\n' +
            'A felhívások pályázói körei: felsőoktatási intézmény, HUN-REN- és MTA-intézmény, egyéb költségvetési kutatóhely, vállalkozói kutatóhely, vállalkozás, nonprofit kutatóhely és szervezet, illetve magánszemély.\n\n' +
            'Külföldi partner a felhívás feltételei szerint kapcsolódhat be: a HU-rizont programban például alvállalkozóként vagy megbízottként, a kétoldalú TéT-pályázatokban pedig úgy, hogy a közös projektet a külföldi fél a saját országa finanszírozójánál nyújtja be.',
        },
        {
          cim: 'Nemzetközi partnerkeresés és társfinanszírozás',
          szoveg:
            '- Horizont Európa NCP-k: ingyenes információs napok, tanácsadás, közreműködés a projektpartnerek keresésében (ncp@nkfih.gov.hu), heti HorizontPéntek10 webinárium.\n' +
            '- WIDERA Travel Grants: utófinanszírozás (legfeljebb 1000 euró) a II. pillér klasztereinek, a missziók és az európai partnerségek konzorciumépítő rendezvényein való részvételhez.\n' +
            '- Partnerségi (társfinanszírozott) konstrukciók: a nemzetközi közös felhívásokon nyertes magyar partnerek a nemzeti részt az NKFI Alapból kapják (európai partnerségek, ERA-NET Cofund, EJP Cofund).\n' +
            '- EUREKA és Eurostars: piacközeli nemzetközi K+F-együttműködés, különösen kkv-knak; az EUREKA-projektek magyar résztvevőit a 2025-1.2.2-EUREKA felhívás támogatja.\n' +
            '- Kétoldalú TéT-pályázatok: a partnerek közös projektet dolgoznak ki, a magyar fél az NKFI Hivatalhoz, a külföldi a saját finanszírozójához nyújtja be; a támogatás a kutatói mobilitást és a szakembercserét fedezi.\n' +
            '- HU-rizont: magyar felsőoktatási intézmény vezette, nemzetközi együttműködésben megvalósuló kutatási programok.\n\n' +
            'A kétoldalú kormányközi TéT-egyezmények és munkatervek előkészítése, végrehajtása és a vegyes bizottsági képviselet a Tudományos és Technológiai Minisztérium TéT-attasé hálózatot koordináló főosztályáé; a közös pályázatokat az NKFI Hivatal írja ki.',
        },
        {
          cim: 'Kormányzati Önerő Alap és más társfinanszírozási konstrukciók',
          szoveg:
            'A Kormányzati Önerő Alap (KÖA) az (EU) 2022/2506 tanácsi végrehajtási határozat hatálya alá tartozó szervezeteknek – a közérdekű vagyonkezelő alapítványoknak és az általuk fenntartott intézményeknek – nyújtott pályázati forrást helyettesítő támogatást a nyertes Horizont Európa-, Erasmus+ és más uniós KFI- vagy oktatási projektekben: a tervezett költség 100%-áig, egy összegben igényelhető előleggel. A 2026-1.2.1-KÖA felhívásra 2026. október 30-ig lehetett kérelmet benyújtani.\n\n' +
            '2026. október 13-án az EU Általános Ügyek Tanácsa lezárta a Magyarország elleni feltételességi eljárást, a korlátozó határozat október 14-én hatályát vesztette. Az érintett intézmények azóta ismét kedvezményezettként és koordinátorként is részt vehetnek a közvetlen uniós programokban; a már aláírt támogatási szerződések módosítását a konzorciumnak kell kezdeményeznie, és a módosítás nem visszamenőleges. Az érintett szervezeteknek az NKFI Hivatal Horizont Jogsegély Hotline-ja ad szakmai támogatást. A 2026. október 14. előtt benyújtott pályázatokban társult partnerként részt vevő intézmények továbbra is a KÖA-ból kérhetnek támogatást; a TTM tervei szerint a konstrukció 2027-ben is elérhető lesz, de új felhívás csak a 2027. évi költségvetési törvény és az NKFI Alap 2027. évi programstratégiájának elfogadása után jelenhet meg.\n\n' +
            'További társfinanszírozás: a Horizont Európa európai partnerségek és az ERA-NET Cofund programok nyertes magyar résztvevőinek nemzeti támogatása (2024-1.2.1-HE_PARTNERSÉG, 2024-1.2.2-ERA_NET) és a Digitális Kulcstechnológiák (KDT) partnerségbe való bekapcsolódás támogatása (2024-1.2.4-KDT) – e három felhívás beadási határideje 2026. október 30-án lejárt –, valamint az EUREKA-részvétel támogatása (2025-1.2.2-EUREKA, 2027. október 15-ig).',
        },
      ],
      programok: [
        {
          nev: 'Európai kutatási-innovációs szakmai szervezetekben való részvétel támogatása (2026-1.2.3-NETWORKING)',
          leiras: 'Felsőoktatási és kutatóintézmények aktív részvétele a keretprogramokat alakító európai KFI-szakmai szervezetek munkájában (önállóan tagdíj nem támogatható); 2–6 MFt, határidő 2026. november 20.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/europai-kutatasi-innovacios-szakmai-szervezetekben-valo-reszvetel-tamogatasa-2026-123-networking/palyazati-felhivas',
        },
        {
          nev: 'Az EUREKA programban való magyar részvétel támogatása (2025-1.2.2-EUREKA)',
          leiras: 'Nemzetközi EUREKA-projektek (alkalmazott kutatás, kísérleti fejlesztés) magyar résztvevőinek támogatása; 20–70 MFt, negyedéves határnapokkal, utoljára 2027. október 15-én.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/eureka-programban-valo-magyar-reszvetel-tamogatasa-2025-122-eureka/palyazati-felhivas',
        },
        {
          nev: 'Szellemi alkotások szellemitulajdon-védelmének támogatása (2025-1.1.1-IPARJOG)',
          leiras: 'Hazai és nemzetközi szellemitulajdon-védelmi tevékenységek támogatása; 0,01–7,5 MFt, határidő 2026. december 18.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/szellemi-alkotasok-szellemi-tulajdon-vedelme-2025-111-iparjog/palyazati-felhivas',
        },
        {
          nev: 'WIDERA Travel Grants',
          leiras: 'Legfeljebb 1000 euró utófinanszírozás a Horizont Európa II. pillér partnerkereső rendezvényein való részvételhez, 2027. január 31-ig (forrása az NCP_WIDERA.NET uniós projekt).',
          url: 'https://nkfih.gov.hu/palyazoknak/egyeb-tamogatas/horizont-europa-2-piller-partnerkereso-rendezvenyen-reszvetel-widera-travel-grants/palyazati-felhivas',
        },
      ],
      linkek: [
        { felirat: 'Aktuális pályázati felhívások', url: 'https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok' },
        { felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: 'https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026' },
        { felirat: 'Az NKFI Alap felépítése', url: 'https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/nkfi-alap-felepitese' },
        { felirat: 'Kormányzati Önerő Alap', url: 'https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap' },
        { felirat: 'A korlátozás megszűnése (2026. október)', url: 'https://nkfih.gov.hu/hivatalrol/hivatal-hirei/megszunt-korlatozas' },
        { felirat: 'Európai partnerségek – gyakorlati útmutató (NKFIH)', url: PARTNERSEG_OLDAL },
        { felirat: 'Ügyfélszolgálat, kapcsolat', url: 'https://nkfih.gov.hu/palyazoknak/ugyfelszolgalat/kapcsolat' },
      ],
    },
    {
      slug: 'hazai-tamogataskezelok',
      tipus: 'lista',
      nev: 'Hazai KFI-támogatások kezelői',
      osszefoglalo:
        'A hazai forrásból finanszírozott KFI-támogatások gazdái: ki dönt a keretekről, és ki írja ki a pályázatokat. A legnagyobb tétel az NKFI Alap; a vállalkozásfinanszírozás állami hitel-, tőke- és garanciaprogramjai a gazdaságfejlesztési tárcához tartoznak.',
      sorok: [
        {
          nev: 'Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal (NKFIH)',
          megjegyzes: 'Az NKFI Alap felhívásainak kiírója és kezelője. Pályázati ügyfélszolgálat: nkfialap@nkfih.gov.hu, +36 1 795 9500.',
          url: 'https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok',
        },
        {
          nev: 'Tudományos és Technológiai Minisztérium (TTM)',
          megjegyzes: 'Felel az NKFI Alap kezeléséért: a miniszter hagyja jóvá az éves programstratégiát, és ő dönt az Innovációs és a Missziók Alaprész támogatásairól.',
          url: 'https://kormany.hu/kormanyzat/tudomanyos-es-technologiai-miniszterium',
        },
        {
          nev: 'Gazdasági és Energetikai Minisztérium (GEM)',
          megjegyzes: 'Vállalkozásfejlesztés; javaslatok a kkv-k finanszírozására (kamattámogatott hitel-, tőke- és garanciaprogramok); előterjeszti az állami pénzintézetek stratégiáját, és felügyeli végrehajtását.',
          url: 'https://kormany.hu/kormanyzat/gazdasagi-es-energetikai-miniszterium',
        },
        {
          nev: 'Nemzeti Innovációs Ügynökség (NIÜ)',
          megjegyzes: 'Innovációs szolgáltatások és támogatások: Innovációs Voucher Program, mentorálás; évente kiírt pályázatok (HSUP Growth Fund, startup-rendezvények; a 2026-os körök lezárultak). Lásd 3. kategória.',
          url: 'https://niu.hu/services',
        },
      ],
    },
    {
      slug: 'unios-tamogataskezelok',
      tipus: 'lista',
      nev: 'Uniós KFI-támogatások kezelői és belépési pontjai',
      osszefoglalo:
        'A közvetlen uniós programokat (Horizont Európa, EIC) az Európai Bizottság és végrehajtó ügynökségei kezelik; a magyar pályázókat az NKFI Hivatal kapcsolattartói segítik. Az uniós kohéziós források (Széchenyi Terv Plusz) felhívásai hazai kezelésben, a pályázati portálon jelennek meg.',
      sorok: [
        {
          nev: 'Európai Bizottság – Funding & Tenders Portal',
          megjegyzes: 'A Bizottság által kezelt programok (köztük a Horizont Európa) felhívásainak, partnerkeresésének és pályázatbenyújtásának egységes belépési pontja.',
          url: 'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home',
        },
        {
          nev: 'Horizont Európa (Európai Bizottság)',
          megjegyzes: 'Az EU 2021–2027-es kutatási és innovációs keretprogramja, 95,5 Mrd euró keretösszeggel.',
          url: 'https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en',
        },
        {
          nev: 'Európai Innovációs Tanács (EIC)',
          megjegyzes: 'A Horizont Európa III. pillérének innovációfinanszírozója (mintegy 10,1 Mrd euró); magyar NCP-je az NKFI Hivatalnál működik.',
          url: 'https://eic.ec.europa.eu/index_en',
        },
        {
          nev: 'Európai Innovációs Tanács és Kkv-k Végrehajtó Ügynöksége (EISMEA)',
          megjegyzes: 'Az EIC és a kkv-programok végrehajtó ügynöksége.',
          url: 'https://eismea.ec.europa.eu/index_en',
        },
        {
          nev: 'NKFI Hivatal – Horizont Európa nemzeti koordináció',
          megjegyzes: 'NCP-hálózat, hírlevél és rendezvények, Kormányzati Önerő Alap, WIDERA Travel Grants, Horizont Jogsegély Hotline.',
          url: 'https://horizonteuropa.nkfih.gov.hu/',
        },
        {
          nev: 'Széchenyi Terv Plusz pályázati portál',
          megjegyzes: 'Az uniós és hazai fejlesztési felhívások közzétételi és e-ügyintézési felülete; több NKFI Alap-pályázat is itt nyújtható be. 2026 októbere óta az uniós projektek is kereshetők rajta.',
          url: 'https://www.palyazat.gov.hu/',
        },
        {
          nev: 'Közlekedési és Beruházási Minisztérium (KBM)',
          megjegyzes: 'Az uniós források hazahozatalának és felhasználásának kormányzati koordinációja.',
          url: 'https://kormany.hu/kormanyzat/kozlekedesi-es-beruhazasi-miniszterium',
        },
        {
          nev: 'Vidék- és Településfejlesztési Minisztérium (VTM)',
          megjegyzes: 'Az uniós források felhasználásáért felelős tárca: ösztönzi a közvetlen uniós források lehívását, és működteti önerő- és előkészítésiköltség-támogatási mechanizmusukat.',
          url: 'https://kormany.hu/kormanyzat/videk-es-telepulesfejlesztesi-miniszterium',
        },
      ],
    },
    {
      slug: 'horizont-europa-ncp',
      tipus: 'lista',
      nev: 'Horizont Európa nemzeti kapcsolattartók',
      osszefoglalo:
        'A nemzeti kapcsolattartók (NCP-k) a program szerkezetét követve ingyenes tájékoztatást, pályázati tanácsadást és partnerkeresési segítséget adnak a magyar pályázóknak. Az ERC kapcsolattartó pontja az MTA-nál, a többi téma az NKFI Hivatalnál működik; közös elérhetőség: ncp@nkfih.gov.hu, +36 70 680 6421. A jogi és pénzügyi NCP csak e-mailben fogad megkeresést. A program leírása és a magyar részvétel tudnivalói a 9. kategória „Horizont Európa” kártyáján.',
      sorok: [
        { nev: 'I. pillér – Európai Kutatási Tanács (ERC)', megjegyzes: 'Magyar Tudományos Akadémia Titkársága', url: 'https://mta.hu/mta_erc' },
        { nev: 'I. pillér – Marie Skłodowska-Curie akciók (MSCA)', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'I. pillér – Kutatási infrastruktúrák', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'II. pillér, 1. klaszter: Egészségügy', megjegyzes: 'NKFI Hivatal; az Innovative Health Initiative (IHI) partnerség is', url: NCP_OLDAL },
        { nev: 'II. pillér, 2. klaszter: Kultúra, kreativitás és befogadó társadalom', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'II. pillér, 3. klaszter: A társadalmat szolgáló polgári biztonság', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'II. pillér, 4. klaszter: Digitalizáció, ipar és világűr', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        {
          nev: 'II. pillér, 5. klaszter: Éghajlat, energia és mobilitás',
          megjegyzes: 'NKFI Hivatal; a Clean Hydrogen, a CCAM, az Europe’s Rail és a Clean Aviation partnerség is',
          url: NCP_OLDAL,
        },
        {
          nev: 'II. pillér, 6. klaszter: Élelmiszerek, biomassza alapú gazdaság, természeti erőforrások és környezet',
          megjegyzes: 'NKFI Hivatal; a Circular Bio-based Europe közös vállalkozás (CBE JU) is',
          url: NCP_OLDAL,
        },
        {
          nev: 'III. pillér – Európai Innovációs Tanács (EIC), európai innovációs ökoszisztémák (EIE), EIT',
          megjegyzes: 'NKFI Hivatal',
          url: NCP_OLDAL,
        },
        { nev: 'A részvétel szélesítése (Widening) és az Európai Kutatási Térség (ERA) megerősítése', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        {
          nev: 'Missziók és a New European Bauhaus kezdeményezés',
          megjegyzes: 'NKFI Hivatal; mind az öt misszió: rák, klímasemleges és intelligens városok, alkalmazkodás az éghajlatváltozáshoz, óceánok és vizek, egészséges talajok',
          url: NCP_OLDAL,
        },
        {
          nev: 'Társfinanszírozott programok: európai partnerségek és ERA-NET-ek',
          megjegyzes: 'NKFI Hivatal; köztük a Chips közös vállalkozás (Chips JU), az EUREKA és a Eurostars. A hazai társfinanszírozásról az NKFI Alap ügyfélszolgálata tájékoztat (nkfialap@nkfih.gov.hu).',
          url: NCP_OLDAL,
        },
        { nev: 'Jogi és pénzügyi NCP', megjegyzes: 'NKFI Hivatal; csak e-mailes megkeresés (ncp@nkfih.gov.hu). Hazai jogszabályt igénylő pénzügyi, adózási, munkajogi kérdésben nem tájékoztat, költségvetést nem ellenőriz.', url: NCP_OLDAL },
      ],
      linkek: [
        { felirat: 'A nemzeti kapcsolattartók oldala (NKFIH)', url: NCP_OLDAL },
        { felirat: 'Horizont Európa – az NKFIH magyar nyelvű oldala', url: 'https://horizonteuropa.nkfih.gov.hu/' },
        { felirat: 'Partnerkeresés (NKFIH Horizont Európa portál)', url: 'https://horizonteuropa.nkfih.gov.hu/hogyan-palyazzak/partnerkereses' },
      ],
    },
    {
      slug: 'nemzetkozi-programok-hazai-felelosei',
      tipus: 'lista',
      nev: 'Az EUREKA, a Eurostars, a COST és más programok hazai felelősei',
      osszefoglalo:
        'A Horizont Európán kívüli nemzetközi KFI-programok magyar kapcsolódási pontjai, tömör címtárként; a programok leírását a 9. kategória kártyái adják. A legtöbb program hazai koordinátora és finanszírozója az NKFI Hivatal; a kormányközi TéT-egyezmények és az űrügyek a Tudományos és Technológiai Minisztériumhoz tartoznak.',
      sorok: [
        {
          nev: 'EUREKA',
          megjegyzes: 'NKFI Hivatal: hazai koordinátor és a magyar résztvevők támogatása (2025-1.2.2-EUREKA felhívás, beadás 2027. október 15-ig).',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/eureka-programban-valo-magyar-reszvetel-tamogatasa-2025-122-eureka/palyazati-felhivas',
        },
        {
          nev: 'Eurostars (innovatív kkv-k európai partnersége)',
          megjegyzes: 'NKFI Hivatal: nemzeti kapcsolattartó; a magyar résztvevőket az NKFI Hivatal a partnerségi portfólióban évi 1 millió eurós kerettel támogatja (2026-os állapot).',
          url: PARTNERSEG_OLDAL,
        },
        {
          nev: 'COST (European Cooperation in Science and Technology)',
          megjegyzes: 'NKFI Hivatal: itt működik a COST nemzeti koordinátora; a COST-akciók témáit alulról szerveződve maguk a kutatók határozzák meg.',
          url: 'https://www.cost.eu/about/members/hungary/',
        },
        {
          nev: 'Európai partnerségek, ERA-NET Cofund, EJP Cofund',
          megjegyzes: 'NKFI Hivatal: NCP-k és a nyertes magyar partnerek nemzeti finanszírozása (2026-ban 19 konstrukció, összesen 2,7 Mrd Ft).',
          url: PARTNERSEG_OLDAL,
        },
        {
          nev: 'Digitális Kulcstechnológiák (KDT) / Chips közös vállalkozás',
          megjegyzes: 'NKFI Hivatal: NCP; a bekapcsolódást támogató hazai felhívás (2024-1.2.4-KDT) beadási határideje 2026. október 30-án lejárt.',
          url: NCP_OLDAL,
        },
        {
          nev: 'Kétoldalú kormányközi TéT-együttműködések',
          megjegyzes: 'TTM TéT-attasé hálózatot koordináló főosztálya (egyezmények, munkatervek, vegyes bizottságok); NKFI Hivatal (közös pályázatok; a 2026-1.2.2-TÉT beadása 2026. július 31-én lezárult).',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-felhivas',
        },
        {
          nev: 'Svájci Finanszírozási Mechanizmus – kétoldalú kutatási együttműködések',
          megjegyzes: 'Programoperátor: NKFI Hivatal; a TTM TéT-főosztálya az NKFI Hivatallal együttműködve látja el a minisztériumi feladatokat.',
          url: 'https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N',
        },
        {
          nev: 'Európai Űrügynökség (ESA) és uniós űrprogramok',
          megjegyzes: 'TTM Űrpolitikai Főosztály (ESA és Iparfejlesztési Osztály; EU Űrpolitikai és Nemzetközi Együttműködési Osztály).',
          url: 'https://kormany.hu/kormanyzat/tudomanyos-es-technologiai-miniszterium',
        },
      ],
    },
  ],
};

export default kategoria;

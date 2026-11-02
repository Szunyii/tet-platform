/**
 * 2. Kutatás-fejlesztési és innovációs finanszírozás – a TéT Tudástár kezdő tartalma.
 *
 * Források (lekérve: 2026-11-02):
 * - NKFIH, A Hivatal küldetése (mód. 2025. 05. 29.): https://nkfih.gov.hu/hivatalrol/hivatalrol – feladat, célcsoportok
 * - NKFIH, ügyfélszolgálat, kapcsolat: https://nkfih.gov.hu/palyazoknak/ugyfelszolgalat/kapcsolat – e-mail, telefon, cím
 * - NKFIH, Az NKFI Alap felépítése (mód. 2026. 04. 08.): https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/nkfi-alap-felepitese
 * - NKFIH, Programstratégia 2026 (mód. 2025. 11. 27.): https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026
 * - NKFIH, aktuális felhívások (NKFI Alap, Széchenyi Terv Plusz, egyéb): https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok
 * - NKFIH, felhívásoldalak: 2026-1.2.3-NETWORKING, 2025-1.1.1-IPARJOG, 2025-1.2.2-EUREKA, WIDERA Travel Grants,
 *   2026-1.2.2-TÉT, 2026-4.1.2-HU-RIZONT, 2026-4.1.1-MISSZIÓK, 2026-1.1.2-TTC (https://nkfih.gov.hu/palyazoknak/…)
 * - NKFIH, Kormányzati Önerő Alap (mód. 2026. 03. 19.): https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap
 * - NKFIH, Horizont Jogsegély Hotline: https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap/horizont-jogsegely-hotline
 * - NKFIH, „Megszűnt a korlátozás” (2026. 10.): https://nkfih.gov.hu/hivatalrol/hivatal-hirei/megszunt-korlatozas
 * - NKFIH, „Még igényelhető a WIDERA Travel Grants” (mód. 2026. 10. 15.):
 *   https://nkfih.gov.hu/hivatalrol/hivatal-hirei/meg-igeneyelheto-a-widera-travel-grants
 * - NKFIH, partnerségi konstrukciók: https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/partnersegi-konstrukciok
 * - NKFIH, Horizont Európa NCP-k (mód. 2026. 10. 15.):
 *   https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok
 * - NKFIH, Horizont Európa (keretösszeg, pillérek): https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa
 * - NKFIH Horizont Európa honlap: https://horizonteuropa.nkfih.gov.hu/
 * - MTA, ERC nemzeti kapcsolattartó pont: https://mta.hu/mta_erc
 * - COST, Hungary (COST National Coordinator): https://www.cost.eu/about/members/hungary/
 * - 90/2026. (V. 13.) Korm. rendelet: https://njt.jog.gov.hu/jogszabaly/2026-90-20-22 – 1. melléklet 15. pont (NKFIH: TTM
 *   irányítás), 82. § (GEM, kkv-finanszírozás), 106. § (KBM, uniós források)
 * - 2/2026. (IX. 21.) TTM utasítás (SZMSZ): https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N – NKFI Alap feletti rendelkezés,
 *   TéT-főosztály (egyezmények, Svájci Hozzájárulás kétoldalú kutatási együttműködései), Űrpolitikai Főosztály (ESA)
 * - NIÜ, Álláspályázat a vezérigazgatói tisztségre (2026. 10. 30.): https://niu.hu/ – az NKFIH a NIÜ tulajdonosi joggyakorlója
 * - kormany.hu, TTM közlemény (2026. 08. 31.): https://kormany.hu/hirek/uj-program-a-doktoranduszoknak – az NKFI Alap tervezett bővítése
 * - EU-oldalak: https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home ; https://eic.ec.europa.eu/index_en ;
 *   https://eismea.ec.europa.eu/index_en ; https://research-and-innovation.ec.europa.eu/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe_en
 *
 * ELLENŐRIZENDŐ:
 * - A GINOP Plusz (Széchenyi Terv Plusz) 2026-os irányító hatósága; hivatalos forrásban nem találtam, ezért a lista nem nevezi meg.
 * - Az NKFI Alap 2027. évi programstratégiája (még nem találtam), és a bejelentett forrásbővítés (TTM: három év alatt kb. 225 Mrd Ft).
 * - A Kormányzati Önerő Alap sorsa a 2026. október 30-i benyújtási határidő és a feltételességi eljárás lezárása után.
 * - A 2026-1.1.2-TTC és a 2026-4.1.1-MISSZIÓK felhívás állapota (a nyitott felhívások listájában nem szerepelnek).
 * - Eurostars: van-e 2026-os hazai társfinanszírozási felhívás (a legutóbbi az NKFIH archívumában 2024-1.2.7-EUROSTARS).
 * - Az EUREKA-hálózat saját oldalán a magyar nemzeti iroda adatai (az eurekanetwork.org lekérése nem sikerült).
 * - Az NKFI Hivatal vezetésének és szervezetének esetleges 2026-os változásai.
 */
import type { ForrasKategoria } from './tipusok';

const NCP_OLDAL = 'https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok';

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
        'A KFI-törvény alapján 2015-ben létrehozott központi hivatal a Tudományos és Technológiai Minisztérium irányítása alatt működik, és a legjelentősebb állami KFI-finanszírozó: kezeli a Nemzeti Kutatási, Fejlesztési és Innovációs Alapot (NKFI Alap). Működteti a Horizont Európa nemzeti kapcsolattartói hálózatát, kiírja a nemzetközi együttműködéseket támogató hazai pályázatokat, és itt érhető el a Kormányzati Önerő Alap.',
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
            'Az NKFI Alap négy alaprészből áll:\n' +
            '- Innovációs Alaprész: vállalati innováció és piacorientált, részben üzleti–tudományos együttműködésben megvalósuló K+F; itt jelennek meg a nemzetközi programok is;\n' +
            '- Kutatási Alaprész: kiszámítható kutatásfinanszírozás, a kutatói pálya elején járók támogatása; a kiválósági alapú felhívásokra a Kutatási Kiválósági Tanács tesz javaslatot;\n' +
            '- Nemzeti Laboratóriumok Alaprész (2022 óta): egészséges élet, biztonság és védelem, a gazdaság és társadalom digitális átállása, zöld átállás;\n' +
            '- Missziók Alaprész (2025 óta): stratégiailag fontos területeken nagy társadalmi vagy gazdasági hatású K+F-programok.\n\n' +
            'Az éves programstratégia határozza meg a meghirdetendő felhívásokat és kereteiket. A 2026. évi programstratégia mintegy 120 Mrd Ft-tal számol; céljai a vállalatok és egyetemek együttműködése, a kutatói létszám növelése, a szabadalmi bejelentések megduplázása és az innovatív vállalkozások arányának emelése, harmadik nagy célterületként a missziókkal. Újdonsága, hogy a vissza nem térítendő támogatások mellett állami társfinanszírozású kockázatitőke-alapok is megjelennek.\n\n' +
            'A TTM 2026. augusztusi közleménye szerint a kormány három év alatt megduplázná az NKFI Alap forrásait.',
        },
        {
          cim: 'Aktuális hazai és nemzetközi pályázatok',
          szoveg:
            'Nyitott NKFI Alap-felhívások a 2026. november 2-i állapot szerint:\n' +
            '- Európai kutatási-innovációs szakmai szervezetekben való részvétel (2026-1.2.3-NETWORKING): 2–6 MFt, határidő 2026. november 20.;\n' +
            '- szellemitulajdon-védelem (2025-1.1.1-IPARJOG): 0,01–7,5 MFt, határidő 2026. december 18.;\n' +
            '- magyar részvétel az EUREKA-programban (2025-1.2.2-EUREKA): 20–70 MFt, szakaszos bírálattal 2027-ig;\n' +
            '- WIDERA Travel Grants: legfeljebb 1000 euró a Horizont Európa partnerkereső rendezvényeinek útiköltségére, 2027. január 31-ig.\n\n' +
            'A Széchenyi Terv Plusz programjai közül az NKFI Hivatal felhívásai között szerepel a Korai fázisú kutatás-fejlesztési kockázati tőkeprogram (GINOP Plusz-2.5.1-25) és a Technológiaspecifikus Kockázati Tőkeprogram (GINOP Plusz-2.5.2-26).\n\n' +
            'A 2026-ban meghirdetett, a nyitott felhívások között már nem szereplő pályázatok közül kiemelendő a HU-rizont nemzetközi kiválósági kutatási együttműködési program (8 Mrd Ft), a kétoldalú TéT-pályázat (kínai és francia reláció), a Misszióvezérelt Nemzeti Laboratóriumok továbbfejlesztése (20,92 Mrd Ft) és a technológiatranszfer-cégek hálózatának fejlesztése (6 Mrd Ft).\n\n' +
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
            'A kétoldalú kormányközi TéT-egyezményeket és munkaterveket a TTM TéT-attasé hálózatot koordináló főosztálya készíti elő; a pályázatokat az NKFI Hivatal írja ki.',
        },
        {
          cim: 'Kormányzati Önerő Alap és más társfinanszírozási konstrukciók',
          szoveg:
            'A Kormányzati Önerő Alap (KÖA) az (EU) 2022/2506 tanácsi végrehajtási határozat hatálya alá tartozó szervezeteknek – a közérdekű vagyonkezelő alapítványoknak és az általuk fenntartott intézményeknek – nyújtott pályázati forrást helyettesítő támogatást a nyertes Horizont Európa-, Erasmus+ és más uniós KFI- vagy oktatási projektekben: a tervezett költség 100%-áig, egy összegben igényelhető előleggel. A 2026-1.2.1-KÖA felhívásra 2026. október 30-ig lehetett kérelmet benyújtani.\n\n' +
            '2026. október 13-án az EU Általános Ügyek Tanácsa lezárta a Magyarország elleni feltételességi eljárást, a korlátozó határozat október 14-én hatályát vesztette. Az érintett intézmények azóta ismét kedvezményezettként és koordinátorként is részt vehetnek a közvetlen uniós programokban; a már aláírt támogatási szerződések módosítását a konzorciumnak kell kezdeményeznie, és a módosítás nem visszamenőleges. Az érintett szervezeteknek az NKFI Hivatal Horizont Jogsegély Hotline-ja ad szakmai támogatást.\n\n' +
            'További társfinanszírozás: a Horizont Európa európai partnerségek és az ERA-NET Cofund programok nyertes magyar résztvevőinek nemzeti támogatása, a Digitális Kulcstechnológiák (KDT) partnerségbe való bekapcsolódás támogatása és az EUREKA-részvétel támogatása.',
        },
      ],
      programok: [
        {
          nev: 'Európai kutatási-innovációs szakmai szervezetekben való részvétel támogatása (2026-1.2.3-NETWORKING)',
          leiras: 'Európai KFI-szakmai szervezetekben való részvétel (pl. tagdíj, kapcsolatépítés); 2–6 MFt, határidő 2026. november 20.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/europai-kutatasi-innovacios-szakmai-szervezetekben-valo-reszvetel-tamogatasa-2026-123-networking/palyazati-felhivas',
        },
        {
          nev: 'Az EUREKA programban való magyar részvétel támogatása (2025-1.2.2-EUREKA)',
          leiras: 'Piacközeli nemzetközi K+F-projektek magyar résztvevőinek támogatása, elsősorban kkv-knak; 20–70 MFt, szakaszos bírálattal 2027-ig.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/eureka-programban-valo-magyar-reszvetel-tamogatasa-2025-122-eureka/palyazati-felhivas',
        },
        {
          nev: 'Szellemi alkotások szellemitulajdon-védelmének támogatása (2025-1.1.1-IPARJOG)',
          leiras: 'Hazai és nemzetközi szellemitulajdon-védelmi tevékenységek támogatása; 0,01–7,5 MFt, határidő 2026. december 18.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/szellemi-alkotasok-szellemi-tulajdon-vedelme-2025-111-iparjog/palyazati-felhivas',
        },
        {
          nev: 'WIDERA Travel Grants',
          leiras: 'Legfeljebb 1000 euró utófinanszírozás a Horizont Európa II. pillér partnerkereső rendezvényein való részvételhez, 2027. január 31-ig.',
          url: 'https://nkfih.gov.hu/palyazoknak/egyeb-tamogatas/horizont-europa-2-piller-partnerkereso-rendezvenyen-reszvetel-widera-travel-grants/palyazati-felhivas',
        },
      ],
      linkek: [
        { felirat: 'Aktuális pályázati felhívások', url: 'https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok' },
        { felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: 'https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026' },
        { felirat: 'Az NKFI Alap felépítése', url: 'https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/nkfi-alap-felepitese' },
        { felirat: 'Kormányzati Önerő Alap', url: 'https://nkfih.gov.hu/palyazoknak/kormanyzati-onero-alap' },
        { felirat: 'A korlátozás megszűnése (2026. október)', url: 'https://nkfih.gov.hu/hivatalrol/hivatal-hirei/megszunt-korlatozas' },
        { felirat: 'Partnerségi konstrukciók', url: 'https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/partnersegi-konstrukciok' },
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
          megjegyzes: 'A miniszter iránymutatása alapján rendelkezik az NKFI Alap felett, és felel annak stratégiai tervezéséért.',
          url: 'https://kormany.hu/kormanyzat/tudomanyos-es-technologiai-miniszterium',
        },
        {
          nev: 'Gazdasági és Energetikai Minisztérium (GEM)',
          megjegyzes: 'Vállalkozásfejlesztés: a kkv-k finanszírozása, kamattámogatott hitel-, tőke- és garanciaprogramok; felügyeli az állami pénzintézetek stratégiáját.',
          url: 'https://kormany.hu/kormanyzat/gazdasagi-es-energetikai-miniszterium',
        },
        {
          nev: 'Nemzeti Innovációs Ügynökség (NIÜ)',
          megjegyzes: 'Kisebb, célzott támogatások: Innovációs Voucher Program, HSUP Growth Fund, startup-rendezvények támogatása. Bővebben: 3. kategória.',
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
          megjegyzes: 'Az uniós társfinanszírozású és hazai fejlesztési felhívások közzétételi és e-ügyintézési felülete; több NKFI Alap-pályázat is itt nyújtható be.',
          url: 'https://www.palyazat.gov.hu/',
        },
        {
          nev: 'Közlekedési és Beruházási Minisztérium (KBM)',
          megjegyzes: 'Az uniós források hazahozatalának és felhasználásának kormányzati koordinációja.',
          url: 'https://kormany.hu/kormanyzat/kozlekedesi-es-beruhazasi-miniszterium',
        },
      ],
    },
    {
      slug: 'horizont-europa-ncp',
      tipus: 'lista',
      nev: 'Horizont Európa nemzeti kapcsolattartók',
      osszefoglalo:
        'A nemzeti kapcsolattartók (NCP-k) ingyenes tájékoztatást, pályázati tanácsadást és partnerkeresési segítséget adnak a magyar pályázóknak. Az ERC kapcsolattartó pontja az MTA-nál, a többi téma az NKFI Hivatalnál működik; közös elérhetőség: ncp@nkfih.gov.hu, +36 70 680 6421. A jogi és pénzügyi NCP csak e-mailben fogad megkeresést.',
      sorok: [
        { nev: 'Európai Kutatási Tanács (ERC)', megjegyzes: 'Magyar Tudományos Akadémia Titkársága', url: 'https://mta.hu/mta_erc' },
        { nev: 'Marie Skłodowska-Curie akciók (MSCA)', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'Kutatási infrastruktúrák', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: '1. klaszter: Egészségügy', megjegyzes: 'NKFI Hivatal; az Innovative Health Initiative (IHI) partnerség is', url: NCP_OLDAL },
        { nev: '2. klaszter: Kultúra, kreativitás és befogadó társadalom', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: '3. klaszter: A társadalmat szolgáló polgári biztonság', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: '4. klaszter: Digitalizáció, ipar és világűr', megjegyzes: 'NKFI Hivatal; a Chips közös vállalkozás (Chips JU) is', url: NCP_OLDAL },
        {
          nev: '5. klaszter: Éghajlat, energia és mobilitás',
          megjegyzes: 'NKFI Hivatal; a Clean Hydrogen, a CCAM, az Europe’s Rail és a Clean Aviation partnerség is',
          url: NCP_OLDAL,
        },
        {
          nev: '6. klaszter: Élelmiszerek, biogazdaság, természeti erőforrások, mezőgazdaság és környezet',
          megjegyzes: 'NKFI Hivatal; a Circular Bio-based Europe közös vállalkozás (CBE JU) is',
          url: NCP_OLDAL,
        },
        { nev: 'Európai Innovációs Tanács (EIC), európai innovációs ökoszisztémák, EIT', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'A részvétel szélesítése (Widening) és az Európai Kutatási Térség (ERA)', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        { nev: 'Missziók és az Új Európai Bauhaus', megjegyzes: 'NKFI Hivatal', url: NCP_OLDAL },
        {
          nev: 'Társfinanszírozott programok: európai partnerségek és ERA-NET-ek',
          megjegyzes: 'NKFI Hivatal; a nemzetközi felhívásokról tájékoztat, a hazai társfinanszírozásról az NKFI Alap ügyfélszolgálata',
          url: NCP_OLDAL,
        },
        { nev: 'Jogi és pénzügyi NCP', megjegyzes: 'NKFI Hivatal; csak e-mailes megkeresés (ncp@nkfih.gov.hu)', url: NCP_OLDAL },
      ],
      linkek: [
        { felirat: 'A nemzeti kapcsolattartók oldala (NKFIH)', url: NCP_OLDAL },
        { felirat: 'Horizont Európa – az NKFIH magyar nyelvű oldala', url: 'https://horizonteuropa.nkfih.gov.hu/' },
      ],
    },
    {
      slug: 'nemzetkozi-programok-hazai-felelosei',
      tipus: 'lista',
      nev: 'Az EUREKA, a Eurostars, a COST és más programok hazai felelősei',
      osszefoglalo:
        'A Horizont Európán kívüli nemzetközi KFI-programok magyar kapcsolódási pontjai. A legtöbb program hazai koordinátora és finanszírozója az NKFI Hivatal; a kormányközi TéT-egyezmények és az űrügyek a Tudományos és Technológiai Minisztériumhoz tartoznak.',
      sorok: [
        {
          nev: 'EUREKA',
          megjegyzes: 'NKFI Hivatal: nemzeti kapcsolattartó és a magyar résztvevők támogatása (2025-1.2.2-EUREKA felhívás).',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/eureka-programban-valo-magyar-reszvetel-tamogatasa-2025-122-eureka/palyazati-felhivas',
        },
        {
          nev: 'Eurostars (innovatív kkv-k európai partnersége)',
          megjegyzes: 'NKFI Hivatal: nemzeti kapcsolattartó; a magyar résztvevők hazai társfinanszírozása korábban külön felhívással (legutóbb 2024-1.2.7-EUROSTARS).',
          url: NCP_OLDAL,
        },
        {
          nev: 'COST (European Cooperation in Science and Technology)',
          megjegyzes: 'NKFI Hivatal, Nemzetközi Ügyek Főosztálya: itt működik a COST nemzeti koordinátora.',
          url: 'https://www.cost.eu/about/members/hungary/',
        },
        {
          nev: 'Európai partnerségek, ERA-NET Cofund, EJP Cofund',
          megjegyzes: 'NKFI Hivatal: NCP-k és a nyertes magyar partnerek nemzeti finanszírozása.',
          url: 'https://nkfih.gov.hu/palyazoknak/kfi-palyazatok/partnersegi-konstrukciok',
        },
        {
          nev: 'Digitális Kulcstechnológiák (KDT) / Chips közös vállalkozás',
          megjegyzes: 'NKFI Hivatal: NCP és a partnerségbe való bekapcsolódás hazai támogatása.',
          url: NCP_OLDAL,
        },
        {
          nev: 'Kétoldalú kormányközi TéT-együttműködések',
          megjegyzes: 'TTM TéT-attasé hálózatot koordináló főosztálya (egyezmények, munkatervek); NKFI Hivatal (pályázatok, pl. 2026-1.2.2-TÉT).',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-felhivas',
        },
        {
          nev: 'Svájci Hozzájárulás – kétoldalú kutatási együttműködések',
          megjegyzes: 'A TTM SZMSZ-e szerint a TéT-főosztály az NKFI Hivatallal együttműködve látja el a feladatokat.',
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

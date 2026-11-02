/**
 * 1. Szakpolitikai irányítás és koordináció – a TéT Tudástár kezdő tartalma.
 *
 * Források (lekérve: 2026-11-02):
 * - 90/2026. (V. 13.) Korm. rendelet a Kormány tagjainak feladat- és hatásköréről (hatályos szöveg, a 383/2026. (X. 29.)
 *   Korm. rendelettel módosítva): https://njt.jog.gov.hu/jogszabaly/2026-90-20-22 – 17. alcím, 168–178. § (TTM), 8. alcím,
 *   75–82. § (GEM, az atomenergia-ipar innovációja is), 12. alcím, 120. § (2) m) (KÜM, tudománydiplomácia), 124. és 127. §
 *   (OGYM), 6. alcím (EüM), 4. alcím (AEM), 9. alcím (HM, védelmi innováció), 106. § (KBM, uniós források), 197/A. §
 *   (Fejlesztési Kabinet), 1. melléklet 15. pont (NKFIH: TTM irányítás)
 * - 2/2026. (IX. 21.) TTM utasítás a TTM Szervezeti és Működési Szabályzatáról: https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N –
 *   alapadatok (1. §), tudománypolitikai és innovációs államtitkár (27–30. §: KFI-stratégia 2026–2034, NKFI Alap, startup,
 *   technológiatranszfer, Science Park, NTTIT és KKT), helyettes államtitkárok (31. §), TéT Attasé Hálózat Koordinációjáért
 *   Felelős Főosztály és Tudományos Nemzetközi Kapcsolatok Főosztály (1. függelék), szervezeti egységek (2. függelék),
 *   irányítási és felügyeleti jogok (4. függelék: NKFIH irányítás, NIÜ szakmai felügyelet)
 * - 2014. évi LXXVI. törvény (KFI tv.), hatályos szöveg: https://njt.jog.gov.hu/jogszabaly/2014-76-00-00 – 4. § (1), 10/A–10/D. §
 *   (Nemzeti Tudománypolitikai Tanács, Kutatási Kiválósági Tanács)
 * - kormany.hu, TTM oldala: https://kormany.hu/kormanyzat/tudomanyos-es-technologiai-miniszterium – elérhetőségek, hírek
 * - kormany.hu, kormányzati elérhetőségek: https://kormany.hu/kormanyzati-elerhetosegek – minisztériumok címe, e-mail-címe
 * - kormany.hu, minisztériumi oldalak (GEM, OGYM, KÜM, AEM, EüM, HM, KBM): https://kormany.hu/kormanyzat
 * - kormany.hu, „Új program a doktoranduszoknak” (TTM, 2026. 08. 31.): https://kormany.hu/hirek/uj-program-a-doktoranduszoknak –
 *   az NKFI Alap tervezett bővítése, innovációs oktatás, brüsszeli tudományos és technológiai iroda terve
 * - kormany.hu, „Magyar érdekek a nemzetközi technológiai innovációban” (TTM, 2026. 09. 23.):
 *   https://kormany.hu/hirek/magyar-erdekek-a-nemzetkozi-technologiai-innovacioban
 * - NKFIH, Kutatási Kiválósági Tanács: https://nkfih.gov.hu/hivatalrol/testuletek-bizottsagok/kutatasi-kivalosagi-tanacs
 * - NKFIH, 2026. évi programstratégia: https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026
 * - MTA (testületek, ERC-pont, kapcsolat): https://mta.hu/ ; HUN-REN: https://hun-ren.hu/ ; MRK: https://mrk.hu/
 *
 * ELLENŐRIZENDŐ:
 * - A 2026–2034-es KFI-stratégia: a TTM SZMSZ-e nevesíti, de elfogadott vagy társadalmi egyeztetésre bocsátott hivatalos
 *   szövegét nem találtam; a „Prioritások” szakasz ezért az SZMSZ feladatköreiből és a TTM közleményeiből épül.
 * - A TTM SZMSZ-ében szereplő „Nemzeti Tudománypolitikai, Technológiai és Innovációs Tanács” és a KFI tv. (2025. 12. 17-i
 *   hatályos szöveg) szerinti Nemzeti Tudománypolitikai Tanács viszonya (átnevezés vagy új testület), összetétele, honlapja.
 * - A TTM központi telefonszáma és önálló honlapja (a kormany.hu csak e-mail-címet és székhelyet közöl; a levelezési
 *   domain ttm.gov.hu, de önálló honlapot nem találtam).
 * - Az NKFI Alap forrásainak a TTM által bejelentett növelése (három év alatt kb. 225 Mrd Ft) a 2027-es költségvetési
 *   törvényjavaslatban.
 * - A bejelentett brüsszeli tudományos és technológiai iroda megnyitásának állapota.
 */
import type { ForrasKategoria } from './tipusok';

const kategoria: ForrasKategoria = {
  leiras: 'A KFI-politikát irányító TTM, az érintett ágazati minisztériumok, koordinációs és tanácsadó testületek.',
  bevezeto:
    'A magyar kutatás-, fejlesztés- és innovációpolitikát 2026 óta a Tudományos és Technológiai Minisztérium (TTM) irányítja: övé a kormányzati tudománypolitika és annak koordinációja, irányítja az NKFI Hivatalt, és szakmailag felügyeli a Nemzeti Innovációs Ügynökséget. A gazdaságfejlesztés, a felsőoktatás, a tudománydiplomácia és az ágazati innováció más minisztériumoknál van, a döntések előkészítésében pedig a KFI-törvény szerinti tanácsok és a tudományos köztestületek vesznek részt. Az attasé itt látja, melyik kérdéssel kihez forduljon, és hol található a TéT-attasé hálózatot koordináló minisztériumi egység.',
  kartyak: [
    {
      slug: 'ttm',
      tipus: 'intezmeny',
      nev: 'Tudományos és Technológiai Minisztérium',
      rovidites: 'TTM',
      osszefoglalo:
        'A 2026-ban létrehozott minisztérium felel a kormányzati tudománypolitikáért és annak koordinációjáért, a KFI-ügyek finanszírozásáért, a mesterséges intelligenciáért, az űriparért, valamint az e-közigazgatásért és a kormányzati informatikáért. Irányítja az NKFI Hivatalt, szakmailag felügyeli a Nemzeti Innovációs Ügynökséget, és itt működik a TéT-attasé hálózatot koordináló főosztály.',
      honlap: 'https://kormany.hu/kormanyzat/tudomanyos-es-technologiai-miniszterium',
      profil:
        'A minisztérium angol neve Ministry of Science and Technology. Alapító okirata 2026. május 28-i; jogállását és feladatkörét a Magyarország minisztériumainak felsorolásáról szóló 2026. évi XIII. törvény, a Kormány tagjainak feladat- és hatásköréről szóló 90/2026. (V. 13.) Korm. rendelet (Statútum rendelet) és a 2/2026. (IX. 21.) TTM utasítással kiadott SZMSZ határozza meg.\n\n' +
        'A Statútum rendelet szerint a tudományos és technológiai miniszter többek között a következőkért felelős:\n' +
        '- kormányzati tudománypolitika és a tudománypolitika koordinációja,\n' +
        '- nemzeti adatvagyon-gazdálkodás és mesterséges intelligencia (ezen belül az MI-vel kapcsolatos vállalkozásfejlesztés),\n' +
        '- űriparfejlesztés és űrtechnológiák (HUNOR Magyar Űrhajós Program, ESA-kapcsolatok),\n' +
        '- e-közigazgatás, informatika, kiberbiztonság, elektronikus hírközlés,\n' +
        '- személyiadat- és lakcímnyilvántartás, külföldre utazás szabályozása, köziratkezelés.\n\n' +
        'A kormányzati tudománypolitikát a miniszter a Magyar Tudományos Akadémia elnökének közreműködésével dolgozza ki. A tudománypolitika koordinációja keretében előkészíti a KFI-ökoszisztéma jogszabályait, felel a KFI-ügyek finanszírozásáért, kapcsolatot tart a HUN-REN Magyar Kutatási Hálózattal, és koordinálja a KFI-ösztönző programok kidolgozását.',
      tevekenyseg:
        'A KFI-ügyek a tudománypolitikai és innovációs államtitkárhoz tartoznak. Közvetlenül alá tartozik a Tudományos Nemzetközi Kapcsolatok Főosztály, valamint két helyettes államtitkár:\n' +
        '- innovációs és technológiai helyettes államtitkár: Innovációs és Startup Főosztály, Technológiai Főosztály (MI-innováció, technológiai szabályozás, élettudományi és egészségipari technológiák, autonóm és intelligens rendszerek, feltörekvő technológiák), Űrpolitikai Főosztály;\n' +
        '- tudománypolitikai helyettes államtitkár: Tudománypolitikai Főosztály, Kutatási Intézményrendszer Főosztály, Kutatói Kiválósági Főosztály.\n\n' +
        'Az államtitkár a miniszter iránymutatása alapján rendelkezik a Nemzeti Kutatási, Fejlesztési és Innovációs Alap (NKFI Alap) felett, és felel annak szakpolitikai és stratégiai tervezéséért. Az NKFI Hivatal irányítását a minisztérium a tudománypolitikai és innovációs államtitkáron keresztül gyakorolja; a Nemzeti Innovációs Ügynökség felett ugyanő gyakorolja a szakmai felügyeletet.\n\n' +
        'A digitalizációs államtitkár viszi az e-közigazgatást, a kormányzati informatikát és a kiberbiztonságot; a mesterséges intelligenciáért külön helyettes államtitkár felel.',
      kapcsolat: {
        email: 'ugyfelszolgalat@ttm.gov.hu',
        cim: '1011 Budapest, Vám utca 5–7.',
      },
      szakaszok: [
        {
          cim: 'KFI-stratégia',
          szoveg:
            'A KFI-törvény szerint a középtávú KFI-stratégiát a Kormány alkotja meg. A TTM SZMSZ-e szerint a tudománypolitikai és innovációs államtitkár az érintett szakterületekkel együttműködve meghatározza és végrehajtja Magyarország 2026–2034 közötti KFI-stratégiáját, és koordinálja az ehhez kapcsolódó kormányzati tevékenységet.\n\n' +
            'A stratégia kidolgozásának keretei:\n' +
            '- a kormányzati tudománypolitikát a miniszter az MTA elnökének közreműködésével dolgozza ki;\n' +
            '- az államtitkár koordinálja az uniós és hazai KFI-források stratégiai felhasználását, és kidolgozza az uniós programozási időszakok KFI-vonatkozású programrészeinek koncepcióját;\n' +
            '- a stratégiai célok egyik fő eszköze az NKFI Alap, amelynek éves programstratégiája határozza meg a meghirdetendő pályázatokat.\n\n' +
            'Az NKFI Alap 2026. évi, még 2025 végén elfogadott programstratégiája (mintegy 120 Mrd Ft) a Neumann János Program céljaihoz igazodik; az új KFI-stratégia elfogadott szövegét a tartalom összeállításakor nem találtuk.',
        },
        {
          cim: 'Prioritások',
          szoveg:
            'Az SZMSZ-ben rögzített feladatok alapján a minisztérium KFI-prioritásai:\n' +
            '- a KFI-t ösztönző szakpolitikai eszközök, köztük az adórendszeren belüli közvetett támogatások fejlesztése;\n' +
            '- az alapkutatás, a kutatási kiválóság, a kutatási infrastruktúrák és a nemzetközi tudományos együttműködések ösztönzése;\n' +
            '- szemléletváltó, misszió alapú stratégiai projektek indítása;\n' +
            '- a nemzeti startup-ökoszisztéma fejlesztése, az innovatív vállalkozások finanszírozási ösztönzőrendszere és a nemzeti startupprogramok koordinálása (a Gazdasági és Energetikai Minisztériummal közösen);\n' +
            '- a technológiatranszfer szabályozási és intézményi keretei, az egyetem–ipar–állam együttműködés;\n' +
            '- az inkubációs és akcelerációs intézményrendszer, valamint a Tudományos és Innovációs Parkok (Science Park) kialakítása;\n' +
            '- az innovációs és szellemitulajdon-védelmi tudatosság erősítése, innovációs képzések.\n\n' +
            'A TTM 2026. augusztus 31-i közleménye szerint a kormány három év alatt megduplázná az NKFI Alap forrásait (így azok elérhetik a 225 Mrd Ft-ot), egyszerűsítené a cégalapítást, a 2026/2027-es tanévtől a középiskolákban is elindítja az innovációs oktatást, és a magyar uniós részvétel erősítésére tudományos és technológiai irodát nyit Brüsszelben.',
        },
        {
          cim: 'Kiemelt ágazatok',
          szoveg:
            'A minisztérium szervezete és feladatköre alapján kiemelt technológiai területek:\n' +
            '- mesterséges intelligencia: nemzeti MI-stratégia, kormányzati MI-alkalmazások, nagy teljesítményű számítási (HPC) és szuverén számítási infrastruktúra, MI-piacfelügyelet;\n' +
            '- űripar és űrtechnológiák: űripari stratégia, nemzetközi képviselet, az Európai Űrügynökséggel (ESA) kapcsolatos feladatok, HUNOR Magyar Űrhajós Program;\n' +
            '- élettudományi és egészségipari technológiák;\n' +
            '- autonóm és intelligens rendszerek, robotika;\n' +
            '- feltörekvő technológiák;\n' +
            '- digitális állam, adatgazdaság és kiberbiztonság.\n\n' +
            'Az ágazati innováció egy része más tárcáknál van: az egészségügyi innováció az Egészségügyi Minisztériumnál, az agrár-KFI az Agrár- és Élelmiszergazdaságért Felelős Minisztériumnál, a védelmi innováció a Honvédelmi Minisztériumnál, az iparügyek és az atomenergia-ipar innovációs feladatai a Gazdasági és Energetikai Minisztériumnál.',
        },
        {
          cim: 'Kapcsolódás a TéT-attasé hálózathoz',
          szoveg:
            'A minisztériumban a nemzetközi és európai uniós helyettes államtitkár a digitalizációs államtitkárral és a tudománypolitikai és innovációs államtitkárral együttműködve koordinálja a tudományos és technológiai attasék munkáját.\n\n' +
            'A Tudományos és Technológiai Attasé Hálózat Koordinációjáért Felelős Főosztály:\n' +
            '- előkészíti a két- és többoldalú kormányközi TéT-egyezményeket és a kétoldalú TéT-munkaterveket, gondoskodik végrehajtásukról;\n' +
            '- a Külügyminisztérium útján tartja a kapcsolatot a külképviseletekkel, és a Külügyminisztériummal együttműködve részt vesz a hálózat szakmai irányításában;\n' +
            '- az NKFI Hivatallal együttműködve látja el a szakdiplomata-hálózat kialakításával, működtetésével és szakmai irányításával kapcsolatos minisztériumi feladatokat.\n\n' +
            'A nemzetközi tudományos és innovációs együttműködések szakmai gazdája a Tudományos Nemzetközi Kapcsolatok Főosztály.',
        },
      ],
      linkek: [
        { felirat: 'A TTM Szervezeti és Működési Szabályzata (2/2026. (IX. 21.) TTM utasítás)', url: 'https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N' },
        { felirat: 'A Kormány tagjainak feladat- és hatásköre (90/2026. (V. 13.) Korm. rendelet)', url: 'https://njt.jog.gov.hu/jogszabaly/2026-90-20-22' },
        { felirat: 'A KFI-törvény (2014. évi LXXVI. törvény)', url: 'https://njt.jog.gov.hu/jogszabaly/2014-76-00-00' },
        { felirat: 'Kormányzati elérhetőségek', url: 'https://kormany.hu/kormanyzati-elerhetosegek' },
        { felirat: 'A TTM 2026. augusztusi közleménye a tudományos és innovációs stratégiáról', url: 'https://kormany.hu/hirek/uj-program-a-doktoranduszoknak' },
      ],
    },
    {
      slug: 'agazati-miniszteriumok',
      tipus: 'lista',
      nev: 'Az innovációhoz kapcsolódó ágazati minisztériumok',
      osszefoglalo:
        'A 90/2026. (V. 13.) Korm. rendelet szerint a KFI-hez kapcsolódó ágazati feladatok több tárcán oszlanak meg. A lista a minisztériumok KFI-szempontból fontos hatásköreit mutatja; a központi e-mail-címek és postacímek a kormányzati elérhetőségek oldalán találhatók.',
      sorok: [
        {
          nev: 'Gazdasági és Energetikai Minisztérium (GEM)',
          megjegyzes: 'Gazdaságfejlesztés, iparügyek, vállalkozásfejlesztés, külgazdaság; az atomenergia-ipar innovációja. A startup-ökoszisztéma irányait a TTM-mel közösen alakítja.',
          url: 'https://kormany.hu/kormanyzat/gazdasagi-es-energetikai-miniszterium',
        },
        {
          nev: 'Oktatási és Gyermekügyi Minisztérium (OGYM)',
          megjegyzes: 'Felsőoktatás; az egyetemekkel megvalósuló tudományos innovációs parkok, nemzeti laborok és kiválósági központok kormányzati koordinációja.',
          url: 'https://kormany.hu/kormanyzat/oktatasi-es-gyermekugyi-miniszterium',
        },
        {
          nev: 'Külügyminisztérium (KÜM)',
          megjegyzes: 'Az érintett miniszterrel együttműködve irányítja a tudománydiplomáciai tevékenységet; a TéT-attasé hálózat szakmai irányításában a TTM-mel működik együtt.',
          url: 'https://kormany.hu/kormanyzat/kulugyminiszter',
        },
        {
          nev: 'Agrár- és Élelmiszergazdaságért Felelős Minisztérium (AEM)',
          megjegyzes: 'Az agrár-KFI feladatok koordinációja, a mezőgazdasági ismeret- és innovációs rendszer (AKIS) és az agrárdigitalizáció.',
          url: 'https://kormany.hu/kormanyzat/agrar-es-elelmiszergazdasagi-miniszterium',
        },
        {
          nev: 'Egészségügyi Minisztérium (EüM)',
          megjegyzes: 'Az egészségügyi innováció; a gyógyszerpolitika, a gyógyászati segédeszközök és az orvostechnikai eszközök.',
          url: 'https://kormany.hu/kormanyzat/egeszsegugyi-miniszterium',
        },
        {
          nev: 'Honvédelmi Minisztérium (HM)',
          megjegyzes: 'A védelmi innováció stratégiai fejlesztési irányai, a védelmi és hadfelszerelési fejlesztések stratégiája.',
          url: 'https://kormany.hu/kormanyzat/honvedelmi-miniszterium',
        },
        {
          nev: 'Közlekedési és Beruházási Minisztérium (KBM)',
          megjegyzes: 'Az európai uniós források hazahozatalának és felhasználásának koordinációja.',
          url: 'https://kormany.hu/kormanyzat/kozlekedesi-es-beruhazasi-miniszterium',
        },
      ],
      linkek: [
        { felirat: 'Kormányzati elérhetőségek', url: 'https://kormany.hu/kormanyzati-elerhetosegek' },
        { felirat: 'A Kormány tagjainak feladat- és hatásköre (90/2026. (V. 13.) Korm. rendelet)', url: 'https://njt.jog.gov.hu/jogszabaly/2026-90-20-22' },
      ],
    },
    {
      slug: 'kfi-koordinacios-testuletek',
      tipus: 'lista',
      nev: 'KFI-koordinációs és döntés-előkészítő testületek',
      osszefoglalo:
        'A tudomány- és innovációpolitika kormányzati döntés-előkészítésének testületei. A Nemzeti Tudománypolitikai Tanácsot és a Kutatási Kiválósági Tanácsot a KFI-törvény hozza létre; a kormányzati döntés fóruma a Fejlesztési Kabinet.',
      sorok: [
        {
          nev: 'Nemzeti Tudománypolitikai Tanács (NTT)',
          megjegyzes: 'KFI tv. 10/A. §: 12 tagú véleményező testület, elnöke a TTM minisztere. A TTM SZMSZ-e Nemzeti Tudománypolitikai, Technológiai és Innovációs Tanácsként említi.',
          url: 'https://njt.jog.gov.hu/jogszabaly/2014-76-00-00',
        },
        {
          nev: 'Kutatási Kiválósági Tanács (KKT)',
          megjegyzes: 'KFI tv. 10/D. §: héttagú, kutatókból álló testület; a kiválósági alapú kutatási támogatások döntés-előkészítője. Titkársága az NKFI Hivatal.',
          url: 'https://nkfih.gov.hu/hivatalrol/testuletek-bizottsagok/kutatasi-kivalosagi-tanacs',
        },
        {
          nev: 'Fejlesztési Kabinet',
          megjegyzes: 'A Kormány ügydöntő fóruma többek között a kormányzati tudománypolitika, a tudománypolitika koordinációja és az űripar ügyeiben (90/2026. Korm. rendelet 197/A. §).',
          url: 'https://njt.jog.gov.hu/jogszabaly/2026-90-20-22',
        },
      ],
    },
    {
      slug: 'strategiai-tanacsado-szervezetek',
      tipus: 'lista',
      nev: 'Stratégiai és tanácsadó szervezetek',
      osszefoglalo:
        'A tudománypolitika kidolgozásában jogszabály vagy hagyomány alapján szerepet vállaló köztestületek és képviseleti szervezetek. Jó belépési pontok, ha a magyar tudományos közösség álláspontjára vagy partnerintézményekre van szükség.',
      sorok: [
        {
          nev: 'Magyar Tudományos Akadémia (MTA)',
          megjegyzes: 'Elnöke közreműködik a kormányzati tudománypolitika kidolgozásában, és társjavaslattevő a KKT tagjainál. Itt működik az ERC nemzeti kapcsolattartó pontja.',
          url: 'https://mta.hu/',
        },
        {
          nev: 'HUN-REN Magyar Kutatási Hálózat',
          megjegyzes: 'Az állami kutatóközpontokat és -intézeteket összefogó hálózat; a TTM tudománypolitikai ügyekben kapcsolatot tart vele, elnöke társjavaslattevő a KKT tagjainál. Bővebben: 4. kategória.',
          url: 'https://hun-ren.hu/',
        },
        {
          nev: 'Magyar Rektori Konferencia (MRK)',
          megjegyzes: 'A felsőoktatási intézmények vezetőinek testülete; Nemzetközi Bizottsága a nemzetközi mobilitási és kutatási együttműködésekkel is foglalkozik.',
          url: 'https://mrk.hu/',
        },
      ],
    },
  ],
};

export default kategoria;

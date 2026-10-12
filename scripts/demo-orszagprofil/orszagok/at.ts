/**
 * Ausztria (AT) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a „2026-10-12” jelzésűek: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 566,456 Mrd USD,
 *   GDP/fő 61 694,026 USD, reálnövekedés 0,27%, lakosság 9,182 millió) –
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/AUT.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 * - Terület: Statistik Austria (83 879 km²; a WKO Statistisches Jahrbuch „Fläche und Wohnbevölkerung” táblája, 2026. február) –
 *   https://www.wko.at/oe/statistik/jahrbuch/bevoelkerung-bl.pdf (a migration.gv.at kormányzati portál 83 878 km²-t közöl)
 * - GII 2025 (19. hely; 2024: 17.; ráfordítás 17., kibocsátás 21.; pillérek: humántőke és kutatás 9., piaci fejlettség 30.;
 *   1 klaszter: Bécs, fő szabadalmi területe az orvostechnika; unikornisok: Bitpanda, GoStudent) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/at.pdf ; https://forwit.at/en/blog/austria-19th-in-the-global-innovation-index-2025/
 * - GERD (a gerd mező): OECD MSTI, 2026. márciusi kiadás, 2024: 3,26% (előzetes) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/AUT.A.G.PT_B1GQ..?startPeriod=2021 ,
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html ;
 *   nemzeti adat és előrejelzés: Statistik Austria, F&E-Globalschätzung 2026 (2026. április 23.): 2024: 3,34% (EU-ban 3.), 2025: 3,39% (becslés),
 *   2026: 3,34% (előrejelzés; a csökkenés oka a vállalati és az állami finanszírozás stagnálása) –
 *   https://www.statistik.at/fileadmin/announcement/2026/04/20260423FuEGlobalschaetzung2026EN.pdf
 * - Stratégia: FTI-Strategie 2030 (kormánydöntés: 2020. december 23.; tízéves, három fő cél) –
 *   https://www.bmwet.gv.at/bmafjgvat/forschung/forschung-oesterreich/strategische-ausrichtung-beratende-gremien/strategien/fti-strategie.html ;
 *   FTI-paktum 2027–2029 (Minisztertanács, 2026. február 24.; kb. 5,5 Mrd EUR, ebből kb. 3 Mrd az alapkutatásra; cél: 4%-os kutatási ráta
 *   2030-ra) – https://www.bundeskanzleramt.gv.at/bundeskanzleramt/nachrichten-der-bundesregierung/2026/02/bundesregierung-beschliesst-fti-pakt-fuer-die-jahre-2027-bis-2029.html
 * - Intézmények: BMFWF – https://www.bmfwf.gv.at/ ; BMIMI – https://www.bmimi.gv.at/ ; FORWIT – https://www.forwit.at/en/ ;
 *   FFG – https://www.ffg.at/en ; FWF – https://www.fwf.ac.at/en/about-us ; aws (BMWET és BMIMI tulajdonosi képviselet) – https://www.aws.at/en/ ;
 *   AIT (az ország legnagyobb kutatási-technológiai szervezete) – https://www.ait.ac.at/en/about-ait ; Silicon Austria Labs –
 *   https://silicon-austria-labs.com/en/ ; ASC (korábban VSC) – https://asc.ac.at/ ; MedAustron – https://www.medaustron.at/en/ ;
 *   Quantum Austria (2021. november 22.–2026. június 30.) – https://www.ffg.at/quantum-austria ; Forschungsprämie (14%) –
 *   https://www.ffg.at/forschungspraemie ; FWF ASTRA-díj (a 2024 júniusáig odaítélt START-díj utódja) –
 *   https://www.fwf.ac.at/en/funding/faq/expiring-programs/fwf-start-awards (2026-10-12) ; ACstyria mobilitási klaszter (autó-, repülő- és
 *   vasútipar) – https://acstyria.com/ueber-uns/zahlen-daten-fakten/ (2026-10-12) ;
 *   EMBL (Ausztria alapító tag, 1974) – https://www.embl.org/about/member-states/
 * - Az első kiemelt iparág indoka: az ágazati szövetség (FEEI) szerint az elektronikai és elektrotechnikai ipar a legkutatásintenzívebb
 *   ágazat – https://www.feei.at/ ; az Infineon Technologies Austria (Villach) saját közlése szerint az ország legnagyobb K+F-ráfordítású
 *   vállalata („das forschungsstärkste Unternehmen in Österreich”): a 2025-ös üzleti évben (szeptember 30-ig) 721 M EUR K+F-ráfordítás, kb. 2500 fő a K+F-ben,
 *   4,7 Mrd EUR árbevétel; a trend Top 500 rangsora szerint 2025-ben a legnagyobb K+F-ráfordítású ipari vállalat –
 *   https://www.infineon.com/de/regional/austria/about ,
 *   https://www.infineon.com/de/regional/austria/research-and-development (2026-10-12)
 * - Top vállalatok (9 név): a 2025-ös EU Industrial R&D Investment Scoreboard (2024-es üzleti év) osztrák székhelyű vállalatai K+F-ráfordítás
 *   szerint – https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip (az adatállományban osztrákként
 *   szereplő, valójában ausztráliai WiseTech Global és a felszámolását 2025-ben megszavazó Hookipa Pharma nélkül –
 *   https://www.sec.gov/Archives/edgar/data/1760542/000110465925071716/tm2521991d7_8k.htm , 2026-10-12), kiegészítve a Scoreboardban nem
 *   szereplő AVL-lel (2025: 1,83 Mrd EUR árbevétel, ennek 11%-a K+F) – https://www.avl.com/en/about-avl
 * - Rendezvények (hivatalos oldalak): https://www.alpbach.org/ , https://www.langenachtderforschung.at/ , https://viennaup.com/
 * - Nemzetközi tagságok: CERN (1959) – https://home.cern/about/who-we-are/member-states ; ESO – https://www.eso.org/public/about-eso/memberstates/ ;
 *   ESA – https://www.esa.int/About_Us/Corporate_news/ESA_facts
 * - Magyar vonatkozás:
 *   - Tudományos és műszaki együttműködési egyezmény (Bécs, 1969. május 28.; hatályos 1972. március 12-től; vegyes bizottság) – BGBl. 111/1972:
 *     https://www.ris.bka.gv.at/Dokumente/BgblPdf/1972_111_0/1972_111_0.pdf ; NKFIH, szerződéses országok –
 *     https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 *   - Kulturális és tudományos együttműködési egyezmény (Bécs, 1976. május 19.; 3. cikk: akadémiák, 4. cikk: kutatócsere) – 115/2008. Korm. rendelet:
 *     https://njt.jog.gov.hu/jogszabaly/2008-115-20-22
 *   - Az osztrák reláció az NKFIH kétoldalú TéT-felhívásaiban: 2023-ban szerepelt –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2023-124-tet/palyazati-csomag/palyazati-felhivas ;
 *     2024-ben (francia, kínai, szlovák), 2025-ben (szlovén, francia, szerb) és 2026-ban (kínai, francia) nem –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2024-125-tet/palyazati-csomag/palyazati-felhivas ,
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2025-124-tet/palyazati-csomag/palyazati-felhivas ,
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-csomag/palyazati-felhivas
 *   - Az OeAD aktív WTZ-partnerei (Magyarország nincs köztük) –
 *     https://oead.at/de/studieren-forschen-lehren/internationale-hochschulkooperationen/wissenschaftlich-technische-zusammenarbeit
 *   - MTA 2026-os mobilitási felhívása (ÖAW-reláció) – https://mta.hu/data/dokumentumok/nemzetkozi_kapcsolatok/egyszeri_kiutazasokhoz_felhivas_2026_honlapra.pdf
 *   - Ausztria Németország után a második legnagyobb befektető Magyarországon (az osztrák külügyminisztérium dátum nélküli oldala; a befektetési
 *     állományt – több mint 14,6 Mrd EUR – évszám nélkül közli, csak a kereskedelmi adat évszámos: 2025) –
 *     https://www.bmeia.gv.at/oeb-budapest/oesterreich-in-ungarn/wirtschaft
 *   - AVL járműfejlesztési központ Zalaegerszegen, a ZalaZONE mellett (megnyitó: 2022. november 17.) –
 *     https://www.avl.com/en/press/press-release/avl-opens-new-vehicle-engineering-center-direct-access-proving-ground (2026-10-12)
 *   - Aktion Österreich–Ungarn (OeAD) – https://oead.at/de/der-oead/unsere-programme-von-a-bis-z ; CEEPUS (központi iroda: Bécs) –
 *     https://www.ceepus.info/content/about ; Collegium Hungaricum – https://tka.hu/collegium_hungaricum ;
 *     Andrássy Gyula Egyetem (ulmi nyilatkozat, 2001; partnerországok) – https://aub.eu/universitaet/profil/geschichte/ ,
 *     https://aub.eu/universitaet/partner/partner-und-foerderlaender/
 *   - Stipendium Hungaricum: Ausztria nem partnerország – https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők: egyik sem; a Stipendium Hungaricum nem szerepel (Ausztria nem partnerország).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'AT',
  profil: {
    alapadatok: {
      fovaros: 'Bécs',
      terulet: '83 879',
      penznem: 'euró (EUR)',
      lakossag: '9 182 000',
      gdp: '566,5',
      gdpEgyFore: '61 694',
      gdpNovekedes: '0,3',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Statistik Austria',
      tagsagok: ['EU', 'OECD'],
      tagsagEgyeb: 'euróövezet, schengeni övezet; ESA, CERN, ESO, EMBL; Bécs ENSZ-székhely (pl. NAÜ, UNIDO)',
      agazatok: ['Gépipar', 'Autóipar', 'Elektronika és félvezetők', 'Gyógyszeripar', 'Energetika', 'Turizmus'],
      agazatEgyeb: 'Fém- és acélipar, fa- és papíripar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 19. hely (2024-ben a 17.); legerősebb pillére a humántőke és kutatás (9.), leggyengébb a piaci fejlettség (30.), '
        + 'a kibocsátási alindexben csak 21. A K+F-ráfordítás az OECD MSTI előzetes adata szerint 2024-ben a GDP 3,26%-a (a Statistik Austria szerint 3,34%, '
        + 'az EU-ban a harmadik legmagasabb); 2025-re 3,39%-os csúcsot becsülnek.',
      gerd: '3,26',
      strategia: 'FTI-Strategie 2030 (2020–2030); végrehajtás: FTI-paktum 2027–2029 (2026, kb. 5,5 milliárd euró); cél: 4%-os kutatási ráta 2030-ra',
      prioritasok: [
        'Alapkutatási kiválóság', 'Tehetség és mobilitás', 'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség',
        'Egészség és élettudomány', 'Technológiai szuverenitás',
      ],
      prioritasEgyeb: 'Kulcstechnológiák és a vállalati kutatás erősítése (FTI-paktum 2027–2029); az FTI-Strategie 2030 célja a nemzetközi élvonal elérése',
      kiemeltIparagak: [
        'Félvezetők és mikroelektronika', 'Mobilitás és autóipar', 'Kvantumtechnológia', 'Biotechnológia és gyógyszeripar',
        'Energetika és fenntarthatóság', 'Anyagtudomány',
      ],
      iparagEgyeb: 'Orvostechnika, gépgyártás és automatizálás',
      erossegek:
        'Tartósan magas, a Statistik Austria szerint az EU-ban harmadik legmagasabb K+F-intenzitás; erős alapkutatás (ISTA, az Osztrák Tudományos Akadémia '
        + 'intézetei, Vienna BioCenter) és alkalmazott kutatás (AIT, Silicon Austria Labs, COMET-központok). Az ágazati szövetség (FEEI) szerint '
        + 'a legkutatásintenzívebb ágazat az elektronikai és elektrotechnikai ipar; '
        + 'a 14%-os Forschungsprämie veszteséges cégeknek is elérhető.',
      kihivasok:
        'Rés a ráfordítások és az eredmények között: a GII kibocsátási alindexében 21., a piaci fejlettségben 30. A Statistik Austria előrejelzése szerint '
        + 'a K+F-intenzitás 2026-ban a vállalati és az állami finanszírozás stagnálása miatt a nemzeti adatsor szerinti 3,39%-ról 3,34%-ra csökken; '
        + 'a 4%-os 2030-as célhoz a vállalati K+F gyorsulása kellene.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Szövetségi Nőügyi, Tudományos és Kutatási Minisztérium (BMFWF) – tudománypolitika, alapkutatás.\n'
        + 'Szövetségi Innovációs, Mobilitási és Infrastruktúra-minisztérium (BMIMI) – alkalmazott kutatás.\n'
        + 'Szövetségi Gazdasági, Energia- és Turisztikai Minisztérium (BMWET) – vállalati innováció.\n'
        + 'FORWIT – tudományos és innovációs tanácsadó testület.\n'
        + 'Finanszírozók: FWF (alapkutatás), FFG (ipari K+F), aws (fejlesztési bank).',
      egyetemek:
        'Bécsi Egyetem, TU Wien, Bécsi Orvostudományi Egyetem, Innsbrucki Egyetem, TU Graz, Grazi Egyetem, Linzi Johannes Kepler Egyetem, BOKU, '
        + 'Leobeni Bányászati Egyetem, Bécsi Közgazdaságtudományi Egyetem (WU); doktori képzésre épülő kutatóintézet az ISTA (Klosterneuburg).',
      kutatokozpontok:
        'Az Osztrák Tudományos Akadémia (ÖAW) intézetei, pl. IQOQI (kvantumoptika, Bécs és Innsbruck) és IMBA (molekuláris biotechnológia); ISTA; '
        + 'AIT Austrian Institute of Technology (az ország legnagyobb kutatási-technológiai szervezete); Silicon Austria Labs (Graz–Linz–Villach); '
        + 'Joanneum Research; IIASA (Laxenburg).',
      infrastrukturak:
        'Austrian Scientific Computing (korábban Vienna Scientific Cluster) – az ország leggyorsabb szuperszámítógépei (VSC-4, VSC-5, MUSICA); '
        + 'MedAustron ionnyaláb-terápiás és kutatóközpont (Wiener Neustadt); Vienna BioCenter; az ISTA kampusza (Klosterneuburg).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Félvezetők és mikroelektronika', 'Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság',
        'Anyagtudomány', 'Kvantumtechnológia',
      ],
      agazatEgyeb: 'Gépgyártás és automatizálás, acél- és fémtechnológia',
      topVallalatok: [
        'ams-OSRAM', 'voestalpine', 'OMV', 'AT&S', 'Andritz',
        'Palfinger', 'Zumtobel', 'KEBA', 'AVL List',
      ].join('\n'),
      startupok:
        'A GII 2025 (CB Insights) szerinti osztrák unikornisok a bécsi Bitpanda (kriptoplatform) és GoStudent (online korrepetálás); a startup-ökoszisztéma '
        + 'központja Bécs. A mélytech-alapítást az aws korai fázisú programjai és az FFG startup-támogatásai segítik.',
      klaszterek:
        'A GII egyetlen osztrák klasztere Bécs (fő szabadalmi területe az orvostechnika). Regionális klaszterek: Silicon Alps (elektronika), ACstyria (stájer mobilitási '
        + 'klaszter: autó-, vasút- és repülőipar), LISAvienna (élettudomány), Softwarepark Hagenberg. Az Infineon Technologies Austria (Villach) saját közlése szerint '
        + 'az ország legnagyobb K+F-ráfordítású vállalata: a 2025-ös üzleti évben 721 millió eurót fordított K+F-re.',
      technologiatranszfer:
        'Christian Doppler-laboratóriumok (egyetemi alkalmazott alapkutatás vállalati társfinanszírozással) és Josef Ressel-központok (főiskolák); '
        + 'COMET-kompetenciaközpontok; egyetemi transzferirodák. A 2027–2029-es FTI-paktum a kulcstechnológiákat és a vállalati kutatást helyezi előtérbe.',
    },
    programok: {
      palyazatok:
        'FWF: egyéni projektek, ESPRIT, ASTRA-díj (a START utódja, 2024-től), Wittgenstein-díj, excellent=austria (kiválósági klaszterek, Emerging Fields); FFG: általános és '
        + 'tematikus programok (digitalizáció, energia, mobilitás, élettudomány), COMET; aws-felhívások.',
      tamogatasiProgramok:
        'FTI-paktum 2027–2029 (kb. 5,5 milliárd euró, ebből mintegy 3 milliárd az alapkutatásra); excellent=austria (FWF); Quantum Austria '
        + '(FWF és FFG, uniós helyreállítási forrásból; 2026. június 30-án lezárult); COMET.',
      finanszirozasiEszkozok:
        'Forschungsprämie – a K+F-ráfordítások 14%-a, adószámlán jóváírva, így veszteséges cég is igénybe veheti (FFG-szakvélemény alapján); '
        + 'az aws (100%-ban állami szövetségi fejlesztési bank) támogatásai, kölcsönei, garanciái és tőkeprogramjai.',
      nemzetkoziReszvetel:
        'Horizont Európa, EUREKA, COST; CERN (1959 óta), ESA, ESO, EMBL; IIASA (Laxenburg); az OeAD mobilitási és kétoldalú tudományos-technológiai (WTZ) '
        + 'programjai; CEEPUS.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'European Forum Alpbach', tipus: 'konferencia', idopont: 'augusztus–szeptember, Alpbach (Tirol)', megjegyzes: 'Politika, tudomány és gazdaság fóruma; 2027: augusztus 23.–szeptember 3.' },
      { nev: 'Lange Nacht der Forschung', tipus: 'forum', idopont: 'április–május, országszerte', megjegyzes: 'Kétévente; 2026-ban több mint 3000 program, 192 ezer látogató; következő: 2028. május 19.' },
      { nev: 'ViennaUP', tipus: 'forum', idopont: 'május, Bécs', megjegyzes: 'Startup- és innovációs fesztivál (Vienna Business Agency); 2027: május 10–14.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU-tag 1995 óta, a Horizont Európa aktív résztvevője; CERN-tag 1959 óta, az ESA és az ESO tagja, az EMBL alapító tagja; Bécs ENSZ-székhely '
        + '(pl. NAÜ, UNIDO), Laxenburgban működik az IIASA; az EU Duna Régió Stratégiájának tagja.',
      partnerorszagok:
        'Németország (a legszorosabb ipari és kutatási partner), Svájc, Olaszország, USA, Japán, Kína; a Duna-régió és Közép-Európa országai, köztük Magyarország.',
      egyezmeny: 'Magyar–osztrák tudományos és műszaki együttműködési egyezmény (Bécs, 1969. május 28.; hatályos 1972. március 12-től)',
      ketoldalu:
        'Az 1969-es egyezmény vegyes bizottságot hozott létre, az 1976-os kulturális és tudományos egyezmény az akadémiákra is kiterjed. Az osztrák reláció '
        + 'az NKFIH TéT-felhívásaiban legutóbb 2023-ban szerepelt, az OeAD WTZ-partnerei között Magyarország nincs. Az osztrák külügyminisztérium '
        + 'szerint Ausztria a második legnagyobb befektető Magyarországon; az AVL 2022 novemberében Zalaegerszegen, a ZalaZONE mellett járműfejlesztési központot nyitott.',
      mobilitas:
        'Aktion Österreich–Ungarn (tudományos csere és nyelvtanulás, ösztöndíjak és projektek; osztrák oldalon az OeAD kezeli); CEEPUS (központi irodája Bécsben); '
        + 'MTA–ÖAW akadémiai mobilitás (2026); '
        + 'Collegium Hungaricum ösztöndíj az osztrák–magyar kapcsolatok történetének bécsi kutatására (Tempus Közalapítvány); az Andrássy Gyula Egyetem, '
        + 'amelynek Ausztria partnerországa; Erasmus+.',
    },
    magyarErtekeles: {
      osszegzes:
        'Ausztria a szomszédság, a Duna-régiós keretek és a szoros gazdasági kapcsolatok révén Magyarország egyik legközvetlenebb TéT-partnere. '
        + 'Az EU élmezőnyébe tartozó K+F-intenzitás, az erős mikroelektronikai és járműipari K+F, valamint a kvantum- és élettudományi kiválóság '
        + 'jó alap közös projektekhez; az AVL zalaegerszegi járműfejlesztési központja a határon átnyúló mérnöki együttműködés példája.',
      egyuttmukodesiLehetosegek:
        'Automatizált járművek tesztelése (ZalaZONE és osztrák járműfejlesztők); mikro- és teljesítményelektronika (Silicon Austria Labs – magyar egyetemek); '
        + 'kvantumtechnológia (IQOQI, ISTA – HUN-REN Wigner); élettudomány (Vienna BioCenter); közös Horizont Európa- és Interreg-pályázatok.',
      joGyakorlatok:
        'A Christian Doppler-laboratóriumok egyetem–vállalat társfinanszírozási modellje; a COMET-kompetenciaközpontok; a 14%-os, adószámlán jóváírt '
        + 'Forschungsprämie; a Lange Nacht der Forschung országos tudománynépszerűsítése; az FTI-paktum többéves finanszírozási kerete.',
      diplomaciaiPrioritasok:
        'Az 1969-es egyezmény szerinti vegyes bizottság rendszeres ülésezése és a kétoldalú TéT-felhívás újraindítása; közös felhívások a mikroelektronika, '
        + 'a járműipar és a kvantumtechnológia területén; a meglévő csatornák (Aktion Österreich–Ungarn, CEEPUS, Andrássy Egyetem) jobb kihasználása.',
    },
  },
};

export default orszag;

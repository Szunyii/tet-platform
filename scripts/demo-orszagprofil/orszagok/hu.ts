/**
 * Magyarország (HU) 2026-os profilja – kutatott vázlat, a központ pontosítja. Hazai profil: viszonyítási alap a
 * térképen és az összehasonlításban.
 * Források (hozzáférés: 2026-10-13):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 247,759 Mrd USD,
 *   GDP/fő 25 916,328 USD, reálnövekedés 0,595%, lakosság 9,560 millió) –
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/HUN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 * - Terület: KSH, STADAT 8.1.1.1. „Földrajzi alapadatok” (93 025 km²; utolsó frissítés: 2026. szeptember 15.) –
 *   https://www.ksh.hu/stadat_files/fol/hu/fol0001.html (az EU portálja 93 012 km²-t közöl, lásd a tagságoknál)
 * - Legfontosabb gazdasági ágazatok (a feldolgozóipari termelés legalább 5%-át adó alágak és a bruttó hozzáadott érték legalább 5%-át adó,
 *   a listán szereplő nemzetgazdasági ágak): KSH, STADAT 13.1.1.4. „Az ipari termelés értéke alágak szerint” (2025, a feldolgozóipar
 *   arányában: járműgyártás 25,5%, élelmiszer, ital, dohánytermék 14,1%, számítógép, elektronikai, optikai termék 11,9%, villamos berendezés
 *   9,0%, gumi-, műanyag és nemfém ásványi termék 8,1%, fémalapanyag és fémfeldolgozási termék 7,2%, gép, gépi berendezés 5,5%; utolsó
 *   frissítés: 2026. augusztus 13.) – https://www.ksh.hu/stadat_files/ipa/hu/ipa0004.html ; KSH, STADAT 21.1.1.6. „A bruttó hozzáadott érték
 *   és megoszlása nemzetgazdasági áganként” (2025: építőipar 6,0%, szállítás, raktározás 5,5%, információ, kommunikáció 5,4%; a mezőgazdaság
 *   3,2%; utolsó frissítés: 2026. október 1.) – https://www.ksh.hu/stadat_files/gdp/hu/gdp0006.html ; a villamos berendezés gyártásának két
 *   legjelentősebb alágazata közül az egyik az akkumulátor, szárazelem gyártása (KSH, Ipar, 2026. július, második becslés) –
 *   https://www.ksh.hu/gyorstajekoztatok/ipa/ipa2607.html
 * - Nemzetközi tagságok: EU (2004. május 1.), schengeni övezet (2007. december 21.) –
 *   https://european-union.europa.eu/principles-countries-history/eu-countries/hungary_en ; OECD (a csatlakozási nyilatkozat letétbe helyezése:
 *   1996. május 7.; 1998. évi XV. törvény) – https://njt.jog.gov.hu/jogszabaly/1998-15-00-00 ; NATO (1999) –
 *   https://www.nato.int/cps/en/natohq/topics_52044.htm ; Visegrádi Csoport (Csehország, Lengyelország, Magyarország, Szlovákia) –
 *   https://www.visegradfund.org/about-us/the-fund/ ; CERN (1992) – https://home.cern/about/who-we-are/member-states ; ESA (22. tagállam,
 *   2015. november 4.) – https://www.esa.int/About_Us/Corporate_news/Hungary_becomes_ESA_s_22nd_Member_State ; EMBL (2017) –
 *   https://www.embl.org/about/member-states/
 * - Global Innovation Index (GII) 2025, országprofil (36. hely a 139 gazdaság közül; 2024: 36.; a hét pillér:
 *   intézmények 63., humántőke és kutatás 33., infrastruktúra 38., piaci fejlettség 49., üzleti fejlettség 37., tudás- és technológiai
 *   kibocsátás 26., kreatív kibocsátás 38.; mutatók: csúcstechnológiai gyártás 7., csúcstechnológiai export 9., közfinanszírozású kutatóhely–ipar
 *   közös publikációk 13., szakpolitikai kiszámíthatóság 107., klaszterfejlettség 122.; nincs klaszter a vezető innovációs klaszterek között,
 *   nincs unikornis; kockázatitőke-ügyletek száma 2023–2024: −67,5%; a QS-rangsor szerinti első három egyetem: ELTE, Szegedi Tudományegyetem,
 *   Debreceni Egyetem; a THE adataira épülő egyetem–ipar és nemzetközi kapcsolatok mutató (5.2.3) első helyezettje: Semmelweis Egyetem) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/hu.pdf
 * - GERD (a gerd mező): OECD MSTI, 2026. márciusi kiadás, 2024: 1,31% (előzetes); 2021: 1,63%; EU-27 2024: 2,13% (becslés) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/HUN.A.G.PT_B1GQ..?startPeriod=2018 ,
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html ; az uniós átlag az Eurostat szerint 2024-ben 2,26% (becslés;
 *   rd_e_gerdtot, frissítve: 2026. szeptember 29.) –
 *   https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/rd_e_gerdtot?format=JSON&lang=EN&geo=EU27_2020&geo=HU&unit=PC_GDP&sectperf=TOTAL&sinceTimePeriod=2021 ;
 *   nemzeti adat: KSH, STADAT 26.1.1.1. (2025: 1,32%; utolsó frissítés: 2026. augusztus 6.) –
 *   https://www.ksh.hu/stadat_files/tte/hu/tte0001.html ; a 2025-ös adat előzetes (KSH Helyzetkép 2025, Kutatás-fejlesztés) –
 *   https://www.ksh.hu/infografika/2026/kutatas-fejlesztes-2026_hu.pdf
 * - Európai Innovációs Eredménytábla (EIS) 2026, országprofil (mérsékelt innovátor; az uniós átlag 72,1%-a, a tagállamok között 21.; közepes és
 *   csúcstechnológiai termékek exportja 5., a vállalati K+F közvetlen és közvetett állami támogatása 8.; az állami szektor K+F-ráfordítása
 *   az uniós átlag 31,7%-a, 22.) – https://ec.europa.eu/assets/rtd/eis/2026/ec_rtd_eis-country-profile-hu.pdf
 * - Stratégia és prioritások: 1456/2021. (VII. 13.) Korm. határozat Magyarország kutatási, fejlesztési és innovációs stratégiájának (2021–2030)
 *   elfogadásáról – https://njt.jog.gov.hu/jogszabaly/2021-1456-30-22 ; a stratégia célja (2030-ra a GDP 3%-a) –
 *   https://nkfih.gov.hu/hivatalrol/strategia-alkotas/kutatasi-fejlesztesi-innovacios-strategia ; Neumann János Program (2023) –
 *   https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/neumann-janos-program ; a program fókuszterületei (digitális átállás: mesterséges
 *   intelligencia, autonóm járművek, kvantumtechnológia; zöld átállás: energiatermelés, agrártechnológiák, vízgazdálkodási technológiák;
 *   egészséges élet: biotechnológia és gyógyszerkutatás; biztonság és védelem: dual use technológiák, kiber- és határvédelem, űrkutatás és
 *   űrtevékenység) és célja („az egyetemek és kutatóintézetek gazdasági szereplőkkel való összekapcsolását célozza”) – a Magyarország innovációs
 *   ökoszisztémája című kiadvány (KIM–NKFIH–NIÜ, lezárva: 2025. január; a továbbiakban: ökoszisztéma-kiadvány) –
 *   https://nkfih.gov.hu/hivatalrol/hivatal-kiadvanyai/magyarorszag-innovacios-okoszisztemaja
 * - Intézmények: 2026. évi XIII. törvény Magyarország minisztériumainak felsorolásáról (hatályos: 2026. május 13-tól; 3. § (6): a Kulturális és
 *   Innovációs Minisztérium Tudományos és Technológiai Minisztérium elnevezéssel működik tovább) – https://njt.jog.gov.hu/jogszabaly/2026-13-00-00 ;
 *   90/2026. (V. 13.) Korm. rendelet a Kormány tagjainak feladat- és hatásköréről (168. §: a tudományos és technológiai miniszter felel a
 *   kormányzati tudománypolitikáért, a tudománypolitika koordinációjáért, az informatikáért, az e-közigazgatásért, az űriparfejlesztésért és
 *   űrtechnológiákért; 170. § (2) a): a KFI finanszírozásáért; 124. § és 127. § (2): a felsőoktatás irányítása és
 *   a felsőoktatási intézmények együttműködésével megvalósuló tudományos innovációs parkok kormányzati koordinációja az oktatási és gyermekügyi
 *   miniszteré; 1. melléklet: az NKFIH a tudományos és technológiai miniszter irányítása, az SZTNH az igazságügyi miniszter felügyelete alatt) –
 *   https://njt.jog.gov.hu/jogszabaly/2026-90-20-22 ; 2/2026. (IX. 21.) TTM utasítás a Tudományos és Technológiai Minisztérium Szervezeti és
 *   Működési Szabályzatáról (4. függelék: a NIÜ szakmai felügyelete; 27. § 23.: a tudományos és innovációs parkok tervezése, előkészítése és
 *   koordinálása) – https://njt.jog.gov.hu/jogszabaly/2026-2-B0-9N ; 2014. évi LXXVI. törvény a tudományos kutatásról, fejlesztésről és
 *   innovációról (10/A. §: a Nemzeti Tudománypolitikai Tanács a Kormány KFI-tevékenységét támogató véleményező testület; 10/D. §: a Kutatási
 *   Kiválósági Tanács a kiválósági alapú támogatások döntés-előkészítő testülete; 12. §: az NKFI Alap bevételi forrásai; 15–16. §: innovációs
 *   járulék, mértéke 0,3% (16. § (2))) – https://njt.jog.gov.hu/jogszabaly/2014-76-00-00 ; 1994. évi XL. törvény a Magyar Tudományos Akadémiáról
 *   (1. § (1): köztestület, amely a tudomány művelésével, támogatásával és képviseletével kapcsolatos országos közfeladatokat lát el) –
 *   https://njt.jog.gov.hu/jogszabaly/1994-40-00-00 ; az NKFIH (az NKFI Alap kezelője), a NIÜ (innovációs szolgáltatások) és az SZTNH
 *   (szellemitulajdon-védelem) szerepe – ökoszisztéma-kiadvány (lásd fent) ; NIÜ: Hungarian Startup University Program (HSUP; egyetemi startup- és
 *   innovációs képzés, a 2026/2027-es tanévben 33 hazai és 1 határon túli felsőoktatási intézményben), HSUP Doctorate (doktoranduszoknak),
 *   Innovációs Voucher Program (startupoknak és kkv-knak) – https://niu.hu/
 * - Kutatóhálózat: a HUN-REN önálló, sajátos jogállású szervezet (2025. október 28-tól) –
 *   https://hun-ren.hu/szakmai-hirek/megujulas-utan-valtozas-a-hun-ren-elen-110383 ; a kutatóhelyek névsora – https://hun-ren.hu/ ; a Bay Zoltán
 *   Kutatóközpont (alkalmazott kutatás) a HUN-REN tagintézménye – ökoszisztéma-kiadvány (lásd fent) ; a tervezett átalakítás: a TTM és az MTA
 *   közös közleménye (2026. július 17.: az alapítói jog az MTA-ra száll; „a korábban az Eötvös Loránd Tudományegyetemhez csatolt négy bölcsészet-
 *   és társadalomtudományi kutatóközpont” az MTA alá kerül) –
 *   https://mta.hu/mta_hirei/mar-oktoberben-letrejohet-az-egyseges-magyar-kutatohalozat-az-mta-alatt-a-tudomanyos-es-technologiai-miniszterium-es-a-magyar-tudomanyos-akademia-kozos-sajtokozlemenye-115541 ;
 *   az MTA vezetőinek tájékoztatója (2026. október 12.: a törvénytervezet 2026. október 9. óta előzetes közigazgatási egyeztetésen van; a hálózat
 *   alapítói jogait az MTA gyakorolná, az ELTE keretében működő négy kutatóközpont csatlakozna) –
 *   https://mta.hu/mta_hirei/az-mta-vezetoinek-tajekoztatoja-a-kutatohalozat-es-az-mta-torvenyi-szabalyozasanak-tervezett-valtozasairol-a-koztestulet-tagjai-szamara-115738 ;
 *   25 nemzeti laboratórium, 55 konzorciumi tag – ökoszisztéma-kiadvány (lásd fent)
 * - Egyetemek: az intézmények hivatalos neve (Oktatási Hivatal, a 2026 szeptemberében induló képzések intézménylistája) –
 *   https://www.felvi.hu/felveteli/meghirdetett_kepzesek/24A/!FFT_Megjelenito_A/intezmenyek ; székhely: https://www.elte.hu/ ,
 *   https://www.bme.hu/ , https://semmelweis.hu/ , https://pte.hu/hu ; a kiválasztás alapja a GII 2025 országprofiljában kiemelt egyetemek
 *   (lásd fent), kiegészítve a műegyetemmel és a pécsi egyetemmel; 64 felsőoktatási intézmény (2024) – ökoszisztéma-kiadvány (lásd fent) ;
 *   a fenntartó alapítványok megszűnése (legkésőbb 2027. augusztus 1.) és az alapítói jogok gyakorlója (az oktatási és gyermekügyi miniszter) –
 *   COM(2026) 516 (lásd az uniós korlátozásnál)
 * - Kutatási infrastruktúrák: ELI ALPS (az Extreme Light Infrastructure attoszekundumos létesítménye, felhasználói pályázatokkal) –
 *   https://www.eli-alps.hu/en/About-Us/Mission , https://www.eli-alps.hu/ ; Budapest Neutron Centre (Budapesti Kutatóreaktor, mérésiidő-pályázatok) –
 *   https://www.bnc.hu/ ; Komondor („hazánk legerősebb szuperszámítógépe”; a HPC Kompetencia Központ 2025. január 1-től a Digitális Kormányzati
 *   Fejlesztés és Projektmenedzsment Kft.-nél) – https://ncc.dkf.hu/ , https://ncc.dkf.hu/hu/komondor.html ; a gép helye (Debreceni Egyetem,
 *   Kassai úti campus) – https://hirek.unideb.hu/en/node/14153 ; ZalaZONE (250 hektáros járműipari tesztpálya; ZalaZONE Park: tudományos és
 *   technológiai park, elektromos és automatizált járművek) – https://zalazone.hu/
 * - Az első kiemelt iparág indoka: az Eurostat szerint a vállalkozási K+F-ráfordítás legnagyobb ágazata 2022 és 2024 között a közúti járműgyártás
 *   (2024: 379,3 M EUR a 2046,5 M EUR-ból, 18,5%; tudományos kutatás-fejlesztés 366,2 – 17,9% –, számítógépes programozás 364,6, gyógyszergyártás
 *   283,0, számítógép, elektronikai, optikai termék gyártása 73,1, gép, gépi berendezés gyártása 60,7 M EUR; rd_e_berdindr2, frissítve: 2026.
 *   szeptember 29.) –
 *   https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/rd_e_berdindr2?format=JSON&lang=EN&geo=HU&unit=MIO_EUR&sinceTimePeriod=2021 ;
 *   a járműgyártás a feldolgozóipari termelés 25,5%-a (KSH, lásd fent); az ökoszisztéma-kiadvány szerint „meghatározók az autóipari fejlesztések”,
 *   a Neumann János Program fókuszterülete az autonóm jármű (lásd fent)
 * - Top vállalatok (6 név): a 2025-ös EU Industrial R&D Investment Scoreboard (2024-es üzleti év) alapján csak a Richter Gedeon szerepel – ez
 *   az egyetlen magyar székhelyű vállalat a világ- és az uniós listán (K+F: 241,3 M EUR) –
 *   https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip ,
 *   https://knowledge-for-policy.ec.europa.eu/sites/default/files/EU800%282004-2025%29.zip ; a további öt név a Scoreboardban nem szereplő
 *   (külföldi tulajdonú) hazai K+F-szereplő, sorrendjük szerkesztői döntés, az adatok a vállalatok saját közlései: Robert Bosch (a vállalat
 *   közlése szerint a Budapesti Fejlesztési Központ több mint 3100 munkavállalója révén, az autóipari mérnökök számát tekintve Magyarország Németország után a Bosch második legnagyobb
 *   európai fejlesztési helyszíne) – https://www.bosch.hu/vallalatunk/a-bosch-magyarorszagon/budapest-robert-bosch-kft/ ; Egis (a Servier Csoport
 *   tagja; a 2024/2025-ös üzleti évben csaknem 23 Mrd Ft K+F) – https://hu.egis.health/cegismerteto ; Audi Hungaria (csaknem 25 éve műszaki
 *   fejlesztés Győrben) – https://audi.hu/hu/portfolio/muszaki-fejlesztes.html ; Ericsson Magyarország (saját közlése szerint az egyik legnagyobb
 *   távközlési és informatikai kutató- és szoftverfejlesztő cég) – https://www.ericsson.com/hu/about-us/company-facts/ericsson-worldwide/hungary ;
 *   Knorr-Bremse (budapesti vasúti telephely 1995 óta, csoportszintű K+F; a haszonjármű-fékrendszerek K+F-központja) –
 *   https://rail.knorr-bremse.com/en/hu/about-us/knorr-bremse-in-hungary/ , https://truck.knorr-bremse.com/en/hu/about-us/knorr-bremse-hungary/
 * - Vállalati ökoszisztéma: a K+F-ráfordítás megoszlása (2023: vállalkozások 72,7%; a vállalati ráfordítás 66%-a Budapesthez köthető), 22 egyetemi
 *   technológia- és tudástranszfer-iroda (2019 óta), öt egyetem önálló technológiatranszfer-vállalata (2024-től), Kooperatív Doktori Program
 *   (vállalati együttműködésben kutató doktori hallgatók), az Egyetemi Kutatói Ösztöndíj Program célcsoportja (hallgatók), Startup Factory (2023
 *   őszén 12 nyertes inkubátor), Pannónia Ösztöndíjprogram (hallgatók és oktatók mobilitási ösztöndíjai) – ökoszisztéma-kiadvány (lásd fent) ;
 *   Hiventures (az MFB Csoporthoz tartozik; mintegy 17 Mrd Ft-os korai fázisú alap, 2026. február 18.) –
 *   https://hiventures.hu/uj-korai-fazisu-befektetesi-alapot-indit-a-hiventures/
 * - Programok és finanszírozás: az NKFI Alap 2026. évi programstratégiája (2025. november; teljes keret: 150,507 Mrd Ft; Nemzeti Kutatási
 *   Kiválósági Program 40 Mrd Ft, alapkutatás, négy célcsoportnak szóló és két nemzetközi – osztrák és szlovén együttműködésű – alprogrammal;
 *   Egyetemi Kutatói Ösztöndíj Program (kiemelkedő képességű fiatalok kutatói pályakezdése); Startup Factory 6 Mrd Ft, állami–magán
 *   társbefektetési modellben működő technológiai inkubátorok; a technológiatranszfer-vállalatok hálózatának fejlesztése 6 Mrd Ft; Life
 *   Sciences Catalyst Program, gyógyszerfejlesztés;
 *   élettudományi egyetemi kockázatitőke-program 20 Mrd Ft; SEED társbefektetési alap 10 Mrd Ft; üzletiangyal-garanciaprogram; Misszióvezérelt
 *   Nemzeti Laboratóriumok; HU-rizont Nemzetközi Kiválósági Kutatási Együttműködési Program 8 Mrd Ft, hazai egyetemek vezetésével, nemzetközi
 *   kutatási együttműködésben; az európai partnerségek – köztük EUROSTARS-3, Clean Energy Transition, Key Digital Technologies, ERA for Health – és
 *   a Horizont Európa-részvétel támogatása az NKFI Alapból; a GINOP Plusz „Kutatás, fejlesztés, innováció” című 2. prioritása: 2025 negyedik
 *   negyedévében és 2026-ban összesen 261 Mrd Ft, két tőkeprogram több mint 73 Mrd Ft keretösszeggel) –
 *   https://nkfih.gov.hu/hivatalrol/hivatal-kiadvanyai/nkfia-programstrategia-2026 ; a Horizont Európa nemzeti kapcsolattartó pontjai –
 *   https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok ; a társaságiadó-alap csökkentése a saját
 *   K+F közvetlen költségével: 1996. évi LXXXI. törvény 7. § (1) bekezdés t) pont – https://njt.jog.gov.hu/jogszabaly/1996-81-00-00 ; kétoldalú
 *   TéT-felhívás, 2026. július (közös pályázat kínai és francia relációban, kutatói mobilitás és szakembercsere) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-csomag/palyazati-felhivas ;
 *   kormányközi TéT-megállapodások (36 ország) – https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 * - Rendezvények (hivatalos oldalak): https://mta.hu/tudomanyunnep/ , https://kutatokejszakaja.hu/ , https://worldscienceforum.org/ (a 2024-es
 *   budapesti fórum: https://mta.hu/mta_hirei/megnyilt-a-world-science-forum-2024-budapesten-talalkoznak-a-nemzetkozi-tudomanyos-elet-meghatarozo-szereploi-114089 ),
 *   https://iparnapjai.hu/
 * - Uniós korlátozás (Horizont Európa, Erasmus+): a Tanács (EU) 2022/2506 végrehajtási határozata (2022. december 15.; 2. cikk (2) bekezdés: tilos új
 *   jogi kötelezettséget vállalni a közérdekű vagyonkezelő alapítványokkal és az általuk fenntartott szervezetekkel a közvetlen és közvetett irányítású
 *   uniós programokban) – https://eur-lex.europa.eu/eli/dec_impl/2022/2506/oj ; az Európai Bizottság javaslata az intézkedések megszüntetésére
 *   (2026. szeptember 23.): IP/26/1941 – https://ec.europa.eu/commission/presscorner/detail/en/ip_26_1941 , COM(2026) 516 final –
 *   https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52026PC0516 ; a 2022/2506 határozatot hatályon kívül helyező tanácsi végrehajtási
 *   határozat szövege (ST 13568/26, 2026. október 6.) – https://data.consilium.europa.eu/doc/document/ST-13568-2026-INIT/en/pdf ; az elfogadás az
 *   Általános Ügyek Tanácsa 2026. október 13-i ülésének „A” napirendi pontjai között (ST 14091/1/26 REV 1, 7. pont) –
 *   https://data.consilium.europa.eu/doc/document/ST-14091-2026-REV-1/en/pdf ; az érintett 21 egyetem (NKFIH, frissítve: 2025. december 16.) –
 *   https://nkfih.gov.hu/for-the-applicants/hungary-in-horizon-europe
 * Kimaradt blokkok és mezők: a „6.2. Magyar–fogadó országbeli kapcsolatok” (magyarKapcsolatok) blokk – a hazai országra nem
 * értelmezhető; a 7. blokkból (magyarErtekeles) csak az összegzés készült el, a többi mező üres.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'HU',
  profil: {
    alapadatok: {
      fovaros: 'Budapest',
      terulet: '93 025',
      penznem: 'forint (HUF)',
      lakossag: '9 560 000',
      gdp: '247,8',
      gdpEgyFore: '25 916',
      gdpNovekedes: '0,6',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), KSH',
      tagsagok: ['EU', 'OECD', 'NATO'],
      tagsagEgyeb: 'schengeni övezet, Visegrádi Csoport (V4); CERN, ESA, EMBL',
      agazatok: [
        'Mobilitás és autóipar', 'Agrár- és élelmiszeripar', 'Elektronika és félvezetők', 'Gépipar',
        'Építőipar', 'Logisztika', 'IKT és digitalizáció',
      ],
      agazatEgyeb: 'Villamosberendezés-gyártás (benne akkumulátorgyártás), gumi- és műanyagipar, nemfém ásványi termékek gyártása, fémfeldolgozás',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index (GII) 2025-ös rangsorában a 36. a 139 gazdaság közül (2024: 36.). A hét pillér közül a legjobb '
        + 'a tudás- és technológiai kibocsátás (26.), a leggyengébbek az intézmények (63.) és a piaci fejlettség (49.). A K+F-ráfordítás az OECD MSTI '
        + 'előzetes adata szerint 2024-ben a GDP 1,31%-a (2021-ben 1,63%; uniós átlag – OECD MSTI: 2,13%; Eurostat: 2,26%, 2024-es becslések); a KSH előzetes '
        + 'adata szerint 2025-ben 1,32%. Az Európai Innovációs Eredménytábla (EIS) 2026-os kiadásában mérsékelt innovátor: az uniós átlag 72,1%-a, '
        + 'a tagállamok között a 21.',
      gerd: '1,31',
      strategia: 'Magyarország kutatási, fejlesztési és innovációs stratégiája (2021–2030; cél: a GDP 3%-a) és a Neumann János Program (2023)',
      prioritasok: [
        'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány', 'Védelem és biztonság', 'Űr',
      ],
      prioritasEgyeb: 'A Neumann János Program további fókuszai: autonóm járművek, kvantumtechnológia, agrár- és vízgazdálkodási technológiák; célja az egyetemek és kutatóintézetek összekapcsolása a gazdasági szereplőkkel',
      kiemeltIparagak: [
        'Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció',
        'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar', 'Kvantumtechnológia', 'Űripar',
      ],
      iparagEgyeb: 'Kettős felhasználású (dual use) és kibervédelmi technológiák',
      erossegek:
        'A K+F-ben a vállalati szektor súlya nagy: 2023-ban a ráfordítás 72,7%-át vállalkozások használták fel. A vállalati K+F legnagyobb ágazata a közúti '
        + 'járműgyártás (2024: 379 millió euró, 18,5%), utána a tudományos kutatás-fejlesztés, a számítógépes programozás és a gyógyszergyártás következik. '
        + 'A GII 2025 szerint a csúcstechnológiai gyártásban a 7., a csúcstechnológiai exportban a 9.; az EIS 2026 szerint a közepes és csúcstechnológiai '
        + 'termékek exportjában az EU-ban az 5., a vállalati K+F állami ösztönzésében a 8.',
      kihivasok:
        'A K+F-intenzitás 2021 óta csökkent (1,63%-ról 1,31%-ra), elmarad az uniós átlagtól és a 2030-ra kitűzött 3%-os céltól; az állami szektor '
        + 'K+F-ráfordítása az uniós átlag 31,7%-a (EIS 2026, a tagállamok között a 22.). A GII 2025-ben a szakpolitikai kiszámíthatóság mutatójában '
        + 'az ország a 107. Az intézményrendszer átalakulóban van (kutatóhálózat, egyetemi fenntartók). 2022 decembere óta 21 alapítványi '
        + 'fenntartású egyetemmel nem vállalható új uniós jogi kötelezettség a Horizont Európa és az Erasmus+ programban; az intézkedések megszüntetése '
        + '2026 októberében folyamatban van.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos és Technológiai Minisztérium (TTM) – tudománypolitika, KFI-finanszírozás, digitalizáció, űripar.\n'
        + 'Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal (NKFIH) – a TTM irányításával az NKFI Alap kezelője.\n'
        + 'Nemzeti Tudománypolitikai Tanács (NTT) – a Kormány véleményező testülete.\n'
        + 'Kutatási Kiválósági Tanács (KKT) – a kiválósági kutatási támogatások döntés-előkészítője.\n'
        + 'Magyar Tudományos Akadémia (MTA) – a tudomány művelését és képviseletét ellátó köztestület.\n'
        + 'HUN-REN Magyar Kutatási Hálózat – önálló kutatóhálózat; a 2026. októberi törvénytervezet szerint az MTA-hoz kerül.\n'
        + 'Nemzeti Innovációs Ügynökség (NIÜ) – a TTM szakmai felügyelete alatt innovációs szolgáltatásokat nyújt.\n'
        + 'Szellemi Tulajdon Nemzeti Hivatala (SZTNH) – szellemitulajdon-védelem.',
      egyetemek:
        'Eötvös Loránd Tudományegyetem (ELTE; Budapest), Budapesti Műszaki és Gazdaságtudományi Egyetem (Budapest), Semmelweis Egyetem (Budapest), '
        + 'Szegedi Tudományegyetem (Szeged), Debreceni Egyetem (Debrecen), Pécsi Tudományegyetem (Pécs). 2024-ben 64 felsőoktatási intézmény működött. '
        + 'Az alapítványi fenntartású egyetemek fenntartói legkésőbb 2027. augusztus 1-jéig megszűnnek; alapítói jogukat az oktatási és '
        + 'gyermekügyi miniszter gyakorolja.',
      kutatokozpontok:
        'A HUN-REN kutatóhelyei, többek között: Wigner Fizikai Kutatóközpont, Számítástechnikai és Automatizálási Kutatóintézet (SZTAKI), '
        + 'Természettudományi Kutatóközpont, Szegedi Biológiai Kutatóközpont, Kísérleti Orvostudományi Kutatóintézet, Rényi Alfréd Matematikai '
        + 'Kutatóintézet, Energiatudományi Kutatóközpont, Atommagkutató Intézet, Bay Zoltán Kutatóközpont (alkalmazott kutatás). 25 nemzeti laboratórium '
        + 'működik konzorciumi formában (2025. januári adat). Négy bölcsészet- és társadalomtudományi kutatóközpont jelenleg az ELTE-hez tartozik.',
      infrastrukturak:
        'ELI ALPS attoszekundumos lézerkutató központ (Szeged) – az Extreme Light Infrastructure (ELI) része, nemzetközi felhasználói pályázatokkal; '
        + 'Budapest Neutron Centre a Budapesti Kutatóreaktorral – nemzetközi mérésiidő-pályázatokkal; Komondor szuperszámítógép (Debrecen) – az üzemeltető '
        + 'HPC Kompetencia Központ közlése szerint az ország legerősebb szuperszámítógépe; ZalaZONE járműipari tesztpálya (Zalaegerszeg, 250 hektár) – '
        + 'elektromos és automatizált járművek fejlesztéséhez és teszteléséhez.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Elektronika és félvezetők', 'Gépipar',
      ],
      agazatEgyeb: 'Tudományos kutatás-fejlesztés mint önálló szolgáltató ágazat (a vállalati K+F-ráfordítás 18%-a, 2024)',
      topVallalatok: [
        'Richter Gedeon', 'Robert Bosch', 'Egis', 'Audi Hungaria', 'Ericsson Magyarország',
        'Knorr-Bremse',
      ].join('\n'),
      startupok:
        'A GII 2025 szerint Magyarországnak nincs unikornisa, a kockázatitőke-ügyletek száma 2023 és 2024 között 67,5%-kal csökkent. Állami eszközök: '
        + 'az NKFIH Startup Factory inkubátorprogramja (állami–magán társbefektetés; 2026-ban 6 milliárd forint), az MFB Csoporthoz tartozó Hiventures '
        + '(2026 februárjában mintegy 17 milliárd forintos korai fázisú alap), valamint a NIÜ egyetemi startupképzése, a Hungarian Startup University '
        + 'Program (HSUP; 2026/2027-ben 34 intézményben).',
      klaszterek:
        'A GII 2025 vezető innovációs klaszterei között nincs magyar, a klaszterfejlettségi mutatóban az ország a 122.; a K+F erősen Budapestre koncentrálódik '
        + '(2023-ban a vállalati ráfordítás 66%-a). Tudományos és technológiai park a zalaegerszegi ZalaZONE Park (elektromos és automatizált járművek). '
        + 'A tudományos és innovációs parkok tervezése és koordinálása a TTM, az egyetemi együttműködésben megvalósuló parkok kormányzati '
        + 'koordinációja az oktatási és gyermekügyi miniszter feladata.',
      technologiatranszfer:
        '2019 óta 22 egyetemen jött létre technológia- és tudástranszfer-iroda, 2024-től öt egyetem önálló technológiatranszfer-vállalatba (TTC) szervezte '
        + 'a hasznosítást; az NKFI Alap 2026-ban 6 milliárd forinttal fejleszti a TTC-hálózatot. A vállalati kapcsolatokat a Kooperatív Doktori Program '
        + 'erősíti. A GII 2025 szerint a közfinanszírozású kutatóhelyek és az ipar közös publikációinak arányában az ország a 13.',
    },
    programok: {
      palyazatok:
        'Az NKFIH felhívásai az NKFI Alap 2025 novemberében jóváhagyott 2026. évi programstratégiája szerint (150,5 milliárd forint): Nemzeti Kutatási '
        + 'Kiválósági Program (NKKP; alapkutatás, 40 milliárd forint), Misszióvezérelt Nemzeti Laboratóriumok, Life Sciences Catalyst Program '
        + '(gyógyszerfejlesztés). Uniós forrásból a GINOP Plusz KFI-felhívásai (2025 negyedik negyedévében és 2026-ban '
        + 'összesen 261 milliárd forint).',
      tamogatasiProgramok:
        'Egyetemi Kutatói Ösztöndíj Program (EKÖP; NKFI Alap, kiemelkedő képességű hallgatók és fiatalok) és Kooperatív Doktori Program (vállalati együttműködésben kutató '
        + 'doktoranduszok); HSUP és HSUP Doctorate (NIÜ; egyetemi hallgatók, doktoranduszok); Startup Factory (NKFIH; technológiai inkubátorok); '
        + 'Innovációs Voucher Program (NIÜ; startupok és kkv-k); Pannónia Ösztöndíjprogram (hallgatói és oktatói mobilitás).',
      finanszirozasiEszkozok:
        'Innovációs járulék (a járulékalap 0,3%-a) – az NKFI Alap egyik bevételi forrása; a saját tevékenységi körben végzett K+F közvetlen költsége csökkenti '
        + 'a társaságiadó-alapot. Tőkeprogramok az NKFI Alap 2026-os programstratégiájában: SEED társbefektetési alap (10 milliárd forint), élettudományi egyetemi '
        + 'kockázatitőke-program (20 milliárd forint), üzletiangyal-garanciaprogram; a GINOP Plusz két tőkeprogramja (összesen több mint 73 milliárd forint).',
      nemzetkoziReszvetel:
        'Horizont Európa (a nemzeti kapcsolattartó pontok az NKFIH-nál) és az európai partnerségek (pl. EUROSTARS-3, Clean Energy Transition, Key Digital '
        + 'Technologies, ERA for Health), az NKFI Alap támogatásával; HU-rizont Nemzetközi Kiválósági Kutatási Együttműködési Program (2026: '
        + '8 milliárd forint; magyar egyetemek vezette nemzetközi projektek); kétoldalú TéT-felhívás (2026: kínai és francia reláció); az NKKP osztrák és '
        + 'szlovén együttműködésű alprogramjai.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Magyar Tudomány Ünnepe', tipus: 'forum', idopont: 'november, Budapest', megjegyzes: 'Az MTA tudományünnepi programsorozata; 2026-ban a nyitóünnepség november 3-án az MTA székházában' },
      { nev: 'Kutatók Éjszakája', tipus: 'forum', idopont: 'szeptember vége (péntek–szombat), országszerte', megjegyzes: 'Ingyenes tudománynépszerűsítő eseménysorozat (EU, Marie Skłodowska-Curie Akciók); 2026: szeptember 25–26., 200 helyszín, 2500 program' },
      { nev: 'World Science Forum', tipus: 'forum', idopont: 'változó időpont; Budapesten legutóbb 2024 novemberében', megjegyzes: 'Az MTA tudománypolitikai világfóruma, partnerei között az UNESCO; 2024-ben 122 ország résztvevőivel; a következő: 2027. március 17–20., Isztambul' },
      { nev: 'Ipar Napjai', tipus: 'szakkiallitas', idopont: 'május, Budapest (Hungexpo)', megjegyzes: 'Nemzetközi ipari szakkiállítás; 2026-ban a MACH-TECH és az Automotive Hungary társrendezvénnyel együtt 22 ország 370 kiállítója; 2027: május 4–7., társrendezvény: Automotive Hungary' },
    ]),
    nemzetkoziKapcsolatok: {
      partnerorszagok:
        'Az NKFI Alap 2026-os közös felhívásainak partnerei: Kína és Franciaország (kétoldalú TéT-felhívás kutatói mobilitásra, '
        + '2026. július), Ausztria és Szlovénia (az NKKP közös alprogramjai). Kormányközi TéT-megállapodás 36 országgal van. A Bosch közlése szerint '
        + 'az autóipari mérnökök számát tekintve Magyarország – Németország után – a vállalat második legnagyobb európai fejlesztési helyszíne.',
      euMultilateralis:
        'EU-tag 2004 óta. A Tanács 2022. decemberi végrehajtási határozata megtiltotta az új uniós jogi kötelezettségvállalást az alapítványi fenntartású '
        + 'egyetemekkel (Horizont Európa, Erasmus+; 21 egyetem); a Bizottság 2026. szeptember 23-án javasolta az intézkedések megszüntetését, az elfogadás '
        + 'a Tanács 2026. október 13-i ülésének napirendjén szerepelt. Kutatási szervezeti tagság: CERN (1992 óta), ESA (2015 óta), EMBL (2017 óta).',
    },
    magyarErtekeles: {
      osszegzes:
        'Magyarország az EU mérsékelt innovátorai közé tartozik (EIS 2026: az uniós átlag 72,1%-a), a GII 2025-ben a 36. A K+F-ráfordítás a GDP 1,31%-a '
        + '(2024), az uniós átlag alatt; a vállalati K+F legnagyobb ágazata a járműgyártás. 2026-ban átalakul az intézményrendszer: a tudománypolitika '
        + 'májustól a Tudományos és Technológiai Minisztériumhoz tartozik, a kutatóhálózat a tervek szerint az MTA-hoz kerül; az alapítványi egyetemeket érintő '
        + 'uniós korlátozás megszüntetése folyamatban van.',
      egyuttmukodesiLehetosegek: '',
      joGyakorlatok: '',
      diplomaciaiPrioritasok: '',
    },
  },
};

export default orszag;

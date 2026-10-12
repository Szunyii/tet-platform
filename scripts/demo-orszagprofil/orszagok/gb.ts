/**
 * Egyesült Királyság (GB) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Az Egyesült Királyságot és Írországot ugyanaz a londoni attasé fedi le.
 * Források (hozzáférés: 2026-10-09; a „2026-10-12” jelzésűek: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 3 958,78 Mrd USD,
 *   GDP/fő 56 660,868 USD, reálnövekedés 1,308%, lakosság 69,868 millió) –
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/GBR.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 * - Terület: ONS, Standard Area Measurements for the Countries (December 2024), a négy országrész területe a közepes dagályvonalig,
 *   a belvizekkel együtt (AREACHECT összesen 24 437 760,73 ha = 244 378 km²) –
 *   https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Standard_Area_Measurements_for_the_Countries_(December_2024)_in_the_United_Kingdom/FeatureServer/0
 * - GII 2025 (6. hely; 2024: 5.; pillérek: kreatív kibocsátás 3., piaci fejlettség 4., infrastruktúra 23., intézmények 25.; 4 klaszter:
 *   London, Cambridge, Oxford, Manchester; intenzitás szerint Cambridge 2., Oxford 5., Oxford fő szabadalmi területe a biotechnológia) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/gb.pdf
 * - GERD (a gerd mező): OECD MSTI, 2026. márciusi kiadás, legfrissebb év 2023: 2,75% (előzetes) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/GBR.A.G.PT_B1GQ..?startPeriod=2021 ,
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html ;
 *   nemzeti adat: ONS, Gross domestic expenditure on R&D, UK: 2024 (2026. augusztus 7.): 79,4 Mrd GBP, a GDP 2,71%-a (2023: 2,72%) –
 *   https://www.ons.gov.uk/economy/governmentpublicsectorandtaxes/researchanddevelopmentexpenditure/bulletins/ukgrossdomesticexpenditureonresearchanddevelopment/2024
 * - Stratégia: Modern Industrial Strategy (2025. június 23., 10 éves terv) – https://www.gov.uk/government/publications/industrial-strategy ;
 *   az IS-8 ágazatok és a Digital and Technologies ágazat frontier iparágai –
 *   https://www.gov.uk/government/publications/industrial-strategy/industrial-strategy-sector-definitions-list ;
 *   86 Mrd GBP állami K+F 2026/27–2029/30 (2025. június 8.) –
 *   https://www.gov.uk/government/news/transformative-86-billion-boost-to-science-and-tech-to-turbocharge-economy-with-regions-backed-to-take-cutting-edge-research-into-own-hands ;
 *   évi 22,6 Mrd GBP 2029/30-ra – https://www.gov.uk/government/publications/spending-review-2025-document/spending-review-2025-html ;
 *   55 Mrd GBP-os ügynökségi allokáció (UKRI >38 Mrd GBP, ARIA évi 220 → 400 M GBP, NQCC 10 éves kötelezettségvállalás; 2025. október 30.) –
 *   https://www.gov.uk/government/news/55-billion-rd-funding-boost-to-unlock-uk-breakthroughs-from-health-to-clean-energy
 * - Az első kiemelt iparág indoka: a két legnagyobb brit vállalati K+F-befektető gyógyszeripari (AstraZeneca: 12,0 Mrd EUR, a világon 14.;
 *   GSK: 6,9 Mrd EUR, 34.) – 2025-ös EU Industrial R&D Investment Scoreboard; a GII-ben Oxford fő szabadalmi területe a biotechnológia.
 * - Intézmények: BIST (a Department for Business and Trade új neve) és a DSIT átalakítása (a DSIT feladatain a BIST, a DCMS és a
 *   Cabinet Office osztozik; 2026. októberi állapot) – https://www.gov.uk/government/organisations/department-for-business-innovation-science-and-trade ,
 *   https://www.gov.uk/government/organisations/department-for-science-innovation-and-technology ,
 *   https://www.gov.uk/government/organisations/department-for-business-and-trade ; UKRI – https://www.ukri.org/who-we-are/ ;
 *   ARIA – https://www.aria.org.uk/about-aria/ ; Catapult-hálózat (9 központ) – https://catapult.org.uk/ ; NQCC – https://www.nqcc.ac.uk/about-us/ ;
 *   AI Research Resource (Isambard-AI – Bristol, Zenith – Cambridge; 2026. szeptember 28.) – https://www.gov.uk/government/publications/ai-research-resource
 *   (2026-10-12), https://docs.isambard.ac.uk/ ; ARCHER2 (a szolgáltatás vége: 2026. november 20.) – https://www.archer2.ac.uk/ (2026-10-12)
 * - Finanszírozás: összevont K+F-adókedvezmény (merged scheme) és a K+F-intenzív, veszteséges KKV-k kiegészítő támogatása (ERIS) a 2024. április 1-jén
 *   vagy később kezdődő üzleti évekre (HMRC, 2026. január 8.) –
 *   https://www.gov.uk/guidance/research-and-development-rd-tax-relief-the-merged-scheme-and-enhanced-rd-intensive-support (2026-10-12)
 * - Top 10 vállalat: a 2025-ös EU Industrial R&D Investment Scoreboard (2024-es üzleti év) legnagyobb K+F-ráfordítású brit székhelyű
 *   vállalatai a pénzügyi szektor nélkül – https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip
 * - Startupok: GII-profil (Revolut, Checkout.com) és a CB Insights unikornislistája (2026. márciusi állapot: Monzo, Wayve, Synthesia, CMR Surgical) –
 *   https://www.cbinsights.com/research-unicorn-companies (2026-10-12)
 * - Rendezvények (hivatalos oldalak): https://londontechweek.com/ , https://www.farnboroughairshow.com/ (FIA2026, FIA2028),
 *   https://www.dsei.co.uk/ , https://www.advancedengineeringuk.com/ ,
 *   https://royalsociety.org/science-events-and-lectures/summer-science-exhibition/ , https://www.britishsciencefestival.org/
 * - Kapcsolatok: Horizont Európa- és Copernicus-társulás (2023. szeptember 7.; költségek 2024 januárjától; Euratom helyett hazai
 *   fúziós stratégia) – https://www.gov.uk/government/news/uk-joins-horizon-europe-under-a-new-bespoke-deal ;
 *   Németország–Egyesült Királyság barátsági és kétoldalú együttműködési szerződés (2025. július 17.; 5. projekt: stratégiai tudományos és
 *   technológiai partnerség) –
 *   https://www.gov.uk/government/news/friendship-and-bilateral-cooperation-treaty-the-17-projects-the-uk-and-germany-will-deliver-together (2026-10-12);
 *   Technology Prosperity Deal (egyetértési megállapodás, 2025. szeptember 18.: MI, polgári nukleáris energia, fúzió, kvantum) –
 *   https://www.gov.uk/government/news/memorandum-of-understanding-between-the-government-of-the-united-states-of-america-and-the-government-of-the-united-kingdom-of-great-britain-and-north (2026-10-12);
 *   végrehajtását az USA 2025. december 16-án felfüggesztette (AFP) –
 *   https://www.freemalaysiatoday.com/category/world/2025/12/17/uk-looks-to-restart-cooperation-after-us-suspends-tech-deal (2026-10-12);
 *   CERN – https://home.cern/about/who-we-are/member-states ; ESO (2002) – https://www.eso.org/public/about-eso/memberstates/
 * - Magyar vonatkozás:
 *   - Oktatási, kulturális, tudományos és technológiai együttműködési egyezmény (Budapest, 1987. március 9.; hatályos 1987. július 1-jétől;
 *     I. cikk: akadémiák, kutatóintézetek és egyetemek közvetlen együttműködése, közös kutatási projektek; II. cikk: közös K+F-program) –
 *     UK Treaty Series No. 44 (1990): https://treaties.fcdo.gov.uk/data/Library2/pdf/1990-TS0044.pdf ; NKFIH, szerződéses országok –
 *     https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 *   - MTA 2026-os mobilitási felhívása (Skót Királyi Társaság, RSE) –
 *     https://mta.hu/data/dokumentumok/nemzetkozi_kapcsolatok/egyszeri_kiutazasokhoz_felhivas_2026_honlapra.pdf
 *   - Több mint 900 brit vállalat, több mint 50 000 munkavállaló (Overseas business risk: Hungary, 2023. november 21.) –
 *     https://www.gov.uk/government/publications/overseas-business-risk-hungary/overseas-business-risk-hungary
 *   - UK Science and Technology Network: a helyszínek között Ausztria és Németország szerepel, Magyarország nem –
 *     https://www.gov.uk/world/organisations/uk-science-and-technology-network
 *   - Erasmus+ 2027-től: https://www.gov.uk/government/news/young-people-from-all-backgrounds-to-get-opportunity-to-study-abroad-as-uk-eu-deal-unlocks-erasmus
 *     (2025. december 17.), https://www.gov.uk/government/news/uk-and-eu-finalise-agreement-to-bring-uk-into-erasmus-in-2027 (2026. április 15.)
 *   - Chevening (magyarországi oldal) – https://www.chevening.org/scholarship/hungary/
 *   - Stipendium Hungaricum: az Egyesült Királyság nem partnerország – https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők: egyik sem; a Stipendium Hungaricum nem szerepel (nem partnerország).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'GB',
  profil: {
    alapadatok: {
      fovaros: 'London',
      terulet: '244 378',
      penznem: 'angol font (GBP)',
      lakossag: '69 868 000',
      gdp: '3 958,8',
      gdpEgyFore: '56 661',
      gdpNovekedes: '1,3',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Office for National Statistics (ONS)',
      tagsagok: ['OECD', 'NATO', 'G7', 'G20', 'Nemzetközösség'],
      tagsagEgyeb: 'ENSZ BT állandó tagja; CPTPP, AUKUS; ESA, CERN, ESO, EMBL',
      agazatok: [
        'Pénzügyi szolgáltatások', 'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Kreatív ipar és média', 'Védelmi ipar',
        'Mobilitás és autóipar',
      ],
      agazatEgyeb: 'Repülőgép- és űripar, szakmai és üzleti szolgáltatások, tiszta energia',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 6. hely (2024-ben az 5.); legerősebb pillére a kreatív kibocsátás (3.), leggyengébb az intézményi környezet (25.); '
        + 'intenzitás szerint Cambridge a világ 2., Oxford az 5. klasztere. A K+F-ráfordítás az OECD MSTI előzetes adata szerint 2023-ban a GDP 2,75%-a '
        + '(az ONS szerint 2024-ben 2,71%); az állami K+F-keret 2029/30-ra évi 22,6 milliárd fontra nő.',
      gerd: '2,75',
      strategia: 'Modern Industrial Strategy (2025, 10 éves terv, 8 kiemelt növekedési ágazat); állami K+F-keret 2026/27–2029/30: 86 Mrd GBP',
      prioritasok: [
        'Digitalizáció és MI', 'Egészség és élettudomány', 'Zöld átállás és klímasemlegesség', 'Védelem és biztonság', 'Űr',
        'Alapkutatási kiválóság', 'Startup és vállalkozói ökoszisztéma', 'Regionális felzárkózás',
      ],
      prioritasEgyeb: 'IS-8 (az ipari stratégia 8 ágazata): fejlett gyártás, tiszta energia, kreatív ipar, védelem, digitális technológiák, pénzügy, élettudomány, szakmai és üzleti szolgáltatások',
      kiemeltIparagak: [
        'Biotechnológia és gyógyszeripar', 'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Kvantumtechnológia',
        'Űripar', 'Védelmi ipar', 'Elektronika és félvezetők',
      ],
      iparagEgyeb: 'Mérnöki biológia, kiberbiztonság, fejlett hálózati technológiák, fintech',
      erossegek:
        'Világszínvonalú egyetemek és kutatóintézetek (Oxford, Cambridge, Imperial, UCL; Francis Crick Institute, Wellcome Sanger Institute); '
        + 'erős élettudományi és MI-ökoszisztéma – a két legnagyobb vállalati K+F-befektető, az AstraZeneca és a GSK gyógyszeripari; '
        + 'a GII-ben a kreatív kibocsátás (3.) és a piaci fejlettség (4.) kiemelkedő; többéves állami K+F-keret.',
      kihivasok:
        'A K+F-intenzitás 2023-ban és 2024-ben is 2,7% körül maradt; a GII-ben az intézményi környezet (25.) és az infrastruktúra (23.) a leggyengébb. '
        + 'Kihívás a Brexit utáni uniós részvétel visszaépítése, a felsőoktatás finanszírozása, a startupok skálázása és az aranyháromszögön kívüli régiók felzárkózása.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Vállalkozási, Innovációs, Tudományos és Kereskedelmi Minisztérium (BIST, 2026) – átveszi a megszűnő Tudományos, Innovációs és Technológiai '
        + 'Minisztérium (DSIT) feladatainak egy részét; a többi a Digitális, Kulturális, Média- és Sportminisztériumhoz (DCMS) és a Kabinetirodához kerül.\n'
        + 'UKRI – nemzeti kutatásfinanszírozó (7 kutatási tanács, Research England, Innovate UK).\n'
        + 'ARIA – áttörő, nagy kockázatú K+F finanszírozása.',
      egyetemek:
        'Oxford, Cambridge, Imperial College London, University College London (UCL), King\'s College London, Edinburgh, Manchester, Bristol, Glasgow, Warwick; '
        + 'az Oxford–Cambridge–London „aranyháromszög” egyetemei a nemzetközi rangsorok élmezőnyében.',
      kutatokozpontok:
        'Francis Crick Institute (orvosbiológia), Wellcome Sanger Institute (genomika), MRC Laboratory of Molecular Biology, Alan Turing Institute (adattudomány és MI), '
        + 'National Physical Laboratory, UKAEA (fúzió, Culham), Rutherford Appleton Laboratory (Harwell); a kilenc Catapult technológiai és innovációs központ.',
      infrastrukturak:
        'Diamond Light Source szinkrotron és ISIS neutron- és müonforrás (Harwell); National Quantum Computing Centre (Harwell, 10 éves állami kötelezettségvállalással); '
        + 'az MI-kutatás nemzeti számítási kapacitása (Isambard-AI – Bristol, Zenith – Cambridge); ARCHER2 (Edinburgh; 2026. november 20-án leáll); UK Biobank; EMBL-EBI (Hinxton).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Biotechnológia és gyógyszeripar', 'Mesterséges intelligencia és adatgazdaság', 'IKT és digitalizáció', 'Űripar', 'Védelmi ipar',
        'Kreatív ipar és média',
      ],
      agazatEgyeb: 'Fintech, repülőgépipar, mérnöki biológia',
      topVallalatok: [
        'AstraZeneca', 'GSK', 'Shell', 'Unilever', 'Rolls-Royce',
        'CNH Industrial', 'Experian', 'BT Group', 'RELX', 'Sage Group',
      ].join('\n'),
      startupok:
        'Európa egyik legnagyobb startup-ökoszisztémája; ismert scale-upok: Revolut, Monzo és Checkout.com (fintech), Wayve (önvezető MI), Synthesia (generatív MI), '
        + 'CMR Surgical (sebészeti robotika). A korai fázist a British Business Bank és az SEIS/EIS befektetői adókedvezmények segítik.',
      klaszterek:
        'A GII klaszterei: London, Cambridge, Oxford, Manchester; az Oxford–Cambridge–London „aranyháromszög”, a londoni King\'s Cross tudásnegyed '
        + '(Google DeepMind, Francis Crick Institute, Alan Turing Institute), a Harwell Science and Innovation Campus; Manchester (grafén), Edinburgh (adattudomány).',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-cégek (pl. Oxford University Innovation, Cambridge Enterprise) és erős spin-off kultúra; a Catapult-hálózat; '
        + 'az Innovate UK Knowledge Transfer Partnerships (KTP) programja; a Research England Higher Education Innovation Funding (HEIF) kerete.',
    },
    programok: {
      palyazatok:
        'Az UKRI kutatási tanácsainak nyílt pályázatai és a Future Leaders Fellowships; az Innovate UK innovációs felhívásai; a National Institute for Health '
        + 'and Care Research (NIHR) egészségkutatási programjai; az ARIA programigazgatói felhívásai.',
      tamogatasiProgramok:
        'A 86 milliárd fontos állami K+F-keret (2026/27–2029/30), ebből 55 milliárd font hosszú távú ügynökségi allokáció (UKRI több mint 38 milliárd); '
        + '10 éves kötelezettségvállalások (pl. NQCC); az ARIA éves kerete 2029/30-ra 400 millió fontra nő.',
      finanszirozasiEszkozok:
        'K+F-adókedvezmény (2024 áprilisától összevont rendszer, K+F-intenzív KKV-knak kiegészítő támogatással); Patent Box (szabadalmi jövedelmek kedvezményes adózása); '
        + 'British Business Bank (British Patient Capital); National Wealth Fund; SEIS/EIS.',
      nemzetkoziReszvetel:
        'Horizont Európa és Copernicus: teljes jogú társult ország 2024-től; az Euratom helyett hazai fúziós program; CERN-alapító, ESA-, ESO- és EMBL-tag; '
        + 'International Science Partnerships Fund; Global Talent vízum.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'London Tech Week', tipus: 'konferencia', idopont: 'június, London (Olympia)', megjegyzes: 'Technológiai és befektetői hét kiállítással; 2027: június 7–11.' },
      { nev: 'Farnborough International Airshow', tipus: 'szakkiallitas', idopont: 'július, Farnborough', megjegyzes: 'Kétévente, páros években; repülés-, űr- és védelmi ipar' },
      { nev: 'DSEI UK', tipus: 'szakkiallitas', idopont: 'szeptember, London (ExCeL)', megjegyzes: 'Kétévente; védelmi és biztonsági ipar; 2027: szeptember 7–10.' },
      { nev: 'Advanced Engineering', tipus: 'szakkiallitas', idopont: 'november, Birmingham (NEC)', megjegyzes: 'Fejlett gyártás és mérnöki megoldások; 2026: november 4–5.' },
      { nev: 'Royal Society Summer Science Exhibition', tipus: 'forum', idopont: 'június–július, London', megjegyzes: 'A brit kutatás eredményei a nagyközönségnek; 2026: június 30.–július 5.' },
      { nev: 'British Science Festival', tipus: 'forum', idopont: 'szeptember, évente más városban', megjegyzes: 'British Science Association; 2026: Southampton, szeptember 16–20.' },
    ]),
    nemzetkoziKapcsolatok: {
      partnerorszagok:
        'USA (2025-ös Technology Prosperity Deal, amelynek végrehajtását az USA 2025 decemberében felfüggesztette), Németország (2025-ös barátsági szerződés '
        + 'stratégiai tudományos-technológiai partnerséggel), Japán, Kanada, '
        + 'Ausztrália (AUKUS), India, Franciaország, Svájc.',
      euMultilateralis:
        'A 2023. szeptemberi megállapodás alapján 2024-től ismét a Horizont Európa és a Copernicus társult országa (az Euratomhoz nem csatlakozott); '
        + 'OECD- és G7-tag; a CERN alapító tagja, az ESA, az ESO (2002 óta) és az EMBL tagja.',
    },
    magyarKapcsolatok: {
      egyezmeny: 'Magyar–brit oktatási, kulturális, tudományos és technológiai együttműködési egyezmény (Budapest, 1987. március 9.)',
      ketoldalu:
        'Az 1987-es egyezmény az akadémiák, kutatóintézetek és egyetemek közvetlen együttműködését és közös K+F-programot irányoz elő; az MTA a Skót Királyi '
        + 'Társasággal (RSE) akadémiai mobilitást támogat (2026). A brit kormány szerint több mint 900 brit cég működik Magyarországon (2023). '
        + 'A brit Science and Technology Network Ausztriában és Németországban jelen van, Magyarországon nem (2026).',
      mobilitas:
        'Az Egyesült Királyság a 2027/28-as tanévtől újra részt vesz az Erasmus+ programban (megállapodás: 2025. december; a jogi szöveg aláírása: 2026. április); '
        + 'a Horizont Európában a brit szervezetek 2024 óta ismét teljes jogú, uniós finanszírozású résztvevők (pl. Marie Skłodowska-Curie); Chevening-ösztöndíj '
        + 'magyar jelentkezőknek; MTA–RSE akadémiai mobilitás.',
    },
    magyarErtekeles: {
      osszegzes:
        'Az Egyesült Királyság a világ egyik vezető tudományos nagyhatalma (GII 6.), amely 2024 óta ismét a Horizont Európa társult országa, 2027-től pedig '
        + 'az Erasmus+ programhoz is visszatér. A kapcsolatok kerete az 1987-es oktatási, kulturális, tudományos és technológiai egyezmény; kiemelt lehetőség '
        + 'az élettudományok, az MI, a kvantumtechnológia és az űripar.',
      egyuttmukodesiLehetosegek:
        'Közös Horizont Európa-pályázatok brit partnerekkel (élettudomány, MI, kvantum, űr); magyar kutatók részvétele a brit nagy infrastruktúrák '
        + '(Diamond, ISIS) felhasználói programjaiban; egyetemi partnerségek az aranyháromszög intézményeivel.',
      joGyakorlatok:
        'Az ARIA programigazgatói modellje (nagy kockázatú, áttörő K+F); a Catapult-hálózat mint ipari technológiai központok rendszere; '
        + 'a Knowledge Transfer Partnerships vállalat–egyetem modell; többéves állami K+F-keretek és 10 éves intézményi finanszírozás.',
      diplomaciaiPrioritasok:
        'Az 1987-es egyezmény szerinti együttműködés (közös K+F-program, akadémiai csere) élénkítése; a Horizont Európa-társulás és a 2027-es Erasmus+-részvétel '
        + 'kihasználása; a brit Science and Technology Network magyarországi jelenlétének ösztönzése.',
    },
  },
};

export default orszag;

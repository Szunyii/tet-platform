/**
 * Írország (IE) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Az Egyesült Királyságot és Írországot ugyanaz a londoni attasé fedi le.
 * Források (hozzáférés: 2026-10-09; a „2026-10-12” jelzésűek: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 708,771 Mrd USD,
 *   GDP/fő 129 131,78 USD, reálnövekedés 9,113%, lakosság 5,489 millió) –
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO_2025_OCT_VINTAGE/1.0.0/IRL.NGDPD+NGDPDPC+NGDP_RPCH+LP.A
 * - Terület: CSO, Census 2022, F1011 „Population Density and Area Size” (Ireland: 70 265 km²) – https://data.cso.ie/table/F1011
 * - GII 2025 (18. hely; 2024: 19.; pillérek: intézmények 10., infrastruktúra 13., humántőke és kutatás 24., piaci fejlettség 36.;
 *   IKT-szolgáltatás-exportban és szellemitulajdon-díjfizetésben 1.; 1 klaszter: Dublin, fő szabadalmi területe az orvostechnika;
 *   unikornisok: BrowserStack, Wayflyer, Flipdish) – https://www.wipo.int/edocs/gii-ranking/2025/ie.pdf ,
 *   https://www.wipo.int/web-publications/global-innovation-index-2025/en/gii-2025-results.html
 * - GERD (a gerd mező): OECD MSTI, 2026. márciusi kiadás, 2024: 1,38% (előzetes) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/IRL.A.G.PT_B1GQ..?startPeriod=2021 ,
 *   https://www.oecd.org/en/data/datasets/main-science-and-technology-indicators.html ;
 *   nemzeti közlés: CSO, Ireland's UN SDGs – Goal 9, 2026 (2026. június 19.): 2024: becslés szerint 7,758 Mrd EUR, a GDP 1,48%-a, a GNI* 2,47%-a.
 *   A CSO 1,48%-a és az MSTI 1,38%-a ugyanarra a ráfordításra (kb. 7,76 Mrd EUR) épül, a különbség a GDP-adat változatából ered, nem két
 *   független becslés. GBARD 2025: +0,6% (forrás: CSO és DFHERIS) –
 *   https://www.cso.ie/en/releasesandpublications/ep/p-sdg9/irelandsunsdgs-goal9industryinnovationandinfrastructure2026/innovation/ ;
 *   vállalati K+F 2023 (83,8% külföldi tulajdonú vállalatoké; 2351 K+F-aktív vállalat, ebből 1706 ír tulajdonú) – CSO BERD 2023/2024:
 *   https://www.cso.ie/en/releasesandpublications/ep/p-berd/businessexpenditureonresearchanddevelopment2023final-2024preliminary/keyfindings
 * - Stratégia: Impact 2030: Ireland's Research and Innovation Strategy (DFHERIS, 2022; öt pillér, az első munkaprogram 2022–2024) –
 *   https://hea.ie/policy/research-policy/impact-2030/ , https://www.gov.ie/en/publication/27c78-impact-2030-irelands-new-research-and-innovation-strategy/ ;
 *   Research Ireland (2024. augusztus 1., az SFI és az IRC összevonásával) – https://www.sfi.ie/research-news/news/Research-Ireland-announce/
 * - Intézmények: DETE (Enterprise Ireland, IDA Ireland, DTIF) – https://enterprise.gov.ie/en/ ; Research Ireland – https://www.researchireland.ie/ ;
 *   Research Ireland Centres (2012 óta, 15 központ) – https://www.researchireland.ie/funded-research/research-ireland-centres/ ;
 *   Tyndall National Institute – https://www.tyndall.ie/ ; NIBRT – https://www.nibrt.ie/ ; K+F-adójóváírás: 35% (Finance Act 2025; általában a
 *   2026. december 31-én vagy később záruló üzleti évekre; korábban 30%) – Revenue, Tax and Duty Manual Part 29-02-03 (2026. április):
 *   https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-29/29-02-03.pdf (2026-10-12)
 * - Programok: Research Ireland pályázatai (Frontiers for the Future – folyamatos; Investigators Programme – 2026 decemberében indul; Pathway
 *   Programme; Government of Ireland posztgraduális és posztdoktori programok) – https://www.researchireland.ie/funding/ ,
 *   https://www.researchireland.ie/funding/investigators/ (2026-10-12); Enterprise Ireland Research, Development & Innovation Fund –
 *   https://www.enterprise-ireland.com/en/supports/research-development-innovation-fund (2026-10-12); Knowledge Transfer Ireland (nemzeti iroda
 *   az Enterprise Irelanden belül) – https://www.knowledgetransferireland.com/About_KTI/ (2026-10-12)
 * - Stripe (társalapítók: Patrick és John Collison; kettős székhely: San Francisco és Dublin) – https://stripe.com/newsroom/information (2026-10-12)
 * - Az első kiemelt iparág indoka: a dublini GII-klaszter fő szabadalmi területe az orvostechnika; a vállalati K+F több mint fele a
 *   feldolgozóiparé (CSO); a Research Ireland Centres között gyógyszeripari (SSPC) és orvostechnikai (CÚRAM) központ, valamint a NIBRT.
 * - Top vállalatok: a 2025-ös EU Industrial R&D Investment Scoreboard (2024-es üzleti év) ír székhelyű vállalatai a pénzügyi szektor nélkül;
 *   a 2025-ös Scoreboard az Írországban bejegyzett, de amerikai központú anyavállalatokat (pl. Medtronic, Accenture, Eaton, Johnson Controls)
 *   az USA-nál tartja nyilván –
 *   https://knowledge-for-policy.ec.europa.eu/sites/default/files/World2000%282004-2025%29.zip
 * - Rendezvények: Stripe Young Scientist & Technology Exhibition (alapítva 1965-ben; 2027: január 6–9., Dublin) – https://stripeyste.com/ (2026-10-12);
 *   a 2025. május 26-i hír szerint a Stripe címadó szponzorként a BT Ireland helyébe lép, amely 25 évig volt a dublini RDS-ben tartott kiállítás
 *   szervezője és szponzora –
 *   https://www.roscommonherald.ie/stripe-named-as-new-sponsor-of-young-scientist-exhibition_arid-59098.html (2026-10-12); https://www.scienceweek.ie/
 * - Nemzetközi tagságok: CERN-társult tagság (2025. október 22-től; a megállapodás 2025 májusában) –
 *   https://home.cern/ireland-becomes-associate-member-state-cern ; ESO (2018) – https://www.eso.org/public/about-eso/memberstates/ ;
 *   ESA – https://www.esa.int/About_Us/Corporate_news/ESA_facts ; EMBL (2003) – https://www.embl.org/about/member-states/
 * - Magyar vonatkozás: Írországgal nincs kormányközi TéT-egyezmény (nem szerepel az NKFIH szerződéses országai között) –
 *   https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok ; CHARM-EU európai egyetemi szövetség (tagjai között
 *   a Trinity College Dublin és az ELTE) – https://www.charm-eu.eu/ ; Stipendium Hungaricum: Írország nem partnerország –
 *   https://stipendiumhungaricum.hu/partners/
 * Kimaradt blokkok és mezők: a magyarKapcsolatok.egyezmeny üres (nincs kétoldalú TéT-egyezmény); a rendezvényeknél két visszatérő országos
 *   esemény szerepel; a top vállalatok listája hat nevet tartalmaz.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'IE',
  profil: {
    alapadatok: {
      fovaros: 'Dublin',
      terulet: '70 265',
      penznem: 'euró (EUR)',
      lakossag: '5 489 000',
      gdp: '708,8',
      gdpEgyFore: '129 132',
      gdpNovekedes: '9,1',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), CSO (Ír Központi Statisztikai Hivatal)',
      tagsagok: ['EU', 'OECD'],
      tagsagEgyeb: 'euróövezet; közös utazási övezet az Egyesült Királysággal (nem schengeni); ESA, ESO, EMBL; a CERN társult tagja (2025-től)',
      agazatok: [
        'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Pénzügyi szolgáltatások', 'Elektronika és félvezetők',
        'Agrár- és élelmiszeripar', 'Turizmus',
      ],
      agazatEgyeb: 'Orvostechnikai eszközök, repülőgép-lízing',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 18. hely (2024-ben a 19.); legerősebb pillére az intézményi környezet (10.), az IKT-szolgáltatások exportjában '
        + 'és a szellemitulajdon-díjfizetésekben 1. A K+F-ráfordítás az OECD MSTI előzetes adata szerint 2024-ben a GDP 1,38%-a (a CSO eltérő GDP-adattal 1,48%-ot, '
        + 'a GNI* arányában 2,47%-ot közöl); a vállalati K+F 84%-át külföldi tulajdonú cégek végzik (2023).',
      gerd: '1,38',
      strategia: 'Impact 2030: Ireland\'s Research and Innovation Strategy (2022–2030); kulcsintézménye a 2024-ben létrehozott Research Ireland',
      prioritasok: [
        'Alapkutatási kiválóság', 'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Egészség és élettudomány',
        'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség',
      ],
      prioritasEgyeb: 'Az ír sziget egészére kiterjedő (észak–déli), uniós és globális kutatási kapcsolatok; a hazai tulajdonú vállalatok innovációs képességének erősítése',
      kiemeltIparagak: [
        'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Elektronika és félvezetők', 'Mesterséges intelligencia és adatgazdaság',
        'Agrár- és élelmiszeripar', 'Energetika és fenntarthatóság',
      ],
      iparagEgyeb: 'Orvostechnikai eszközök (medtech), fotonika, fintech',
      erossegek:
        'A gyógyszeripari, orvostechnikai és IKT-multinacionális vállalatok sűrű jelenléte és képzett munkaerő; az iparral közösen finanszírozott '
        + 'Research Ireland Centres hálózat; 35%-os K+F-adójóváírás; angol nyelvű euróövezeti ország; a GII-ben az intézményi környezet (10.) '
        + 'és az infrastruktúra (13.) a legerősebb pillér.',
      kihivasok:
        'A K+F-intenzitás az uniós átlag alatt marad és erősen koncentrált: a vállalati K+F 84%-a külföldi cégeké, a hazai KKV-k innovációs képessége gyengébb. '
        + 'A GII-ben a piaci fejlettség (36.) és a humántőke és kutatás (24.) a leggyengébb; az állami K+F-előirányzat 2025-ben csak 0,6%-kal nő.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Továbbképzési, Felsőoktatási, Kutatási, Innovációs és Tudományos Minisztérium (DFHERIS) – kutatáspolitika, az Impact 2030 gazdája.\n'
        + 'Vállalkozási, Turisztikai és Foglalkoztatási Minisztérium (DETE) – vállalati innováció.\n'
        + 'Research Ireland (2024-től) – nemzeti kutatásfinanszírozó, az SFI és az IRC utódja.\n'
        + 'Enterprise Ireland – a hazai vállalatok fejlesztése.\n'
        + 'IDA Ireland – a külföldi befektetések vonzása.',
      egyetemek:
        'Trinity College Dublin, University College Dublin, University College Cork, University of Galway, Maynooth University, University of Limerick, '
        + 'Dublin City University, RCSI University of Medicine and Health Sciences; technológiai egyetemek (pl. TU Dublin, Munster Technological University).',
      kutatokozpontok:
        'A Research Ireland Centres (2012 óta) 15 nemzeti kutatóközpontja, pl. ADAPT (MI-alapú digitális tartalom), AMBER (anyagtudomány), CONNECT (hálózatok), '
        + 'Insight (adatelemzés), Lero (szoftver), CÚRAM (orvostechnika), SSPC (gyógyszeripar), I-Form (gyártás), IPIC (fotonika), VistaMilk (tejipar); Tyndall National Institute (Cork); DIAS.',
      infrastrukturak:
        'NIBRT (Dublin, 2011) – biogyógyszer-gyártási képzési és kutatóközpont; a Tyndall elektronikai és fotonikai kutatóinfrastruktúrája (Cork); '
        + 'ICHEC – a nemzeti nagy teljesítményű számítástechnikai központ; a Teagasc agrár- és élelmiszer-kutatóközpontjai.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Biotechnológia és gyógyszeripar', 'IKT és digitalizáció', 'Elektronika és félvezetők', 'Agrár- és élelmiszeripar',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Orvostechnika (medtech), fintech, repülőgép-lízing',
      topVallalatok: ['Kerry Group', 'Cimpress', 'Allegion', 'Prothena', 'nVent Electric', 'Kingspan'].join('\n'),
      startupok:
        'A GII 2025 (CB Insights) szerinti ír unikornisok: BrowserStack, Wayflyer és Flipdish; a Stripe-ot az ír Collison testvérek alapították, kettős székhelye '
        + 'San Francisco és Dublin. A 2351 K+F-aktív vállalatból 1706 ír tulajdonú (2023); a startupokat az Enterprise Ireland, a kutatói spin-offokat a Commercialisation Fund támogatja.',
      klaszterek:
        'A GII egyetlen ír klasztere Dublin (fő szabadalmi területe az orvostechnika). Regionális központok: Dublin (IKT-cégek európai központjai), Cork (gyógyszeripar, Tyndall), '
        + 'Galway (orvostechnika), Limerick–Shannon (félvezetők, orvostechnika), Leixlip (Intel); egyetemi inkubátorok (pl. NovaUCD, Trinity LaunchBox).',
      technologiatranszfer:
        'Knowledge Transfer Ireland (KTI) – az Enterprise Irelanden belül működő nemzeti iroda, amely a vállalatok hozzáférését segíti a kutatóhelyek tudásához; '
        + 'a felsőoktatási intézmények technológiatranszfer-irodái; az Enterprise Ireland Innovation Partnership '
        + 'Programme-ja, Technology Gateway hálózata és innovációs utalványai; a Research Ireland Centres ipari társfinanszírozású projektjei.',
    },
    programok: {
      palyazatok:
        'Research Ireland: Frontiers for the Future, Investigators Programme (2026 decemberétől), Pathway Programme, Government of Ireland posztgraduális és '
        + 'posztdoktori ösztöndíjak; Enterprise Ireland: RD&I Fund (Research, Development & Innovation Fund), Innovation Partnership Programme, Commercialisation Fund.',
      tamogatasiProgramok:
        'Disruptive Technologies Innovation Fund (DTIF – a DETE alapja áttörő technológiákra épülő vállalati–kutatói konzorciumoknak); a Shared Island kezdeményezés '
        + 'észak–déli kutatási programjai; US–Ireland R&D Partnership (Egyesült Államok, Írország, Észak-Írország).',
      finanszirozasiEszkozok:
        'K+F-adójóváírás: 35% (Finance Act 2025; általában a 2026. december 31-én vagy később záruló üzleti évekre; korábban 30%); Knowledge Development Box (szellemi tulajdonból származó jövedelem '
        + 'kedvezményes adózása); az Enterprise Ireland tőkebefektetései; az Ireland Strategic Investment Fund (ISIF) befektetései.',
      nemzetkoziReszvetel:
        'Horizont Európa; ESA-tag, EMBL-tag 2003 óta, ESO-tag 2018 óta, a CERN társult tagja 2025. október 22-től; a Research Ireland nemzetközi partnerei között '
        + 'az UKRI, az amerikai NSF és a Royal Society.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Stripe Young Scientist and Technology Exhibition', tipus: 'forum', idopont: 'január, Dublin (Royal Dublin Society)', megjegyzes: '1965 óta; 2025-ig 25 éven át a BT Ireland szervezte és szponzorálta; iskolai tudományos verseny és kiállítás; 2027: január 6–9.' },
      { nev: 'Science Week', tipus: 'forum', idopont: 'november, országszerte', megjegyzes: 'Országos tudományos hét a Research Ireland szervezésében; 2026: november 8–15.' },
    ]),
    nemzetkoziKapcsolatok: {
      partnerorszagok:
        'Egyesült Államok (US–Ireland R&D Partnership), Egyesült Királyság, ezen belül Észak-Írország (észak–déli együttműködés, Shared Island), az EU-tagállamok; '
        + 'a Research Ireland partnerei között az UKRI, az NSF és a Royal Society.',
      euMultilateralis:
        'EU-tag 1973 óta, euróövezeti ország; a Horizont Európa résztvevője; ESA-tag, 2003 óta EMBL-, 2018 óta ESO-tag, 2025. október 22-től a CERN társult tagja; OECD-tag.',
    },
    magyarKapcsolatok: {
      egyezmeny: '',
      ketoldalu:
        'Kormányközi TéT-egyezmény nincs (Írország nem szerepel az NKFIH szerződéses országai között); a kutatási együttműködés fő kerete az uniós keretprogram '
        + '(Horizont Európa). Közvetlen egyetemi kapcsolat: a Trinity College Dublin és az ELTE egyaránt tagja a CHARM-EU európai egyetemi szövetségnek.',
      mobilitas: 'Erasmus+ hallgatói és oktatói mobilitás, a CHARM-EU szövetségen belül is (Trinity College Dublin – ELTE); Marie Skłodowska-Curie-ösztöndíjak a Horizont Európában.',
    },
    magyarErtekeles: {
      osszegzes:
        'Írország a multinacionális vállalatokra épülő innováció modellországa: a gyógyszer-, orvostechnikai és IKT-ipar európai központja, 2025 óta a CERN társult tagja. '
        + 'Kétoldalú TéT-egyezmény nincs, így a kapcsolatok fő kerete a Horizont Európa és az európai egyetemi szövetségek (a CHARM-EU-ban a Trinity College Dublin '
        + 'és az ELTE); a legígéretesebb közös területek a biogyógyszer-gyártás, az orvostechnika és a félvezetők.',
      egyuttmukodesiLehetosegek:
        'Közös Horizont Európa-konzorciumok a Research Ireland Centres partnereivel (pl. SSPC – gyógyszeripar, CÚRAM – orvostechnika, Tyndall – félvezetők, '
        + 'Insight és ADAPT – MI); biogyógyszer-gyártási képzés (NIBRT); agrár- és élelmiszer-innováció (Teagasc, VistaMilk); közös képzés és kutatás a CHARM-EU-ban.',
      joGyakorlatok:
        'A Research Ireland Centres ipari társfinanszírozású modellje; a kutatásfinanszírozás egyetlen ügynökségbe szervezése (Research Ireland); '
        + 'a 35%-os K+F-adójóváírás; a Knowledge Transfer Ireland mint az Enterprise Irelanden belüli nemzeti tudástranszfer-iroda; a GNI* mint a multinacionális '
        + 'hatásoktól megtisztított viszonyítási alap.',
      diplomaciaiPrioritasok:
        'Kétoldalú TéT-együttműködési keret (egyezmény vagy szándéknyilatkozat) feltárása; kapcsolatfelvétel a Research Ireland és az NKFIH között; '
        + 'közös Horizont Európa-pályázatok ösztönzése.',
    },
  },
};

export default orszag;

/**
 * Tunézia (TN) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09, a [2026-10-12] jelölésűeké 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF Data, WEO_2025_OCT_VINTAGE adatfolyam) –
 *   https://data.imf.org/Datasets/WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/TUN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (GDP 59,069 Mrd USD; GDP/fő 4751,548 USD; reálnövekedés 2,464%; lakosság 12,432 millió – 2025, becslés).
 * - Terület: CIA World Factbook (2025. április 23-i állapot: 163 610 km²) – https://www.cia.gov/the-world-factbook/countries/tunisia/
 *   (a Factbook 2026-ban megszűnt; archív: web.archive.org, 2025-04-28-i page-data.json); Világbank AG.SRF.TOTL.K2 ugyanennyi.
 * - GII 2025 (76. hely; 2024: 81.; alsó-közepes jövedelműek közt 6.; erősségek, gyengeségek; egyetemek):
 *   https://www.wipo.int/edocs/gii-ranking/2025/tn.pdf
 * - GERD: UNESCO UIS, 2019: 0,7466% – https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=TN
 * - Kutatói létszám, technoparkok, magyar–tunéziai gazdasági kapcsolatok: Tunézia országismertető (HEPA/KGM,
 *   2024. december) – https://exporthungary.gov.hu/download/c/33/53000/2024%20Tun%C3%A9zia%20Orsz%C3%A1gismertet%C5%91%20vf.pdf
 * - Stratégia: reformterv 2015–2025 – https://www.anpr.tn/mobilite-des-chercheurs-mobidoc-promesse/ ; Fejlesztési terv 2026–2030
 *   (2026. évi 16. törvény) – https://www.mdici.gov.tn/plan-2026-2030-ar/ ; „Horizont 2035” fórum és új stratégia –
 *   https://www.mes.tn/detail_evennement.php?code_menu=548&code_evennement=4390 ; kutatási prioritások (2017) és ARESSE-projekt
 *   (négy év, teljes keret 11,5 M EUR) – …&code_evennement=4313 [2026-10-12] ; kutatási konzorciumok – …&code_evennement=4191 ;
 *   „Green Post-Doc” felhívás – https://www.anpr.tn/projet-aresse-appel-mobidoc-green-post-doc-2026/ [2026-10-12]
 * - Startup Act – https://startup.gov.tn/en/startup_act/discover , https://startup.gov.tn/en/startup_act/benefits_to_Startups ;
 *   címkézési eredmények (2019–2021: több száz címke) – https://startup.gov.tn/en/startup_act/results ;
 *   InstaDeep – https://www.sec.gov/Archives/edgar/data/1776985/000177698523000003/ex991instadeepagreementrel.htm ;
 *   Expensya – https://www.expensya.com/fr/lp/expensya-devient-medius-expense/ ; ANAVA – https://smartcapital.tn/?page_id=326 ;
 *   KfW – https://startup.gov.tn/fr/news/la-kfw-investit-20-millions-deuros-dans-le-fonds-de-fonds-anava ;
 *   Világbank P167380 – https://projects.worldbank.org/en/projects-operations/project-detail/P167380 ; zárónapja 2028. 11. 30-ra módosult –
 *   https://documents.worldbank.org/curated/en/099061925090538346/pdf/P167380-1a28eb08-f8c4-4949-bd99-9f8e36fb9f0e.pdf [2026-10-12]
 * - Intézmények: MESRS (DGRS) – https://www.mes.tn/page.php?code_menu=551&code_menu_parent=12 ; ANPR – https://www.anpr.tn/mission/ ;
 *   értékelő és akkreditációs ügynökség (2022) – …&code_evennement=4327 [2026-10-12] ; kutatóközpontok programszerződései (2026: 14) –
 *   …&code_evennement=4454 [2026-10-12] ;
 *   egyetemek – https://www.mes.tn/annuaire.php?code_menu=22 , https://utm.rnu.tn/utm/fr/universite--presentation , https://ucar.rnu.tn/ ;
 *   kutatóközpontok – https://www.mes.tn/page.php?code_menu=33&code_menu_parent=28 , https://pasteur.tn/ , https://cbs.rnrt.tn/page/presentation ,
 *   https://ecopark.tn/ , https://cbbc.rnrt.tn/ , http://www.instm.agrinet.tn/index.php/fr/presentation/historique ;
 *   szuperszámítógép (2026) – …&code_evennement=4512 ; INNORPI – https://www.innorpi.tn/fr/propos-de-linnorpi ;
 *   technopoliszok – https://www.tunisieindustrie.nat.tn/fr/doc.asp?mcat=16&mrub=157 ; programok – https://www.anpr.tn/programmes-nationaux/ ,
 *   https://www.anpr.tn/mobidoc/ , https://www.anpr.tn/les-butt-tunisie/ ; repülőgépipar – https://investintunisia.tn/secteur-aeronautique/
 *   (a „…&code_evennement=N” a https://www.mes.tn/detail_evennement.php?code_menu=548&code_evennement=N rövidítése)
 * - Rendezvények: SIAT 2026 – https://www.siat.tn/ , https://www.siat.tn/presentation-exposition-siat.html [2026-10-12]
 * - EU és multilaterális: https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/europe-world/international-cooperation/association-horizon-europe/tunisia_en ;
 *   EU–Tunézia tudományos-technológiai megállapodás (2004/127/EK tanácsi határozat; aláírás: 2003. 06. 26., Szaloniki) –
 *   https://eur-lex.europa.eu/eli/dec/2004/127(1)/oj/eng [2026-10-12] , http://publications.europa.eu/resource/celex/32004D0127 [2026-10-12] ;
 *   EU–Marokkó tudományos-technológiai megállapodás (2004/126/EK tanácsi határozat; aláírás: ugyancsak 2003. 06. 26., Szaloniki) –
 *   http://publications.europa.eu/resource/celex/32004D0126 [2026-10-12] , https://lexaris.de/book/version/documentflat/head/4624221 [2026-10-12] ;
 *   EU–Tunézia memorandum (2023) – https://ec.europa.eu/commission/presscorner/detail/en/ip_23_3887 ; PRIMA – https://prima-med.org/participating-states/ ;
 *   PHC Utique – https://www.campusfrance.org/fr/utique ; Afrikai Unió – https://au.int/en/member_states/countryprofiles2 ;
 *   kétoldalú partnerek (Kína 2025, Olaszország 2024–2025, Egyesült Királyság 2026) – …&code_evennement=4311, 4221, 4500
 * - Magyar vonatkozás:
 *   1966-os kulturális és tudományos egyezmény – https://njt.jog.gov.hu/jogszabaly/2008-131-20-22 ;
 *   Stipendium Hungaricum-megállapodás (312/2022. Korm. rendelet; Tunéziára 2025. 11. 08-tól hatályos) – https://njt.jog.gov.hu/jogszabaly/2025-28-C0-6Q ;
 *   SH-partner (minden szint) – https://stipendiumhungaricum.hu/partners/ ; évi 200, majd 250 hely – …&code_evennement=3740, 3904 ;
 *   2024. 04. 29-i felsőoktatási egyetértési memorandum – …&code_evennement=4038 ;
 *   gazdasági együttműködési megállapodás (2004) és vegyes bizottsági ülések (legutóbb 2023) – országismertető (fent) ;
 *   a gazdasági együttműködés fő területei (vasúti infrastruktúra, vízgazdálkodás, mezőgazdaság, orvostechnikai eszközök, informatikai biztonság) –
 *   https://tunisz.mfa.gov.hu/hu/magyarorszag-tunezia-ketoldalu-kuelgazdasagi-adatok ;
 *   SZTE–IRESA (2018) – https://tunisz.mfa.gov.hu/fr/articles/egyuettmukoedesi-megallapodast-irt-ala-a-szegedi-tudomanyegyetem-es-a-tuneziai-nemzeti-agrarkutatasi-es-felsooktatasi-intezet
 * Kimaradt blokkok és mezők: nincs. Nem ellenőrizhető, ezért kimaradt: formálisan elfogadott nemzeti MI-stratégia,
 * a minősített startupok hivatalos összesített száma 2021 után, a Tunisia Investment Forum, a FITA, a BigTech Africa és a JITT
 * 2026-os kiadása (az utóbbi kettőnek csak 2025-ös kiadása ellenőrizhető).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'TN',
  profil: {
    alapadatok: {
      fovaros: 'Tunisz',
      terulet: '163 610',
      penznem: 'tunéziai dinár (TND)',
      lakossag: '12 432 000',
      gdp: '59,1',
      gdpEgyFore: '4 752',
      gdpNovekedes: '2,5',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: CIA World Factbook (archív)',
      tagsagok: ['Afrikai Unió', 'Arab Liga'],
      tagsagEgyeb: 'Iszlám Együttműködési Szervezet, Arab Maghreb Unió; EU-társulási (euromediterrán) megállapodás; a Horizont Európa társult országa',
      agazatok: [
        'Mezőgazdaság és élelmiszeripar', 'Turizmus', 'Autóipar', 'Elektronika és félvezetők', 'Vegyipar', 'Bányászat és nyersanyagok',
        'IKT és szoftver',
      ],
      agazatEgyeb: 'Textil- és ruhaipar, repülőgépipari alkatrészgyártás, olívaolaj',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 76. hely (2024-ben a 81.), az alsó-közepes jövedelmű országok között a 6.; a WIPO szerint fejlettségi '
        + 'szintjénél jobban teljesít. Kiemelkedő a természettudományi és mérnöki diplomások aránya (2.) és az oktatási ráfordítás (7.). A K+F a GDP '
        + '0,75%-a (2019, UNESCO UIS); 2022-ben 13 802 kutató dolgozott.',
      gerd: '0,75',
      strategia: 'Felsőoktatási és kutatási reformterv 2015–2025 (lezárult); Fejlesztési terv 2026–2030; új nemzeti kutatási és innovációs stratégia készül (Horizont 2035)',
      prioritasok: [
        'Zöld átállás és klímasemlegesség', 'Energiabiztonság', 'Digitalizáció és MI', 'Egészség és élettudomány',
        'Technológiai szuverenitás', 'Startup és vállalkozói ökoszisztéma',
      ],
      prioritasEgyeb: 'Víz- és élelmiszerbiztonság, fenntartható vízgazdálkodás, mezőgazdaság és alkalmazkodás az éghajlatváltozáshoz',
      kiemeltIparagak: [
        'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszertechnológia',
        'Mesterséges intelligencia és adatgazdaság', 'Mobilitás és autóipar',
      ],
      iparagEgyeb: 'Víztechnológia, olívaolaj-kutatás, mechatronika',
      erossegek:
        'Jól képzett mérnök- és kutatói bázis (a kutatásban dolgozók 59%-a nő), élénk publikációs teljesítmény (a GDP-arányos cikkszámban 17.); '
        + 'a Horizont 2020-hoz egyedüli afrikai és arab országként társult (2016); a Horizont Európának 2021-től társult országa; úttörő Startup Act (2018); '
        + 'nemzetközi siker az InstaDeep.',
      kihivasok:
        'Nagyon gyenge kutatóhely–vállalat együttműködés (a közös publikációk arányában 136. a GII-ben), csekély magánfinanszírozású K+F '
        + '(a 2026–2030-as fejlesztési terv is kiemeli), alacsony beruházási ráta (132.); a legutóbbi nemzetközi K+F-adat 2019-es.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási és Tudományos Kutatási Minisztérium (MESRS) és Tudományos Kutatási Főigazgatóság (DGRS) – kutatáspolitika.\n'
        + 'ANPR (Nemzeti Kutatásösztönzési Ügynökség) – kutatáshasznosítás, MOBIDOC, technológiatranszfer.\n'
        + 'Felsőoktatási és Kutatási Értékelő és Akkreditációs Ügynökség (2022).\n'
        + 'Kommunikációs Technológiai Minisztérium – digitális átállás, MI.\n'
        + 'Ipari, Bányászati és Energetikai Minisztérium – APII (innovációösztönzés), INNORPI (iparjogvédelem).',
      egyetemek:
        'Université de Tunis El Manar (benne az ENIT; a GII szerint az ipari és nemzetközi kapcsolatokban a legerősebb), Université de Sfax, '
        + 'Université de Carthage (INSAT, Tuniszi Politechnikum), Sousse, Monastir, Manouba (ENSI), Université de Tunis; Sup’Com. Összesen 13 állami egyetem.',
      kutatokozpontok:
        'Institut Pasteur de Tunis; Centre de Biotechnologie de Sfax (CBS); a Borj Cédria technopolisz négy központja: CRTEn (energia), CERTE (víz), '
        + 'CBBC (növényi biotechnológia), CNRSM (anyagtudomány); CNSTN (nukleáris tudomány); INRAP (analitika); INSTM (tengertudomány); CRNS (digitális kutatás, Sfax).',
      infrastrukturak:
        'A Borj Cédria technopolisz kísérleti létesítményei (energia, víz, biotechnológia, anyagok); a manoubai El Khawarizmi számítóközpont 2026 júliusában '
        + 'átadott, kínai együttműködéssel épült nagy teljesítményű számítógépe; a CBBC ISO/IEC 17025 szerint akkreditált olívaolaj-elemző egysége.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'IKT és digitalizáció', 'Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'Agrár- és élelmiszertechnológia',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Repülőgépipari alkatrészgyártás (80+ cég, 17 ezer munkahely), elektromos kábelek és kábelkötegek, textilipar',
      topVallalatok: [
        'Poulina Group Holding', 'Tunisie Telecom', 'STEG', 'Groupe Chimique Tunisien', 'Compagnie des Phosphates de Gafsa', 'COFICAB',
        'OneTech', 'Vermeg', 'Délice', 'InstaDeep (BioNTech-csoport)',
      ].join('\n'),
      startupok:
        'A 2018-as Startup Act (2018-20. sz. törvény) 20 intézkedést – címkét, adó- és devizakönnyítéseket – kínál a minősített startupoknak; '
        + 'a címkét több száz vállalkozás kapta meg. A tuniszi irodával is működő InstaDeep MI-cégnek a BioNTech 2023-ban megvásárolta a még nem '
        + 'birtokolt részvényeit (kb. 362 M GBP, továbbá legfeljebb kb. 200 M GBP teljesítményfüggő kifizetés); az Expensyát a Medius vette meg.',
      klaszterek:
        'Az APII kilenc technopoliszt és pólust tart nyilván, köztük: Elgazala (IKT, Ariana; több mint 100 cég), Novation City (Sousse; mechatronika, '
        + 'elektronika), Sfax (IKT), Borj Cédria (energia, víz, biotechnológia), Sidi Thabet (biotechnológia, gyógyszer), Bizerte (élelmiszeripar).',
      technologiatranszfer:
        'BuTTNet – 25 technológiatranszfer-iroda hálózata (ANPR); VRR (kutatási eredmények hasznosítása) és PRF (kutatóhelyek és vállalatok közös '
        + 'projektjei); MOBIDOC (doktori és posztdoktori kutatók vállalati projektjei).',
    },
    programok: {
      palyazatok:
        'Nemzeti programok: VRR (3 éves), PRF (4 éves), PNRI (ipari K+F, állami finanszírozás a költség legfeljebb 80%-áig), PIRD (K+F-beruházás), '
        + 'RIICTIC (IKT-innováció); kutatási konzorciumok 2024–2027 (4 konzorcium, 20 labor, 306 kutató).',
      tamogatasiProgramok:
        'MOBIDOC posztdoktori program (a 2026-os „Green Post-Doc” felhívást az uniós ARESSE-projekt finanszírozza; a projekt négyéves teljes kerete '
        + '11,5 M EUR); a 2026–2030-as fejlesztési terv kutatási céljai (élelmiszer-, energia- és egészségbiztonság, digitális átalakulás, ipari '
        + 'modernizáció, környezet); kutatóközpontok programszerződései (2026: 14).',
      finanszirozasiEszkozok:
        'ANAVA alapok alapja (Smart Capital; 100 M EUR célméret, KfW-részvétellel) és InnovaTech alap – a Világbank 75 M USD-s startup- és '
        + 'kkv-projektje (2019–2028) keretében; Startup Act-kedvezmények (pl. technológiai kártya évi 100 ezer TND-ig).',
      nemzetkoziReszvetel:
        'A Horizont Európa társult országa (hatályos 2022. június 9-től, 2021. január 1-jéig visszamenőleg); PRIMA- és BLUEMED-résztvevő; PHC Utique és '
        + 'PHC Maghreb Franciaországgal.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'SIAT – mezőgazdasági beruházási és technológiai vásár', tipus: 'szakkiallitas', idopont: 'páros években október, Tunisz (Kram vásárközpont)', megjegyzes: 'Szervező: APIA (agrárberuházás-ösztönző ügynökség); 2026: 16. kiadás, október 28–31.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        '2003. június 26-án – Marokkóval egy napon – írta alá az EU-val a tudományos-technológiai megállapodást (hatályos 2004 áprilisától); '
        + 'a 2023-as EU–Tunézia memorandum a Horizont Európa-részvételt is érinti. Az Afrikai Unió alapító tagja, az Arab Liga tagja.',
      partnerorszagok:
        'Franciaország (PHC Utique, PHC Maghreb, kutatásértékelési együttműködés), Olaszország (memorandum 2024; közös kutatási projektek előkészítése 2025), Kína '
        + '(tudományos-technológiai megállapodás 2025), Németország (GIZ, KfW), Egyesült Királyság (vegyes bizottság).',
      egyezmeny: 'Magyar–tunéziai kulturális és tudományos együttműködési egyezmény (Budapest, 1966; kihirdetve: 131/2008. Korm. rendelet)',
      ketoldalu:
        'A 2004-es gazdasági együttműködési megállapodás vegyes bizottsága a 2024 végi állapot szerint legutóbb 2023-ban ülésezett; a gazdasági együttműködés fő '
        + 'területei: vasúti infrastruktúra, vízgazdálkodás, mezőgazdaság, orvostechnikai eszközök és informatikai biztonság. 2024-ben a felsőoktatásért felelős tárcák Stipendium Hungaricum-memorandumot írtak alá.',
      mobilitas:
        'Stipendium Hungaricum: a 2023–2025-ös programban évi 250 hely (2023 októberétől; előtte 200); a kormányközi SH-megállapodás 2025. november 8-án lépett hatályba, '
        + 'öt évre; a 2024-es memorandum tunéziai ösztöndíjakat is kínál magyar hallgatóknak; az SZTE és az IRESA (agrárkutatási és -felsőoktatási intézmény) 2018-as megállapodásának célja a kutató- és hallgatói mobilitás.',
    },
    magyarErtekeles: {
      osszegzes:
        'Tunézia a Maghreb leginkább EU-integrált kutatási rendszere (Horizont Európa-társult ország), sok mérnökkel, de gyenge vállalati K+F-fel. '
        + 'A kapcsolatok fő pillére a Stipendium Hungaricum (évi 250 hely a 2023–2025-ös programban) és a gazdasági vegyes bizottság; következő lépés lehet '
        + 'a TéT-keret megújítása.',
      egyuttmukodesiLehetosegek:
        'Víztechnológia és vízgazdálkodás (CERTE); fenntartható mezőgazdaság és olívaolaj-kutatás (SZTE–IRESA, CBBC); megújuló energia (CRTEn); '
        + 'IKT, MI és mérnöki szolgáltatások; egészségügyi biotechnológia (Institut Pasteur, CBS); közös Horizont Európa- és PRIMA-pályázatok.',
      joGyakorlatok:
        'Startup Act (2018) – egyetlen törvényben rögzített startup-címke és kedvezménycsomag; MOBIDOC – doktori és posztdoktori kutatók vállalati '
        + 'projektekben; BuTTNet – országos technológiatranszfer-iroda-hálózat; ANAVA – nemzetközi forrásokra épülő alapok alapja.',
      diplomaciaiPrioritasok:
        'Kétoldalú TéT-program vagy közös felhívás kezdeményezése az 1966-os egyezmény korszerűsítésével; az SH-ösztöndíjasok bevonása a kutatásba; '
        + 'tudományos napirend a vegyes bizottságban; partnerkeresés tunéziai Horizont Európa- és PRIMA-konzorciumokhoz.',
    },
  },
};

export default orszag;

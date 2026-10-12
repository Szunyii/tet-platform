/**
 * Marokkó (MA) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Figyelem: Marokkóban a 2026. szeptember 23-i választások után kormányalakítás folyik, ezért a profil tárcanevekre
 * hivatkozik, személyekre nem (https://www.maroc.ma/fr/le-maroc/gouvernement).
 * Források (hozzáférés: 2026-10-09, a [2026-10-12] jelölésűeké 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF Data, WEO_2025_OCT_VINTAGE adatfolyam) –
 *   https://data.imf.org/Datasets/WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/MAR.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (GDP 179,612 Md USD; GDP/fő 4762,729 USD; reálnövekedés 4,394%; lakosság 37,712 millió – 2025, becslés).
 * - Terület: Világbank AG.SRF.TOTL.K2 – 446 550 km², Nyugat-Szahara nélkül (ENSZ-gyakorlat) –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=MA . A CIA World Factbook utolsó (2025. decemberi)
 *   kiadása Nyugat-Szaharával együtt 716 550 km²-t közöl (archív page-data.json, web.archive.org, 2025-12-12); ezt a
 *   vitatott státusz miatt a profil nem használja.
 * - GII 2025 (57. hely; 2024: 66., 2020: 75.; alsó-közepes jövedelműek közt 4.; erősségek, gyengeségek; egyetemek, márkák):
 *   https://www.wipo.int/edocs/gii-ranking/2025/ma.pdf
 * - GERD: UNESCO UIS, 2010: 0,66% – https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=MA ; ENSZ-ESCWA (2017)
 *   becslése (0,7–0,8%, a ráfordítás kb. 65%-a felsőoktatási) – https://www.cnrst.ma/images/CNRST/Images/MoroccoEscwabook.pdf
 * - Stratégia: PACTE ESRI 2030 – https://www.maroc.ma/fr/strategies-politiques-publiques/plan-national-dacceleration-de-la-transformation-de-lecosysteme-de-lenseignement-superieur ,
 *   https://www.maroc.ma/sites/default/files/2024-12/enssup-fr.pdf ; indulás 2023 (másodlagos forrás):
 *   https://www.atalayar.com/en/articulo/society/esri-pact-2030-in-action-for-new-model-of-moroccan-universities/20241003190000205933.html ;
 *   Maroc Digital 2030 (2024. 09. 25.) – https://cgem.ma/actualites/lancement-officiel-de-la-strategie-nationale-maroc-digital-2030/ ;
 *   „Maroc IA 2030” ütemterv és JAZARI-intézetek – https://www.mmsp.gov.ma/fr/actualites (2026. 01. 12., 2026. 09. 08.)
 * - Intézmények: CNRST – https://www.cnrst.ma/fr/cnrst/a-propos/presentation ; MARWAN – https://www.marwan.ma/ ;
 *   Académie Hassan II – https://www.academiesciences.ma/fr/academie/historique.php ; OMPIC – https://www.mcinet.gov.ma/fr/organismes-sous-tutelle ;
 *   egyetemek: https://www.um5.ac.ma/um5/histoire-de-lum5 , https://www.uca.ma/fr , https://www.univh2c.ma/fr/page/histoire-de-luh2c ,
 *   https://aui.ma/about-aui , https://www.uit.ac.ma/presentation-de-luit/ , https://um6p.ma/ [2026-10-12] ;
 *   IRESEN, Green Energy Park – https://iresen.org/institut/ , https://iresen.org/infrastructure/ , https://iresen.org/ (32 szabadalom) ; INRA – https://www.inra.org.ma/fr/content/presentation ;
 *   Institut Pasteur du Maroc – http://www.pasteur.ma/fr/accueil/histoire ; Toubkal – https://top500.org/system/179908/
 * - Vállalati: Renault Tanger – https://www.renaultgroup.com/en/magazine/our-group-news/tangier-factory-the-industrial-and-logistics-hub-where-everything-comes-together/ ;
 *   AMICA – https://amica.org.ma/fr ; repülőgépipar – https://www.trade.gov/country-commercial-guides/morocco-aerospace ,
 *   https://www.trade.gov/country-commercial-guides/morocco-market-overview ;
 *   elektronika – https://www.mcinet.gov.ma/fr/content/industrie/secteurs-industriels/electronique ; HPS – https://www.hps-worldwide.com/about-hps ;
 *   Innov Invest Fund – https://www.tamwilcom.ma/celebration-des-resultats-du-fonds-innov-invest-un-programme-au-service-de-lecosysteme-marocain-de ;
 *   Startup Venture Building – https://www.mmsp.gov.ma/fr/actualites (2025. 12. 17.) ; Chari – https://www.trade.gov/country-commercial-guides/morocco-digital-economy ;
 *   Technopark – https://www.technopark.ma/technopark/ ; UM6P Ventures – https://um6pventures.com/ ;
 *   FSI – https://www.mcinet.gov.ma/fr/content/programmes-dappui-et-daccompagnement/fonds-de-soutien-linnovation
 * - Programok: Al-Khawarizmi – https://www.cnrst.ma/images/CNRST/Images/Programme-Al-Khawarizmi-IA.pdf ; PPR –
 *   https://www.cnrst.ma/fr/financement-de-la-recherche/programmes-nationaux/financement-des-projets-de-recherche?layout=blog&id=159 ;
 *   PHC Toubkal – https://www.campusfrance.org/fr/toubkal ; PHC Maghreb – https://www.campusfrance.org/fr/maghreb
 * - Rendezvények: https://gitexafrica.com/faqs , https://www.salon-agriculture.ma/ , https://solaireexpomaroc.com/ ,
 *   https://www.maroc.ma/fr/actualites/rabat-ouverture-des-travaux-du-3e-congres-international-des-mines-au-maroc , https://amica.org.ma/fr/evenements ;
 *   az IMC Morocco korábbi kiadásai (1.: 2024. december 3–4., 2.: 2025. november 24–25., mindkettő Marrákes) –
 *   https://medias24.com/2024/12/04/minerais-strategiques-ouverture-de-la-1re-edition-du-congres-international-des-mines-du-maroc/ ,
 *   https://fr.allafrica.com/stories/202511270444.html [2026-10-12]
 * - EU és multilaterális: https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/europe-world/international-cooperation/bilateral-cooperation-science-and-technology-agreements-non-eu-countries/morocco_en ;
 *   PRIMA 2025–2027 – https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/eu-morocco-renew-prima-agreement-mediterranean-research-cooperation-2026-03-27_en ;
 *   Horizont Európa (átmeneti szabályok; automatikus finanszírozás) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf ;
 *   Afrikai Unió – https://au.int/en/member_states/countryprofiles2 ; partnerek – https://www.cnrst.ma/index.php/fr/component/content/article/13-cnrst/68-conventions ,
 *   https://www.cnrst.ma/fr/unites-et-services/pole-moyens-et-appui-a-la-recherche/cooperation , https://ptx-hub.org/morocco/ ;
 *   INNO-ESPAMAROC ENERGY (IRESEN–CDTI) – https://lematin.ma/express/2018/liresen-lance-inno-espamaroc-energy/307165.html [2026-10-12] ,
 *   https://iresen.org/inno-espamaroc-energy/ [2026-10-12]
 * - Magyar vonatkozás:
 *   CNRST–NKFIH (ex-NIH) TéT-megállapodás és közös felhívások – https://www.cnrst.ma/fr/financement-de-la-recherche/appels-a-projets-internationaux-cooperation/cooperation-internationale/21-appels-a-projets-en-cours/142-lancement-de-l-edition-2019-2020-de-l-appel-a-projets-maroco-hongrois ,
 *   https://www.cnrst.ma/fr/financement-de-la-recherche/appels-a-projets-internationaux-cooperation/cooperation-internationale/21-appels-a-projets-en-cours/125-ap-2017-2018-cooperation-scientifique-maroco-hongrois ;
 *   NKFIH kétoldalú megállapodás Marokkóval (2020-as TéT-felhívás lábjegyzete) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tet-egyuttmukodes-2019-2111-tet/palyazati-csomag/palyazati-felhivas-2020 ;
 *   2021-1.2.6-TÉT-IPARI-MA (360,9 M Ft keret, prioritások; 49 pályázat, 6 projekt, 283,99 M Ft, döntés 2023. 07. 20.) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-marokkoi-alkalmazott-kf-egyuttmukodes-2021-126-tet-ipari-ma/palyazati-csomag/palyazati-felhivas ,
 *   https://nkfih.gov.hu/english/nrdi-fund/hungarian-moroccan-cooperation-2021-126-tet-ipari-ma/call-for-applications ;
 *   gazdasági együttműködési megállapodás (Budapest, 2009. 05. 11.; 130/2009. Korm. rendelet; hatályos 2013. 05. 23-tól; vegyes bizottság;
 *   területek köztük az oktatás és a tudomány és technológia) – https://njt.jog.gov.hu/jogszabaly/2009-130-20-22 ,
 *   https://njt.jog.gov.hu/jogszabaly/2013-44-C0-27 ; Stipendium Hungaricum (partner, minden szint) – https://stipendiumhungaricum.hu/partners/ ;
 *   165 hely – https://rabat.mfa.gov.hu/en/articles/bourses-stipendium-hungaricum-2024 ; 2023-as rabati miniszteri látogatás (165 helyre
 *   kb. 1300 jelentkező) –
 *   https://kormany.hu/hirek/az-europai-unioval-szemben-marokkora-lehet-szamitani-a-migracio-elleni-kuzdelemben ;
 *   levéltári együttműködés (2024) – https://rabat.mfa.gov.hu/hu/articles/magyar-marokkoi-leveltari-egyuettmukoedes
 * Kimaradt blokkok és mezők: nincs. Nem ellenőrizhető, ezért kimaradt: a Marrakech Air Show, az Új Fejlesztési Modell K+F-célja,
 * a Maroc Digital 2030 startup-célszámai, az UM6P és a MAScIR viszonya, a CNESTEN TRIGA reaktorának adatai.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'MA',
  profil: {
    alapadatok: {
      fovaros: 'Rabat',
      terulet: '446 550',
      penznem: 'marokkói dirham (MAD)',
      lakossag: '37 712 000',
      gdp: '179,6',
      gdpEgyFore: '4 763',
      gdpNovekedes: '4,4',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: Világbank (Nyugat-Szahara nélkül)',
      tagsagok: ['Afrikai Unió', 'Arab Liga'],
      tagsagEgyeb: 'Iszlám Együttműködési Szervezet, Arab Maghreb Unió; EU-társulási megállapodás (2000)',
      agazatok: [
        'Autóipar', 'Bányászat és nyersanyagok', 'Vegyipar', 'Mezőgazdaság és élelmiszeripar', 'Energetika', 'Turizmus',
      ],
      agazatEgyeb: 'Repülőgépipari beszállítás, foszfátalapú műtrágyagyártás, elektronikai alkatrészgyártás',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben az 57. hely (2024-ben a 66., 2020-ban a 75.), az alsó-közepes jövedelmű országok között a 4.; a WIPO szerint '
        + 'fejlettségi szintjénél jobban teljesít. Erősségei: az ipari minták száma (6.) és a csúcstechnológiai gyártás aránya (12.). A legutóbbi '
        + 'K+F-adat a GDP 0,66%-a (2010, UNESCO UIS); az ENSZ-ESCWA 2017-ben 0,7–0,8%-ra becsülte.',
      gerd: '0,66',
      strategia: 'PACTE ESRI 2030 – a felsőoktatási, kutatási és innovációs ökoszisztéma átalakításának nemzeti terve (2023-tól); Maroc Digital 2030 (2024)',
      prioritasok: [
        'Zöld átállás és klímasemlegesség', 'Digitalizáció és MI', 'Egészség és élettudomány', 'Energiabiztonság', 'Ipar 4.0 és gyártás',
        'Startup és vállalkozói ökoszisztéma', 'Regionális felzárkózás',
      ],
      prioritasEgyeb: 'Víz és éghajlatváltozás, orvosbiológiai technológiák (a PACTE ESRI 2030 nemzeti kutatóintézetei); zöld hidrogén (Power-to-X)',
      kiemeltIparagak: [
        'Energetika és fenntarthatóság', 'Hidrogén és akkumulátor', 'Agrár- és élelmiszertechnológia',
        'Mesterséges intelligencia és adatgazdaság', 'Mobilitás és autóipar',
      ],
      iparagEgyeb: 'Foszfátkémia és műtrágya, víztechnológia, repülőgépipar',
      erossegek:
        'Erős exportorientált ipar: autóipar (1 millió jármű beépített kapacitás), repülőgépipar, foszfátvegyipar; nemzetközi léptékű '
        + 'megújulóenergia-kutatási platformok (IRESEN, Green Energy Park); az ipari kapcsolatokban élen járó UM6P; a GII szerint kiemelkedő '
        + 'az oktatási ráfordítás (16.).',
      kihivasok:
        'Régóta nem mért, alacsony K+F-ráfordítás; gyenge kutatóhely–vállalat együttműködés (a közös publikációk arányában 112. a GII-ben), csekély '
        + 'szellemitulajdon-bevétel (111.). Az ESCWA szerint a K+F mintegy 65%-a a felsőoktatásban valósul meg; a GII szerint nincs marokkói unikornis.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási, Tudományos Kutatási és Innovációs Minisztérium (MESRSI) – kutatáspolitika, PACTE ESRI 2030.\n'
        + 'CNRST – kutatásfinanszírozás és közös infrastruktúrák (MARWAN, IMIST, Országos Geofizikai Intézet).\n'
        + 'Digitális átállásért felelős tárca (a kormányfő mellett) – Maroc Digital 2030, „Maroc IA 2030”.\n'
        + 'Ipari és Kereskedelmi Minisztérium – Innovációtámogatási Alap, OMPIC (iparjogvédelem).\n'
        + 'Académie Hassan II des Sciences et Techniques – tudományos akadémia.',
      egyetemek:
        'UM6P (Benguerir; a GII szerint az ipari és nemzetközi kapcsolatokban a legerősebb), Université Mohammed V (Rabat), Université Cadi Ayyad '
        + '(Marrákes), Université Hassan II (Casablanca), Université Ibn Tofail (Kenitra), Al Akhawayn University (Ifrane), EMI, INPT.',
      kutatokozpontok:
        'IRESEN (napenergia és új energiák, 2011; 32 szabadalom), MAScIR (biotechnológia, mikroelektronika, nanoanyagok), INRA Maroc (agrárkutatás), '
        + 'CNESTEN (nukleáris tudomány), Institut Pasteur du Maroc, INRH (halászati kutatás).',
      infrastrukturak:
        'Green Energy Park (Benguerir) – napenergia-teszt- és kutatóplatform; Green H2A zöldhidrogén-platform; Toubkal szuperszámítógép (UM6P, 2020; '
        + '3,16 PFlop/s); MARWAN kutatási és oktatási hálózat (1998); országos szeizmológiai megfigyelőhálózat (CNRST).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszertechnológia', 'IKT és digitalizáció', 'Hidrogén és akkumulátor',
      ],
      agazatEgyeb: 'Repülőgépipar, foszfátalapú vegyipar, bányászat',
      topVallalatok: [
        'OCP Group', 'Maroc Telecom', 'Attijariwafa bank', 'Managem', 'HPS (Hightech Payment Systems)', 'Royal Air Maroc', 'Renault Group Maroc',
        'Stellantis (Kenitra)', 'STMicroelectronics',
      ].join('\n'),
      startupok:
        'Az Innov Invest Fund (Tamwilcom, 2017-től) több mint 500 startupot finanszírozott, több mint 590 millió dirham értékben; 2025 decemberében '
        + 'indult a Startup Venture Building program (700 millió dirham felett, 800 startup). Az első 100 millió dolláros startup-értékelést '
        + '2022-ben a Chari érte el.',
      klaszterek:
        'Technopark-hálózat (Casablanca, Rabat, Tanger, Agadir, Essaouira); autóipari platformok Tangerben (a Renault szerint Afrika legnagyobb '
        + 'autógyára) és Kenitrában; a repülőgépipar (mintegy 150 cég) főként Casablancában koncentrálódik; Benguerir „zöld város”.',
      technologiatranszfer:
        'Egyetemi innovációs városok és technológiatranszfer-központok; a CNRST egyetemi inkubátorhálózata (RMIE, 2002); az Innovációtámogatási '
        + 'Alap (FSI) szabadalomhasznosításra (80%, legfeljebb 1 M MAD) és K+F-projektekre (60%, legfeljebb 4 M MAD); UM6P Ventures.',
    },
    programok: {
      palyazatok:
        'CNRST-programok: prioritási kutatási projektek (PPR, 2014-től), Al-Khawarizmi MI-program (2019; 50 millió dirham, 45 projekt), foszfát- és '
        + 'társadalomtudományi felhívások; IRESEN-felhívások (megújuló energia, zöld hidrogén); az FSI 2026–2028-as felhívása.',
      tamogatasiProgramok:
        'PACTE ESRI 2030 (nemzeti tematikus kutatóintézetek, innovációs városok minden régióban); Maroc Digital 2030 és a „Maroc IA 2030” '
        + '(2030-ra 100 milliárd dirham hozzáadott érték, 50 ezer munkahely, 200 ezer szakember); JAZARI MI-intézetek (2026-tól).',
      finanszirozasiEszkozok:
        'Innov Invest Fund és négy magvető- és kockázatitőke-alap (Tamwilcom); Startup Venture Building (Tamwilcom); Innovációtámogatási Alap (FSI); UM6P Ventures.',
      nemzetkoziReszvetel:
        'Horizont Európa: társulási tárgyalások 2021 óta, átmeneti szabályokkal, automatikusan finanszírozható ország; PRIMA-résztvevő 2018 óta '
        + '(2025–2027: 6,6 M EUR; a 269 projektből 137-ben marokkói partner); PHC Toubkal és PHC Maghreb Franciaországgal.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'GITEX Africa', tipus: 'szakkiallitas', idopont: 'április, Marrákes', megjegyzes: 'Digitális technológiák és startupok; 2027: április 26–28.' },
      { nev: 'SIAM – Salon International de l’Agriculture au Maroc', tipus: 'szakkiallitas', idopont: 'április, Meknesz', megjegyzes: 'Mezőgazdasági kiállítás; 2027: április 19–27.' },
      { nev: 'Solaire Expo Maroc', tipus: 'szakkiallitas', idopont: 'február–március, Casablanca', megjegyzes: 'Napenergia és energiahatékonyság; 2027: március 16–18.' },
      { nev: 'Salon de la Compétitivité Industrielle Automobile au Maroc', tipus: 'szakkiallitas', idopont: 'változó időpont és helyszín', megjegyzes: 'Autóipari beszállítói kiállítás (AMICA); 2026: 8. kiadás, június 24–26., Kenitra' },
      { nev: 'International Mining Congress (IMC Morocco)', tipus: 'konferencia', idopont: 'ősz, változó helyszín', megjegyzes: 'Bányászati kongresszus; 2026: 3. kiadás, október 6–7., Rabat (2024–2025: Marrákes)' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Marokkó társulási (2000) és tudományos-technológiai megállapodás (2003); Horizont Európa-társulási tárgyalások 2021 óta; '
        + 'az Unió a Mediterrán Térségért kutatási ütemtervei (egészség, éghajlat, megújuló energia). 2017 óta ismét az Afrikai Unió tagja.',
      partnerorszagok:
        'Franciaország (a CNRST első partnere a CNRS, 1984; PHC Toubkal, PHC Maghreb), Németország (Power-to-X Hub; DFG), Spanyolország '
        + '(INNO-ESPAMAROC ENERGY, IRESEN–CDTI közös energetikai felhívás), Olaszország (CNR), Portugália (FCT), Törökország (TÜBİTAK), Egyesült Királyság (British Council).',
      egyezmeny: 'CNRST–NKFIH (korábban NIH) tudományos és technológiai együttműködési megállapodás; kormányközi gazdasági együttműködési megállapodás (2009)',
      ketoldalu:
        'Közös CNRST–NKFIH mobilitási felhívások (2017–2018, 2019–2020); az NKFIH magyar–marokkói alkalmazott K+F-felhívása (2021-1.2.6-TÉT-IPARI-MA) '
        + '6 projektet támogatott 283,99 M Ft-tal (2023). A 2009-es gazdasági megállapodás vegyes bizottsága a tudományt is lefedi; 2024 óta '
        + 'levéltári együttműködés működik.',
      mobilitas:
        'Stipendium Hungaricum: a 2024-es felhívásban 165 hely marokkói hallgatóknak, minden képzési szinten (2023-ban mintegy 1300 jelentkező); '
        + 'a CNRST–NKFIH projektek kutatói mobilitása.',
    },
    magyarErtekeles: {
      osszegzes:
        'Marokkó az észak-afrikai térség egyik leggyorsabban fejlődő innovációs rendszere (GII 2025: 57.). A magyar–marokkói TéT-kapcsolatok '
        + 'intézményesültek (CNRST–NKFIH megállapodás, közös K+F-felhívás, Stipendium Hungaricum); egy esetleges Horizont Európa-társulás '
        + 'a közös konzorciumokat is megkönnyítené.',
      egyuttmukodesiLehetosegek:
        'Víztechnológia és öntözés; agrár-biotechnológia; megújuló energia és zöld hidrogén (IRESEN, Green Energy Park); MI és digitalizáció '
        + '(JAZARI-intézetek); egészségipar; közös PRIMA- és Horizont Európa-konzorciumok.',
      joGyakorlatok:
        'IRESEN – tematikus kutatóintézet saját tesztplatformokkal és ipari pályázatokkal; Innov Invest Fund – magvető- és kockázatitőke-alapokon '
        + 'keresztül működő állami startup-finanszírozás; egyetemi innovációs városok; Startup Venture Building.',
      diplomaciaiPrioritasok:
        'A CNRST–NKFIH közös felhívások újraindítása (a legutóbbi ismert: 2019–2020) és az alkalmazott K+F-program folytatása; tudományos '
        + 'napirend a gazdasági vegyes bizottságban.',
    },
  },
};

export default orszag;

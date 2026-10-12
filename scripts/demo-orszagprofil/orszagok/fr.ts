/**
 * Franciaország (FR) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09, a [2026-10-12] jelölésűeké 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF Data, WEO_2025_OCT_VINTAGE adatfolyam) –
 *   https://data.imf.org/Datasets/WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/FRA.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (GDP 3361,557 Mrd USD; GDP/fő 48 981,965 USD; reálnövekedés 0,671%; lakosság 68,628 millió – 2025, becslés).
 * - Terület: CIA World Factbook (2025. szeptember 26-i állapot; 643 801 km² a tengerentúli régiókkal, a
 *   kontinentális rész 551 500 km²) – https://www.cia.gov/the-world-factbook/countries/france/ (a Factbook
 *   2026-ban megszűnt; archív: web.archive.org, 2025-10-25-i page-data.json).
 * - GII 2025 (13. hely, Európában 8.; input 18., output 12.; párizsi klaszter 12.; erősségek, gyengeségek;
 *   unikornisok): https://www.wipo.int/edocs/gii-ranking/2025/fr.pdf
 * - GERD: OECD MSTI, 2024 (előzetes): 2,18%; BERD 1,44% – https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/FRA.A.G+B.PT_B1GQ..?startPeriod=2014
 *   (UNESCO UIS / Világbank GB.XPD.RSDV.GD.ZS, 2023: 2,18% – https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=FR).
 * - Stratégia: LPR (2020-1674. sz. törvény, 2021–2030, 3%-os cél) – https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042738027 ;
 *   France 2030 (54 Mrd EUR, 2021; az ANR kb. 12 Mrd EUR-t kezel; PEPR 3 Mrd EUR) – https://anr.fr/fr/france-2030/france-2030/ ,
 *   https://anr.fr/fr/france-2030/programmes-et-equipements-prioritaires-de-recherche-pepr/ ; a tíz célkitűzés –
 *   https://www.elysee.fr/emmanuel-macron/france2030 [2026-10-12] ; az SGPI szerepe (irányítás a miniszterelnök megbízásából) –
 *   https://www.banquedesterritoires.fr/france-2030 [2026-10-12]
 * - Intézmények: ARWU 2025 – https://www.shanghairanking.com/rankings/arwu/2025 ; CNRS – https://www.cnrs.fr/fr/le-cnrs ;
 *   Hcéres – https://www.hceres.fr/fr/qui-sommes-nous ; ITER – https://www.iter.org/proj/inafewlines ;
 *   Alice Recoque – https://eurohpc-ju.europa.eu/supercomputers/our-supercomputers_en ; a minisztérium neve (MESRE):
 *   https://www.campusfrance.org/fr/balaton , https://www.fetedelascience.fr/
 * - Vállalati: Mistral AI – https://mistral.ai/news/mistral-ai-raises-1-7-b-to-accelerate-technological-progress-with-ai ;
 *   Station F (a világ legnagyobb startup-campusa; alapítója Xavier Niel) – https://stationf.co/ , https://stationf.co/about ;
 *   French Tech Next40/120 – https://lafrenchtech.gouv.fr/fr/programmes-et-initiatives/french-tech-next40-120/
 * - Finanszírozás: CIR – https://entreprendre.service-public.gouv.fr/vosdroits/F23533 ; JEI –
 *   https://entreprendre.service-public.gouv.fr/vosdroits/F31188
 * - Rendezvények: https://vivatechnology.com/ , https://www.siae.fr/en/ ,
 *   https://www.eurosatory.com/en/practical-infos/dates-venue-and-opening-hours/ (helyszín) , https://www.eurosatory.com/en/
 *   (következő kiadás: 2028. június 19–23.) [2026-10-12] , https://www.jec-world.events/ ,
 *   https://www.global-industrie.com/presentation (2027: Lyon) , https://mygi.global-industrie.com/event/gi-2026-salon-exhibition
 *   (2026: Villepinte) , https://www.fetedelascience.fr/
 * - PHC Toubkal / Utique / Tassili+ / Maghreb: https://www.campusfrance.org/fr/toubkal , https://www.campusfrance.org/fr/utique ,
 *   https://www.campusfrance.org/fr/tassili , https://www.campusfrance.org/fr/maghreb ; a térség PHC-programjainak határidői
 *   (Tassili: 2024. 09. 30.) – https://www.campusfrance.org/fr/phc-afrique-nord-mo [2026-10-12]
 * - Magyar vonatkozás:
 *   egyezmény (1966, 122/2008. Korm. rendelet; francia–magyar albizottság) – https://njt.jog.gov.hu/jogszabaly/2008-122-20-22 ;
 *   Balaton program (PHC Balaton; Campus France, NKFIH – STEM, Tempus Közalapítvány – SHS; 2027-es felhívás határideje
 *   2026. 08. 27.; összegek) – https://www.campusfrance.org/fr/balaton ;
 *   NKFIH 2026-1.2.2-TÉT (francia és kínai reláció, a francia relációra tervezett keret 30 M Ft, francia projektek 2027-től; a kódszám a felhívás
 *   oldalának címében és dokumentumaiban így szerepel, az URL-ben „2026-112-tet”) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/ketoldalu-tudomanyos-technologiai-egyuttmukodes-tamogatasa-2026-112-tet/palyazati-felhivas ;
 *   Egis–Servier (1995 óta többségi, 2013 óta 100%-os tulajdon) – https://hu.egis.health/tortenetunk [2026-10-12] ;
 *   Sanofi–Chinoin – https://www.sanofi.hu/ ; Valeo magyarországi K+F-központja – https://www.valeo.com/en/hungary/
 * Kimaradt blokkok és mezők: nincs. Nem ellenőrizhető, ezért kimaradt: a 2024-es programügynökségi reform, a startupok és
 * unikornisok száma, a France 2030 2026-os értékelése. Franciaország nem Stipendium Hungaricum-partner
 * (https://stipendiumhungaricum.hu/partners/).
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'FR',
  profil: {
    alapadatok: {
      fovaros: 'Párizs',
      terulet: '643 801',
      penznem: 'euró (EUR)',
      lakossag: '68 628 000',
      gdp: '3 361,6',
      gdpEgyFore: '48 982',
      gdpNovekedes: '0,7',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: CIA World Factbook (archív, a tengerentúli régiókkal)',
      tagsagok: ['EU', 'OECD', 'NATO', 'G7', 'G20'],
      tagsagEgyeb: 'ENSZ BT állandó tag, euróövezet, schengeni térség, ESA, CERN, Frankofónia Nemzetközi Szervezete',
      agazatok: [
        'Mobilitás és autóipar', 'Biotechnológia és gyógyszeripar', 'Vegyipar', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar',
        'Védelmi ipar', 'Turizmus', 'Pénzügyi szolgáltatások',
      ],
      agazatEgyeb: 'Repülőgép- és űripar, luxus- és kozmetikai ipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 13. hely (2024-ben a 12.), Európában a 8.; a kibocsátási oldalon (12.) erősebb, mint a ráfordításin (18.), '
        + 'a párizsi tudományos-technológiai klaszter a világ 12. legnagyobbja. A K+F-ráfordítás 2024-ben a GDP 2,18%-a (OECD MSTI, előzetes adat): egy évtizede 2,2% körül '
        + 'stagnál; a K+F kétharmadát vállalatok végzik.',
      gerd: '2,18',
      strategia: 'Kutatási programozási törvény (LPR, 2021–2030); France 2030 beruházási terv (54 Mrd EUR, 2021-től)',
      prioritasok: [
        'Zöld átállás és klímasemlegesség', 'Energiabiztonság', 'Digitalizáció és MI', 'Egészség és élettudomány', 'Űr',
        'Technológiai szuverenitás', 'Ipar 4.0 és gyártás', 'Alapkutatási kiválóság',
      ],
      prioritasEgyeb: 'France 2030-célok: kis moduláris atomreaktorok (SMR), zöld hidrogén, alacsony kibocsátású repülőgép, biogyógyszerek, mélytengeri kutatás',
      kiemeltIparagak: [
        'Űripar', 'Mesterséges intelligencia és adatgazdaság', 'Energetika és fenntarthatóság',
        'Biotechnológia és gyógyszeripar', 'Kvantumtechnológia', 'Mobilitás és autóipar',
      ],
      iparagEgyeb: 'Repülőgépipar, nukleáris technológia (SMR), mélytengeri kutatás',
      erossegek:
        'Nemzetközileg elismert alapkutatás nagy nemzeti kutatószervezetekkel (CNRS, CEA, Inserm, Inria); a GII szerint kiemelkedő a publikációk hatása '
        + '(H-index: 5.) és a késői fázisú kockázatitőke-ügyletek aránya (5.). Világvezető repülőgép-, űr-, gyógyszer- és energetikai vállalatok; '
        + 'bőkezű kutatási adójóváírás (CIR) és a France 2030.',
      kihivasok:
        'A 2020-as programozási törvényben rögzített 3%-os K+F-cél távoli. A GII 2025 gyengeségei között szerepel '
        + 'a munkatermelékenység növekedése (110. hely) és a működőtőke-beáramlás (69.).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási, Kutatási és Űrügyi Minisztérium (MESRE) – kutatás-, felsőoktatás- és űrpolitika.\n'
        + 'Beruházási Főtitkárság (SGPI, a miniszterelnök alatt) – a France 2030 irányítása.\n'
        + 'Nemzeti Kutatási Ügynökség (ANR) – projektfinanszírozás, a France 2030 kutatási részének fő operátora.\n'
        + 'Bpifrance – állami befektetési bank: vállalati innováció és kockázati tőke.\n'
        + 'Hcéres – független értékelő hatóság (egyetemek, kutatóhelyek, képzések).',
      egyetemek:
        'Université Paris-Saclay (ARWU 2025: 13., a kontinentális Európa legjobbja), Université PSL, Sorbonne Université, Institut Polytechnique de Paris, '
        + 'Université Paris Cité, Université Grenoble Alpes, Aix-Marseille Université, Université de Strasbourg.',
      kutatokozpontok:
        'CNRS (minden tudományterületen; 29 400 tudományos munkatárs, mintegy 1100 laboratórium), CEA (atomenergia, alternatív energiák, mikroelektronika), '
        + 'Inserm (egészségtudomány), INRAE (agrár, élelmiszer, környezet), Inria (digitális tudományok), CNES (űr), ONERA (repülés- és űrkutatás), '
        + 'Institut Pasteur, Ifremer (tengerkutatás).',
      infrastrukturak:
        'ITER – épülő nemzetközi fúziós kísérleti reaktor (Saint-Paul-lez-Durance); ESRF és ILL (Grenoble); '
        + 'SOLEIL szinkrotron (Saclay); GANIL/SPIRAL2 (Caen); Jean Zay szuperszámítógép és a tervezett Alice Recoque exascale gép (EuroHPC); Guyanai Űrközpont (Kourou).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Űripar', 'Biotechnológia és gyógyszeripar', 'Mobilitás és autóipar', 'Energetika és fenntarthatóság',
        'Mesterséges intelligencia és adatgazdaság', 'Védelmi ipar',
      ],
      agazatEgyeb: 'Repülőgépipar, luxus- és kozmetikai ipar',
      topVallalatok: [
        'Airbus', 'Sanofi', 'Safran', 'Thales', 'Renault Group', 'Dassault Systèmes', 'Schneider Electric', "L'Oréal",
        'TotalEnergies', 'Air Liquide',
      ].join('\n'),
      startupok:
        'A GII 2025 szerint a legértékesebb unikornisok a Doctolib, a Mistral AI és a Back Market; a Mistral AI 2025 szeptemberében 1,7 Mrd EUR-t vont be '
        + '11,7 Mrd EUR-s értékeléssel (az ASML vezetésével). A French Tech Next40/120 (2019 óta) a scale-upokat támogatja; a párizsi Station F '
        + 'a világ legnagyobb startup-campusa.',
      klaszterek:
        'Párizs és Paris-Saclay, Lyon (vegyipar), Grenoble (mikroelektronika: CEA-Leti, STMicroelectronics, Soitec), Toulouse (repülőgép- és űripar), '
        + 'Sophia Antipolis; a versenyképességi pólusok (pl. Aerospace Valley, Minalogic, Systematic Paris-Region) cégeket és kutatóhelyeket kapcsolnak össze.',
      technologiatranszfer:
        'SATT-ok (egyetemi technológiatranszfer-gyorsítók), Carnot-címkés intézetek (vállalati megbízásos kutatás), technológiai kutatóintézetek '
        + '(IRT, pl. Saint Exupéry, SystemX) és energetikai átállási intézetek (ITE); a CEA-Leti ipari partnerségi modellje.',
    },
    programok: {
      palyazatok:
        'ANR általános (AAPG) és tematikus felhívások; France 2030: prioritási kutatási programok és infrastruktúrák (PEPR, 3 Mrd EUR); '
        + 'a Bpifrance innovációs versenyei (i-Nov, i-Lab, i-PhD); ERC- és MSCA-pályázatok.',
      tamogatasiProgramok:
        'France 2030 (közel 12 Mrd EUR-t az ANR kezel), amely a korábbi beruházási programok (PIA 1–4) kiválósági '
        + 'kezdeményezéseit (IdEx, LabEx) is továbbviszi; nemzeti gyorsítási stratégiák (pl. MI, kvantum, hidrogén).',
      finanszirozasiEszkozok:
        'Kutatási adójóváírás (CIR): a K+F-kiadások 30%-a 100 M EUR-ig, felette 5%; fiatal innovatív vállalkozás (JEI) státusz munkáltatói '
        + 'járulékkedvezménnyel; a Bpifrance hitelei, garanciái és kockázatitőke-alapjai.',
      nemzetkoziReszvetel:
        'EU-tagként a Horizont Európa és az Euratom-program résztvevője; az ESA alapító tagja (az ügynökség központja Párizsban működik); '
        + 'Hubert Curien-partnerségek (PHC) számos országgal, köztük Magyarországgal (Balaton).',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'VivaTech', tipus: 'szakkiallitas', idopont: 'június, Párizs (Paris Expo Porte de Versailles)', megjegyzes: 'Technológiai és startup-esemény; 2027: június 16–19.' },
      { nev: 'Párizsi Légiszalon (SIAE)', tipus: 'szakkiallitas', idopont: 'páratlan években június, Le Bourget', megjegyzes: 'Repülő- és űripar; következő: 2027. június 14–20.' },
      { nev: 'Eurosatory', tipus: 'szakkiallitas', idopont: 'páros években június, Paris Nord Villepinte', megjegyzes: 'Védelmi és biztonsági technológiák; következő: 2028. június 19–23.' },
      { nev: 'JEC World', tipus: 'szakkiallitas', idopont: 'március, Paris Nord Villepinte', megjegyzes: 'Kompozit anyagok; 2027: március 2–4.' },
      { nev: 'Global Industrie', tipus: 'szakkiallitas', idopont: 'március, felváltva Párizs (Villepinte) és Lyon (Eurexpo)', megjegyzes: 'Ipari technológiák, Ipar 4.0; 2027: március 15–18., Lyon' },
      { nev: 'Fête de la science', tipus: 'forum', idopont: 'október, országszerte', megjegyzes: 'A kutatási tárca országos tudományünnepe; 2026: október 2–12.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Az EU (EGK) alapító tagja; az ESA, a CERN, az ESO és az EMBL tagja, az ITER gazdaországa, a grenoble-i ESRF és ILL társtulajdonosa; '
        + 'Párizsban működik az OECD és az UNESCO központja.',
      partnerorszagok:
        'Németország (aacheni szerződés, 2019), USA, Egyesült Királyság, Japán, India (indiai–francia kutatástámogató központ, CEFIPRA), Kanada; '
        + 'a Maghreb-országokkal Hubert Curien-partnerségek: Toubkal (Marokkó), Utique (Tunézia), regionálisan PHC Maghreb (a 2027-es felhívásban '
        + 'Marokkó és Tunézia); az algériai Tassili+ legutóbbi közzétett felhívása 2024-ben zárult.',
      egyezmeny: 'Magyar–francia műszaki és tudományos együttműködési egyezmény (Budapest, 1966; kihirdetve: 122/2008. Korm. rendelet)',
      ketoldalu:
        'Az 1966-os egyezmény francia–magyar albizottságot hozott létre a végrehajtásra. A Balaton program (PHC Balaton) a közös projektek kutatói '
        + 'mobilitását támogatja (Campus France; NKFIH, Tempus); az NKFIH 2026-1.2.2-TÉT felhívásában a francia relációra tervezett keret 30 M Ft. Francia '
        + 'vállalatok Magyarországon: Egis (Servier), Sanofi (Chinoin), Valeo (K+F-központtal).',
      mobilitas:
        'Erasmus+; a Balaton program kutatói mobilitása (tájékoztató összegek: francia oldalon kb. 3100 EUR/év, NKFIH 4 M Ft két évre, '
        + 'Tempus 1 M Ft/év); Marie Skłodowska-Curie-ösztöndíjak.',
    },
    magyarErtekeles: {
      osszegzes:
        'Franciaország Európa egyik vezető kutatási nagyhatalma (GII 2025: 13.), erős alapkutatással és világszínvonalú infrastruktúrákkal. '
        + 'A magyar–francia TéT-kapcsolatok intézményesek, de szerény léptékűek; bővítésük fő terepe a Horizont Európa, a lézerfizika, az MI és a kvantum.',
      egyuttmukodesiLehetosegek:
        'Lézer- és attoszekundumos fizika (ELI ALPS és francia lézer-, szinkrotronlaborok); MI és kvantum (közös európai projektek PEPR-partnerekkel); '
        + 'egészségipar és biotechnológia; fúziós (ITER, EUROfusion) és űrkutatás (ESA, CNES).',
      joGyakorlatok:
        'CIR – egyszerű, kiszámítható K+F-adójóváírás; PEPR – nemzeti prioritásokhoz kötött, többéves kutatási programok; SATT-hálózat – régiós '
        + 'technológiatranszfer; French Tech Next40/120 – állami koordinációjú scale-up-program.',
      diplomaciaiPrioritasok:
        'A Balaton program és az NKFIH francia relációjának bővítése; magyar részvétel francia vezetésű Horizont Európa- és EuroHPC-együttműködésekben; '
        + 'az 1966-os egyezmény szerinti albizottság szerepének áttekintése; francia cégek hazai K+F-jének ösztönzése.',
    },
  },
};

export default orszag;

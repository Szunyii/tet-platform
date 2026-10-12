/**
 * India (IN) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (WEO 9.0.0, közzétéve 2025-10-14; a 2025-ös oszlop India
 *   2025/26-os pénzügyi éve) – https://data.imf.org/en/datasets/IMF.RES:WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/3.0/data/dataflow/IMF.RES/WEO/9.0.0/IND.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?asOf=2025-11-01T00:00:00Z
 *   (GDP 4125,213 Mrd USD; 2818,027 USD/fő; 6,646%; 1463,866 millió fő)
 * - Terület: Világbank AG.SRF.TOTL.K2, a legutóbbi közölt (2024-es) érték: 3 287 263 km² (a 2022-ig közölt évekre 3 287 260) –
 *   https://data.worldbank.org/indicator/AG.SRF.TOTL.K2?locations=IN ;
 *   https://api.worldbank.org/v2/country/IND/indicator/AG.SRF.TOTL.K2?format=json&mrnev=1
 * - GII 2025 (38. hely, pillérek, mutatók, klaszterek) – https://www.wipo.int/edocs/gii-ranking/2025/in.pdf
 * - GERD: UNESCO UIS EXPGDP.TOT, 2020: 0,646% – https://data.uis.unesco.org ; Világbank GB.XPD.RSDV.GD.ZS –
 *   https://data.worldbank.org/indicator/GB.XPD.RSDV.GD.ZS?locations=IN ; a DST R&D Statistics at a Glance 2025–26 nemzeti
 *   adata (2023–24: 0,84%) – https://www.policyedge.in/p/private-industry-lifts-indias-rd-spending-as-research-intensity-reaches-084 ,
 *   https://www.tribuneindia.com/news/business/private-sector-leads-indias-rd-spending-for-first-time-as-total-investment-reaches-rs-2-45-lakh-crore-in-fy24/
 * - Stratégia: STI Policy 2013, STIP 2020 tervezet – https://dst.gov.in/sites/default/files/STIP_2020_Background_Note.pdf
 * - ANRF (a miniszterelnök elnököl a kormányzótanácsban, a SERB-et váltja) –
 *   https://prsindia.org/billtrack/the-anusandhan-national-research-foundation-bill-2023 ; programjai (Core Research Grant,
 *   MAHA, PAIR, PM ECRG) – https://anrfonline.in/ANRF/HomePage ; RDI Scheme (2025. július 1.) –
 *   https://www.pmindia.gov.in/en/news_updates/cabinet-approves-research-development-and-innovation-rdi-scheme-to-scale-up-research-development-and-innovation-in-strategic-and-sunrise-domains
 * - IndiaAI Mission (10 371,92 crore) és National Quantum Mission (6003,65 crore) –
 *   https://rsdebate.nic.in/bitstream/123456789/759511/1/PQ_267_21032025_U2459_p178_p179.pdf ,
 *   https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/mar/doc2025318521601.pdf
 * - Félvezetőgyárak (2024. február 29.) –
 *   https://narendramodi.in/giant-leap-for-india-semiconductor-mission-cabinet-approves-three-more-semiconductor-units
 * - Startupok (223 ezer DPIIT-elismert, 2026. március 31.) – https://inc42.com/?p=555314
 * - NIRF 2025 – https://news.careers360.com/nirf-ranking-2025-overall-iit-madras-top-iisc-bangalore-second-iit-bombay-delhi-kanpur-roorkee-aiims-jnu-bhu-university-nba/amp
 * - National Green Hydrogen Mission (19 744 crore) – https://mnre.gov.in/en/national-green-hydrogen-mission/
 * - CERN-társult tagság (2017. január 16.) – https://home.cern/news/news/cern/india-becomes-associate-member-state-cern ;
 *   SKAO-tagság (2024. július) – https://www.skao.int/en/news/590/india-celebrates-skao-membership ; LIGO-India – https://www.ligo-india.in/ ;
 *   Chandrayaan-3 – https://www.isro.gov.in/Chandrayaan3_Details.html
 * - Kétoldalú központok és partnerségek: https://www.iusstf.org/ ; https://www.igstc.org/ ; https://www.cefipra.org/ ;
 *   UK–India Technology Security Initiative (2024. július 25.) –
 *   https://www.gov.uk/government/publications/uk-india-technology-security-initiative-factsheet
 * - ISA: titkárság és székhely Gurugram – https://isa.int/about_us ; a 7. közgyűlés (Új-Delhi, 2024) Indiát elnökké, Franciaországot
 *   társelnökké választotta 2024–2026-ra – https://www.pv-magazine.com/2024/11/05/international-solar-alliance-re-elects-india-as-president/ ;
 *   India és Franciaország közös indítása (Párizs, COP21, 2015. november 30.) – https://www.downtoearth.org.in/news/energy/solar-alliance-launched-51926
 * - EU: TéT-megállapodás (aláírva 2001. november 23.; a legutóbbi megújítás 2025. november 27-én lépett hatályba, 2025. május 17-től
 *   öt évre) – https://data.consilium.europa.eu/doc/document/ST-5116-2026-INIT/en/pdf ; Horizont Európa-társulási tárgyalások
 *   (2026. július 17-től, a cél a lezárás 2026 végéig és a társulás 2027-től), indiai társfinanszírozás –
 *   https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/europe-world/international-cooperation/bilateral-cooperation-science-and-technology-agreements-non-eu-countries/india_en ;
 *   3. TTC – https://digital-strategy.ec.europa.eu/en/news/eu-and-india-strengthen-strategic-partnership-third-trade-and-technology-council ;
 *   FTA – https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/india/eu-india-agreements_en ;
 *   automatikus HE-finanszírozás listája (India nincs rajta) – https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf
 * - Rendezvények: https://bengaluru.stpi.in/index.php/en/events/bengaluru-tech-summit-2025 ; https://www.digitalindia.gov.in/?p=11605 ;
 *   https://www.semiconindia.org/about/overview ; https://indiamedtoday.com/delhi-to-host-18th-edition-of-cphi-pmec-india-2025-from-nov-25-to-27-2025/ ;
 *   https://www.digitalindia.gov.in/events/global-fintech-fest/ (2026: szeptember 8–11.) ; https://nasscom.in/ntlf/ ;
 *   https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/dec/doc2025125718801.pdf
 * - Magyar vonatkozás:
 *   - 1992-es TéT-megállapodás, a közös stratégiai kutatási alap felállításáról szóló, 2008. január 18-án aláírt szándéknyilatkozat (így
 *     a nagykövetség magyar nyelvű oldala és az indiai külügyminisztérium; az angol nyelvű oldal egyetértési megállapodásnak nevezi),
 *     10. vegyesbizottsági ülés (Új-Delhi, 2018) –
 *     https://delhi.mfa.gov.hu/hu/articles/2018-marcius-21-ujdelhiben-uelesezett-a-magyar-indiai-tet-vegyesbizottsag ;
 *     https://delhi.mfa.gov.hu/eng/news/2018-marcius-21-ujdelhiben-uelesezett-a-magyar-indiai-tet-vegyesbizottsag
 *   - 11. vegyesbizottsági ülés (online, 2020. július 29.), INSA–MTA, 2016-os vízügyi MoU, Fővárosi Vízművek–WAPCOS (2019),
 *     NKE–Marwadi (2022), indiai befektetések (kb. 3,3 Mrd USD: Apollo Tyres, TCS, Sun Pharma), kb. 1200 indiai hallgató –
 *     https://www.mea.gov.in/Portal/ForeignRelation/India-Hungary-2025.pdf
 *   - 2019-2.1.13-TÉT_IN felhívás (300 millió Ft, DST) –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-indiai-alkalmazott-kf-egyuttmukodesi-palyazat-2019-2113-tet-in/palyazati-csomag/palyazati-felhivas
 *   - NKFIH TéT-beszámoló, Újdelhi, 2021–22 („TéT Vegyesbizottság”; a 2021–22-ben kötött Wigner–IIT Indore, Széchenyi Egyetem–IIT Indore,
 *     NKE–IIT Kanpur, NKE–Marwadi megállapodások; 200 SH-hely és 1924 pályázat a 2022/23-as körben; India a publikációk számában a
 *     világ 3.) – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-uj
 *   - Stipendium Hungaricum (küldő fél: UGC) – https://stipendiumhungaricum.hu/partners/
 *   - Apollo Tyres, Gyöngyöshalász (475 millió eurós beruházás, 2017) –
 *     https://tyrepress.com/2017/05/apollo-tyres-opens-e475-million-greenfield-hungarian-plant
 * Kimaradt blokkok és mezők: nincs kimaradt blokk. A gerd mező nemzetközi forrásból (UNESCO UIS, 2020) származik; a DST
 * újabb, bővített adatgyűjtésen alapuló nemzeti adata csak a teljesítmény-szövegben szerepel. Az unikornisok száma és a
 * kutatói létszám forrásonként eltér, ezért kimaradt. A vegyesbizottság 2020 utáni üléséről nem került elő forrás.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'IN',
  profil: {
    alapadatok: {
      fovaros: 'Új-Delhi',
      terulet: '3 287 263',
      penznem: 'indiai rúpia (INR)',
      lakossag: '1 463 866 000',
      gdp: '4 125,2',
      gdpEgyFore: '2 818',
      gdpNovekedes: '6,6',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október; a 2025-ös év a 2025/26-os pénzügyi év), Világbank',
      tagsagok: ['G20', 'BRICS', 'Nemzetközösség'],
      tagsagEgyeb: 'Sanghaji Együttműködési Szervezet (SCO), SAARC, BIMSTEC, Quad, Indiai-óceáni Peremországok Szövetsége (IORA)',
      agazatok: [
        'IKT és szoftver', 'Mezőgazdaság és élelmiszeripar', 'Gyógyszeripar', 'Autóipar', 'Vegyipar',
        'Pénzügyi szolgáltatások', 'Energetika',
      ],
      agazatEgyeb: 'Textil- és ruhaipar, acélipar',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 38. hely a 139 gazdaság közül (2020-ban még 48.); az alsó-közepes jövedelmű országok között '
        + 'és Közép- és Dél-Ázsiában is az első. A K+F-ráfordítás az UNESCO UIS szerint 2020-ban a GDP 0,65%-a volt; a DST bővített '
        + 'adatgyűjtésen alapuló statisztikája szerint 2023–24-ben 0,84%, és a vállalati szektor súlya gyorsan nő. '
        + 'A nemzetközi szabadalmi bejelentések száma a GII szerint 2024-ben 22%-kal nőtt.',
      gerd: '0,65',
      strategia: 'Tudomány-, technológia- és innovációpolitika (Science, Technology and Innovation Policy, 2013); az 5. STI-politika (STIP) 2020-as tervezete',
      prioritasok: [
        'Digitalizáció és MI', 'Technológiai szuverenitás', 'Űr', 'Zöld átállás és klímasemlegesség', 'Energiabiztonság',
        'Egészség és élettudomány', 'Ipar 4.0 és gyártás', 'Startup és vállalkozói ökoszisztéma', 'Védelem és biztonság',
      ],
      prioritasEgyeb: 'Önellátás (Atmanirbhar Bharat) és a „Viksit Bharat 2047” fejlesztési cél; mélytengeri kutatás (Deep Ocean Mission)',
      kiemeltIparagak: [
        'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Űripar', 'Mesterséges intelligencia és adatgazdaság',
        'Félvezetők és mikroelektronika', 'Hidrogén és akkumulátor', 'Kvantumtechnológia',
      ],
      iparagEgyeb: 'Digitális közinfrastruktúra (Aadhaar, UPI), atomenergia',
      erossegek:
        'Hatalmas belső piac (a GII-ben 3.) és nagy mérnök- és IT-szakember-állomány; az IKT-szolgáltatások exportrészarányában a GII-ben első. '
        + 'Költséghatékony űrprogram: a Chandrayaan-3 2023-ban elsőként szállt le a Hold déli pólusának közelében. '
        + 'A világ egyik legnagyobb generikusgyógyszer- és vakcinagyártója; a tudományos publikációk számában a világ harmadik; '
        + 'a digitális közinfrastruktúra (Aadhaar, UPI) nemzetközi mintává vált.',
      kihivasok:
        'A K+F-ráfordítás GDP-arányosan 1% alatt marad, és a lakosságarányos kutatói létszám alacsony (a GII-ben 80.). '
        + 'A felsőoktatás minősége egyenetlen, kevés a külföldi hallgató (a GII-ben 113.), a magasan képzett nők foglalkoztatása alacsony (101.). '
        + 'Az elektronikai és félvezető-alapanyagokban erős az importfüggőség; a GII-ben az üzleti kifinomultság a leggyengébb pillér (64.).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudományos főtanácsadó (PSA) és miniszterelnöki tanácsadó testület (PM-STIAC).\n'
        + 'Tudományos és Technológiai Minisztérium: DST (tudomány és technológia), DBT (biotechnológia), DSIR (ide tartozik a CSIR).\n'
        + 'ANRF – a miniszterelnök elnökletével működő kutatásfinanszírozó csúcsszerv, a SERB utódja.\n'
        + 'Szaktárcák: MeitY (IndiaAI, félvezetők), Department of Space (ISRO), DAE (atomenergia), MoES (földtudományok).\n'
        + 'Ágazati kutatási szervezetek: ICMR (orvostudomány), ICAR (mezőgazdaság), DRDO (védelem); NITI Aayog (tervezési agytröszt) – Atal Innovation Mission.',
      egyetemek:
        'Indian Institute of Science (IISc, Bengaluru); az Indian Institutes of Technology (IIT) hálózata – a 2025-ös nemzeti '
        + 'rangsor (NIRF) élén az IIT Madras, mögötte az IISc, az IIT Bombay, az IIT Delhi és az IIT Kanpur; Indian Institutes of Science '
        + 'Education and Research (IISER); Jawaharlal Nehru University, Banaras Hindu University, University of Delhi, AIIMS New Delhi '
        + '(orvostudomány), IIIT Hyderabad, Manipal Academy of Higher Education.',
      kutatokozpontok:
        'A CSIR országos laboratóriumhálózata (pl. National Chemical Laboratory, Pune; Centre for Cellular and Molecular Biology, Haidarábád; '
        + 'National Physical Laboratory, Új-Delhi); az ISRO központjai (VSSC, URSC, SAC); Bhabha Atomic Research Centre (BARC); '
        + 'Tata Institute of Fundamental Research (TIFR) a bengalurui NCBS-szel és a punei NCRA-val; Raman Research Institute; '
        + 'Inter-University Centre for Astronomy and Astrophysics (IUCAA); az ICMR, az ICAR és a DRDO intézetei.',
      infrastrukturak:
        'Satish Dhawan Űrközpont (Sriharikota) – az ISRO indítóbázisa; GMRT rádióteleszkóp (Narayangaon, NCRA-TIFR); Indus-2 szinkrotron '
        + '(RRCAT, Indore); a nemzeti szuperszámítógép-misszió (National Supercomputing Mission) PARAM-rendszerei; a LIGO-India gravitációshullám-obszervatórium projektje. '
        + 'Nemzetközi részvétel: CERN-társult tagság (2017), ITER, FAIR, SKA Observatory (teljes jogú tag 2024 óta).',
    },
    vallalati: {
      kiemeltAgazatok: [
        'IKT és digitalizáció', 'Biotechnológia és gyógyszeripar', 'Mobilitás és autóipar', 'Félvezetők és mikroelektronika',
        'Űripar', 'Energetika és fenntarthatóság',
      ],
      agazatEgyeb: 'Globális képességközpontok (GCC), fintech és digitális fizetés',
      topVallalatok: [
        'Reliance Industries', 'Tata Consultancy Services (TCS)', 'Infosys', 'HCLTech', 'Wipro',
        'Tata Motors Passenger Vehicles (JLR)', 'Mahindra & Mahindra', 'Sun Pharmaceutical Industries', "Dr. Reddy's Laboratories", 'Bharti Airtel',
      ].join('\n'),
      startupok:
        'A DPIIT által elismert startupok száma 2026. március végére meghaladta a 223 ezret (csak a 2025–26-os pénzügyi évben több mint 55 ezer új); '
        + 'az ökoszisztémát a kormány a világ harmadik legnagyobbjaként tartja számon. A GII 2025-ben India a késői fázisú kockázatitőke-ügyletek '
        + 'részarányában 4., a startupok és scale-upok finanszírozásában 9.; a Startup India program (2016) adó- és szabályozási könnyítéseket és alapok alapját kínál.',
      klaszterek:
        'A GII 2025 legjobb innovációs klaszterei között Bengaluru (21.), Delhi (26.), Mumbai (46.) és Chennai (84.); Haidarábád (Genome Valley '
        + 'biotechnológiai klaszter, T-Hub inkubátor); Gudzsarát (Dholera: a Tata Electronics és a tajvani PSMC félvezetőgyára; Sanand: a Micron '
        + 'és a CG Power tokozóüzemei). Inkubátorok: az Atal Innovation Mission inkubációs központjai, az IIT-k kutatási parkjai (pl. IIT Madras Research Park).',
      technologiatranszfer:
        'BIRAC (a DBT biotechnológiai iparfejlesztési ügynöksége) – korai fázisú támogatás és inkubáció; Technology Development Board (TDB) – '
        + 'a kereskedelmi hasznosítás finanszírozása; National Research Development Corporation (NRDC) – szabadalom- és licenckezelés; '
        + 'a kiber-fizikai rendszerek nemzeti missziójának (NM-ICPS) technológiai innovációs központjai (TIH) vezető egyetemeken.',
    },
    programok: {
      palyazatok:
        'ANRF-felhívások: Core Research Grant, MAHA (Mission for Advancement in High-impact Areas), PAIR (vezető és feltörekvő egyetemek '
        + 'kutatási párosítása), Prime Minister Early Career Research Grant; DBT- és BIRAC-felhívások (pl. Biotechnology Ignition Grant); '
        + 'az ICMR és az ICAR kutatási támogatásai; DST INSPIRE ösztöndíjak.',
      tamogatasiProgramok:
        'Nemzeti missziók: IndiaAI Mission (2024, 103,7 milliárd rúpia), National Quantum Mission (2023/24–2030/31, 60 milliárd rúpia), '
        + 'India Semiconductor Mission (760 milliárd rúpiás ösztönzőkeret), National Green Hydrogen Mission (2023), Deep Ocean Mission; '
        + 'BioE3-politika (2024) a biogyártásért; Startup India Seed Fund; Atal Innovation Mission.',
      finanszirozasiEszkozok:
        'RDI Scheme (2025): 1 billió rúpiás alap, amely az ANRF-en belüli különleges célú alapon és második szintű alapkezelőkön át hosszú '
        + 'lejáratú, alacsony vagy nulla kamatú finanszírozást nyújt a magánszféra K+F-jének; Fund of Funds for Startups (SIDBI); '
        + 'termeléshez kötött ösztönzők (PLI); a BIRAC és a TDB támogatási és hitelkonstrukciói.',
      nemzetkoziReszvetel:
        'Horizont Európa: India harmadik országként vesz részt, az EU-tól automatikus finanszírozás nélkül (az indiai résztvevők saját vagy '
        + 'indiai kormányzati társfinanszírozással); a társulási tárgyalások 2026. július 17-én indultak; a cél a lezárás 2026 végéig és India társulása 2027-től. '
        + 'Kétoldalú központok: Indo-German Science & Technology Centre (IGSTC), Indo-French Centre (CEFIPRA), Indo-US Science and Technology Forum (IUSSTF).',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'Bengaluru Tech Summit', tipus: 'konferencia', idopont: 'november, Bengaluru (BIEC)', megjegyzes: 'Karnátaka állam technológiai csúcstalálkozója és kiállítása; 2025-ben 28. alkalommal' },
      { nev: 'India Mobile Congress', tipus: 'szakkiallitas', idopont: 'október, Új-Delhi (Yashobhoomi)', megjegyzes: 'Távközlés, 5G/6G, MI; a DoT és a COAI rendezvénye' },
      { nev: 'SEMICON India', tipus: 'szakkiallitas', idopont: 'szeptember, Új-Delhi (Yashobhoomi)', megjegyzes: 'Az India Semiconductor Mission és a SEMI rendezvénye; 2026: szeptember 17–19.' },
      { nev: 'CPHI & PMEC India', tipus: 'szakkiallitas', idopont: 'november, Greater Noida (India Expo Centre & Mart)', megjegyzes: 'Gyógyszeripari alapanyagok, gyártás- és csomagolástechnológia' },
      { nev: 'Global Fintech Fest', tipus: 'konferencia', idopont: 'augusztus–október, Mumbai (Jio World Centre)', megjegyzes: 'Fintech és digitális fizetés (NPCI, PCI, FCC); 2026: szeptember 8–11.' },
      { nev: 'Nasscom Technology & Leadership Forum (NTLF)', tipus: 'konferencia', idopont: 'február, Mumbai', megjegyzes: 'Az indiai IT-iparági szövetség éves vezetői fóruma; 2027: február 24–25.' },
      { nev: 'India International Science Festival (IISF)', tipus: 'forum', idopont: 'évente, változó időpontban és helyszínen', megjegyzes: 'Tudományos fesztivál; 2025: december 6–9., Panchkula' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–India TéT-megállapodás (2001; 2030-ig megújítva, a megújítás 2025. november 27-én lépett hatályba); EU–India Kereskedelmi és Technológiai Tanács '
        + '(3. ülés: Brüsszel, 2026. július); a szabadkereskedelmi tárgyalások 2026 januárjában lezárultak; Horizont Európa-társulási tárgyalások. '
        + 'Multilaterálisan: G20 (2023-as elnökség), BRICS, Quad, SCO; a Nemzetközi Napenergia Szövetség (ISA) Franciaországgal közös alapítója, '
        + 'közgyűlésének elnöke (társelnök: Franciaország) és székhelye (Gurugram).',
      partnerorszagok:
        'USA (IUSSTF; kritikus és feltörekvő technológiák), Németország (IGSTC), Franciaország (CEFIPRA), Japán, Egyesült Királyság '
        + '(Technology Security Initiative, 2024), Oroszország (atomenergia – Kudankulam), Izrael (mezőgazdasági kiválósági központok).',
      egyezmeny: 'Magyar–indiai tudományos és technológiai együttműködési megállapodás (1992); közös stratégiai kutatási alap (szándéknyilatkozat, 2008. január 18.)',
      ketoldalu:
        'Magyar–indiai TéT-vegyesbizottság (utolsó ismert ülés: 11., online, 2020); NKFIH–DST közös felhívások (pl. 2019-2.1.13-TÉT_IN, '
        + '300 millió Ft); INSA–MTA akadémiai csere. Intézményi megállapodások (2021–22): HUN-REN Wigner FK–IIT Indore, Széchenyi István '
        + 'Egyetem–IIT Indore, NKE–IIT Kanpur, NKE–Marwadi University; vízügyi MoU (2016), Fővárosi Vízművek–WAPCOS (2019). '
        + 'Indiai befektetések: mintegy 3,3 milliárd USD (Apollo Tyres, TCS, Sun Pharma; indiai külügyminisztérium, 2025).',
      mobilitas:
        'Stipendium Hungaricum: India partnerország (küldő fél: University Grants Commission; főként természet- és élettudományok, informatika, '
        + 'gazdaságtudomány, mérnöki képzés); a 2022/23-as körben 200 helyre 1924 pályázat érkezett. Az indiai külügyminisztérium 2025-ös összefoglalója szerint '
        + 'mintegy 1200 indiai hallgató tanul Magyarországon.',
    },
    magyarErtekeles: {
      osszegzes:
        'India a világ legnépesebb országa és gyorsan erősödő KFI-szereplő (GII 2025: 38.), világszínvonalú IT-szolgáltatásokkal, űrprogrammal és '
        + 'gyógyszeriparral. A magyar–indiai TéT-kapcsolatok az 1992-es megállapodásra és a közös kutatási alapra épülnek; a jelentős indiai befektetések '
        + 'és India várható Horizont Európa-társulása új lendületet adhat, elsősorban a víz-, az IKT-, a biotechnológiai és az egészségügyi kutatásban.',
      egyuttmukodesiLehetosegek:
        'Vízgazdálkodás és víztisztítás (a vízügyi MoU-ra és a Fővárosi Vízművek–WAPCOS kapcsolatra építve); IKT, MI és kiberbiztonság '
        + '(az indiai IT-cégek magyarországi központjainak bevonásával); biotechnológia és gyógyszeripar; napenergia és megújuló energia; '
        + 'a Horizont Európa-társulás után közös konzorciumok, valamint együttműködés a CERN-kísérletekben.',
      joGyakorlatok:
        'Az ANRF mint a miniszterelnök elnökletével működő kutatásfinanszírozó csúcsszerv; a PAIR program a vezető és a feltörekvő egyetemek '
        + 'párosítására; az RDI Scheme alacsony kamatú, hosszú lejáratú K+F-finanszírozása a magánszektornak; a digitális közinfrastruktúra '
        + '(UPI, Aadhaar) mint nyílt innovációs platform.',
      diplomaciaiPrioritasok:
        'A TéT-vegyesbizottság üléseinek felújítása és a közös NKFIH–DST felhívások újraindítása; magyar–indiai konzorciumok építése '
        + 'a Horizont Európa-társulás nyomán; a Stipendium Hungaricum-ösztöndíjasok és az indiai befektetők bevonása a kutatási együttműködésekbe; '
        + 'magyar részvétel a nagy indiai technológiai rendezvényeken (Bengaluru Tech Summit, SEMICON India).',
    },
  },
};

export default orszag;

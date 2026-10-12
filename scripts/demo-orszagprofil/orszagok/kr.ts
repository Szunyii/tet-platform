/**
 * Dél-Korea (KR) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a [*] jelűeké: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 1 858,572 Mrd USD,
 *   GDP/fő 35 962,344 USD, reálnövekedés 0,896%, lakosság 51,681 millió) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/KOR.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 * - Terület: Világbank AG.SRF.TOTL.K2, 2024: 100 460 km² – https://api.worldbank.org/v2/country/KOR/indicator/AG.SRF.TOTL.K2?format=json
 * - GII 2025 (4. hely a 139 gazdaság közül, 2024: 6.; régiójában 1.; pillérek, mutatók – köztük a GDP-arányos K+F-ráfordítás 2. helye –,
 *   klaszterek, unikornisok, K+F-befektetők, az országprofilban használt QS-rangsor) – https://www.wipo.int/edocs/gii-ranking/2025/kr.pdf
 * - GERD: OECD MSTI, 2024: 5,13% (előzetes adat; 2023: 4,94%; BERD 2024: 4,17%) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/KOR.A.G+B.PT_B1GQ..?startPeriod=2018 ;
 *   abszolút sorrend a teljes MSTI-táblában (GERD folyó áras PPP USD-ben, 2024, az országok között: Kína, USA, Japán, Németország, Korea) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/.A.G.USD_PPP.V._Z?startPeriod=2022 [*]
 * - Stratégia: 6. Tudomány- és Technológiai Alapterv (2026–2030), a PACST hagyta jóvá, az MSIT 2026. június 26-án hirdette ki
 *   (több mint 200 billió von állami K+F; 10 nemzeti stratégiai technológiai terület 55 technológiával, legalább 60 billió von; négy stratégia:
 *   innovációs rendszer, MI-átalakulás, technológiavezérelt növekedés, mindenki növekedése; régiós, blokkfinanszírozású K+F, népegészség és
 *   bioökonómia, energiaátmenet; MI-kutatótársak, autonóm laboratóriumok, saját MI-alapmodellek; 6G 2030 körül; nemzeti tudós program) –
 *   https://mobile.newsis.com/view/NISX20260626_0003685303 , https://newsseoul.co.kr/news/view/1065586210691179 ,
 *   https://thequantuminsider.com/2026/06/30/south-korea-commits-200-trillion-won-to-rd-quantum-listed-as-strategic-tech/
 *   (ez utóbbi szerint az MSIT minisztere egyben miniszterelnök-helyettes)
 * - K+F-költségvetés: a 2026-os költségvetés 35,5 billió von (+19,9%), a Nemzetgyűlés 2025. december 2-án fogadta el –
 *   https://newsseoul.co.kr/news/view/1065611409139329 [*] , https://www.ddaily.co.kr/page/view/2026011914572385475 [*] ; a 2024-es csökkentés –
 *   https://www.koreajoongangdaily.com/business/govt-allocates-record-253-billion-to-national-rd-next-year-ai-gets-steepest-funding-boost/12334625
 * - Intézmények: KASA (indulás: 2024. május 27.) – https://www.kasa.go.kr/eng/sub04_01_02.do [*] ; a KASA az MSIT alá tartozik, a KARI és a KASI
 *   a KASA-hoz kerül – https://www.koreatimes.co.kr/amp/business/tech-science/20240108/parliamentary-committee-passes-bills-on-establishing-aerospace-agency [*] ;
 *   NST (23 tagintézet, a KARI és a KASI nélkül) – https://www.nst.re.kr/eng/index.do [*] ;
 *   a 2025-ös átszervezés (a MOTIE új neve Ministry of Trade, Industry and Resources, MOTIR; az energiaügy 2025 októberétől a Klíma-, Energia- és
 *   Környezetvédelmi Minisztériumé, MCEE) – https://english.motir.go.kr/ [*] , https://www.mcee.go.kr/eng/web/main.do [*] ,
 *   https://www.iea.org/reports/korea-2025/executive-summary [*] ;
 *   a 6. nemzeti szuperszámítógép (HPE, 600 PF, a Nurion utódja) –
 *   https://www.koreatimes.co.kr/business/tech-science/20250514/south-korea-to-deploy-new-supercomputer-from-hewlett-packard-enterprise/ ;
 *   CCEI (19 központ) – https://ccei.creativekorea.or.kr/ ; TIPS (magánbefektetői előszűrés, állami K+F-társfinanszírozás; MSS) –
 *   https://view.asiae.co.kr/en/article/2025121808330151831 ; TIPS 2026: 800 vállalat (2025: 700) –
 *   https://www.unicornfactory.co.kr/article/2026012511000214016 [*] ;
 *   „K-Chips” adójóváírás (2023, 2025) – https://www.koreajoongangdaily.com/business/koreas-kchips-act-with-big-tax-breaks-passes-national-assembly/10093105 ,
 *   https://view.asiae.co.kr/en/article/2025022715351457043 ;
 *   Brain Pool / BP+ (MSIT 2025-0575. sz. felhívás) – https://research.uos.ac.kr/sites/default/files/2025-06/%EB%B6%99%EC%9E%841-2%29%202025%202nd%20Call%20for%20Brain%20Pool%28BP%29%20fellowship%20progra_91774459181285735.pdf
 * - EU és multilaterális: Horizont Európa-társulás (II. pillér, a 2025-ös költségvetési évtől) – EK, List of participating countries, V4.2
 *   (2026. 10. 07.) – https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf ;
 *   Digitális Partnerség (2022) – https://data.consilium.europa.eu/doc/document/ST-7691-2024-INIT/en/pdf ;
 *   Zöld Partnerség (2023. május 22.) –
 *   https://cyprus.representation.ec.europa.eu/news/european-green-deal-eu-and-republic-korea-launch-green-partnership-deepen-cooperation-climate-action-2023-05-22_en ;
 *   EUREKA teljes jogú tagság (2022) – https://www.researchprofessionalnews.com/?p=441813 ;
 *   az EU–Korea Tudományos és Technológiai Vegyesbizottság 8. ülése (Szöul, 2025. március 7.; az EK számozása, a szöuli TéT-beszámoló 7.-ként említi) –
 *   https://research-and-innovation.ec.europa.eu/news/all-research-and-innovation-news/8th-republic-korea-eu-joint-scientific-technological-cooperation-committee-meeting-2025-03-10_en [*] ;
 *   ITER-tagság – https://www.iter.org/about/iter-members [*] ;
 *   USA–Korea Technology Prosperity Deal (2025. október) –
 *   https://www.whitehouse.gov/releases/2025/10/the-united-states-signs-technology-prosperity-deals-with-japan-and-korea [*]
 * - Rendezvények: SEMICON Korea – https://www.semi.org/en/semi-press-release/semicon-korea-2026-to-showcase-core-semiconductor-technologies-for-the-ai-era ,
 *   https://semiconkorea.org/ ; InterBattery 2027 – https://ib2027.ems.coex.co.kr/sub-5-1?hl=en ;
 *   BIO KOREA (a szervező oldala; 2026: április 28–30., 2025: május 7–9.) – https://www.biokorea.org/index.do [*] ,
 *   https://www.biokorea.org/content.do?key=2507310002 [*] ;
 *   NANO KOREA 2026 – https://www.digitaltoday.co.kr/en/view/79319/nanokorea-2026-opens-at-kint-ex-with-401-firms-from-8-countries ;
 *   World Knowledge Forum 2026 – https://www.wkforum.org/ ;
 *   COMEUP 2026 (december 9–11., COEX; házigazda: MSS) – https://www.venturesquare.net/en/1115886/ [*] ;
 *   K-Science and Technology Global Forum 2025 (december 9., az MSIT és a Külügyminisztérium, mintegy 200 résztvevő) –
 *   https://view.asiae.co.kr/en/article/2025120821100477011 [*] ; éves jellege: a szöuli TéT-beszámoló (lent)
 * - Magyar vonatkozás:
 *   - Az 1989-es kormányközi egyezmény: NKFIH, szerződéses országok – https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 *   - NKFIH TéT-beszámoló, Szöul, 2024. június – 2025. május, véglegesítve 2025. június 16-án (az egyezmény ötévenkénti megújulása és a
 *     kétévenkénti TéT-vegyesbizottság; 10. ülés: 2021, hibrid; a 11. magyarországi rendezésű, a terv szerint 2025 szeptemberében Szegeden;
 *     a 2022-es NKFIH–NRF felhívás 5 magyar nyertese; V4–Korea együttműködési szándéknyilatkozat, 2021, és közös kutatási felhívás, 2023;
 *     egyetértési megállapodások 2021–2022, EIPP; MTA–NST megállapodás 2019–2022; Chung-Ang Egyetem és hat magyar egyetem, 2022;
 *     Stipendium Hungaricum: évi 100 hely, 2025/26-ban 63 ösztöndíjas; a HUFS magyar tanszéke és a Dankook Magyarország Intézete;
 *     a koreai hallgatók zöme a magyar orvosegyetemeken; a cikkek negyede nemzetközi társszerzős; a K-Science and Technology Global Forum éves) –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-szoul
 *   - 2018-2.1.17-TÉT-KR (az NKFIH és az MSIT közös programja) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-koreai-kfi-egyuttmukodes/2018-2117-tet-kr
 *   - 2025-1.2.3-TÉT-IPARI-KR felhívás és döntés (koreai partner: NRF; 2025. december 4.: 5 projekt, összesen 382 717 410 Ft) –
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/magyar-koreai-alkalmazott-kutatas-fejlesztesi-egyuttmukodes-2025-123-tet-ipari-kr/palyazati-felhivas ,
 *     https://nkfih.gov.hu/palyazoknak/nkfi-alap/tamogatott-projektek-2025-123-tet-ipari-kr
 *   - Stipendium Hungaricum (küldő fél: NIIED) – https://stipendiumhungaricum.hu/partners/
 *   - Global Korea Scholarship 2026 (GKS-G, 4 nagykövetségi hely magyar állampolgároknak) –
 *     https://hungary.korean-culture.org/ko/962/board/713/read/141919
 *   - Samsung SDI Hungary (Göd) – https://www.samsungsdi.com/about-sdi/global-network.html ; SK (Komárom: a cég első két tengerentúli gyára,
 *     Iváncsa: harmadik akkumulátorgyár, 2021-es bejelentés) –
 *     https://kormany.hu/hirek/szijjarto-magyarorszag-tortenetenek-legnagyobb-zoldmezos-beruhazasat-valositja-meg-a-del-koreai-sk-innovation-ivancsan ;
 *     az SK On magyarországi leányvállalatai (SK On Hungary Kft., SK Battery Manufacturing Kft.) – https://eng.sk.com/companies/info/sk-on
 * Kimaradt blokkok és mezők: nincs kimaradt blokk. Forrással nem ellenőrizhető egyetemi partnerségek és csereprogramok nem szerepelnek;
 * a 11. vegyesbizottsági ülés lezajlásáról nem került elő forrás.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'KR',
  profil: {
    alapadatok: {
      fovaros: 'Szöul',
      terulet: '100 460',
      penznem: 'dél-koreai von (KRW)',
      lakossag: '51 681 000',
      gdp: '1 858,6',
      gdpEgyFore: '35 962',
      gdpNovekedes: '0,9',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank',
      tagsagok: ['OECD', 'G20'],
      tagsagEgyeb: 'APEC, RCEP, IPEF',
      agazatok: ['Elektronika és félvezetők', 'Autóipar', 'Gépipar', 'Vegyipar', 'IKT és szoftver'],
      agazatEgyeb: 'Hajógyártás, acélipar, akkumulátorgyártás',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 4. hely a 139 gazdaság közül (2024-ben a 6.), régiójában (Kelet- és Délkelet-Ázsia, Óceánia) az első; '
        + 'a humántőke és kutatás pillérben világelső. A K+F-ráfordítás 2024-ben a GDP 5,13%-a volt (OECD MSTI, előzetes adat), ami a világ egyik '
        + 'legmagasabb aránya; ennek mintegy négyötödét a vállalatok végzik, abszolút értékben pedig Korea az ötödik legnagyobb K+F-ráfordító '
        + '(Kína, az USA, Japán és Németország után).',
      gerd: '5,13',
      strategia: '6. Tudomány- és Technológiai Alapterv (2026–2030, kihirdetve: 2026. június 26.): több mint 200 billió von állami K+F, ebből legalább 60 billió a 10 nemzeti stratégiai technológiai területre',
      prioritasok: [
        'Digitalizáció és MI', 'Technológiai szuverenitás', 'Zöld átállás és klímasemlegesség', 'Egészség és élettudomány',
        'Regionális felzárkózás', 'Tehetség és mobilitás',
      ],
      prioritasEgyeb: 'Nemzeti MI-átalakulás (saját MI-alapmodellek, MI-kutatótársak és autonóm laboratóriumok), 6G-fejlesztés, bioökonómia',
      kiemeltIparagak: [
        'Félvezetők és mikroelektronika', 'Mesterséges intelligencia és adatgazdaság', 'Hidrogén és akkumulátor',
        'Biotechnológia és gyógyszeripar', 'Kvantumtechnológia', 'Űripar', 'Energetika és fenntarthatóság',
      ],
      iparagEgyeb: 'Fejlett robotika és mobilitás, új generációs biztonság és hálózatok, jövőbeli anyagok, atomenergia',
      erossegek:
        'Erős, nagyvállalati K+F: a legnagyobb befektetők a Samsung Electronics (évi közel 20 milliárd euró K+F-ráfordítással), az SK hynix, '
        + 'az LG Electronics és a Hyundai Motor. A GII 2025 szerint Korea első a vállalati K+F-ráfordításban és a GDP-arányos szabadalmi bejelentésekben, '
        + 'második a lakosságarányos kutatói létszámban; kiemelkedő a termelés és az export technológiai összetettsége (2.), a digitális közszolgáltatás (1.) '
        + 'és az IKT-infrastruktúra.',
      kihivasok:
        'A K+F és a technológiai fejlesztés néhány nagy konglomerátumon (csebolon) belül összpontosul, a nemzetközi kutatási együttműködés alacsony: '
        + 'a tudományos cikkeknek csak mintegy negyede készül nemzetközi társszerzőséggel. A GII gyenge pontjai a demográfia (a fiatal népesség aránya alapján 138.), '
        + 'a beáramló külföldi működőtőke (108.) és a külföldi hallgatók aránya (57.). A 2024-es állami K+F-költségvetés csökkentése után '
        + 'a 2026-os K+F-költségvetés rekordösszegű, 35,5 billió von (+19,9%).',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Elnöki Tudományos és Technológiai Tanácsadó Testület (PACST) – a KFI-politika legfelső szintű testülete, jóváhagyja az alapterveket és a K+F-költségvetés elosztását.\n'
        + 'Tudományos és IKT Minisztérium (MSIT) – az állami K+F és a KFI-stratégia gazdája, minisztere egyben miniszterelnök-helyettes; alá tartozik a 2024-ben létrehozott Koreai Űrügynökség (KASA).\n'
        + 'Kereskedelmi, Ipari és Erőforrásügyi Minisztérium (MOTIR, a korábbi MOTIE; az energiaügy 2025 októbere óta a Klíma-, Energia- és Környezetvédelmi Minisztériumé) – ipari K+F.\n'
        + 'Ügynökségek: Nemzeti Kutatási Alapítvány (NRF), KISTEP (tervezés és értékelés), NST (a 23 kormányzati kutatóintézet tanácsa), IITP (IKT), KEIT és KIAT (ipari technológia).',
      egyetemek:
        'KAIST (Tedzson), Szöuli Nemzeti Egyetem (SNU), POSTECH (Pohang), Yonsei Egyetem, Korea Egyetem, Sungkyunkwan Egyetem (SKKU), '
        + 'UNIST (Ulszan), GIST (Kvangdzsu), DGIST (Tegu); a GII 2025 által használt QS-rangsorban közülük az SNU, a KAIST és a Yonsei a legjobb helyezésű.',
      kutatokozpontok:
        'Koreai Tudományos és Technológiai Intézet (KIST), ETRI (elektronika és távközlés), KRISS (metrológia), KAERI (atomenergia), '
        + 'KRIBB (biotudományok), KIMM (gépészet), KIER (energia), KARI (űrkutatás, a KASA intézete), IBS (Institute for Basic Science – alapkutatási intézethálózat).',
      infrastrukturak:
        'Daedeok Innopolis (Tedzson) – a koreai KFI „fővárosa”, a KAIST és számos kormányzati kutatóintézet otthona; '
        + 'PAL-XFEL röntgenlézer (Pohang); KSTAR szupravezető tokamak (Tedzson); a Nuri hordozórakéta és a Naro űrközpont; '
        + 'a KISTI nemzeti szuperszámítógépe, a Nurion, amelynek utódja a HPE által épített, 600 petaflopsos 6. nemzeti szuperszámítógép.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Félvezetők és mikroelektronika', 'Mobilitás és autóipar', 'Hidrogén és akkumulátor', 'Biotechnológia és gyógyszeripar',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Hajógyártás, kijelzőgyártás',
      topVallalatok: [
        'Samsung Electronics', 'SK hynix', 'Hyundai Motor', 'LG Electronics', 'LG Energy Solution',
        'Kia', 'POSCO Holdings', 'Naver', 'Kakao', 'Celltrion',
      ].join('\n'),
      startupok:
        'A GII 2025 szerint a legnagyobb értékű koreai unikornisok a Toss (Viva Republica), a Yello Mobile és a Kurly; az unikornisok összértéke a GDP 1,6%-a (27. hely). '
        + 'A Kis- és Középvállalkozási és Startup Minisztérium (MSS) TIPS programjában magánbefektetők választják ki és finanszírozzák elsőként a startupokat, '
        + 'az állam ehhez K+F-támogatást ad; a program 2026-ban 800 vállalatot támogat (2025-ben 700-at).',
      klaszterek:
        'A GII 2025 klaszterrangsorában Szöul az 5., Tedzson a 25., Puszan a 95.; Pangyo Techno Valley (IKT, játékipar, fintech), '
        + 'Songdo (biotechnológia, a Samsung Biologics és a Celltrion központja), az épülő jongini félvezető-klaszter; '
        + 'a 19 Kreatív Gazdasági Innovációs Központ (CCEI) régiós inkubátorhálózatként működik.',
      technologiatranszfer:
        'Egyetemi és intézeti technológiatranszfer-irodák (pl. KAIST, ETRI, KIST); a KIAT technológiatranszfer- és hasznosítási programjai; '
        + 'nagyvállalati kockázatitőke-alapok (Samsung Ventures, Hyundai CRADLE).',
    },
    programok: {
      palyazatok:
        'NRF alapkutatási pályázatok (egyéni, fiatal kutatói és csoportos sémák); IITP IKT K+F felhívások; KEIT ipari technológiai programok; '
        + 'a nemzeti stratégiai technológiákhoz kötött célzott programok.',
      tamogatasiProgramok:
        'TIPS (Tech Incubator Program for Startup; lásd Startupok, KKV-k); Brain Pool és Brain Pool+ (MSIT, NRF) – '
        + 'külföldi kutatók meghívása koreai egyetemekre, kutatóintézetekbe és vállalatokhoz.',
      finanszirozasiEszkozok:
        'Korea Venture Investment Corp. (KVIC) alapok alapja; a KOTEC (Korea Technology Finance Corporation) technológiaalapú hitelgaranciái; Korea Development Bank (KDB) innovációs hitelei; '
        + 'K+F- és beruházási adójóváírás, a nemzeti stratégiai technológiáknál emelt mértékkel (a „K-Chips” törvénymódosítások, 2023 és 2025).',
      nemzetkoziReszvetel:
        'Korea a Horizont Európa II. pillérének társult országa és az EUREKA teljes jogú tagja, így szervezetei mindkettőben részt vehetnek; '
        + 'magyar partnerekkel a kétoldalú NKFIH–NRF és a V4–Korea felhívások adtak eddig keretet (lásd Kapcsolatok).',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'SEMICON Korea', tipus: 'szakkiallitas', idopont: 'február, Szöul (COEX)', megjegyzes: 'Félvezetőipari kiállítás és konferencia (SEMI); 2027: február 17–19.' },
      { nev: 'InterBattery', tipus: 'szakkiallitas', idopont: 'március, Szöul (COEX)', megjegyzes: 'Akkumulátoripari kiállítás és konferencia (KBIA, Coex, KOTRA); 2027: március 10–12.' },
      { nev: 'BIO KOREA', tipus: 'szakkiallitas', idopont: 'április–május, Szöul (COEX)', megjegyzes: 'Biotechnológia és gyógyszeripar, partnering; 2026: április 28–30.' },
      { nev: 'NANO KOREA', tipus: 'szakkiallitas', idopont: 'július, Kojang (KINTEX)', megjegyzes: 'Nanotechnológiai kiállítás, 2026-ban 24. alkalommal; 2026: július 8–10.' },
      { nev: 'World Knowledge Forum', tipus: 'konferencia', idopont: 'szeptember, Szöul', megjegyzes: 'A Maeil Business Newspaper gazdasági és technológiai fóruma; 2026: szeptember 8–10.' },
      { nev: 'COMEUP', tipus: 'forum', idopont: 'december, Szöul (COEX)', megjegyzes: 'Nemzetközi startup-fesztivál (MSS); 2026: december 9–11.' },
      { nev: 'K-Science and Technology Global Forum', tipus: 'forum', idopont: 'december, Szöul', megjegyzes: 'Az MSIT éves tudománydiplomáciai fóruma (2025-ben a Külügyminisztériummal közösen, mintegy 200 résztvevővel); 2025: december 9.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'Horizont Európa-társult ország (II. pillér) a 2025-ös költségvetési évtől; az EU–Korea Tudományos és Technológiai Vegyesbizottság 8. ülése 2025 márciusában '
        + 'Szöulban volt. EU–Korea Digitális Partnerség (2022) és Zöld Partnerség (2023); az EUREKA teljes jogú tagja (2022), az ITER és az OECD tagja.',
      partnerorszagok:
        'USA (Technology Prosperity Deal, 2025. október), EU (Horizont Európa-társulás, digitális és zöld partnerség), visegrádi országok (2021-es együttműködési szándéknyilatkozat).',
      egyezmeny: 'Magyar–koreai kormányközi egyezmény a tudományos és műszaki együttműködésről (1989); ötévente megújul, ennek alapján működik a TéT-vegyesbizottság',
      ketoldalu:
        'A terv szerint kétévente ülésező TéT-vegyesbizottság 10. ülése 2021-ben hibrid formában zajlott, a 11. ülést Magyarország rendezi (a 2025. júniusi TéT-beszámoló szerint '
        + '2025 őszére, Szegedre tervezték). Közös felhívások: NKFIH–MSIT (2018), '
        + 'NKFIH–NRF (2022: 5 magyar nyertes; 2025: 5 projekt 382,7 millió Ft NKFI-támogatással, főként gyógyszer- és orvosbiológiai kutatás), V4–Korea (2023: '
        + 'a négy nyertesből háromban magyar résztvevő). Egyetértési megállapodások: egészségipar és digitális gazdaság (2021), akkumulátoripari fókuszú '
        + 'Economic Innovation Partnership Program (EIPP, 2022), az MTA–NST megállapodás 2022-ben lejárt. Koreai akkumulátorgyárak: Samsung SDI (Göd), SK On (Komárom, Iváncsa).',
      mobilitas:
        'Stipendium Hungaricum: Korea partnerország (küldő fél: NIIED), évi 100 hellyel; a 2025/26-os tanévre több mint 200 jelentkezőből 63-an nyertek, '
        + 'a jelentkezők többsége orvos-, gyógyszerész- vagy állatorvos-képzésre pályázik, a koreai hallgatók zöme a magyar orvosegyetemeken tanul. '
        + 'Global Korea Scholarship: 2026-ban 4 nagykövetségi hely magyar mester- és doktori jelentkezőknek. A Hankuk Idegennyelvi Egyetemen 1987 óta magyar tanszék, '
        + 'a Dankook Egyetemen 2019 óta Magyarország Intézet működik; a Chung-Ang Egyetem 2022-ben hat magyar egyetemmel kötött egyetértési megállapodást.',
    },
    magyarErtekeles: {
      osszegzes:
        'Dél-Korea a világ egyik legintenzívebb K+F-befektetője (2024: a GDP 5,13%-a), a GII 2025 4. helyezettje és 2025 óta a Horizont Európa II. pillérének '
        + 'társult országa. A magyar–koreai TéT-kapcsolatok az 1989-es egyezményre, a vegyesbizottságra és a közös NKFIH–NRF felhívásokra épülnek; '
        + 'a magyarországi koreai akkumulátorgyárak az akkumulátor-kutatásban, a közös projektek a gyógyszer- és orvosbiológiai kutatásban adnak alapot az elmélyítéshez.',
      egyuttmukodesiLehetosegek:
        'Akkumulátor-technológia és -újrahasznosítás a magyarországi koreai gyártóbázisra és az EIPP akkumulátoripari munkájára építve; gyógyszer- és orvosbiológiai '
        + 'kutatás (a 2025-ös NKFIH–NRF projektek fő témái); MI és félvezetők; kvantumtechnológia; közös konzorciumok a Horizont Európa II. pillérében.',
      joGyakorlatok:
        'A TIPS modellje: a piaci szűrés megelőzi a közpénzt (lásd Startupok, KKV-k); a nemzeti stratégiai technológiák '
        + 'elkülönített, ötéves K+F-kerete (2026–2030: legalább 60 billió von); a KISTEP rendszeres programértékelése; a 19 CCEI régiós startup-inkubációja.',
      diplomaciaiPrioritasok:
        'A TéT-vegyesbizottság rendszeres, kétévenkénti ülésezésének biztosítása; az NKFIH–NRF közös felhívások folytatása; a lejárt MTA–NST megállapodás helyett HUN-REN–NST '
        + 'egyetértési megállapodás; magyar beszállítók és kutatóhelyek bevonása a koreai akkumulátoripari K+F-be; közös Horizont Európa-konzorciumok szervezése.',
    },
  },
};

export default orszag;

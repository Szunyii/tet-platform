/**
 * Japán (JP) 2026-os profilja – kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09; a [*] jelűeké: 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF.RES:WEO_2025_OCT_VINTAGE, 2025-ös év: GDP 4 279,828 Mrd USD,
 *   GDP/fő 34 713,248 USD, reálnövekedés 1,076%, lakosság 123,291 millió) –
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/JPN.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 * - Terület: Világbank AG.SRF.TOTL.K2, 2024: 377 974,71 km² – https://api.worldbank.org/v2/country/JPN/indicator/AG.SRF.TOTL.K2?format=json
 * - GII 2025 (12. hely a 139 gazdaság közül, 2024: 13.; régiójában 4.; pillérek, mutatók, klaszterek, unikornisok, K+F-befektetők) –
 *   https://www.wipo.int/edocs/gii-ranking/2025/jp.pdf
 * - GERD: OECD MSTI, 2024: 3,62% (becslés; 2023: 3,44%; BERD 2024: 2,86%, azaz a ráfordítások mintegy négyötödét a vállalatok végzik) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/JPN.A.G+B.PT_B1GQ..?startPeriod=2018 ;
 *   abszolút sorrend a teljes MSTI-táblában (GERD folyó áras PPP USD-ben, 2024, az országok között: Kína, USA, Japán) –
 *   https://sdmx.oecd.org/public/rest/data/OECD.STI.STP,DSD_MSTI@DF_MSTI,1.3/.A.G.USD_PPP.V._Z?startPeriod=2022 [*]
 * - Stratégia: 7. Tudomány-, Technológia- és Innovációs Alapterv – https://www8.cao.go.jp/cstp/kihonkeikaku/index7.html ,
 *   https://www8.cao.go.jp/cstp/kihonkeikaku/7gaiyo.pdf , https://www8.cao.go.jp/cstp/kihonkeikaku/7honbun.pdf
 *   (2026–2030-as pénzügyi évek, kormánydöntés: 2026. március 27.; 60 billió jen állami és 180 billió jen összes K+F-ráfordítás a cél;
 *   hat nemzeti stratégiai technológiai terület; a K+F-ráfordítás összegében a világ 3. helye; a legtöbbet idézett publikációk mutatójában
 *   a 4. helyről a 13.-ra esés; doktori fokozatok: 15 744 (2024) → 20 000 (2030); a SIP 2014-es, a Moonshot 2018-as és a 10 billió jenes
 *   Egyetemi Alap 2021-es indulása; nemzetközi partnerek a 7honbun.pdf 24–25. oldalán: G7 és Európa [Horizont Európa, ASPIRE], ASEAN [NEXUS],
 *   India [LOTUS]; a K+F-adójóváírás bővítése; a digitális átállás lemaradása és a széttagoltság)
 * - Startup-fejlesztési ötéves terv (2022: 10 billió jenes befektetési cél 2027-re, hosszabb távon 100 unikornis) –
 *   https://www.cas.go.jp/jp/seisaku/atarashii_sihonsyugi/pdf/sdfyplan2022.pdf
 * - Intézmények és infrastruktúrák: Tohoku Egyetem (az első nemzetközi kutatási kiválósági egyetem, 2024. november 8.) –
 *   https://www.sci.tohoku.ac.jp/direct/english/igpas-network/2024/12/university-for-international-research-excellence.html ;
 *   Institute of Science Tokyo (2024. október 1., a Tokyo Tech és a TMDU egyesülése) – https://www.isct.ac.jp/en/001/about [*] ;
 *   FugakuNEXT (RIKEN, Fujitsu, NVIDIA; 2030 körül) – https://www.riken.jp/en/news_pubs/news/2025/20250822_1/index.html ;
 *   Rapidus (Csitosze, 2 nm, próbagyártás 2025 áprilisától, tömeggyártás 2027-től) – https://www.rapidus.inc/en/iim/ [*] ;
 *   JASM (Kumamoto; TSMC kb. 86,5%, Sony Semiconductor Solutions, Denso, Toyota) – https://global.toyota/en/newsroom/corporate/40410568.html [*] ;
 *   NanoTerasu (2024. április) és JT-60SA (2023. december 1.) – a tokiói TéT-beszámolók (lent); ITER-tagság – https://www.iter.org/about/iter-members [*]
 * - EU és multilaterális: Horizont Európa-társulás (II. pillér, 2026. július 30-tól) –
 *   https://research-and-innovation.ec.europa.eu/strategy/strategy-research-and-innovation/europe-world/international-cooperation/bilateral-cooperation-science-and-technology-agreements-non-eu-countries/japan_en ;
 *   EK, List of participating countries, V4.2 (2026. 10. 07.; a V4.0 2026. 07. 31-én vette fel Japánt a társult országok közé) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf ;
 *   EU–Japán Digitális Partnerség (2022) – https://data.consilium.europa.eu/doc/document/ST-7691-2024-INIT/en/pdf
 * - Rendezvények: CEATEC 2026 – https://www.ceatec.com/en/ ; BioJapan 2026 – https://jcd-expo.jp/en/ ;
 *   SEMICON Japan 2026 – https://www.tradefairdates.com/Semicon-Japan-M1125/Tokyo.html ;
 *   nano tech (25. kiállítás: 2026. január 28–30.; 26. kiállítás: 2026. december 16–18.) – https://www.nanotechexpo.jp/main/en/report2026.html [*] ,
 *   https://www.nanotechexpo.jp/main/en/outline2026dec.html [*] ;
 *   Innovation Japan 2026 – https://www.jst.go.jp/tt/fair/ , https://www.jst.go.jp/tt/fair/entry.html ;
 *   Science Agora 2026 – https://www.jst.go.jp/sis/scienceagora/ ; STS forum – https://www.stsforum.org/
 * - Magyar vonatkozás:
 *   - Az 1979-es kormányközi egyezmény: NKFIH, szerződéses országok – https://nkfih.gov.hu/hivatalrol/ketoldalu-kapcsolatok/szerzodeses-orszagok
 *   - NKFIH TéT-beszámolók, Tokió: 2021–22 (2021. június – 2022. május; TéT-konzultációk 1993 óta felváltva a két fővárosban, a 12. 2015-ben; az utolsó mobilitási
 *     TéT-pályázat 2016-ban, 2017-től 12 projekt; V4–Japán: 2021-es felhívás, a 2021–2024-es ciklusban öt anyagtudományi konzorcium;
 *     CONCERT-Japan: Magyarország 2020 óta tag; Sakura Science: Magyarország 2022-től kedvezményezett, évente várhatóan 10–20 fő) –
 *     https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2022-tokio ;
 *     2023–24 (a 13. konzultáció 2023 februárjában Budapesten, a következő a terv szerint 2025-ben Tokióban; 2024. május 21.: KKM–METI
 *     nukleáris és BM–MLIT vízügyi megállapodás; CONCERT-Japan nyertes konzorcium a HUN-REN Wigner részvételével; a JT-60SA HUN-REN
 *     EK-kamerarendszere; Szakuradzsimai Müográfiai Obszervatórium; NanoTerasu) – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2023-tokio ;
 *     2025. március–május (a következő konzultáció Tokióban; V4–Japán 2015 óta; a 10. CONCERT-Japan-felhívás három magyar részvételű
 *     nyertes projektje; KKM–JAXA megállapodás előkészítése; a Wigner müográfiai munkája a Szakuradzsimán; a CSTI élén a miniszterelnök,
 *     a MEXT a KFI-költségvetés közel kétharmada felett rendelkezik) – https://nkfih.gov.hu/hivatalrol/tet-szakdiplomatak/tet-beszamolo2024-tokio
 *   - A JT-60SA diagnosztikai célú intelligens kamerarendszere (HUN-REN EK; a berendezés az EU–Japán Broader Approach megállapodás része) –
 *     https://hun-ren.hu/en/news/involving-hun-ren-ek-cer-researchers-european-and-japanese-engineers-have-successfully
 *   - Stipendium Hungaricum (küldő fél: MEXT) – https://stipendiumhungaricum.hu/partners/
 *   - A japán kormány kutatói ösztöndíja Magyarországon 1965 óta (a budapesti japán nagykövetség 2016-os kiírásának tájékoztatója
 *     az SZTE oldalán) – https://sci.u-szeged.hu/hirek-esemenyek/research-flyer-japan
 * Kimaradt blokkok és mezők: nincs kimaradt blokk. Forrással nem ellenőrizhető intézményi és egyetemi megállapodások, illetve vállalati
 * K+F-telephelyek nem szerepelnek; a 14. TéT-konzultáció és a JAXA-megállapodás sorsáról nem került elő forrás.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'JP',
  profil: {
    alapadatok: {
      fovaros: 'Tokió',
      terulet: '377 975',
      penznem: 'japán jen (JPY)',
      lakossag: '123 291 000',
      gdp: '4 279,8',
      gdpEgyFore: '34 713',
      gdpNovekedes: '1,1',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank',
      tagsagok: ['OECD', 'G7', 'G20'],
      tagsagEgyeb: 'APEC, CPTPP, RCEP, Quad',
      agazatok: [
        'Mobilitás és autóipar', 'Gépipar', 'Elektronika és félvezetők', 'Vegyipar', 'Biotechnológia és gyógyszeripar',
        'Pénzügyi szolgáltatások',
      ],
      agazatEgyeb: 'Robotika és precíziós műszerek',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 12. hely (2024-ben a 13.; régiójában a 4.); a GII szerint a termelés és az export összetettségében, valamint '
        + 'a közfinanszírozású kutatás és az ipar közös publikációinak arányában világelső. A K+F-ráfordítás 2024-ben a GDP 3,62%-a volt (OECD MSTI, becslés); '
        + 'abszolút értékben Japán a világ harmadik legnagyobb K+F-ráfordítója Kína és az USA után, a ráfordítások mintegy négyötödét a vállalatok végzik. '
        + 'A 7. alapterv szerint a legtöbbet idézett publikációk mutatójában Japán a 2000-es évek eleji 4. helyről a 13.-ra esett (2021–2023).',
      gerd: '3,62',
      strategia: '7. Tudomány-, Technológia- és Innovációs Alapterv (2026–2030, kormánydöntés: 2026. március 27.): 60 billió jen állami és 180 billió jen összes K+F-ráfordítás a cél',
      prioritasok: [
        'Alapkutatási kiválóság', 'Digitalizáció és MI', 'Technológiai szuverenitás', 'Védelem és biztonság',
        'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Energiabiztonság',
      ],
      prioritasEgyeb: 'A tudomány újjáélesztése mint a 7. alapterv vezérelve, gazdaságbiztonság, stratégiai tudománydiplomácia, MI a tudományban (AI for Science); a Society 5.0 jövőkép továbbvitele',
      kiemeltIparagak: [
        'Elektronika és félvezetők', 'Mobilitás és autóipar', 'Mesterséges intelligencia és adatgazdaság', 'Kvantumtechnológia',
        'Biotechnológia és gyógyszeripar', 'Űripar', 'Energetika és fenntarthatóság', 'Anyagtudomány',
      ],
      iparagEgyeb: 'Fúziós energia, fejlett robotika, kommunikációs technológiák',
      erossegek:
        'Világszínvonalú anyagtudomány és gyártástechnológia; stabil, kutatói kezdeményezésű alapkutatás-finanszírozás (KAKENHI); kiemelkedő nagyberendezések '
        + '(lásd Kutatási infrastruktúrák). Erős vállalati K+F: a legnagyobb befektetők a Toyota, a Honda, az NTT és a Sony; '
        + 'a GDP-arányos szabadalmi mutatókban a világ élmezőnye (GII: 2–3. hely).',
      kihivasok:
        'Elöregedő és fogyó népesség (a GII-ben a fiatal népesség aránya alapján 137.), stagnáló doktori kibocsátás: évente mintegy 15–16 ezer doktori fokozat, '
        + 'a 7. alapterv célja 20 ezer 2030-ra. Alacsony a beáramló külföldi működőtőke (GII: 113.), a startup-ökoszisztéma a gazdaság méretéhez képest kicsi '
        + '(az unikornisok értéke a GDP 0,25%-a, 49. hely). A kormány a digitális átállás lemaradását és a szervezeti széttagoltságot is a fő kihívások között említi.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudomány-, Technológia- és Innovációs Tanács (CSTI, a Kabinetiroda alatt, a miniszterelnök elnökletével) – stratégiai irányítás, az alaptervek előkészítése.\n'
        + 'MEXT (oktatás, kultúra, sport, tudomány és technológia) – alapkutatás, egyetemek; az állami KFI-költségvetés közel kétharmada felett rendelkezik.\n'
        + 'METI (gazdaság, kereskedelem, ipar) – ipari K+F, félvezető-politika.\n'
        + 'Finanszírozó ügynökségek: JST, JSPS (MEXT alatt), NEDO (METI alatt), AMED (orvosi K+F).',
      egyetemek:
        'Tokiói Egyetem, Kiotói Egyetem, Oszakai Egyetem, Tohoku Egyetem (2024 novemberében az első „nemzetközi kutatási kiválósági egyetem”), '
        + 'Institute of Science Tokyo (a Tokyo Tech és a TMDU 2024. októberi egyesüléséből), Nagojai Egyetem, Hokkaidói Egyetem, Kjúsúi Egyetem, Keio, Waseda.',
      kutatokozpontok:
        'RIKEN (természettudományi alapkutatás), AIST (ipari tudomány és technológia), NIMS (anyagtudomány), JAXA (űr), '
        + 'NICT (infokommunikáció), QST (kvantum- és sugárzástudomány), NIES (környezet), NIBIOHN (orvosbiológia, egészség és táplálkozás).',
      infrastrukturak:
        'Fugaku szuperszámítógép (Kóbe) és a 2030 körülre tervezett utódja, a FugakuNEXT; SPring-8 szinkrotron és SACLA röntgenlézer (Harima); NanoTerasu '
        + 'szinkrotron (Szendai, 2024); J-PARC protongyorsító (Tókai); Super-Kamiokande és az épülő Hyper-Kamiokande; JT-60SA szupravezető tokamak (Naka, 2023); '
        + 'a Rapidus 2 nm-es félvezetőgyára (Csitosze, Hokkaidó; próbagyártás 2025 áprilisától) és a TSMC többségi tulajdonú JASM kumamotói gyára.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'Elektronika és félvezetők', 'Biotechnológia és gyógyszeripar', 'Anyagtudomány',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Robotika, optika és képalkotás',
      topVallalatok: [
        'Toyota Motor', 'Sony Group', 'Hitachi', 'Panasonic Holdings', 'Honda Motor',
        'SoftBank Group', 'Mitsubishi Electric', 'Takeda Pharmaceutical', 'Tokyo Electron', 'NTT',
      ].join('\n'),
      startupok:
        'A Startup-fejlesztési ötéves terv (2022) célja, hogy a startup-befektetések 2027-re elérjék a 10 billió jent, hosszabb távon pedig 100 unikornis és '
        + '100 ezer startup jöjjön létre. A GII 2025 szerint a legértékesebb japán unikornisok a Preferred Networks, a SmartNews és a SmartHR. '
        + 'A J-Startup (METI) és a JST START program a startupokat, a KKV-ügynökség (SME Agency) programjai a kisvállalkozások innovációját támogatják.',
      klaszterek:
        'A GII 2025 klaszterrangsorában Tokió–Jokohama a világon a 2., Oszaka–Kóbe–Kiotó a 11., Nagoja a 28.; Cukuba tudományváros; '
        + 'Kavaszaki King Skyfront (élettudomány); új félvezető-ipari központok Hokkaidón és Kumamotóban (lásd Kutatási infrastruktúrák).',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-irodák az 1998-as TLO-törvény alapján; egyetemi kockázatitőke-cégek (pl. UTokyo IPC, Kyoto University Innovation Capital); '
        + 'a JST A-STEP programja; az AIST vállalati közös laboratóriumai.',
    },
    programok: {
      palyazatok:
        'JSPS KAKENHI (Grants-in-Aid for Scientific Research – a legnagyobb alapkutatási támogatás); JST CREST, PRESTO, ERATO; '
        + 'NEDO ipari K+F felhívások; AMED orvosi K+F programok.',
      tamogatasiProgramok:
        'Moonshot K+F Program (2018 óta, 2050-ig szóló célokkal); SIP (tárcaközi Stratégiai Innovációs Program, 2014 óta); a 2021-ben létrehozott, 10 billió jenes '
        + 'Egyetemi Alap a nemzetközi kutatási kiválósági egyetemeknek; WPI (World Premier International Research Center Initiative).',
      finanszirozasiEszkozok:
        'Japan Investment Corporation (JIC) és a JIC Venture Growth Investments; Development Bank of Japan (DBJ); K+F-adójóváírás, amelynek a kiemelt '
        + 'területekre irányuló bővítését a 7. alapterv előirányozza.',
      nemzetkoziReszvetel:
        'A Horizont Európa II. pillérében a japán szervezetek társult országbeliként konzorciumot vezethetnek és közvetlen uniós támogatást kaphatnak (lásd Kapcsolatok). '
        + 'JSPS kétoldalú és Core-to-Core programok; JST SICORP és e-ASIA JRP; ITER és az EU–Japán Broader Approach.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'CEATEC', tipus: 'szakkiallitas', idopont: 'október, Makuhari Messe (Csiba)', megjegyzes: 'Elektronika, IKT és digitális innováció; 2026: október 13–16.' },
      { nev: 'BioJapan', tipus: 'szakkiallitas', idopont: 'október, Jokohama (PACIFICO Yokohama)', megjegyzes: 'Biotechnológia és partnering, a Regenerative Medicine JAPAN és a healthTECH JAPAN kiállítással; 2026: október 7–9.' },
      { nev: 'SEMICON Japan', tipus: 'szakkiallitas', idopont: 'december, Tokió (Tokyo Big Sight)', megjegyzes: 'Félvezetőipari kiállítás (SEMI); 2026: december 9–11.' },
      { nev: 'nano tech', tipus: 'szakkiallitas', idopont: 'változó hónap, Tokió (Tokyo Big Sight)', megjegyzes: 'Nanotechnológia és anyagtudomány; a 26. kiállítás: 2026. december 16–18. (a 25. 2026. január 28–30-án volt)' },
      { nev: 'Innovation Japan', tipus: 'forum', idopont: 'augusztus, Tokió (Tokyo Big Sight)', megjegyzes: 'A JST egyetemi technológiabörzéje (2004 óta); 2026: augusztus 27–28.' },
      { nev: 'Science Agora', tipus: 'forum', idopont: 'ősz, Tokió (Odaiba)', megjegyzes: 'A JST tudomány–társadalom fóruma; 2026: szeptember 12–13.' },
      { nev: 'STS forum (Science and Technology in Society)', tipus: 'konferencia', idopont: 'október, Kiotó', megjegyzes: 'Tudománypolitikai vezetők éves fóruma; 2027: október 3–5.' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Japán tudományos és technológiai együttműködési megállapodás (2011-ben lépett hatályba; a közös bizottság 7. ülése: 2023. december); '
        + 'a Horizont Európa II. pillérének társult országa 2026. július 30. óta; EU–Japán Digitális Partnerség (2022). G7- és OECD-tag.',
      partnerorszagok:
        'A 7. alapterv a szövetséges és hasonlóan gondolkodó országokra épít: a G7-országok (köztük az USA) és Európa (Horizont Európa-társulás, ASPIRE program), '
        + 'valamint az ASEAN-országok (NEXUS) és India (LOTUS program); ezen felül az EIG CONCERT-Japan és a visegrádi országok (V4–Japán közös kutatási program 2015 óta).',
      egyezmeny: 'Kormányközi egyezmény a magyar–japán műszaki, tudományos és technológiai együttműködésről (1979)',
      ketoldalu:
        'A kormányközi TéT-konzultációk 1993 óta felváltva zajlanak a két fővárosban: a 12. konzultáció 2015-ben, a 13. 2023 februárjában Budapesten volt, '
        + 'a következőt Tokió rendezi (a 2023–24-es TéT-beszámoló 2025-re tervezte). Az utolsó kétoldalú mobilitási TéT-pályázatot a 2021–22-es TéT-beszámoló szerint '
        + '2016-ban írták ki (2017-től 12 projekt). Többoldalú keretek: V4–Japán (2021–2024: öt anyagtudományi konzorcium) és CONCERT-Japan '
        + '(Magyarország 2020 óta tag, több magyar részvételű nyertes projekttel). A HUN-REN Wigner FK a Szakuradzsima-vulkán müográfiai obszervatóriumában dolgozik '
        + 'japán partnereivel, a HUN-REN EK fejlesztette a JT-60SA tokamak kamerarendszerét; 2024-ben nukleáris (KKM–METI) és vízügyi együttműködési megállapodás '
        + 'született, a KKM–JAXA űrkutatási megállapodás 2025-ben előkészítés alatt állt.',
      mobilitas:
        'Stipendium Hungaricum: Japán partnerország (küldő fél: MEXT; alap- és mesterképzés főként egészségtudomány, művészet, természettudomány, informatika '
        + 'és mérnöki területen, doktori képzés bármely területen). '
        + 'A japán kormány (MEXT) kutatói ösztöndíja a japán nagykövetség 2016-os kiírása szerint 1965 óta érhető el Magyarországon. '
        + 'A JST Sakura Science programjába 2022 óta magyar fiatalok is bekapcsolódhatnak (a 2021–22-es beszámoló szerint évente várhatóan 10–20 fő).',
    },
    magyarErtekeles: {
      osszegzes:
        'Japán a világ harmadik legnagyobb K+F-ráfordítója (2024: a GDP 3,62%-a), 2026 júliusától a Horizont Európa II. pillérének társult országa. '
        + 'A magyar–japán TéT-kapcsolatok az 1979-es egyezményre és a 2023-ban újraindult kormányközi konzultációkra épülnek; a V4–Japán program, '
        + 'valamint a HUN-REN müográfiai és fúziós munkája jó alapot ad az anyagtudományi, fúziós és földtudományi együttműködés bővítéséhez.',
      egyuttmukodesiLehetosegek:
        'Anyagtudomány (a V4–Japán anyagtudományi felhívásaira és a CONCERT-Japan programra építve); fúziós kutatás és diagnosztika (JT-60SA); müográfia, vulkán- és '
        + 'földrengéskutatás; félvezető-, kvantum- és MI-kutatás (Horizont Európa II. pillér); nukleáris és vízügyi együttműködés '
        + 'a 2024-es megállapodások alapján.',
      joGyakorlatok:
        'A KAKENHI kiszámítható, kutatói kezdeményezésű finanszírozása; a WPI kiválósági központjai és az Egyetemi Alapból finanszírozott '
        + 'kutatóegyetemi kiválósági program; a Moonshot hosszú távú, missziós céljai; a Sakura Science korai tehetségvonzása.',
      diplomaciaiPrioritasok:
        'A kormányközi TéT-konzultációk rendszeressé tétele és a kétoldalú mobilitási pályázat felújítása; a KKM–JAXA '
        + 'űrkutatási megállapodás lezárása; magyar részvétel a japán partnerségű Horizont Európa-konzorciumokban; '
        + 'magyar–japán vállalati K+F-együttműködések ösztönzése.',
    },
  },
};

export default orszag;

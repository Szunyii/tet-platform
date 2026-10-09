/**
 * Japán (JP) 2026-os demó-profilja (a 2026-09-15-i adat, a korábbi scripts/demo-orszagprofil.ts-ből
 * változatlanul). Források: IMF World Economic Outlook (2025. október), Világbank, Japán Statisztikai Hivatal, GII 2025.
 */
import { rendezvenyek, type DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'JP',
  profil: {
    alapadatok: {
      fovaros: 'Tokió',
      terulet: '377 975',
      penznem: 'japán jen (JPY)',
      lakossag: '123 800 000',
      gdp: '4 190,0',
      gdpEgyFore: '33 900',
      gdpNovekedes: '1,1',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október), Világbank, Japán Statisztikai Hivatal',
      tagsagok: ['OECD', 'G7', 'G20'],
      tagsagEgyeb: 'APEC, CPTPP, RCEP, Quad',
      agazatok: ['Autóipar', 'Gépipar', 'Elektronika és félvezetők', 'Vegyipar', 'Gyógyszeripar', 'Pénzügyi szolgáltatások'],
      agazatEgyeb: 'Robotika és precíziós műszerek',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 13. hely; abszolút K+F ráfordításban a világ 3. legnagyobb (az USA és Kína után). '
        + 'A ráfordítások mintegy 78%-a vállalati; szabadalmi bejelentésekben tartósan a top 3-ban. '
        + 'A magas idézettségű publikációk részaránya az elmúlt két évtizedben csökkent, ennek visszafordítása kormányzati prioritás.',
      gerd: '3,41',
      strategia: '7. Tudomány-, Technológia- és Innovációs Alapterv (2026–2030); Integrált Innovációs Stratégia (évente)',
      prioritasok: [
        'Digitalizáció és MI', 'Zöld átállás és klímasemlegesség', 'Technológiai szuverenitás', 'Alapkutatási kiválóság',
        'Tehetség és mobilitás', 'Startup és vállalkozói ökoszisztéma', 'Regionális felzárkózás',
      ],
      prioritasEgyeb: 'Gazdaságbiztonság (Economic Security Promotion Act), Society 5.0',
      kiemeltIparagak: [
        'Félvezetők és mikroelektronika', 'Kvantumtechnológia', 'Mesterséges intelligencia és adatgazdaság',
        'Biotechnológia és gyógyszeripar', 'Hidrogén és akkumulátor', 'Anyagtudomány',
      ],
      iparagEgyeb: 'Robotika, fúziós energia',
      erossegek:
        'Világszínvonalú anyagtudomány és gyártástechnológia; a félvezető-berendezések és -alapanyagok globális kulcsszállítója; '
        + 'stabil, hosszú távú alapkutatás-finanszírozás (KAKENHI); nagy kutatási infrastruktúrák (SPring-8, J-PARC, Fugaku); '
        + 'erős vállalati K+F-kultúra és szabadalmi portfóliók.',
      kihivasok:
        'Elöregedő társadalom és fogyó kutatói utánpótlás; alacsony nemzetközi mobilitás és kevés külföldi kutató; '
        + 'a doktori képzés vonzerejének csökkenése; a startup-ökoszisztéma a méretéhez képest kicsi; '
        + 'lassú digitalizáció a közszférában és a KKV-knál.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Tudomány-, Technológia- és Innovációs Tanács (CSTI, a Kabinetiroda alatt) – stratégiai irányítás.\n'
        + 'MEXT (oktatás, kultúra, sport, tudomány és technológia) – alapkutatás, egyetemek.\n'
        + 'METI (gazdaság, kereskedelem, ipar) – ipari K+F, félvezető-politika.\n'
        + 'Finanszírozó ügynökségek: JST, JSPS (MEXT alatt), NEDO (METI alatt), AMED (orvosi K+F).',
      egyetemek:
        'Tokiói Egyetem, Kiotói Egyetem, Oszakai Egyetem, Tohoku Egyetem (az első „nemzetközi kutatási kiválósági egyetem"), '
        + 'Institute of Science Tokyo (a Tokyo Tech és a TMDU 2024-es egyesüléséből), Nagojai Egyetem, Hokkaidói Egyetem, Kjúsúi Egyetem, Keio, Waseda.',
      kutatokozpontok:
        'RIKEN (természettudományi alapkutatás), AIST (ipari tudomány és technológia), NIMS (anyagtudomány), JAXA (űr), '
        + 'NICT (infokommunikáció), QST (kvantum- és sugárzástudomány), NIES (környezet), NIBIOHN.',
      infrastrukturak:
        'Fugaku szuperszámítógép (Kóbe) és a 2030-ra tervezett utódja; SPring-8 szinkrotron és SACLA röntgenlézer (Harima); '
        + 'J-PARC protongyorsító (Tókai); Super-Kamiokande és az épülő Hyper-Kamiokande; Cukuba tudományváros; '
        + 'a Rapidus 2 nm-es félvezető-gyár (Hokkaidó) és a TSMC kumamotói üzemei.',
    },
    vallalati: {
      kiemeltAgazatok: [
        'Mobilitás és autóipar', 'Félvezetők és mikroelektronika', 'Biotechnológia és gyógyszeripar', 'Anyagtudomány',
        'Mesterséges intelligencia és adatgazdaság',
      ],
      agazatEgyeb: 'Robotika, optika és képalkotás',
      topVallalatok: [
        'Toyota Motor', 'Sony Group', 'Hitachi', 'Panasonic Holdings', 'Honda Motor',
        'SoftBank Group', 'Mitsubishi Electric', 'Takeda Pharmaceutical', 'Tokyo Electron', 'NTT',
      ].join('\n'),
      startupok:
        'A Startup Fejlesztési Ötéves Terv (2022) 2027-re 10 billió jen befektetést és 100 unikornist céloz; '
        + 'kiemelt startupok: Preferred Networks, Sakana AI, SmartHR, Spiber, Telexistence. '
        + 'A J-Startup (METI/JETRO) és a JST START program a mélytech-cégeket támogatja; a KKV-k innovációját az SME Agency programjai segítik.',
      klaszterek:
        'Cukuba tudományváros; Kavaszaki King Skyfront (élettudomány); Kanszai Innovációs Övezet (Oszaka–Kiotó–Kóbe, regeneratív orvoslás); '
        + 'Sibuja és Fukuoka startup-központok; a hokkaidói félvezető-klaszter (Rapidus); Kumamoto (TSMC beszállítói lánc).',
      technologiatranszfer:
        'Egyetemi technológiatranszfer-irodák a TLO-törvény (1998) alapján; egyetemi kockázatitőke-cégek (UTokyo IPC, Kyoto-iCAP, Osaka University Venture Capital); '
        + 'JST A-STEP és START programok; AIST vállalati közös laborok; a RIKEN Innovation Design Office.',
    },
    programok: {
      palyazatok:
        'JSPS KAKENHI (Grants-in-Aid for Scientific Research – a legnagyobb alapkutatási felhívás); JST CREST, PRESTO, ERATO; '
        + 'NEDO ipari K+F felhívások; AMED orvosi K+F programok.',
      tamogatasiProgramok:
        'Moonshot K+F Program (2050-ig szóló célok); SIP (tárcaközi Stratégiai Innovációs Program); '
        + '10 billió jenes Egyetemi Alap a nemzetközi kutatási kiválósági egyetemeknek; WPI (World Premier International Research Center Initiative); '
        + 'GX (zöld transzformáció) 20 billió jenes átmeneti kötvényprogram.',
      finanszirozasiEszkozok:
        'Japan Investment Corporation (JIC) és a JIC Venture Growth Investments; Development Bank of Japan (DBJ); '
        + 'K+F adókedvezmény (a K+F költség 1–14%-a); a Rapidus félvezető-programjának közvetlen állami támogatása.',
      nemzetkoziReszvetel:
        'JSPS kétoldalú programok és Core-to-Core; JST SICORP és e-ASIA JRP; Horizont Európa társulási tárgyalások; '
        + 'ITER (Japán az EU mellett a fő partner), IEA, OECD; Sakura Science Program külföldi fiataloknak.',
    },
    rendezvenyek: rendezvenyek([
      { nev: 'CEATEC', tipus: 'szakkiallitas', idopont: 'október, Makuhari Messe (Csiba)', megjegyzes: 'Elektronika, IKT, Society 5.0' },
      { nev: 'SEMICON Japan', tipus: 'szakkiallitas', idopont: 'december, Tokyo Big Sight' },
      { nev: 'BioJapan', tipus: 'szakkiallitas', idopont: 'október, Jokohama', megjegyzes: 'Ázsia legnagyobb biotech partnering-eseménye' },
      { nev: 'nano tech', tipus: 'szakkiallitas', idopont: 'január–február, Tokyo Big Sight', megjegyzes: 'Nanotechnológia és anyagtudomány' },
      { nev: 'Innovation Japan', tipus: 'forum', idopont: 'augusztus, Tokió', megjegyzes: 'JST egyetemi technológiabörze' },
      { nev: 'Science Agora', tipus: 'konferencia', idopont: 'október–november, Tokió (Odaiba)', megjegyzes: 'JST tudomány–társadalom fórum' },
      { nev: 'Japan Mobility Show', tipus: 'szakkiallitas', idopont: 'kétévente október–november, Tokyo Big Sight', megjegyzes: 'Következő: 2027' },
    ]),
    kapcsolatok: {
      euMultilateralis:
        'EU–Japán tudományos és technológiai együttműködési megállapodás (2011) és Digitális Partnerség (2022); '
        + 'Horizont Európa társult tagság tárgyalás alatt; OECD CSTP aktív részvétel; G7 tudományos miniszteri folyamat; ITER és Broader Approach.',
      partnerorszagok:
        'USA (félvezető, kvantum, MI – 2023-as közös nyilatkozatok), EU (Horizont Európa, zöld átállás), Egyesült Királyság (Hiroshima Accord), '
        + 'Németország (Ipar 4.0, hidrogén), India és Ausztrália (Quad kritikus technológiák), Dél-Korea (ellátási láncok).',
      egyezmeny: 'Magyar–japán tudományos és technológiai együttműködési egyezmény (1988)',
      ketoldalu:
        'NKFIH–JSPS kétoldalú kutatócsere-program és közös pályázat; HUN-REN–RIKEN és HUN-REN–AIST kapcsolatok; '
        + 'BME és ELTE megállapodásai a Tokiói Egyetemmel és a Tohoku Egyetemmel; a Suzuki (Esztergom) és a Bridgestone (Tatabánya) magyar K+F-hátterű telephelyei; '
        + 'magyar–japán TéT vegyes bizottság.',
      mobilitas:
        'MEXT (Monbukagakusho) ösztöndíj magyar hallgatóknak; JSPS posztdoktori ösztöndíjak; Stipendium Hungaricum japán kvóta; '
        + 'Sakura Science Program középiskolásoknak és fiatal kutatóknak; Erasmus+ nemzetközi kreditmobilitás (Waseda, Keio, Tohoku).',
    },
    magyarErtekeles: {
      osszegzes:
        'Japán az egyik legnagyobb K+F-költő, stabil alapkutatás-finanszírozással és nagy infrastruktúrákkal; a magyar–japán kapcsolatok '
        + 'hagyományosak (1988-as egyezmény, JSPS-csere), a következő lépés az anyagtudomány, a kvantum és a zöld hidrogén területén közös projektek indítása.',
      egyuttmukodesiLehetosegek:
        'Anyagtudomány és félvezető-alapanyagok (NIMS – HUN-REN EK, BME); kvantumtechnológia (RIKEN – Wigner); '
        + 'hidrogén és energiatárolás (NEDO programok magyar partnerekkel); egészségipar és elöregedő társadalom kutatása (AMED); '
        + 'a Horizont Európa japán társulása után közös konzorciumok.',
      joGyakorlatok:
        'KAKENHI: kiszámítható, többéves, kutatói kezdeményezésű alapkutatás-finanszírozás; WPI nemzetközi kiválósági központok; '
        + 'Moonshot – hosszú távú, missziós célok programmenedzserekkel; Sakura Science – korai, célzott tehetségvonzás.',
      diplomaciaiPrioritasok:
        'A TéT vegyes bizottság ülésének megszervezése; közös NKFIH–JSPS felhívás bővítése; magyar kutatóintézetek bekapcsolása a Moonshot és a WPI hálózatba; '
        + 'a japán vállalatok magyarországi K+F-tevékenységének ösztönzése.',
    },
  },
};

export default orszag;

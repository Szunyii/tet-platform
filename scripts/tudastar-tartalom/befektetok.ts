/**
 * 7. Finanszírozók és befektetők – a TéT Tudástár kezdő tartalma (kutatott vázlat, címtár jelleggel: nem befektetési
 * tanács, nem értékelés).
 *
 * Források (lekérve: 2026-11-02):
 * - MFB Magyar Fejlesztési Bank, főoldal és az MFB Csoport tagjai (Hiventures Zrt., Garantiqa Hitelgarancia Zrt.,
 *   MFB Invest Zrt.: 2006 óta, legalább 500 millió Ft tőkeigényű ügyletek, főként kisebbségi részesedés, 4–7 év utáni
 *   kilépés, a Hiventures 100%-os tulajdonosa; Garantiqa: 1992 óta kkv-hitelek kezessége) – https://www.mfb.hu/ ,
 *   https://www.mfb.hu/mfb-csoport/mfb-invest-zrt-s13 , https://www.mfb.hu/mfb-csoport/garantiqa-hitelgarancia-zrt-s10
 * - Hiventures: főoldal (120+ aktív portfóliócég, korai fázis) és közlemény (2026. február 18.: mintegy 17 milliárd Ft-os,
 *   uniós forrású kockázati tőkealap az MFB Csoporthoz tartozó Hiventures kezelésében; MI, deeptech, egészségügy) –
 *   https://hiventures.hu/ , https://hiventures.hu/uj-korai-fazisu-befektetesi-alapot-indit-a-hiventures/
 * - Az NKFI Alap 2026. évi programstratégiája (2025. november; SEED co-investment fund 10 Mrd Ft, Startup Factory
 *   6 Mrd Ft, Üzleti Angyal Garancia Program 0,5 Mrd Ft, Life Sciences Catalyst Venture Capital Fund 20 Mrd Ft,
 *   Life Sciences Catalyst Program I–II. 5–5 Mrd Ft, TTC-hálózat fejlesztése 6 Mrd Ft, MEDTECH kórházi inkubátor
 *   program 2 Mrd Ft) – https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026 (a PDF:
 *   https://nkfih.gov.hu/hivatalrol/hivatal-kiadvanyai/nkfia-programstrategia-2026 )
 * - NKFIH, Technology-Specific Venture Capital Programme (GINOP Plusz-2.5.2-26; meghirdetve 2026. március 25.; keret
 *   55,12 Mrd Ft, kb. 10 pályázó alapkezelő, 200–2000 M Ft-os befektetések deep tech kkv-kba, elsősorban TRL 6 fölött) –
 *   https://nkfih.gov.hu/english/szechenyi-plan-plus/technology-specific-venture-capital-programme-ginop-plusz-252-26 ;
 *   a hazai közlemény: https://www.palyazat.gov.hu/kozlemenyek/megjelent-a-technologiaspecifikus-kockazati-tokeprogram-cimu-ginop-plusz-2-5-2-26-kodszamu-felhivas
 * - NKFIH, a Startup Factory (2023-1.1.3-STARTUP) támogatott projektjei (2023. december 7. és 18.; 12 inkubátor,
 *   összesen 5,7 Mrd Ft) – https://nkfih.gov.hu/english/nrdi-fund/funded-projects-2023-113-startup
 * - HVCA, főoldal (közel 35 éve, mintegy 70 tag) és taglista; a tagok adatlapjai (honlapcímek) –
 *   https://www.hvca.hu/ , https://www.hvca.hu/hu/tagok
 * - Az alapkezelők saját honlapjai: https://dayonecapital.com/ , https://www.portfolion.com/ , https://platinacapital.hu/ ,
 *   https://impactventures.hu/ , https://fundwise.hu/ , https://eximinvest.hu/ (a honlap leírása) ,
 *   https://szta.hu/rolunk/ (Széchenyi Alapok Zrt.: 2011 óta, 155+ Mrd Ft tőkekeret, 80+ portfóliócég, tulajdonos:
 *   Rudolf Kalman Óbudai Egyetemért Alapítvány; 2023-ban alapított Óbuda Uni Venture Capital Zrt.)
 * - HunBAN – https://hunban.eu/
 * - EXIM Magyarország (beruházási, forgóeszköz- és zöld hitel, garancia, exporthitel-biztosítás) – https://exim.hu/
 * - KAVOSZ, Széchenyi Kártya Program termékei – https://www.kavosz.hu/
 * - Európai Innovációs Tanács, főoldal („One of the largest deep tech investors in Europe”; Pathfinder, Transition,
 *   Accelerator, STEP Scale Up, EIC Fund) – https://eic.ec.europa.eu/index_en ; az EIC magyar NCP-je az NKFIH-ban:
 *   https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok
 *
 * ELLENŐRIZENDŐ:
 * - Az NKFI Alap 2026. évi programstratégiája 2025 novemberében, a 2026-os kormányváltás előtt készült: a SEED
 *   társbefektetési alap, az Üzleti Angyal Garancia Program, a Life Sciences Catalyst VC Fund, a TTC-hálózat fejlesztése,
 *   a MEDTECH kórházi inkubátor program és a Startup Factory 2026-os indulása és kerete a mai állapot szerint.
 * - A GINOP Plusz-2.5.2-26 tőkeprogram alapkezelőinek kiválasztása (állás, nyertesek).
 * - A Széchenyi Alapok Zrt. tulajdonosa a közérdekű vagyonkezelő alapítványok megszüntetése miatt változhat.
 * - Az EXIM Invest tulajdonosi háttere (EXIM-csoport) a honlapon nem volt ellenőrizhető, ezért nem szerepel.
 * - A Nemzeti Tőkeholding (nth.hu) szerepe az állami kockázatitőke-alapok felett: a honlap tanúsítványhibája miatt nem
 *   volt ellenőrizhető, ezért kimaradt.
 * - A HunBAN magyar jogi neve és EBAN-tagsága nem ellenőrzött.
 * - Vállalati kockázati tőke (CVC): hivatalos forrásból ellenőrizhető hazai CVC-programot nem találtunk; a kártya ezért a
 *   Startup Factory inkubátorait közli, CVC-szereplővel bővítendő.
 */
import type { ForrasKategoria } from './tipusok';

const PROGRAMSTRATEGIA = 'https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026';

const kategoria: ForrasKategoria = {
  leiras: 'Állami és magán kockázati tőke, üzleti angyalok, fejlesztési bankok, deep tech és egyetemi alapok.',
  bevezeto:
    'Az innováció tőkeoldalának szereplői címtárszerűen: az állami és állami hátterű finanszírozók, a kockázatitőke-alapkezelők, az üzleti angyal hálózatok, a fejlesztési bankok és garanciaintézmények, az inkubációs és vállalati befektetők, a deep tech finanszírozók, valamint az egyetemi és proof-of-concept alapok. Az attasé itt találja meg, kihez irányíthatja a társbefektetőt kereső külföldi partnert, vagy honnan ered egy magyar startup finanszírozása. A lista nem befektetési tanács és nem értékelés; a vállalati (CVC) és az inkubációs befektetők a kevés ellenőrizhető adat miatt közös kártyán szerepelnek, az összegek a források közlései.',
  kartyak: [
    {
      slug: 'allami-finanszirozok',
      tipus: 'lista',
      nev: 'Állami és állami hátterű finanszírozók',
      osszefoglalo:
        'Az állami fejlesztési bank csoportja és az NKFI Alap tőkeprogramjai a korai fázisú innovatív cégek fő állami tőkeforrásai. Az MFB Csoporthoz tartozó Hiventures 2026 februárjában mintegy 17 milliárd forintos új kockázati tőkealapot indított; az NKFI Alap 2026. évi programstratégiája a vissza nem térítendő támogatások mellett állami társfinanszírozású kockázati tőkealapokat is tartalmaz.',
      honlap: 'https://www.mfb.hu/',
      sorok: [
        {
          nev: 'MFB Magyar Fejlesztési Bank Zrt.',
          megjegyzes: 'Állami fejlesztési bank; csoportjához tartozik a Hiventures, az MFB Invest és a Garantiqa Hitelgarancia. Hitelprogramjai az MFB Pontokon érhetők el.',
          url: 'https://www.mfb.hu/',
        },
        {
          nev: 'MFB Invest Zrt.',
          megjegyzes: '2006 óta; legalább 500 millió Ft tőkeigényű ügyletekben, főként kisebbségi tulajdonosként fektet be, 4–7 éves kilépéssel. A Hiventures 100%-os tulajdonosa.',
          url: 'https://www.mfb.hu/mfb-csoport/mfb-invest-zrt-s13',
        },
        {
          nev: 'Hiventures Zrt.',
          megjegyzes: 'Az MFB Csoport kockázatitőke-alapkezelője, 120+ aktív portfóliócéggel; 2026 februárjától kb. 17 Mrd Ft-os, uniós forrású alap korai fázisú startupoknak.',
          url: 'https://hiventures.hu/',
        },
        {
          nev: 'EXIM Invest Befektetési és Vagyonkezelő Zrt.',
          megjegyzes: 'Honlapja szerint nemzetközileg is versenyképes magyar társaságok fejlődését célzó tőkealapokból fektet be; a HVCA tagja.',
          url: 'https://eximinvest.hu/',
        },
        {
          nev: 'SEED társbefektetési alap (NKFI Alap)',
          megjegyzes: '2026-ban induló, 10 Mrd Ft-os tőkeprogram: matching fund szerkezetben, a piaci befektető hozza az ügyletet; korai fázisú mikro- és kisvállalkozásoknak.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Startup Factory (NKFI Alap)',
          megjegyzes: 'Állami–magán társbefektetési modellben működő technológiai inkubátorok programja, 2026-os kerete 6 Mrd Ft; a támogatott inkubátorok külön kártyán.',
          url: PROGRAMSTRATEGIA,
        },
      ],
      linkek: [
        { felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: PROGRAMSTRATEGIA },
        { felirat: 'Hiventures: új korai fázisú alap (2026. február)', url: 'https://hiventures.hu/uj-korai-fazisu-befektetesi-alapot-indit-a-hiventures/' },
      ],
    },
    {
      slug: 'kockazatitoke-alapok',
      tipus: 'lista',
      nev: 'Kockázatitőke-alapkezelők',
      osszefoglalo:
        'A hazai kockázati- és magántőke-iparág szakmai szervezete a Magyar Kockázati- és Magántőke Egyesület (HVCA), mintegy 70 taggal; taglistája és a magyar befektetések listája a honlapján érhető el. Az alábbi alapkezelők a HVCA tagjai; a lista válogatás a technológiai és növekedési befektetőkből, a leírások a saját honlapjuk közlései.',
      honlap: 'https://www.hvca.hu/',
      sorok: [
        {
          nev: 'Magyar Kockázati- és Magántőke Egyesület (HVCA)',
          megjegyzes: 'Közel 35 éve a hazai kockázati- és magántőke-iparág szakmai platformja, mintegy 70 taggal (befektetők, jogi, tanácsadói és pénzügyi szolgáltatók).',
          url: 'https://www.hvca.hu/',
        },
        {
          nev: 'Day One Capital',
          megjegyzes: 'Közép-kelet-európai alapítók technológiai cégeibe fektet be; budapesti iroda.',
          url: 'https://dayonecapital.com/',
        },
        {
          nev: 'PortfoLion Capital Partners',
          megjegyzes: 'Többfázisú befektető Közép-Kelet-Európában: kockázati tőke (pre-seed–seed, 0,5–3 M EUR), növekedési tőke és magántőke.',
          url: 'https://www.portfolion.com/',
        },
        {
          nev: 'Platina Capital Kockázati Tőkealap-kezelő Zrt.',
          megjegyzes: 'Korai, növekedési és érett szakaszú, elsősorban digitális innovatív cégekbe fektet be; korábbi neve Nukleus Kockázati Tőkealap-kezelő Zrt.',
          url: 'https://platinacapital.hu/',
        },
        {
          nev: 'Impact Ventures Zrt.',
          megjegyzes: 'Hatásbefektető: a pénzügyi eredmény mellett mérhető társadalmi vagy környezeti hatást célzó vállalkozásokba fektet be.',
          url: 'https://impactventures.hu/',
        },
        {
          nev: 'FundWise Zrt.',
          megjegyzes: '2008-ban alakult független kockázatitőke-alapkezelő; kb. 27 Mrd Ft kezelt vagyon, a régió kis- és középvállalataiba fektet be.',
          url: 'https://fundwise.hu/',
        },
        {
          nev: 'Széchenyi Alapok Zrt.',
          megjegyzes: '2011 óta; több mint 155 Mrd Ft tőkekeret, főként kkv- és nagyvállalati befektetések. Tulajdonosa a Rudolf Kalman Óbudai Egyetemért Alapítvány.',
          url: 'https://szta.hu/',
        },
      ],
      linkek: [{ felirat: 'A HVCA tagjai', url: 'https://www.hvca.hu/hu/tagok' }],
    },
    {
      slug: 'uzleti-angyalok',
      tipus: 'lista',
      nev: 'Üzleti angyal hálózatok',
      osszefoglalo:
        'A hazai angyalbefektetői közösség fő szervezete a HunBAN, amely pitch-eseményekkel, online bemutatkozásokkal és előszűrt startupokkal köti össze az alapítókat, a befektetőket és a mentorokat. Az NKFI Alap 2026. évi programstratégiája üzleti angyaloknak szóló garanciaprogramot is tartalmaz.',
      honlap: 'https://hunban.eu/',
      sorok: [
        {
          nev: 'HunBAN – Hungarian Business Angel Network',
          megjegyzes: 'Alapítókat, befektetőket és mentorokat összekötő hálózat: pitch-események, 60 perces online bemutatkozások, előszűrt startupok; budapesti iroda.',
          url: 'https://hunban.eu/',
        },
        {
          nev: 'Üzleti Angyal Garancia Program (NKFI Alap)',
          megjegyzes: 'Garanciatámogatás a nagy növekedési potenciálú, innovatív startupokba kockázati tőkével befektető üzleti angyaloknak; 2026-os keret 0,5 Mrd Ft.',
          url: PROGRAMSTRATEGIA,
        },
      ],
    },
    {
      slug: 'bankok-garanciaintezmenyek',
      tipus: 'lista',
      nev: 'Banki innovációfinanszírozás: fejlesztési bankok és garanciaintézmények',
      osszefoglalo:
        'A hitel- és garanciaoldali vállalati finanszírozás állami és állami hátterű szereplői. A konkrét hitel- és tőkeprogramok, köztük a GINOP Plusz pénzügyi eszközei, gyakran változnak, ezért az aktuális konstrukciókat mindig a kezelő honlapján vagy a palyazat.gov.hu-n érdemes ellenőrizni.',
      sorok: [
        {
          nev: 'MFB Magyar Fejlesztési Bank Zrt. – MFB Pontok',
          megjegyzes: 'Az állami fejlesztési bank hitelprogramjai a partnerbankok MFB Pont hálózatán keresztül igényelhetők.',
          url: 'https://www.mfb.hu/',
        },
        {
          nev: 'EXIM Magyarország',
          megjegyzes: 'Beruházási, forgóeszköz- és zöld hitel, garancia és exporthitel-biztosítás kkv-knak és nagyvállalatoknak, a belföldi és az exporttevékenységhez.',
          url: 'https://exim.hu/',
        },
        {
          nev: 'Garantiqa Hitelgarancia Zrt.',
          megjegyzes: '1992 óta kezességet vállal kkv-k hiteléhez, garanciájához, lízing- és faktoringügyleteihez; az MFB Csoport tagja.',
          url: 'https://garantiqa.hu/',
        },
        {
          nev: 'KAVOSZ – Széchenyi Kártya Program',
          megjegyzes: 'Kkv-hitelek: folyószámla-, likviditási és beruházási hitel, mikrohitel, lízing, agrár konstrukciók.',
          url: 'https://www.kavosz.hu/',
        },
        {
          nev: 'Pályázati portál (palyazat.gov.hu)',
          megjegyzes: 'Az uniós és hazai fejlesztési programok, köztük a GINOP Plusz hitel- és tőkeprogramjainak hivatalos közleményei.',
          url: 'https://www.palyazat.gov.hu/',
        },
      ],
    },
    {
      slug: 'inkubacios-vallalati-befektetok',
      tipus: 'lista',
      nev: 'Inkubációs, akcelerációs és vállalati (CVC) befektetők',
      osszefoglalo:
        'Az NKFI Alap Startup Factory programjában állami–magán társbefektetési modellben működő technológiai inkubátorok fektetnek be korai fázisú startupokba, és szakmai, üzleti tudást is adnak. A lista a 2023-as felhívás 12 támogatott inkubátora (NKFIH, 2023. december) a projekt címével, helyszínével és a támogatással. Önálló vállalati kockázatitőke-programokról (CVC) kevés nyilvános, ellenőrizhető adat érhető el, ezért ezek nem külön kártyán szerepelnek.',
      sorok: [
        { nev: 'Lunar Program Zrt.', megjegyzes: 'Lunar Program – Startup Factory Inkubációs Program; Budapest; 246,5 M Ft támogatás.' },
        { nev: 'White Unicorn Befektetési és Tanácsadó Kft.', megjegyzes: 'Inkubátorház főként egészségügyi és IT fókusszal (finanszírozás, matchmaking, szakmai inkubáció); Budapest; 250 M Ft.' },
        { nev: 'Nesprit Ventures Zrt.', megjegyzes: 'Inkubációs program; Budapest; kb. 250 M Ft.' },
        { nev: 'Virgo Ventures Technológiai Inkubátor Kft.', megjegyzes: 'Startup Factory Program II. (2024–2026); Budapest; 450 M Ft.' },
        { nev: 'Első Közép-Európai Hardver Akcelerátor Kft.', megjegyzes: 'Hardveres innovációs ökoszisztéma kialakítása; Bonyhád; 450 M Ft.' },
        { nev: 'STRT Invest Kft.', megjegyzes: 'STRT innovációs inkubátor; Budapest; 450 M Ft.' },
        { nev: 'BNL Start Partners Kft.', megjegyzes: 'Inkubátorprogram kezdő ötletgazdáknak és haladó innovatív vállalkozóknak; Miskolc, Egyetemváros; 450 M Ft.' },
        { nev: 'OXO Labs Üzletviteli és Tanácsadó Kft.', megjegyzes: 'Oxo Labs Startup Factory; Budapest; 450 M Ft.' },
        { nev: 'Startup Campus Inkubátor Zrt.', megjegyzes: 'Startup Campus – Ötlettől a nemzetközi piacig! 2.0; Debrecen; 450 M Ft.' },
        { nev: 'GUKA Energetikai Zrt.', megjegyzes: 'Startup Factory program az informatikai és zöld innovációk szolgálatában; Békéscsaba; kb. 900 M Ft.' },
        { nev: 'Creative Accelerator Kft.', megjegyzes: 'Élettudományi fókuszú inkubátorprogram; Szeged; kb. 900 M Ft.' },
        { nev: 'Védelmi Innovációs Kutatóintézet Nonprofit Zrt.', megjegyzes: 'VIRTUS – védelmi innovációs venture studio; Budapest; 500 M Ft (2023. december 18-i döntés).' },
      ],
      linkek: [
        { felirat: 'Startup Factory 2023: támogatott projektek (NKFIH)', url: 'https://nkfih.gov.hu/english/nrdi-fund/funded-projects-2023-113-startup' },
        { felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: PROGRAMSTRATEGIA },
      ],
    },
    {
      slug: 'deep-tech-finanszirozok',
      tipus: 'lista',
      nev: 'Deep tech finanszírozók',
      osszefoglalo:
        'A tudományos és mérnöki áttörésekre épülő technológiák finanszírozására 2026-ban külön állami tőkeprogram indult: a GINOP Plusz Technológia-specifikus Kockázati Tőkeprogramja kiválasztott alapkezelőkön keresztül fektet be. Európai szinten az Európai Innovációs Tanács (EIC) saját meghatározása szerint az egyik legnagyobb deep tech befektető; a magyar pályázóknak az NKFI Hivatal nemzeti kapcsolattartója ad tanácsot.',
      sorok: [
        {
          nev: 'Technológia-specifikus Kockázati Tőkeprogram (GINOP Plusz-2.5.2-26)',
          megjegyzes: 'Meghirdetve 2026. március 25.; 55,12 Mrd Ft, kb. 10 alapkezelő; 200–2000 M Ft-os befektetések deep tech kkv-kba, elsősorban TRL 6 fölött.',
          url: 'https://nkfih.gov.hu/english/szechenyi-plan-plus/technology-specific-venture-capital-programme-ginop-plusz-252-26',
        },
        {
          nev: 'Hiventures – a 2026-os korai fázisú alap',
          megjegyzes: 'A mintegy 17 Mrd Ft-os alap kiemelten a mesterséges intelligencia, a deeptech és az egészségügyi fejlesztések startupjait célozza.',
          url: 'https://hiventures.hu/uj-korai-fazisu-befektetesi-alapot-indit-a-hiventures/',
        },
        {
          nev: 'Európai Innovációs Tanács (EIC)',
          megjegyzes: 'Pathfinder, Transition, Accelerator, STEP Scale Up és az EIC Fund tőkebefektetései; magyar nemzeti kapcsolattartó: NKFI Hivatal.',
          url: 'https://eic.ec.europa.eu/index_en',
        },
      ],
      linkek: [
        {
          felirat: 'GINOP Plusz-2.5.2-26 közlemény (palyazat.gov.hu)',
          url: 'https://www.palyazat.gov.hu/kozlemenyek/megjelent-a-technologiaspecifikus-kockazati-tokeprogram-cimu-ginop-plusz-2-5-2-26-kodszamu-felhivas',
        },
      ],
    },
    {
      slug: 'egyetemi-poc-alapok',
      tipus: 'lista',
      nev: 'Egyetemi és proof-of-concept alapok',
      osszefoglalo:
        'Az egyetemi és kutatóintézeti eredmények hasznosítását célzó tőke- és támogatási programok. Az NKFI Alap 2026. évi programstratégiája élettudományi egyetemi kockázatitőke-alapot, a proof-of-concept szakaszt támogató felhívásokat és a technológiatranszfer-cégek (TTC) hálózatának fejlesztését is tartalmazza; egyetemi hátterű kockázatitőke-társaságként működik az Óbuda Uni Venture Capital.',
      sorok: [
        {
          nev: 'Life Sciences Catalyst Venture Capital Fund (NKFI Alap)',
          megjegyzes: '20 Mrd Ft; co-investment struktúrában fektet TRL 4 feletti élettudományi startupokba és spin-offokba, főként az egyetemi TTC-k portfóliójából.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Life Sciences Catalyst Program I–II. (NKFI Alap)',
          megjegyzes: 'Két felhívás, egyenként 5 Mrd Ft: a felfedező kutatástól a proof of conceptig, illetve a proof of concepttől a klinikai vizsgálatokig.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Technológiatranszfer-cégek (TTC) hálózatának fejlesztése (NKFI Alap)',
          megjegyzes: '6 Mrd Ft; új TTC-k létrehozása, a működők hálózatba szervezése (csomóponti TTC-k) és továbbfejlesztése.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'MEDTECH Kórházi Inkubátor Program (NKFI Alap)',
          megjegyzes: '2 Mrd Ft; a kórházakban és egészségügyi intézményekben született megoldások inkubálása a prototípustól a termékig és a piacig.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Óbuda Uni Venture Capital Zrt.',
          megjegyzes: '2023-ban alapította a Széchenyi Alapok, az Óbudai Egyetem és közös tulajdonosuk; rajta keresztül startupok is a befektetési célpontok közé kerültek.',
          url: 'https://szta.hu/rolunk/',
        },
      ],
      linkek: [{ felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: PROGRAMSTRATEGIA }],
    },
  ],
};

export default kategoria;

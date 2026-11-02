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
 *   uniós forrású kockázati tőkealap az MFB Csoporthoz tartozó Hiventures kezelésében, „a GINOP Plusz program részeként”;
 *   MI, deeptech, egészségügy) – https://hiventures.hu/ , https://hiventures.hu/uj-korai-fazisu-befektetesi-alapot-indit-a-hiventures/
 * - Az NKFI Alap 2026. évi programstratégiája (2025. november, a kormányváltás előtt; tervek: „2026-ban indul az előző
 *   évben előkészített SEED co-investment fund” 10 Mrd Ft, a Startup Factory 2026-os újraindítása 6 Mrd Ft, Üzleti Angyal
 *   Garancia Program 0,5 Mrd Ft, Life Sciences Catalyst Venture Capital Fund 20 Mrd Ft – „co-investment struktúrában …
 *   tervez” –, TTC-hálózat fejlesztése 6 Mrd Ft, MEDTECH kórházi inkubátor program 2 Mrd Ft; a Life Sciences Catalyst
 *   Program felhívásai 2025-ben jelentek meg, finanszírozásuk a 2026-os keretből) –
 *   https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026 (a PDF:
 *   https://nkfih.gov.hu/hivatalrol/hivatal-kiadvanyai/nkfia-programstrategia-2026 )
 * - NKFIH, aktuális felhívások (a SEED, az Üzleti Angyal Garancia Program, a Life Sciences Catalyst VC Fund és a Startup
 *   Factory 2026 nem szerepel köztük) – https://nkfih.gov.hu/palyazoknak/palyazatok/aktualis-felhivasok
 * - NKFIH, Korai fázisú kutatás-fejlesztési kockázati tőkeprogram (GINOP Plusz-2.5.1-25; meghirdetve 2025. december 11.;
 *   keret 18,12 Mrd Ft, két alap: kevésbé fejlett régiók 10,61 Mrd Ft, Budapest 6,33 Mrd Ft; elsősorban TRL 6 fölött;
 *   a végső kedvezményezettek kiválasztása „az állami alapkezelő kijelölését követően veszi kezdetét”) –
 *   https://nkfih.gov.hu/palyazoknak/szechenyi-terv-plusz/korai-fazisu-kutatas-fejlesztesi-kockazati-tokeprogram-ginop-plusz-251-25/palyazati-felhivas
 * - NKFIH, Technology-Specific Venture Capital Programme (GINOP Plusz-2.5.2-26; meghirdetve 2026. március 25.; keret
 *   55,12 Mrd Ft, „Number of applications 10”, „The fund managers to be selected …”, 200–2000 M Ft-os befektetések,
 *   elsősorban TRL 6 fölött) –
 *   https://nkfih.gov.hu/english/szechenyi-plan-plus/technology-specific-venture-capital-programme-ginop-plusz-252-26 ;
 *   a hazai közlemény (a hivatalos név: Technológiaspecifikus Kockázati Tőkeprogram):
 *   https://www.palyazat.gov.hu/kozlemenyek/megjelent-a-technologiaspecifikus-kockazati-tokeprogram-cimu-ginop-plusz-2-5-2-26-kodszamu-felhivas
 * - NKFIH-felhívások: Life Sciences Catalyst Program I. és II. (2025-1.1.3- és 2025-1.1.4-LIFE SCIENCES; meghirdetve 2025.
 *   október 6., beadás 2025. november 28.; keret 7,4 és 5,3 Mrd Ft) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/life-sciences-catalyst-program-celponttol-a-koncepcio-bizonyitasaig-2025-113-life-sciences-1/palyazati-felhivas ,
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/life-sciences-catalyst-program-koncepcio-bizonyitasatol-a-klinikai-vizsgalatokig-2025-114-life-sciences-2/palyazati-felhivas ;
 *   TTC-hálózat fejlesztése (2026-1.1.2-TTC; meghirdetve 2026. március 18., beadás április 16.; 6 Mrd Ft) –
 *   https://nkfih.gov.hu/palyazoknak/nkfi-alap/technologia-transzfer-vallalatok-halozatanak-fejlesztese-2026-112-ttc/palyazati-felhivas ;
 *   MEDTECH Kórházi Inkubátor Program (2026-1.1.1-MEDTECH; meghirdetve 2026. február 12., beadás március 31.; 2 Mrd Ft,
 *   2 pályamű) – https://nkfih.gov.hu/palyazoknak/nkfi-alap/medtech-korhazi-inkubator-program-2026-111-medtech/palyazati-felhivas
 * - NKFIH, a Startup Factory (2023-1.1.3-STARTUP) támogatott projektjei (2023. december 7. és 18.; 12 inkubátor,
 *   összesen 5,7 Mrd Ft; a cégnév „Startup Campus Inkubator Zrt.”) – https://nkfih.gov.hu/english/nrdi-fund/funded-projects-2023-113-startup
 * - Négy inkubátor saját honlapja: https://www.startupcampus.hu/ (Startup Factory 2023) , https://creativeaccelerator.hu/ ,
 *   https://www.whiteunicorn.hu/ (health/medtech és IT) , https://nesprit.vc/ (pre-seed, seed)
 * - HVCA, főoldal (közel 35 éve, mintegy 70 tag) és taglista; a tagok adatlapjai (honlapcímek; a Magyar Telekom csak
 *   „Társult tag”) – https://www.hvca.hu/ , https://www.hvca.hu/hu/tagok
 * - Az alapkezelők saját honlapjai: https://dayonecapital.com/ , https://www.portfolion.com/ , https://platinacapital.hu/ ,
 *   https://impactventures.hu/ , https://fundwise.hu/ , https://eximinvest.hu/ (a honlap leírása) ,
 *   https://szta.hu/rolunk/ (Széchenyi Alapok Zrt.: 2011 óta, 155+ Mrd Ft tőkekeret, 80+ portfóliócég, tulajdonos:
 *   Rudolf Kalman Óbudai Egyetemért Alapítvány; 2023-ban alapított Óbuda Uni Venture Capital Zrt.)
 * - HunBAN („a community of angel investors, incubators, and early-stage venture capital funds who are members of our
 *   association”) – https://hunban.eu/
 * - EXIM Magyarország (beruházási, forgóeszköz- és zöld hitel, garancia, exporthitel-biztosítás) – https://exim.hu/ ;
 *   Tőkealapok (a hazai és nemzetközi tőkealapok ügyében: „További információkért kérjük keresse fel az EXIM INVEST-et!”) –
 *   https://exim.hu/tokealapok/
 * - KAVOSZ, Széchenyi Kártya Program termékei – https://www.kavosz.hu/
 * - Európai Innovációs Tanács, főoldal („One of the largest deep tech investors in Europe”; Pathfinder, Transition,
 *   Accelerator, STEP Scale Up, EIC Fund) – https://eic.ec.europa.eu/index_en ; az EIC magyar NCP-je az NKFIH-ban:
 *   https://nkfih.gov.hu/hivatalrol/nemzetkozi-kapcsolatok/horizont-europa/nemzeti-kapcsolattarto-pontok
 *
 * ELLENŐRIZENDŐ:
 * - Az NKFI Alap 2026. évi programstratégiája 2025 novemberében, a 2026-os kormányváltás előtt készült: a SEED
 *   társbefektetési alap, az Üzleti Angyal Garancia Program, a Life Sciences Catalyst VC Fund és a Startup Factory 2026
 *   ezért „tervezett”; meghirdetésük és keretük a mai állapot szerint.
 * - Azonos-e a Hiventures 2026-os, „mintegy 17 Mrd Ft”-os (GINOP Plusz-forrású) alapja a GINOP Plusz-2.5.1-25 két
 *   alapjával (10,61 + 6,33 Mrd Ft, „állami alapkezelő”)? A kártya mindkettőt külön sorban, egymásra utalás nélkül közli.
 * - A GINOP Plusz-2.5.2-26 tőkeprogram alapkezelőinek kiválasztása (állás, nyertesek).
 * - A Széchenyi Alapok Zrt. tulajdonosa a közérdekű vagyonkezelő alapítványok megszüntetése miatt változhat.
 * - Az EXIM Invest és az EXIM tulajdonosi viszonya nem ellenőrzött (az EXIM tőkealap-oldala hozzá irányít, a HVCA
 *   „Befektetői tag”-ként tartja nyilván), ezért a kártya csak a kapcsolatot írja.
 * - A Nemzeti Tőkeholding (nth.hu) szerepe az állami kockázatitőke-alapok felett: a honlap tanúsítványhibája miatt nem
 *   volt ellenőrizhető, ezért kimaradt.
 * - A HunBAN EBAN-tagsága nem ellenőrzött (jogi formája: egyesület, a honlap szerint).
 * - Vállalati kockázati tőke (CVC): hivatalos forrásból ellenőrizhető hazai CVC-programot nem találtunk; a kártya ezt
 *   kimondja, és a 8. kategória nyílt innovációs programjaira utal – CVC-szereplővel bővítendő.
 */
import type { ForrasKategoria } from './tipusok';

const PROGRAMSTRATEGIA = 'https://nkfih.gov.hu/hivatalrol/kfi-szakpolitika/programstrategia-2026';

const kategoria: ForrasKategoria = {
  leiras: 'Állami és magán kockázati tőke, üzleti angyalok, fejlesztési bankok, deep tech és egyetemi alapok.',
  bevezeto:
    'Az innováció tőkeoldalának szereplői címtárszerűen: az állami és állami hátterű finanszírozók, a kockázatitőke-alapkezelők, az üzleti angyal hálózatok, a fejlesztési bankok és garanciaintézmények, az inkubációs és vállalati befektetők, a deep tech finanszírozók, valamint az egyetemi és proof-of-concept alapok. Az attasé itt találja meg, kihez irányíthatja a társbefektetőt kereső külföldi partnert, vagy honnan ered egy magyar startup finanszírozása. A lista nem befektetési tanács és nem értékelés; önálló vállalati kockázatitőke-programot (CVC) hivatalos forrásból nem azonosítottunk, az összegek a források közlései.',
  kartyak: [
    {
      slug: 'allami-finanszirozok',
      tipus: 'lista',
      nev: 'Állami és állami hátterű finanszírozók',
      osszefoglalo:
        'Az állami fejlesztési bank csoportja (MFB Csoport) és az NKFI Alap tőkeprogramjai állami forrásból fektetnek be korai fázisú innovatív cégekbe. Az MFB Csoporthoz tartozó Hiventures 2026 februárjában mintegy 17 milliárd forintos új kockázati tőkealapot indított; az NKFI Alap 2026. évi programstratégiája a vissza nem térítendő támogatások mellett állami társfinanszírozású kockázati tőkealapokat is tervez.',
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
          megjegyzes: 'Az MFB Csoport kockázatitőke-alapkezelője, 120+ aktív portfóliócéggel; 2026 februárjától kb. 17 Mrd Ft-os, uniós (GINOP Plusz) forrású alap korai fázisú startupoknak.',
          url: 'https://hiventures.hu/',
        },
        {
          nev: 'EXIM Invest Befektetési és Vagyonkezelő Zrt.',
          megjegyzes: 'Honlapja szerint nemzetközileg is versenyképes magyar társaságok fejlődését célzó tőkealapokból fektet be; az EXIM tőkealapjai ügyében az EXIM is hozzá irányít. A HVCA tagja.',
          url: 'https://eximinvest.hu/',
        },
        {
          nev: 'Korai fázisú kutatás-fejlesztési kockázati tőkeprogram (GINOP Plusz-2.5.1-25)',
          megjegyzes: 'Meghirdetve 2025. december 11.; 18,12 Mrd Ft, két alap (kevésbé fejlett régiók, Budapest); a befektetések az állami alapkezelő kijelölése után indulnak, elsősorban TRL 6 fölött.',
          url: 'https://nkfih.gov.hu/palyazoknak/szechenyi-terv-plusz/korai-fazisu-kutatas-fejlesztesi-kockazati-tokeprogram-ginop-plusz-251-25/palyazati-felhivas',
        },
        {
          nev: 'SEED társbefektetési alap (NKFI Alap)',
          megjegyzes: 'A 2026. évi programstratégiában (2025. november) tervezett 10 Mrd Ft-os tőkeprogram: matching fund szerkezetben, korai fázisú mikro- és kisvállalkozásoknak; az ügyletet a piaci befektető hozza.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Startup Factory (NKFI Alap)',
          megjegyzes: 'Állami–magán társbefektetési modellben működő technológiai inkubátorok programja; a 2026. évi programstratégia szerint újraindul, tervezett kerete 6 Mrd Ft. A 2023-as 12 inkubátor külön kártyán.',
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
        'Az angyalbefektetőket, inkubátorokat és korai fázisú alapokat tömörítő HunBAN egyesület pitch-eseményekkel, online bemutatkozásokkal és előszűrt startupokkal köti össze az alapítókat, a befektetőket és a mentorokat. Az NKFI Alap 2026. évi programstratégiája üzleti angyaloknak szóló garanciaprogramot is tervez.',
      honlap: 'https://hunban.eu/',
      sorok: [
        {
          nev: 'HunBAN – Hungarian Business Angel Network',
          megjegyzes: 'Alapítókat, befektetőket és mentorokat összekötő hálózat: pitch-események, 60 perces online bemutatkozások, előszűrt startupok; budapesti iroda.',
          url: 'https://hunban.eu/',
        },
        {
          nev: 'Üzleti Angyal Garancia Program (NKFI Alap)',
          megjegyzes: 'Garanciatámogatás a nagy növekedési potenciálú, innovatív startupokba kockázati tőkével befektető üzleti angyaloknak; a 2026. évi programstratégiában tervezett keret 0,5 Mrd Ft.',
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
      nev: 'Inkubációs és akcelerációs befektetők (Startup Factory); vállalati kockázati tőke',
      osszefoglalo:
        'Az NKFI Alap Startup Factory programjában állami–magán társbefektetési modellben működő technológiai inkubátorok fektetnek be korai fázisú startupokba, és szakmai, üzleti tudást is adnak. A lista a 2023-as felhívás 12 támogatott inkubátora (NKFIH, 2023. december) a projekt címével, helyszínével és a támogatással. Önálló hazai vállalati kockázatitőke-programot (CVC) hivatalos forrásból nem azonosítottunk; a nagyvállalati nyílt innovációs programokat a 8. kategória sorolja fel.',
      sorok: [
        { nev: 'Lunar Program Zrt.', megjegyzes: 'Lunar Program – Startup Factory Inkubációs Program; Budapest; 246,5 M Ft támogatás.' },
        {
          nev: 'White Unicorn Befektetési és Tanácsadó Kft.',
          megjegyzes: 'Inkubátorház főként egészségügyi és IT fókusszal (finanszírozás, matchmaking, szakmai inkubáció); Budapest; 250 M Ft.',
          url: 'https://www.whiteunicorn.hu/',
        },
        { nev: 'Nesprit Ventures Zrt.', megjegyzes: 'Inkubációs program; Budapest; kb. 250 M Ft.', url: 'https://nesprit.vc/' },
        { nev: 'Virgo Ventures Technológiai Inkubátor Kft.', megjegyzes: 'Startup Factory Program II. (2024–2026); Budapest; 450 M Ft.' },
        { nev: 'Első Közép-Európai Hardver Akcelerátor Kft.', megjegyzes: 'Hardveres innovációs ökoszisztéma kialakítása; Bonyhád; 450 M Ft.' },
        { nev: 'STRT Invest Kft.', megjegyzes: 'STRT innovációs inkubátor; Budapest; 450 M Ft.' },
        { nev: 'BNL Start Partners Kft.', megjegyzes: 'Inkubátorprogram kezdő ötletgazdáknak és haladó innovatív vállalkozóknak; Miskolc, Egyetemváros; 450 M Ft.' },
        { nev: 'OXO Labs Üzletviteli és Tanácsadó Kft.', megjegyzes: 'Oxo Labs Startup Factory; Budapest; 450 M Ft.' },
        {
          nev: 'Startup Campus Inkubator Zrt.',
          megjegyzes: 'Startup Campus – Ötlettől a nemzetközi piacig! 2.0; Debrecen; 450 M Ft.',
          url: 'https://www.startupcampus.hu/',
        },
        { nev: 'GUKA Energetikai Zrt.', megjegyzes: 'Startup Factory program az informatikai és zöld innovációk szolgálatában; Békéscsaba; kb. 900 M Ft.' },
        { nev: 'Creative Accelerator Kft.', megjegyzes: 'Élettudományi fókuszú inkubátorprogram; Szeged; kb. 900 M Ft.', url: 'https://creativeaccelerator.hu/' },
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
        'A tudományos és mérnöki áttörésekre épülő technológiák finanszírozására 2026 márciusában külön állami tőkeprogramot hirdettek meg: a GINOP Plusz Technológiaspecifikus Kockázati Tőkeprogramja a pályázaton kiválasztandó alapkezelőkön keresztül fektet be. Európai szinten az Európai Innovációs Tanács (EIC) saját meghatározása szerint az egyik legnagyobb deep tech befektető; a magyar pályázóknak az NKFI Hivatal nemzeti kapcsolattartója ad tanácsot.',
      sorok: [
        {
          nev: 'Technológiaspecifikus Kockázati Tőkeprogram (GINOP Plusz-2.5.2-26)',
          megjegyzes: 'Meghirdetve 2026. március 25.; 55,12 Mrd Ft; a pályázaton kiválasztandó (kb. 10) alapkezelőn át 200–2000 M Ft-os befektetések deep tech kkv-kba, elsősorban TRL 6 fölött.',
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
        'Az egyetemi és kutatóintézeti eredmények hasznosítását célzó tőke- és támogatási programok. A proof-of-concept szakaszt támogató Life Sciences Catalyst felhívások (2025), valamint a technológiatranszfer-cégek (TTC) és a kórházi inkubátorok 2026-os felhívásai lezárultak; az NKFI Alap 2026. évi programstratégiája élettudományi egyetemi kockázatitőke-alapot is tervez. Egyetemi hátterű kockázatitőke-társaságként működik az Óbuda Uni Venture Capital.',
      sorok: [
        {
          nev: 'Life Sciences Catalyst Venture Capital Fund (NKFI Alap)',
          megjegyzes: 'Tervezett, 20 Mrd Ft; co-investment struktúrában fektetne TRL 4 feletti élettudományi startupokba és spin-offokba, főként az egyetemi TTC-k portfóliójából.',
          url: PROGRAMSTRATEGIA,
        },
        {
          nev: 'Life Sciences Catalyst Program I–II. (NKFI Alap)',
          megjegyzes: 'Két felhívás (2025-1.1.3 és 2025-1.1.4-LIFE SCIENCES), beadás 2025. november 28-ig (lezárult); 7,4 és 5,3 Mrd Ft: a célponttól a koncepció bizonyításáig, onnan a klinikai vizsgálatokig.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/life-sciences-catalyst-program-celponttol-a-koncepcio-bizonyitasaig-2025-113-life-sciences-1/palyazati-felhivas',
        },
        {
          nev: 'Technológiatranszfer-cégek (TTC) hálózatának fejlesztése (2026-1.1.2-TTC)',
          megjegyzes: 'Meghirdetve 2026. március 18., beadás április 16-ig (lezárult); 6 Mrd Ft: új TTC-k megalapozása, a működők szintlépése és csomóponti TTC-k kialakítása.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/technologia-transzfer-vallalatok-halozatanak-fejlesztese-2026-112-ttc/palyazati-felhivas',
        },
        {
          nev: 'MEDTECH Kórházi Inkubátor Program (2026-1.1.1-MEDTECH)',
          megjegyzes: 'Meghirdetve 2026. február 12., beadás március 31-ig (lezárult); 2 Mrd Ft: kórházi megoldások inkubálása a prototípusig vagy a piacra vitelig.',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/medtech-korhazi-inkubator-program-2026-111-medtech/palyazati-felhivas',
        },
        {
          nev: 'Óbuda Uni Venture Capital Zrt.',
          megjegyzes: '2023-ban alapította a Széchenyi Alapok, az Óbudai Egyetem és közös tulajdonosuk; rajta keresztül startupok is a befektetési célpontok közé kerültek.',
          url: 'https://szta.hu/rolunk/',
        },
      ],
      linkek: [
        { felirat: 'Az NKFI Alap 2026. évi programstratégiája', url: PROGRAMSTRATEGIA },
        {
          felirat: 'Life Sciences Catalyst Program II. – felhívás (NKFIH)',
          url: 'https://nkfih.gov.hu/palyazoknak/nkfi-alap/life-sciences-catalyst-program-koncepcio-bizonyitasatol-a-klinikai-vizsgalatokig-2025-114-life-sciences-2/palyazati-felhivas',
        },
      ],
    },
  ],
};

export default kategoria;

/**
 * Mauritánia (MR) 2026-os profilja – részleges, kutatott vázlat, a relációs vezető pontosítja.
 * Források (hozzáférés: 2026-10-09, a [2026-10-12] jelölésűeké 2026-10-12):
 * - Alapadatok: IMF World Economic Outlook, 2025. október (IMF Data, WEO_2025_OCT_VINTAGE adatfolyam) –
 *   https://data.imf.org/Datasets/WEO ; lekérdezés:
 *   https://api.imf.org/external/sdmx/2.1/data/IMF.RES,WEO_2025_OCT_VINTAGE,1.0.0/MRT.NGDPD+NGDPDPC+NGDP_RPCH+LP.A?startPeriod=2025&endPeriod=2025
 *   (GDP 11,953 Mrd USD; GDP/fő 2582,099 USD; reálnövekedés 3,953%; lakosság 4,629 millió – 2025, becslés).
 * - Terület: CIA World Factbook (2025. szeptember 17-i állapot: 1 030 700 km²) –
 *   https://www.cia.gov/the-world-factbook/countries/mauritania/ (a Factbook 2026-ban megszűnt; archív: web.archive.org,
 *   2025-11-20-i page-data.json); Világbank AG.SRF.TOTL.K2 ugyanennyi.
 * - GII 2025 (131. hely; 2024: 126.; erősségek, gyengeségek): https://www.wipo.int/edocs/gii-ranking/2025/mr.pdf
 * - GERD: UNESCO UIS, 2018: 0,0102% – https://api.uis.unesco.org/api/public/data/indicators?indicator=EXPGDP.TOT&geoUnit=MRT
 *   (Világbank GB.XPD.RSDV.GD.ZS ugyanez).
 * - Intézmények: Felsőoktatási és Tudományos Kutatási Minisztérium, ANRSI – https://www.mesrs.gov.mr/en/scientific-research ;
 *   állami felsőoktatási intézmények – https://www.mesrs.gov.mr/fr/etablissements?type=public (és &page=2) ; IMROP – https://www.imrop.mr/ ,
 *   új nouakchotti székház (2024. 12. 05.) –
 *   https://www.imrop.mr/nouveau-siege-de-linstitut-mauritanien-de-recherches-oceanographiques-et-des-peches-a-nouakchott/ [2026-10-12] ;
 *   ESP – https://www.esp.mr/ ; INRSP – https://www.inrsp.mr/ ; digitális tárca, Nemzeti Digitális Átalakítási Agenda 2022–2025,
 *   MI-konzultáció – https://www.mtnima.gov.mr/fr ; startup-törvény (2024-002.) – https://mtnima.gov.mr/fr/loi-de-startup/
 * - Gazdaság: SNIM (2025-ös adatok; 2024–2045-ös stratégia) – https://www.snim.com/ ; Greater Tortue Ahmeyim LNG –
 *   https://www.kosmosenergy.com/greater-tortue/ ; Project Nour – https://chariotenergygroup.com/operations/green-hydrogen/
 * - EU és multilaterális: Horizont Európa (nem társult, automatikusan finanszírozható alacsony és közepes jövedelmű ország) –
 *   https://ec.europa.eu/info/funding-tenders/opportunities/docs/2021-2027/common/guidance/list-3rd-country-participation_horizon-euratom_en.pdf ;
 *   PRIMA (nem résztvevő) – https://prima-med.org/participating-states/ ; Team Europe, 2024-es közös nyilatkozat –
 *   https://international-partnerships.ec.europa.eu/countries/mauritania_en ; zöldhidrogén Team Europe-kezdeményezés (2023) –
 *   https://ec.europa.eu/commission/presscorner/detail/en/ip_23_5268 ; halászati partnerség –
 *   https://oceans-and-fisheries.ec.europa.eu/fisheries/international-agreements/sustainable-fisheries-partnership-agreements-sfpas/mauritania_en ;
 *   a jegyzőkönyv megújításáról folyó tárgyalások állása 2026 júniusában (a Tanács 10711/26. sz. dokumentuma, Lettország tájékoztatója) –
 *   https://data.consilium.europa.eu/doc/document/ST-10711-2026-INIT/en/pdf [2026-10-12] ;
 *   Afrikai Unió – https://au.int/en/member_states/countryprofiles2 ; algériai felsőoktatási program (2025) – https://www.mesrs.gov.mr/en/article/27 ;
 *   YÖK-memorandum (2026) és brazil ösztöndíjak – https://www.mesrs.gov.mr/fr
 * - Magyar vonatkozás: tiszteletbeli konzul Nouakchottban – https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/mauritania ,
 *   https://rabat.mfa.gov.hu/hu/kapcsolat ; a Magyarországra kijelölt, berlini székhelyű mauritániai nagykövet kinevezéséhez adott
 *   hozzájárulás (276/2025. (X. 30.) KE határozat) – https://njt.jog.gov.hu/jogszabaly/2025-276-30-76 ;
 *   Stipendium Hungaricum: a 281/2019. (XI. 25.) Korm. rendelet partnerlistáján szerepel (40.) – https://njt.jog.gov.hu/jogszabaly/2019-281-20-22 ,
 *   de a program partnerországai között nem – https://stipendiumhungaricum.hu/partners/ ; a Nemzeti Jogszabálytár címkeresése (2026-10-09)
 *   nem ad kétoldalú magyar–mauritániai szerződést.
 * Kimaradt blokkok és mezők: a Programok és a Rendezvények blokk (nincs ellenőrizhető tartalom); a kfiRendszer blokk stratégia,
 * prioritások, egyéb prioritás és egyéb iparág mezője (hatályos nemzeti KFI-stratégia és hivatalos KFI-prioritás nem ismert; a kiemelt
 * iparágak a vállalati blokk kiemelt ágazatait követik); az intezmenyek.infrastrukturak, a vallalati.klaszterek és vallalati.technologiatranszfer, a magyarKapcsolatok.egyezmeny és
 * a magyarErtekeles.joGyakorlatok mező. A minisztérium honlapjának egyes számszerű kutatási adatai és jogszabálylistája nem
 * ellenőrizhetők, ezért kimaradtak.
 */
import type { DemoOrszag } from '../tipusok';

const orszag: DemoOrszag = {
  kod: 'MR',
  profil: {
    alapadatok: {
      fovaros: 'Nouakchott',
      terulet: '1 030 700',
      penznem: 'mauritániai ouguiya (MRU)',
      lakossag: '4 629 000',
      gdp: '12,0',
      gdpEgyFore: '2 582',
      gdpNovekedes: '4,0',
      adatEv: '2025',
      forras: 'IMF World Economic Outlook (2025. október); terület: CIA World Factbook (archív)',
      tagsagok: ['Afrikai Unió', 'Arab Liga'],
      tagsagEgyeb: 'Iszlám Együttműködési Szervezet, Arab Maghreb Unió',
      agazatok: ['Bányászat és nyersanyagok', 'Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      agazatEgyeb: 'Halászat, vasércbányászat (SNIM), tengeri földgáz (Greater Tortue Ahmeyim LNG, 2025-től)',
    },
    kfiRendszer: {
      teljesitmeny:
        'A Global Innovation Index 2025-ben a 131. hely a 139 gazdaság között (2024-ben a 126.); a WIPO szerint fejlettségi szintje alatt teljesít, '
        + 'az alsó-közepes jövedelmű országok átlaga alatt van minden pillérben, a szubszaharai átlagot a humántőke és kutatás, valamint az '
        + 'infrastruktúra pillérben meghaladja. A legutóbbi K+F-adat a GDP 0,01%-a (2018, UNESCO UIS).',
      gerd: '0,01',
      kiemeltIparagak: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      erossegek:
        'A GII 2025 szerint kiemelkedő a beruházási ráta (5. hely), az ifjúsági demográfiai osztalék (8.), a működőtőke-beáramlás (9.) és a természettudományi '
        + 'és mérnöki diplomások aránya (9.). A Szenegállal közös Greater Tortue Ahmeyim LNG-projekt 2025-ben kezdte meg az exportot; '
        + 'zöldhidrogén-projektek tervezés alatt (pl. Project Nour).',
      kihivasok:
        'A GII 2025 gyengeségei: rendkívül alacsony K+F-ráfordítás (114. hely), kevés nemzetközi szabadalmi bejelentés (PCT: 109.), '
        + 'csekély szellemitulajdon-bevétel (127.) és gyenge elektronikus kormányzati szolgáltatások (138.); hatályos nemzeti KFI-stratégia nem ismert.',
    },
    intezmenyek: {
      iranyitoSzervek:
        'Felsőoktatási és Tudományos Kutatási Minisztérium (MESRS) – felsőoktatás- és kutatáspolitika.\n'
        + 'Nemzeti Tudományos Kutatási és Innovációs Ügynökség (ANRSI) – kutatásfinanszírozás, innováció, nemzetközi együttműködés.\n'
        + 'Digitális Átalakításért, Innovációért és Közigazgatás-korszerűsítésért Felelős Minisztérium – digitális agenda, startup-törvény, MI-program.',
      egyetemek:
        'Université de Nouakchott, Université de Nouadhibou (2024), Université des Sciences Islamiques d’Aïoun, École Supérieure Polytechnique, '
        + 'ISET Rosso (agrár- és élelmiszeripar), Institut Supérieur du Numérique, Institut Supérieur des Sciences de la Mer (Nouadhibou).',
      kutatokozpontok:
        'IMROP (Institut Mauritanien de Recherches Océanographiques et des Pêches) – óceánkutatás és halászati kutatás (hagyományos székhelye '
        + 'Nouadhibou; 2024 decembere óta új székháza van Nouakchottban); INRSP (Nouakchott) – népegészségügyi kutatóintézet.',
    },
    vallalati: {
      kiemeltAgazatok: ['Energetika és fenntarthatóság', 'Agrár- és élelmiszeripar'],
      agazatEgyeb: 'Vasércbányászat, tengeri földgáz (LNG), halászat',
      topVallalatok: 'SNIM (Société Nationale Industrielle et Minière)',
      startupok:
        'A technológiai és innovatív startupokról szóló 2024-002. sz. törvény megteremtette a startup-minősítés jogi keretét.',
    },
    nemzetkoziKapcsolatok: {
      partnerorszagok:
        'Franciaország, Németország és Spanyolország (Team Europe), Algéria (felsőoktatási végrehajtási program 2025–2027), '
        + 'Törökország (egyetemi együttműködési memorandum a YÖK-kel, 2026), Brazília (mester- és doktori ösztöndíjak).',
      euMultilateralis:
        'Az Afrikai Unió alapító tagja, az Arab Liga tagja. A Horizont Európában nem társult, de automatikusan finanszírozható ország; a PRIMA-nak '
        + 'nem résztvevője. Az EU 2014–2024 között több mint 1 milliárd eurót fordított Mauritániára; 2023-ban zöldhidrogén Team Europe-kezdeményezés '
        + 'indult, 2024-ben közös nyilatkozat született; a halászati jegyzőkönyv 2026. november 14-ig érvényes (megújításáról 2026-ban tárgyalások folytak; '
        + '2026 júniusáig megállapodás nem született).',
    },
    magyarKapcsolatok: {
      ketoldalu:
        'Kétoldalú TéT-egyezmény nem ismert. Magyarországnak Nouakchottban tiszteletbeli konzulja van (a rabati magyar nagykövetség '
        + 'konzuli hálózatában). Mauritánia Magyarországra kijelölt nagykövete berlini székhelyű (kinevezéséhez a köztársasági '
        + 'elnök 2025 októberében hozzájárult).',
      mobilitas:
        'A Stipendium Hungaricum-megállapodásról szóló 281/2019. Korm. rendelet a lehetséges partnerek között felsorolja Mauritániát, '
        + 'a program partnerországai között azonban nem szerepel (2026).',
    },
    magyarErtekeles: {
      osszegzes:
        'Mauritánia KFI-rendszere kezdeti szakaszban van (GII 2025: 131., K+F-ráfordítás 0,01%), a magyar–mauritániai TéT-kapcsolatok '
        + 'nem intézményesültek. Belépési pont lehet a halászati és tengerkutatás, a bányászat, az energetika és a közös Horizont Európa-pályázat.',
      egyuttmukodesiLehetosegek:
        'Halászati és tengerkutatás (IMROP), agrár- és élelmiszeripari képzés és kutatás (ISET Rosso), népegészségügy (INRSP), bányászati és geológiai '
        + 'szakértelem; közös részvétel afrikai partnerekkel nyitott Horizont Európa-felhívásokban.',
      diplomaciaiPrioritasok:
        'A Stipendium Hungaricum-partnerség aktiválásának kezdeményezése; '
        + 'kapcsolatépítés az MESRS-szel és az ANRSI-vel a rabati nagykövetségre és a nouakchotti tiszteletbeli konzulra építve; '
        + 'magyar egyetemek bevonása a mauritániai felsőoktatási partnerkeresésbe.',
    },
  },
};

export default orszag;

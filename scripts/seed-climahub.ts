/**
 * scripts/seed-climahub.ts
 * Futás: npx tsx scripts/seed-climahub.ts
 * Idempotens: ha már van adat a products táblában, kilép.
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Hiányzik a SUPABASE_URL vagy SUPABASE_SERVICE_ROLE_KEY a .env fájlból.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

// --- Adatok ---

const products = [
  {
    name: 'Mitsubishi Electric MSZ-AP25VGK',
    brand: 'Mitsubishi Electric',
    category: 'klíma',
    description: 'Energiatakarékos inverteres klímaberendeés, A+++ energiaosztály, Wi-Fi vezérléssel. Ideális 20-25 m²-es helyiségekhez.',
    price_min: 280000,
    price_max: 340000,
    image_url: null,
    affiliate_url: 'https://www.mitsubishi-electric.hu',
    published: true,
    published_at: new Date('2026-03-10').toISOString(),
  },
  {
    name: 'Daikin FTXM35R',
    brand: 'Daikin',
    category: 'hőszivattyú',
    description: 'Levegő-levegő hőszivattyú rendszer, COP 4.0, -15°C-ig hatékonyan működik. Alacsony fagyasztószerrel.',
    price_min: 450000,
    price_max: 520000,
    image_url: null,
    affiliate_url: 'https://www.daikin.hu',
    published: true,
    published_at: new Date('2026-03-15').toISOString(),
  },
  {
    name: 'Bosch Compress 3000 AWS',
    brand: 'Bosch',
    category: 'hőszivattyú',
    description: 'Levegő-víz hőszivattyú, központi fűtésre köthető. SCOP 3.8, csendes külső egység, kompakt beltéri egységgel.',
    price_min: 680000,
    price_max: 780000,
    image_url: null,
    affiliate_url: 'https://www.bosch-climate.hu',
    published: true,
    published_at: new Date('2026-02-20').toISOString(),
  },
  {
    name: 'Samsung WindFree AR09TXEAAWKNEU',
    brand: 'Samsung',
    category: 'klíma',
    description: 'WindFree technológiával hűti a legtöbb légáramlat nélkül. 2.5 kW, A++ energiaosztály, SmartThings integráció.',
    price_min: 220000,
    price_max: 260000,
    image_url: null,
    affiliate_url: 'https://www.samsung.com/hu',
    published: true,
    published_at: new Date('2026-01-25').toISOString(),
  },
  {
    name: 'Philips Hue Starter Kit E27',
    brand: 'Philips',
    category: 'okos_otthon',
    description: 'Okos otthon kezdőcsomag: 3 db E27 színes okosíző + Hue Bridge. 16 millió szín, hangvezérlés Alexa/Google kompatibilis.',
    price_min: 45000,
    price_max: 55000,
    image_url: null,
    affiliate_url: 'https://www.philips-hue.com/hu-hu',
    published: true,
    published_at: new Date('2026-02-05').toISOString(),
  },
  {
    name: 'LG Artcool Gallery AC12BK',
    brand: 'LG',
    category: 'klíma',
    description: 'Festménykeret kialakítású design klíma, A+++ energiaosztály, ThinQ Wi-Fi vezérlés, cserebetét panellel personalizálható.',
    price_min: 310000,
    price_max: 380000,
    image_url: null,
    affiliate_url: 'https://www.lg.com/hu',
    published: true,
    published_at: new Date('2026-03-01').toISOString(),
  },
]

const news = [
  {
    title: 'Rekordszinten a hőszivattyú-telepítések száma Magyarországon 2025-ben',
    summary: 'A Magyar Hőszivattyú Szövetség adatai szerint 2025-ben 42 000 hőszivattyú került beszerélésre, ami 28%-os növekedést jelent az előző évhez képest. Az állami támogatás kibővítése jélentősen hozzájárult a növekedéshez.',
    source_url: 'https://www.portfolio.hu/uzlet/20250310/rekordszinten-a-hoszivattyuk-szama-magyarorszagon-578234.html',
    source_name: 'Portfolio.hu',
    image_url: null,
    category: 'hőszivattyú',
    published_at: new Date('2025-03-10').toISOString(),
  },
  {
    title: 'Az EU 2026-tól betiltja a magas GWP-jű hűtőközegeket az új klímaberendeézsekben',
    summary: 'Az Európai Unió F-gáz rendelete értelmében 2026. január 1-jétől az új háztartási klímaberendeézsekbe csak alacsony GWP-jű hűtőközeget szabad töltésre használni. Ez érinti az R-32 és R-290 (propan) rendszereket.',
    source_url: 'https://www.hvgklima.hu/eu-fgaz-rendelet-2026-klima-hutokozeg',
    source_name: 'HVG Klíma',
    image_url: null,
    category: 'klíma',
    published_at: new Date('2025-11-18').toISOString(),
  },
  {
    title: 'Okos otthon eszközök 2026: ezek a legnépszerűbb termékek',
    summary: 'Az év első negyedévének eladási adatai alapján a háztartási okoseszközök piacán a hőmérséklet-vezérlők és az okos termosztátok vezeték: a Nest és a Tado+ eszközök együtt a piac 38%-át teszik ki.',
    source_url: 'https://www.techmonitor.hu/okos-otthon-2026-top-termekek',
    source_name: 'TechMonitor.hu',
    image_url: null,
    category: 'okos_otthon',
    published_at: new Date('2026-01-30').toISOString(),
  },
  {
    title: 'Mitsubishi Electric és Daikin áremelés: mit várjunk 2026-ban?',
    summary: 'Európai elosztóik értesítései szerint a gyártók 5-12%-os nagykereskedelmi áremelsést terveznek, elsősorban az euró-jen árfolyam-változás és az alkatrészhyány miatt. A fogyasztói árak várhatóan 2026 második negyedévére nőnek.',
    source_url: 'https://www.klima.lap.hu/mitsubishi-daikin-aremeles-2026',
    source_name: 'Klima.lap.hu',
    image_url: null,
    category: 'klíma',
    published_at: new Date('2026-02-14').toISOString(),
  },
  {
    title: 'Geotermikus hőszivattyú program: 10 milliárd forint támogatás kis- és középvállalatoknak',
    summary: 'Az Energiaügyi Minisztérium új pályázatot hirdetett geotermikus hőszivattyú-rendszerek telepítésére. KKV-k legföljebb 12 millió forintot igényelhetnek vissza nem téríténkenő támogatásként.',
    source_url: 'https://www.energiainfo.hu/geotermikus-hoszivattyuprog-kkv-palyazat-2026',
    source_name: 'EnergiaInfo.hu',
    image_url: null,
    category: 'hőszivattyú',
    published_at: new Date('2026-03-22').toISOString(),
  },
  {
    title: 'Matter 1.3 szabvány: minden főbb gyártó csatlakozott',
    summary: 'Az Apple, Google, Amazon és Samsung megerősítette, hogy új okos otthon eszközeik támogatják a Matter 1.3-at. Ez egységes interoperabilitást tesz lehetővé klímavérlélók, érzékelők és hőszabalyozók között.',
    source_url: 'https://www.hwsw.hu/hirek/matter-1-3-okosotthon-interoperabilitas-2026',
    source_name: 'HWSW.hu',
    image_url: null,
    category: 'okos_otthon',
    published_at: new Date('2026-04-01').toISOString(),
  },
]

// --- Fő függvény ---

async function seed() {
  console.log('🌱 ClimaHub seed indul...')

  // Idempotens ellenőrzés
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Hiba a products tábla ellenőrzésekor:', countError.message)
    process.exit(1)
  }

  if ((count ?? 0) > 0) {
    console.log(`⚠️  Már van ${count} termék az adatbázisban. Seed nem fut le újra.`)
    process.exit(0)
  }

  // Termékek beszúrása
  const { error: productsError } = await supabase.from('products').insert(products)
  if (productsError) {
    console.error('❌ Hiba termékek beszúrásakor:', productsError.message)
    process.exit(1)
  }
  console.log(`✅ ${products.length} termék beszúrása sikeres.`)

  // Hírek beszúrása
  const { error: newsError } = await supabase.from('news').insert(news)
  if (newsError) {
    console.error('❌ Hiba hírek beszúrásakor:', newsError.message)
    process.exit(1)
  }
  console.log(`✅ ${news.length} hír beszúrása sikeres.`)

  console.log('\n🎉 Seed kész! Az adatbázis feltöltve.')
  process.exit(0)
}

seed()

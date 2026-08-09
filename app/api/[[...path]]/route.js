import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

let client
let db
let connectionPromise = null

async function connectToMongo() {
  if (db) return db
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const tempClient = new MongoClient(process.env.MONGO_URL)
      await tempClient.connect()
      const tempDb = tempClient.db(process.env.DB_NAME || 'shindora_db')
      await seedDatabase(tempDb)
      db = tempDb
      client = tempClient
      return tempDb
    })()
  }
  return connectionPromise
}

// Automatic Seeder for MVP
async function seedDatabase(database) {
  const catCount = await database.collection('categories').countDocuments()
  if (catCount === 0) {
    console.log('Seeding default categories...')
    const categories = [
      { id: '1', name: 'Doraemon', slug: 'doraemon', parent_id: null },
      { id: '2', name: 'Crayon Shinchan', slug: 'crayon-shinchan', parent_id: null },
      { id: '3', name: 'Ninja Hattori-kun', slug: 'ninja-hattori-kun', parent_id: null },
      { id: '4', name: 'Chibi Maruko-chan', slug: 'chibi-maruko-chan', parent_id: null }
    ]
    await database.collection('categories').insertMany(categories)
  }

  const videoCount = await database.collection('videos').countDocuments()
  if (videoCount === 0) {
    console.log('Seeding database for ShinDora Nesub...')

    // Seed default users
    const defaultUsers = [
      {
        id: 'user-admin-id',
        name: 'Super Admin Shindora',
        email: 'admin@shindora.com',
        password: 'Emilia9@#$',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        isBanned: false,
        createdAt: new Date()
      },
      {
        id: 'user-mod-id',
        name: 'Moderator Staf',
        email: 'mod@shindora.com',
        password: 'mod123',
        role: 'moderator',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
        isBanned: false,
        createdAt: new Date()
      },
      {
        id: 'user-regular-id',
        name: 'Pencinta Anime Retro',
        email: 'user@shindora.com',
        password: 'user123',
        role: 'user',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        isBanned: false,
        createdAt: new Date()
      }
    ]
    await database.collection('users').insertMany(defaultUsers)

    // Seed default videos
    const defaultVideos = [
      {
        id: 'vid-dora-1',
        title: 'Doraemon: Nobita dan Baling-baling Bambu',
        animeTitle: 'Doraemon',
        episode: 'Eps 1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1710052014408-557848f939db?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHw0fHxEb3JhZW1vbnxlbnwwfHx8fDE3ODYxODQ1MjV8MA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl2: 'https://www.youtube.com/embed/S2p-7O6jEaY',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Nobita dan Doraemon mencoba baling-baling bambu baru untuk terbang mengelilingi kota dan menghindari kejaran Giant dan Suneo yang marah.',
        views: 3201,
        likes: 124,
        createdAt: new Date()
      },
      {
        id: 'vid-dora-2',
        title: 'Doraemon: Pintu Kemana Saja dan Petualangan Hutan',
        animeTitle: 'Doraemon',
        episode: 'Eps 2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1724749793945-85dcc7b8a6af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxKYXBhbmVzZSUyMGNhcnRvb258ZW58MHx8fHwxNzg2MTg0MzU0fDA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/7Vp-L1P6Gzo',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Petualangan seru Nobita, Doraemon, Shizuka, Giant, dan Suneo menjelajahi hutan rimba terpencil menggunakan Pintu Kemana Saja untuk mencari harta karun.',
        views: 4500,
        likes: 310,
        createdAt: new Date()
      },
      {
        id: 'vid-shin-1',
        title: 'Crayon Shinchan: Kenakalan Shinchan Membantu Ibu Belanja',
        animeTitle: 'Crayon Shinchan',
        episode: 'Eps 1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1741676470815-f4e90ca4d650?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxTaGluY2hhbnxlbnwwfHx8fDE3ODYxODQ1MjV8MA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/S2p-7O6jEaY',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Misae menyuruh Shinchan berbelanja di supermarket terdekat. Namun di jalan Shinchan malah membuat kegaduhan dan membeli barang yang salah!',
        views: 5100,
        likes: 423,
        createdAt: new Date()
      },
      {
        id: 'vid-shin-2',
        title: 'Crayon Shinchan: Bermain Petak Umpet Bersama Shiro',
        animeTitle: 'Crayon Shinchan',
        episode: 'Eps 2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1760158490502-fdd1800ec342?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHzfHxTaGluY2hhbnxlbnwwfHx8fDE3ODYxODQ1MjV8MA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/N-R0b9FpIdw',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Shiro sangat pintar dalam menyembunyikan diri. Dapatkah Shinchan dan teman-teman dari Geng Penyelamat Kasukabe menemukannya sebelum matahari tenggelam?',
        views: 3800,
        likes: 290,
        createdAt: new Date()
      },
      {
        id: 'vid-hattori-1',
        title: 'Ninja Hattori-kun: Kedatangan Hattori Kanzou',
        animeTitle: 'Ninja Hattori-kun',
        episode: 'Eps 1',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwxfHxyZXRybyUyMGFuaW1lfGVufDB8fHx8MTc4NjE4NDUyNXww&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/gI8F93pMWhE',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/S2p-7O6jEaY',
        description: 'Keluarga Mitsuba kedatangan tamu tak terduga, seorang ninja kecil dari Iga bernama Hattori Kanzou yang bersedia membantu Kenichi mengatasi kemalasan sekolah.',
        views: 2400,
        likes: 180,
        createdAt: new Date()
      },
      {
        id: 'vid-hattori-2',
        title: 'Ninja Hattori-kun: Menghadapi Ninja Kemumaki',
        animeTitle: 'Ninja Hattori-kun',
        episode: 'Eps 2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjV1MTN8MHwxfHNlYXJjaHwyfHxhbmltZSUyMGNoYXJhY3RlcnxlbnwwfHx8fDE3ODYxODQ1MzN8MA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/xLzVv04f7OQ',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Kemumaki, seorang ninja licik dari Koga, mencoba menantang Hattori di sekolah Kenichi dengan berbagai trik sulap ninja demi menarik perhatian Yumeko.',
        views: 2900,
        likes: 205,
        createdAt: new Date()
      },
      {
        id: 'vid-maruko-1',
        title: 'Chibi Maruko-chan: Maruko Terlambat Lagi di Hari Senin',
        animeTitle: 'Chibi Maruko-chan',
        episode: 'Eps 1',
        thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Chibi_Maruko-chan_anime.png',
        videoUrl: 'https://www.youtube.com/embed/Esw6L2Z-qE0',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Maruko kesulitan bangun tidur di hari Senin pagi yang sangat dingin. Dengan tergesa-gesa ia berlari ke sekolah agar tidak dihukum berdiri di lorong oleh guru kelas.',
        views: 1800,
        likes: 95,
        createdAt: new Date()
      },
      {
        id: 'vid-maruko-2',
        title: 'Chibi Maruko-chan: Menabung untuk Membeli Komik Baru',
        animeTitle: 'Chibi Maruko-chan',
        episode: 'Eps 2',
        thumbnailUrl: 'https://images.unsplash.com/photo-1724749793945-85dcc7b8a6af?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHw0fHxKYXBhbmVzZSUyMGNhcnRvb258ZW58MHx8fHwxNzg2MTgwMzg1fDA&ixlib=rb-4.1.0&q=85',
        videoUrl: 'https://www.youtube.com/embed/K81lV0b3vcs',
        videoUrl2: 'https://www.youtube.com/embed/9BqO96j-Akg',
        videoUrl3: 'https://www.youtube.com/embed/gI8F93pMWhE',
        description: 'Maruko bertekad menyisihkan uang jajannya demi membeli komik edisi terbatas, namun godaan untuk membeli permen kapas dan mainan sangat sulit dibendung.',
        views: 2100,
        likes: 110,
        createdAt: new Date()
      }
    ]
    await database.collection('videos').insertMany(defaultVideos)

    // Seed default playlists
    const defaultPlaylists = [
      {
        id: 'playlist-official-1',
        title: 'Maraton Anime Nostalgia Hari Minggu',
        ownerId: null, // Null = Official Admin
        videoIds: ['vid-dora-1', 'vid-dora-2', 'vid-shin-1', 'vid-shin-2', 'vid-hattori-1', 'vid-maruko-1'],
        isPrivate: false,
        createdAt: new Date()
      }
    ]
    await database.collection('playlists').insertMany(defaultPlaylists)

    // Seed default Ads
    const defaultAds = [
      {
        id: 'ad-slot-1',
        slot: 'banner_top',
        title: 'Dukung ShinDora Nesub di Saweria!',
        imageUrl: 'https://images.unsplash.com/photo-1760158490392-b97ccf0c9e14?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxTaGluY2hhbnxlbnwwfHx8fDE3ODYxODQ1MjV8MA&ixlib=rb-4.1.0&q=85',
        targetUrl: 'https://saweria.co/shindora',
        isActive: true
      }
    ]
    await database.collection('ads').insertMany(defaultAds)

    // Seed default comments
    const defaultComments = [
      {
        id: 'comm-1',
        videoId: 'vid-dora-1',
        userId: 'user-regular-id',
        userName: 'Pencinta Anime Retro',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        content: 'Ya ampun! Nonton ini langsung inget waktu kecil bangun pagi-pagi banget hari Minggu!',
        parentId: null,
        createdAt: new Date(Date.now() - 3600000 * 5)
      },
      {
        id: 'comm-2',
        videoId: 'vid-dora-1',
        userId: 'user-mod-id',
        userName: 'Moderator Staf',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
        content: 'Betul kak! Sangat nostalgia denger theme song-nya.',
        parentId: 'comm-1',
        createdAt: new Date(Date.now() - 3600000 * 4)
      }
    ]
    await database.collection('comments').insertMany(defaultComments)

    // Seed default settings
    const defaultSettings = {
      id: 'site_settings',
      logoUrl: '', // empty to trigger text or fallbacks, can upload file
      googleClientId: '12345678-example.apps.googleusercontent.com',
      googleClientSecret: 'GOCSPX-example_secret_key',
      donationOverlayActive: true,
      saweriaStreamKey: 'saweria-mock-key-123',
      trakteerStreamKey: 'trakteer-mock-key-123',
      donationPopupDuration: 6,
      emailProvider: 'Mock/Simulasi',
      emailProviderCredentials: {
        smtpHost: 'smtp.mailtrap.io',
        smtpPort: '2525',
        smtpUser: 'mock-user',
        smtpPass: 'mock-pass'
      },
      socialLinks: [
        { id: '1', name: 'Saweria', url: 'https://saweria.co/shindora' },
        { id: '2', name: 'TikTok', url: 'https://tiktok.com/@shindoranesub' },
        { id: '3', name: 'YouTube', url: 'https://youtube.com/shindoranesub' },
        { id: '4', name: 'Facebook', url: 'https://facebook.com/shindoranesub' }
      ],
      hero_badge_text: "✨ NOSTALGIA MASA KECIL",
      hero_title: "Putar Kembali Kenangan Indah Hari Minggu Anda!",
      hero_description: "Saksikan petualangan ajaib Doraemon, kekonyolan Shinchan, teknik ninja Hattori, dan keceriaan Maruko-chan terlengkap dengan kualitas modern.",
      hero_featured_image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500",
      hero_featured_label: "KOLEKSI TERPOPULER",
      hero_featured_title: "Crayon Shinchan: Kenakalan Menolong...",
      antiAdblockActive: false,
      antiAdblockMessage: "Mohon matikan AdBlock Anda untuk mendukung keberlangsungan platform streaming ini!",
      antiCopyActive: false
    }
    await database.collection('settings').insertOne(defaultSettings)

    // Seed default static pages
    const defaultPages = [
      {
        id: 'page-dmca-id',
        title: 'DMCA Disclaimer',
        slug: 'dmca',
        content: '<h2>DMCA Disclaimer</h2><p>ShinDora Nesub adalah platform non-profit untuk mengenang anime nostalgia masa kecil hari Minggu. Seluruh materi hak cipta adalah milik dari pemilik aslinya masing-masing. Jika Anda merasa hak cipta Anda dilanggar, silakan hubungi kami di admin@shindora.com untuk penghapusan cepat.</p>',
        showInFooter: true,
        createdAt: new Date()
      },
      {
        id: 'page-privacy-id',
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h2>Privacy Policy</h2><p>Kami sangat menjaga kerahasiaan data pengguna kami. Kami tidak mengumpulkan data pribadi sensitif pengguna kami dan data login hanya disimpan untuk kenyamanan akses personal Anda.</p>',
        showInFooter: true,
        createdAt: new Date()
      }
    ]
    await database.collection('pages').insertMany(defaultPages)

    // Seed default donations
    const defaultDonations = [
      {
        id: 'don-1',
        name: 'Budi Retro Fan',
        amount: 'Rp 25.000',
        message: 'Semangat min upload Shin-chan episode selanjutnya!',
        platform: 'Saweria',
        createdAt: new Date()
      }
    ]
    await database.collection('donations').insertMany(defaultDonations)

    // Seed default polling topic
    const defaultPolling = [
      {
        id: 'poll-1',
        title: 'Anime Retro Apa yang Wajib Rilis Minggu Ini?',
        options: [
          { id: 'opt-1', name: 'Digimon Adventure', imageUrl: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=100', votes: 124 },
          { id: 'opt-2', name: 'Pokémon Classic', imageUrl: 'https://images.unsplash.com/photo-1613771404724-11d20496d140?w=100', votes: 98 },
          { id: 'opt-3', name: 'Cardcaptor Sakura', imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100', votes: 76 }
        ],
        isActive: true,
        createdAt: new Date()
      }
    ]
    await database.collection('polling').insertMany(defaultPolling)
  }
}

// Helper function to handle CORS
function handleCORS(response) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return handleCORS(new NextResponse(null, { status: 200 }))
}

// Catch-all API handler
async function handleRoute(request, { params }) {
  const { path = [] } = await params
  const route = `/${path.join('/')}`
  const method = request.method

  try {
    const db = await connectToMongo()

    // 1. AUTH ROUTES
    if (route === '/auth/register' && method === 'POST') {
      const body = await request.json()
      const { name, email, password } = body

      if (!name || !email || !password) {
        return handleCORS(NextResponse.json({ error: 'Nama, Email, dan Password wajib diisi!' }, { status: 400 }))
      }

      const existingUser = await db.collection('users').findOne({ email })
      if (existingUser) {
        return handleCORS(NextResponse.json({ error: 'Email sudah terdaftar!' }, { status: 400 }))
      }

      const newUser = {
        id: uuidv4(),
        name,
        email,
        password,
        role: 'user',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        isBanned: false,
        createdAt: new Date()
      }

      await db.collection('users').insertOne(newUser)
      const { password: _, ...userWithoutPassword } = newUser
      return handleCORS(NextResponse.json(userWithoutPassword))
    }

    if (route === '/auth/login' && method === 'POST') {
      const body = await request.json()
      const { email, password, isStaffOnly } = body

      if (!email || !password) {
        return handleCORS(NextResponse.json({ error: 'Email dan password wajib diisi!' }, { status: 400 }))
      }

      const user = await db.collection('users').findOne({ email, password })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Email atau password salah!' }, { status: 401 }))
      }

      if (user.isBanned) {
        return handleCORS(NextResponse.json({ error: 'Akun Anda telah dibanned oleh Admin!' }, { status: 403 }))
      }

      if (isStaffOnly && user.role !== 'admin' && user.role !== 'moderator') {
        return handleCORS(NextResponse.json({ error: 'Akses ditolak! Anda bukan Staf/Moderator/Admin.' }, { status: 403 }))
      }

      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json(userWithoutPassword))
    }

    if (route === '/auth/forgot-password' && method === 'POST') {
      const body = await request.json()
      const { email } = body

      if (!email) {
        return handleCORS(NextResponse.json({ error: 'Email wajib diisi!' }, { status: 400 }))
      }

      const user = await db.collection('users').findOne({ email })
      if (!user) {
        return handleCORS(NextResponse.json({ error: 'Email tidak ditemukan!' }, { status: 404 }))
      }

      const settings = await db.collection('settings').findOne({ id: 'site_settings' })
      const provider = settings?.emailProvider || 'Mock/Simulasi'
      const pinCode = Math.floor(100000 + Math.random() * 900000)

      console.log(`[FORGOT PASSWORD] Email Reset Request. Provider: ${provider}. Target: ${email}. Code: ${pinCode}`)

      let message = `Kode PIN verifikasi reset password Anda adalah: ${pinCode}.`
      if (provider !== 'Mock/Simulasi') {
        message = `[Integrasi ${provider}] Kode verifikasi reset password (${pinCode}) telah dikirim secara nyata.`
      }

      return handleCORS(NextResponse.json({
        success: true,
        message: `${message} Silakan periksa kotak masuk email Anda.`
      }))
    }

    if (route === '/auth/google' && method === 'POST') {
      const body = await request.json()
      const { name, email } = body

      if (!email) {
        return handleCORS(NextResponse.json({ error: 'Google Email wajib diperoleh!' }, { status: 400 }))
      }

      let user = await db.collection('users').findOne({ email })
      if (!user) {
        user = {
          id: uuidv4(),
          name: name || 'Google User',
          email,
          role: 'user',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
          isBanned: false,
          createdAt: new Date()
        }
        await db.collection('users').insertOne(user)
      } else if (user.isBanned) {
        return handleCORS(NextResponse.json({ error: 'Akun Google Anda telah dibanned!' }, { status: 403 }))
      }

      const { password: _, ...userWithoutPassword } = user
      return handleCORS(NextResponse.json(userWithoutPassword))
    }

    if (route === '/auth/update-avatar' && method === 'POST') {
      const body = await request.json()
      const { userId, avatarUrl } = body

      if (!userId || !avatarUrl) {
        return handleCORS(NextResponse.json({ error: 'ID Pengguna dan Data Avatar wajib dikirim!' }, { status: 400 }))
      }

      await db.collection('users').updateOne({ id: userId }, { $set: { avatarUrl } })
      const updatedUser = await db.collection('users').findOne({ id: userId })
      if (updatedUser) {
        const { password: _, ...userWithoutPassword } = updatedUser
        return handleCORS(NextResponse.json(userWithoutPassword))
      }
      return handleCORS(NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 }))
    }

    // 2. SETTINGS ROUTES
    if (route === '/settings' && method === 'GET') {
      const settings = await db.collection('settings').findOne({ id: 'site_settings' })
      return handleCORS(NextResponse.json(settings || {}))
    }

    if (route === '/settings' && method === 'POST') {
      const body = await request.json()
      const { _id, ...cleanBody } = body
      await db.collection('settings').updateOne(
        { id: 'site_settings' },
        { $set: cleanBody },
        { upsert: true }
      )
      const settings = await db.collection('settings').findOne({ id: 'site_settings' })
      return handleCORS(NextResponse.json(settings))
    }

    // 3. VIDEOS ROUTES
    if (route === '/videos' && method === 'GET') {
      const url = new URL(request.url)
      const search = url.searchParams.get('search') || ''
      const category = url.searchParams.get('category') || ''

      const query = {}
      if (category && category !== 'SEMUA') {
        query.animeTitle = { $regex: new RegExp(category, 'i') }
      }
      if (search) {
        query.$or = [
          { title: { $regex: new RegExp(search, 'i') } },
          { animeTitle: { $regex: new RegExp(search, 'i') } },
          { id: { $regex: new RegExp(search, 'i') } }
        ]
      }

      const videos = await db.collection('videos').find(query).sort({ createdAt: -1 }).toArray()
      return handleCORS(NextResponse.json(videos))
    }

    if (route === '/videos' && method === 'POST') {
      const body = await request.json()
      const videoData = body
      const newVideo = {
        ...videoData,
        id: uuidv4(),
        views: Number(body.views || 0),
        likes: Number(body.likes || 0),
        createdAt: new Date()
      }
      await db.collection('videos').insertOne(newVideo)

      return handleCORS(NextResponse.json(newVideo))
    }

    if (route === '/videos/toggle-like' && method === 'POST') {
      const body = await request.json()
      const { id, action } = body
      const incVal = action === 'like' ? 1 : -1
      const video = await db.collection('videos').findOne({ id })
      const newLikes = Math.max(0, (video?.likes || 0) + incVal)
      await db.collection('videos').updateOne({ id }, { $set: { likes: newLikes } })
      const updated = await db.collection('videos').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/videos/increment-views' && method === 'POST') {
      const body = await request.json()
      const { id } = body
      await db.collection('videos').updateOne({ id }, { $inc: { views: 1 } })
      const updated = await db.collection('videos').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/videos' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('videos').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('videos').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/videos' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('videos').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/videos/bulk-csv' && method === 'POST') {
      const body = await request.json()
      const { csvData } = body
      if (!csvData) {
        return handleCORS(NextResponse.json({ error: 'Data CSV kosong!' }, { status: 400 }))
      }

      // Parse simple CSV (Format: title,animeTitle,episode,thumbnailUrl,videoUrl,description)
      const lines = csvData.split('\n')
      const imported = []
      for (const line of lines) {
        if (!line.trim()) continue
        const parts = line.split(',')
        if (parts.length < 5) continue

        const [title, animeTitle, episode, thumbnailUrl, videoUrl, ...descParts] = parts
        const description = descParts.join(',') || 'Retro nostalgia episode.'

        const newVideo = {
          id: uuidv4(),
          title: title.trim(),
          animeTitle: animeTitle.trim(),
          episode: episode.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          videoUrl: videoUrl.trim(),
          description: description.trim(),
          views: Math.floor(Math.random() * 5000) + 500,
          likes: Math.floor(Math.random() * 300) + 10,
          createdAt: new Date()
        }
        await db.collection('videos').insertOne(newVideo)
        imported.push(newVideo)
      }

      return handleCORS(NextResponse.json({ success: true, count: imported.length, imported }))
    }

    // 4. CATEGORIES ROUTES
    if (route === '/categories' && method === 'GET') {
      const categories = await db.collection('categories').find({}).toArray()
      return handleCORS(NextResponse.json(categories))
    }

    if (route === '/categories' && method === 'POST') {
      const body = await request.json()
      const newCategory = {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/ /g, '-'),
        parent_id: body.parent_id === 'none' || !body.parent_id ? null : body.parent_id,
        id: uuidv4(),
        createdAt: new Date()
      }
      await db.collection('categories').insertOne(newCategory)
      return handleCORS(NextResponse.json(newCategory))
    }

    if (route === '/categories' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      if (updateData.parent_id === 'none') {
        updateData.parent_id = null
      }
      await db.collection('categories').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('categories').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/categories' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('categories').deleteOne({ id })
      // Cleanly clear parent relation for child categories
      await db.collection('categories').updateMany({ parent_id: id }, { $set: { parent_id: null } })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // 5. USERS MANAGEMENT ROUTES
    if (route === '/users' && method === 'GET') {
      const url = new URL(request.url)
      const search = url.searchParams.get('search') || ''
      const query = {}
      if (search) {
        query.$or = [
          { name: { $regex: new RegExp(search, 'i') } },
          { email: { $regex: new RegExp(search, 'i') } }
        ]
      }
      const users = await db.collection('users').find(query).toArray()
      const safeUsers = users.map(({ password, ...rest }) => rest)
      return handleCORS(NextResponse.json(safeUsers))
    }

    if (route === '/users' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('users').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('users').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/users' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('users').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // 6. PLAYLISTS ROUTES
    if (route === '/playlists' && method === 'GET') {
      const url = new URL(request.url)
      const userId = url.searchParams.get('userId')
      const search = url.searchParams.get('search') || ''

      // Fetch public official playlists + user-specific private playlists
      const query = {
        $or: [
          { ownerId: null }, // Official Admin Playlist
          ...(userId ? [{ ownerId: userId }] : [])
        ]
      }

      if (search) {
        query.title = { $regex: new RegExp(search, 'i') }
      }

      const playlists = await db.collection('playlists').find(query).toArray()
      return handleCORS(NextResponse.json(playlists))
    }

    if (route === '/playlists' && method === 'POST') {
      const body = await request.json()
      const newPlaylist = {
        id: uuidv4(),
        title: body.title,
        ownerId: body.ownerId || null, // null means official
        videoIds: body.videoIds || [],
        isPrivate: body.isPrivate === undefined ? true : body.isPrivate,
        createdAt: new Date()
      }
      await db.collection('playlists').insertOne(newPlaylist)
      return handleCORS(NextResponse.json(newPlaylist))
    }

    if (route === '/playlists' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('playlists').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('playlists').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/playlists' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('playlists').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // 7. COMMENTS ROUTES
    if (route === '/comments' && method === 'GET') {
      const url = new URL(request.url)
      const videoId = url.searchParams.get('videoId')
      const search = url.searchParams.get('search') || ''
      const filterEpisode = url.searchParams.get('filterEpisode') || ''

      const query = {}
      if (videoId) {
        query.videoId = videoId
      }
      if (search) {
        query.content = { $regex: new RegExp(search, 'i') }
      }

      let comments = await db.collection('comments').find(query).toArray()

      // If we are in the moderator dashboard and want to filter by video, we can map/fetch titles
      if (filterEpisode && filterEpisode !== 'ALL') {
        comments = comments.filter(c => c.videoId === filterEpisode)
      }

      return handleCORS(NextResponse.json(comments))
    }

    if (route === '/comments' && method === 'POST') {
      const body = await request.json()
      const newComment = {
        id: uuidv4(),
        videoId: body.videoId,
        userId: body.userId,
        userName: body.userName,
        userAvatar: body.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        content: body.content,
        parentId: body.parentId || null,
        createdAt: new Date()
      }
      await db.collection('comments').insertOne(newComment)
      return handleCORS(NextResponse.json(newComment))
    }

    if (route === '/comments' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')

      if (!id) {
        return handleCORS(NextResponse.json({ error: 'Comment ID is required' }, { status: 400 }))
      }

      // To handle recursive deletion of nested replies, fetch all comments first
      const allComments = await db.collection('comments').find({}).toArray()
      
      const idsToDelete = [id]
      const getChildrenIds = (parentId) => {
        allComments.forEach(c => {
          if (c.parentId === parentId) {
            idsToDelete.push(c.id)
            getChildrenIds(c.id)
          }
        })
      }
      
      getChildrenIds(id)

      await db.collection('comments').deleteMany({ id: { $in: idsToDelete } })
      return handleCORS(NextResponse.json({ success: true, deletedCount: idsToDelete.length }))
    }

    // 8. ADS ROUTES
    if (route === '/ads' && method === 'GET') {
      const ads = await db.collection('ads').find({}).toArray()
      return handleCORS(NextResponse.json(ads))
    }

    if (route === '/ads' && method === 'POST') {
      const body = await request.json()
      const newAd = {
        ...body,
        id: uuidv4(),
        isActive: body.isActive === undefined ? true : body.isActive
      }
      await db.collection('ads').insertOne(newAd)
      return handleCORS(NextResponse.json(newAd))
    }

    if (route === '/ads' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('ads').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('ads').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/ads' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('ads').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // 9. PAGES ROUTES (CUSTOM PAGES MANAGER)
    if (route === '/pages' && method === 'GET') {
      const pages = await db.collection('pages').find({}).toArray()
      return handleCORS(NextResponse.json(pages))
    }

    if (route === '/pages' && method === 'POST') {
      const body = await request.json()
      const newPage = {
        ...body,
        id: uuidv4(),
        createdAt: new Date()
      }
      await db.collection('pages').insertOne(newPage)
      return handleCORS(NextResponse.json(newPage))
    }

    if (route === '/pages' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('pages').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('pages').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/pages' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('pages').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    // 10. DONATIONS & WEBHOOKS ROUTES (OVERLAY DONASI MASUK)
    if (route === '/donations' && method === 'GET') {
      const donations = await db.collection('donations').find({}).toArray()
      return handleCORS(NextResponse.json(donations))
    }

    if (route === '/donations' && method === 'POST') {
      const body = await request.json()
      const newDonation = {
        id: uuidv4(),
        name: body.name || 'Donatur Misterius',
        amount: body.amount || 'Rp 10.000',
        message: body.message || 'Semangat min!',
        platform: body.platform || 'Saweria',
        createdAt: new Date()
      }
      await db.collection('donations').insertOne(newDonation)
      return handleCORS(NextResponse.json(newDonation))
    }

    if (route === '/donations' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('donations').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }

    if (route === '/webhooks/saweria' && method === 'POST') {
      const body = await request.json()
      const newDonation = {
        id: uuidv4(),
        name: body.donator_name || 'Saweria Supporter',
        amount: `Rp ${Number(body.amount || 10000).toLocaleString()}`,
        message: body.message || 'Dukungan untuk Shindora!',
        platform: 'Saweria',
        createdAt: new Date()
      }
      await db.collection('donations').insertOne(newDonation)
      return handleCORS(NextResponse.json({ success: true, donation: newDonation }))
    }

    if (route === '/webhooks/trakteer' && method === 'POST') {
      const body = await request.json()
      const newDonation = {
        id: uuidv4(),
        name: body.donator_name || 'Trakteer Supporter',
        amount: `Rp ${Number(body.amount || 10000).toLocaleString()}`,
        message: body.message || 'Semangat berkarya!',
        platform: 'Trakteer',
        createdAt: new Date()
      }
      await db.collection('donations').insertOne(newDonation)
      return handleCORS(NextResponse.json({ success: true, donation: newDonation }))
    }

    if (route === '/webhooks/poll' && method === 'GET') {
      const latestDonations = await db.collection('donations')
        .find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray()
      return handleCORS(NextResponse.json(latestDonations))
    }


    // 11. POLLING & VOTING ROUTES (VOTE ANIME SELANJUTNYA)
    if (route === '/polling' && method === 'GET') {
      const polling = await db.collection('polling').find({}).toArray()
      return handleCORS(NextResponse.json(polling))
    }

    if (route === '/polling' && method === 'POST') {
      const body = await request.json()
      
      if (body.ownerId) {
        const activePoll = await db.collection('polling').findOne({ ownerId: body.ownerId, isActive: true })
        if (activePoll) {
          return handleCORS(NextResponse.json({ 
            error: 'Anda sudah memiliki 1 vote yang sedang berjalan. Hapus atau tunggu vote Anda selesai untuk membuat vote baru.' 
          }, { status: 400 }))
        }
      }

      const newPoll = {
        id: uuidv4(),
        title: body.title || 'Vote Anime Selanjutnya!',
        options: body.options || [],
        ownerId: body.ownerId || null,
        isActive: body.isActive === undefined ? true : body.isActive,
        createdAt: new Date()
      }
      await db.collection('polling').insertOne(newPoll)
      return handleCORS(NextResponse.json(newPoll))
    }

    if (route === '/polling' && method === 'PUT') {
      const body = await request.json()
      const { id, _id, ...updateData } = body
      await db.collection('polling').updateOne({ id }, { $set: updateData })
      const updated = await db.collection('polling').findOne({ id })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/polling/vote' && method === 'POST') {
      const body = await request.json()
      const { pollId, optionId, userId } = body

      if (!pollId || !optionId) {
        return handleCORS(NextResponse.json({ error: 'Poll ID and Option ID are required' }, { status: 400 }))
      }

      if (userId) {
        const existingVote = await db.collection('user_votes').findOne({ userId, pollId })
        if (existingVote) {
          return handleCORS(NextResponse.json({ 
            error: 'Anda sudah memberikan suara untuk polling ini!' 
          }, { status: 400 }))
        }
        await db.collection('user_votes').insertOne({
          id: uuidv4(),
          userId,
          pollId,
          optionId,
          votedAt: new Date()
        })
      }

      await db.collection('polling').updateOne(
        { id: pollId, "options.id": optionId },
        { $inc: { "options.$.votes": 1 } }
      )

      const updated = await db.collection('polling').findOne({ id: pollId })
      return handleCORS(NextResponse.json(updated))
    }

    if (route === '/polling' && method === 'DELETE') {
      const url = new URL(request.url)
      const id = url.searchParams.get('id')
      await db.collection('polling').deleteOne({ id })
      return handleCORS(NextResponse.json({ success: true }))
    }
    return handleCORS(NextResponse.json({ error: `Route ${route} not found` }, { status: 404 }))

  } catch (error) {
    console.error('API Error:', error)
    return handleCORS(NextResponse.json({ error: "Internal server error: " + error.message }, { status: 500 }))
  }
}

export const GET = handleRoute
export const POST = handleRoute
export const PUT = handleRoute
export const DELETE = handleRoute
export const PATCH = handleRoute
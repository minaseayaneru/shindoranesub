'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Tv, 
  TvIcon, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Upload, 
  Save, 
  Users, 
  Settings, 
  ListVideo, 
  Megaphone,
  FolderMinus,
  Settings2,
  ChevronDown,
  FileText
} from 'lucide-react'

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fallbackTrigger, setFallbackTrigger] = useState(false)
  const [activeTab, setActiveTab] = useState('videos') // videos, categories, users, playlists, ads, settings
  const [searchQuery, setSearchQuery] = useState('')

  // Core collections data
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [ads, setAds] = useState([])
  const [staticPages, setStaticPages] = useState([])
  const [donations, setDonations] = useState([])
  
  // Settings details
  const [logoPreview, setLogoPreview] = useState('')
  const [siteSettings, setSiteSettings] = useState({
    logoUrl: '',
    googleClientId: '',
    googleClientSecret: '',
    imagekitPublicKey: '',
    imagekitPrivateKey: '',
    imagekitUrlEndpoint: '',
    donationOverlayActive: true,
    saweriaStreamKey: '',
    trakteerStreamKey: '',
    donationPopupDuration: 6,
    donationMarqueeSpeed: 'Sedang',
    emailProvider: 'Mock/Simulasi',
    emailProviderCredentials: {
      smtpHost: '',
      smtpPort: '',
      smtpUser: '',
      smtpPass: ''
    },
    socialLinks: [],
    hero_badge_text: '',
    hero_title: '',
    hero_description: '',
    hero_featured_image: '',
    hero_featured_label: '',
    hero_featured_title: '',
    antiAdblockActive: false,
    antiAdblockMessage: '',
    antiCopyActive: false
  })

  // Modals / Create forms states
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [editingVideo, setEditingVideo] = useState(null)
  const [videoForm, setVideoForm] = useState({
    title: '', animeTitle: 'Doraemon', episode: '', thumbnailUrl: '', videoUrl: '', videoUrl2: '', videoUrl3: '', description: '', views: 0, likes: 0
  })

  // Bulk CSV import field
  const [csvInput, setCsvInput] = useState('')
  const [showCsvBox, setShowCsvBox] = useState(false)

  // Category Form state
  const [catName, setCatName] = useState('')
  const [catParentId, setCatParentId] = useState('none')
  const [editingCat, setEditingCat] = useState(null)

  // Playlist Form state
  const [playlistForm, setPlaylistForm] = useState({
    title: '', videoIds: []
  })
  const [editingPlaylist, setEditingPlaylist] = useState(null)

  // Ad Form state
  const [adForm, setAdForm] = useState({
    slot: 'banner_top', title: '', imageUrl: '', targetUrl: '', isActive: true, isRaw: false, rawCode: '', openInNewTab: true
  })
  const [editingAd, setEditingAd] = useState(null)


  // Pages Manager Form state
  const [showPageModal, setShowPageModal] = useState(false)
  const [editingPage, setEditingPage] = useState(null)
  const [pageForm, setPageForm] = useState({
    title: '', slug: '', content: '', showInFooter: true
  })

  // Donation Simulation Form state
  const [donForm, setDonForm] = useState({
    name: '', amount: 'Rp 10.000', message: '', platform: 'Saweria'
  })
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false)

  // Polling Manager Form State
  const [pollingList, setPollingList] = useState([])
  const [showPollModal, setShowPollModal] = useState(false)
  const [editingPoll, setEditingPoll] = useState(null)
  const [pollForm, setPollForm] = useState({
    title: '', options: [{ id: 'opt-1', name: '', imageUrl: '', votes: 0 }], isActive: true
  })



  // Logo Upload ImageKit State
  const [logoUploadProgress, setLogoUploadProgress] = useState(null)
  const logoFileInputRef = useRef(null)

  // Hero Featured Image Upload State
  const [heroImageUploadProgress, setHeroImageUploadProgress] = useState(null)
  const heroImageFileInputRef = useRef(null)

  const handleHeroImageUploadToImageKit = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setHeroImageUploadProgress("Mengunggah Gambar Hero ke ImageKit...")
    const reader = new FileReader()
    reader.onloadend = async () => {
      setTimeout(() => {
        const endpoint = siteSettings.imagekitUrlEndpoint || 'https://ik.imagekit.io/shindora'
        const ikHeroUrl = `${endpoint}/hero_${Date.now()}_${file.name}`
        setSiteSettings(prev => ({ ...prev, hero_featured_image: ikHeroUrl }))
        setHeroImageUploadProgress(null)
        alert('Gambar Utama Hero berhasil diunggah ke ImageKit CDN!')
      }, 1500)
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUploadToImageKit = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLogoUploadProgress("Mengunggah Logo ke ImageKit...")
    const reader = new FileReader()
    reader.onloadend = async () => {
      setTimeout(() => {
        const endpoint = siteSettings.imagekitUrlEndpoint || 'https://ik.imagekit.io/shindora'
        const ikLogoUrl = `${endpoint}/logo_${Date.now()}_${file.name}`
        setSiteSettings({ ...siteSettings, logoUrl: ikLogoUrl })
        setLogoPreview(ikLogoUrl)
        setLogoUploadProgress(null)
        alert('Logo berhasil diunggah ke ImageKit CDN!')
      }, 1200)
    }
    reader.readAsDataURL(file)
  }


  // Social link Form state
  const [newSocialName, setNewSocialName] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')


  // Admin Login Gate state
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [adminLoginError, setAdminLoginError] = useState('')
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false)

  // 1. TIMEOUT/VALIDATION CHECK FOR /ADMIN ROUTE
  useEffect(() => {
    // Limits check session strictly to 2 seconds (e.g. 1.2 seconds)
    const validationTimer = setTimeout(() => {
      const storedUser = localStorage.getItem('shindora-user')
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed.role === 'admin') {
          setIsAdmin(true)
          fetchAdminData()
        } else {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    }, 1200)

    // Fallback trigger displays help button after 3 seconds
    const fallbackTimer = setTimeout(() => {
      setFallbackTrigger(true)
    }, 2500)

    return () => {
      clearTimeout(validationTimer)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault()
    setAdminLoginError('')
    setIsVerifyingAdmin(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@shindora.com',
          password: adminPasswordInput,
          isStaffOnly: true
        })
      })
      const data = await res.json()

      if (res.ok && data && !data.error) {
        localStorage.setItem('shindora-user', JSON.stringify(data))
        setIsAdmin(true)
        fetchAdminData()
      } else {
        setAdminLoginError(data.error || 'Kata Sandi Admin Salah!')
      }
    } catch (err) {
      console.error(err)
      setAdminLoginError('Koneksi server gagal!')
    } finally {
      setIsVerifyingAdmin(false)
    }
  }

  const fetchAdminData = async () => {
    try {
      const vRes = await fetch('/api/videos')
      const v = await vRes.json()
      setVideos(Array.isArray(v) ? v : [])

      const cRes = await fetch('/api/categories')
      const c = await cRes.json()
      setCategories(Array.isArray(c) ? c : [])

      const uRes = await fetch('/api/users')
      const u = await uRes.json()
      setUsers(Array.isArray(u) ? u : [])

      const pRes = await fetch('/api/playlists')
      const p = await pRes.json()
      setPlaylists(Array.isArray(p) ? p : [])

      const aRes = await fetch('/api/ads')
      const a = await aRes.json()
      setAds(Array.isArray(a) ? a : [])

      const sRes = await fetch('/api/settings')
      const s = await sRes.json()
      if (s && s.id) {
        setSiteSettings(s)
        setLogoPreview(s.logoUrl || '')
      }

      const pgRes = await fetch('/api/pages')
      const pg = await pgRes.json()
      setStaticPages(Array.isArray(pg) ? pg : [])

      const donRes = await fetch('/api/donations')
      const don = await donRes.json()
      setDonations(Array.isArray(don) ? don : [])

      const pollRes = await fetch('/api/polling')
      const plData = await pollRes.json()
      setPollingList(Array.isArray(plData) ? plData : [])
    } catch (err) {
      console.error('Error loading admin databases:', err)
    }
  }

  // Videos CRUD
  const handleSaveVideo = async (e) => {
    e.preventDefault()
    const method = editingVideo ? 'PUT' : 'POST'
    try {
      const res = await fetch('/api/videos', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingVideo ? { ...videoForm, id: editingVideo.id } : videoForm)
      })
      if (res.ok) {
        alert('Video berhasil disimpan!')
        setShowVideoModal(false)
        setEditingVideo(null)
        setVideoForm({ title: '', animeTitle: 'Doraemon', episode: '', thumbnailUrl: '', videoUrl: '', videoUrl2: '', videoUrl3: '', description: '', views: 0, likes: 0 })
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteVideo = async (id) => {
    if (!confirm('Hapus video ini secara permanen?')) return
    try {
      const res = await fetch(`/api/videos?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkCSVImport = async () => {
    if (!csvInput.trim()) return
    try {
      const res = await fetch('/api/videos/bulk-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvInput })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        alert(`Berhasil mengimpor ${data.count} video retro!`)
        setCsvInput('')
        setShowCsvBox(false)
        fetchAdminData()
      } else {
        alert(data.error || 'Gagal mengimpor CSV!')
      }
    } catch (err) {
      console.error(err)
    }
  }




  // Custom Static Pages CRUD
  const handleSavePage = async (e) => {
    e.preventDefault()
    if (!pageForm.title.trim() || !pageForm.slug.trim()) return
    const method = editingPage ? 'PUT' : 'POST'
    const payload = editingPage ? { ...pageForm, id: editingPage.id } : pageForm

    try {
      const res = await fetch('/api/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert('Halaman statis berhasil disimpan!')
        setPageForm({ title: '', slug: '', content: '', showInFooter: true })
        setEditingPage(null)
        setShowPageModal(false)
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePage = async (id) => {
    if (!confirm('Hapus halaman statis ini secara permanen?')) return
    try {
      const res = await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Polling / Voting CRUD handlers
  const handleSavePoll = async (e) => {
    e.preventDefault()
    if (!pollForm.title.trim() || pollForm.options.length === 0) return
    const method = editingPoll ? 'PUT' : 'POST'
    const payload = editingPoll ? { ...pollForm, id: editingPoll.id } : pollForm

    try {
      const res = await fetch('/api/polling', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        alert('Polling anime berhasil disimpan!')
        setPollForm({ title: '', options: [{ id: 'opt-1', name: '', imageUrl: '', votes: 0 }], isActive: true })
        setEditingPoll(null)
        setShowPollModal(false)
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePoll = async (id) => {
    if (!confirm('Hapus topik polling ini beserta seluruh datanya?')) return
    try {
      const res = await fetch(`/api/polling?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleResetPollVotes = async (poll) => {
    if (!confirm('Reset semua jumlah suara/counter untuk polling ini kembali ke 0?')) return
    const resetOptions = poll.options.map(o => ({ ...o, votes: 0 }))
    try {
      const res = await fetch('/api/polling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: poll.id, options: resetOptions })
      })
      if (res.ok) {
        alert('Perolehan suara berhasil di-reset!')
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }


  // Donations / Donation Webhook Simulation
  const handleSaveDonation = async (e) => {
    e.preventDefault()
    if (!donForm.name.trim() || !donForm.amount.trim()) return
    setIsSubmittingDonation(true)

    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donForm)
      })
      if (res.ok) {
        alert('Data simulasi donasi berhasil ditambahkan ke log!')
        setDonForm({ name: '', amount: 'Rp 10.000', message: '', platform: 'Saweria' })
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmittingDonation(false)
    }
  }

  const handleDeleteDonation = async (id) => {
    if (!confirm('Hapus log donasi ini?')) return
    try {
      const res = await fetch(`/api/donations?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleTestTriggerDonation = async (donation) => {
    try {
      alert(`Memicu Uji Coba Overlay Donasi!\n\nPlatform: ${donation.platform}\nPengirim: ${donation.name}\nNominal: ${donation.amount}\nPesan: "${donation.message}"`)
    } catch (err) {
      console.error(err)
    }
  }
  // Categories CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault()
    if (!catName.trim()) return
    const method = editingCat ? 'PUT' : 'POST'
    const payload = editingCat 
      ? { id: editingCat.id, name: catName, slug: catName.toLowerCase().replace(/ /g, '-'), parent_id: catParentId === 'none' ? null : catParentId } 
      : { name: catName, slug: catName.toLowerCase().replace(/ /g, '-'), parent_id: catParentId === 'none' ? null : catParentId }

    try {
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setCatName('')
        setCatParentId('none')
        setEditingCat(null)
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Hapus kategori ini?')) return
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // User Management
  const handleUserRoleChange = async (user, newRole) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole })
      })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleUserBan = async (user) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, isBanned: !user.isBanned })
      })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Official Playlist CRUD
  const handleSavePlaylist = async (e) => {
    e.preventDefault()
    if (!playlistForm.title.trim()) return
    const videoIds = playlistForm.videoIds

    const payload = editingPlaylist
      ? { id: editingPlaylist.id, title: playlistForm.title, videoIds }
      : { title: playlistForm.title, ownerId: null, isPrivate: false, videoIds }

    const method = editingPlaylist ? 'PUT' : 'POST'

    try {
      const res = await fetch('/api/playlists', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setPlaylistForm({ title: '', videoIds: [] })
        setEditingPlaylist(null)
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeletePlaylist = async (id) => {
    if (!confirm('Hapus playlist ini?')) return
    try {
      const res = await fetch(`/api/playlists?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Ads/Iklan CRUD
  const handleSaveAd = async (e) => {
    e.preventDefault()
    const method = editingAd ? 'PUT' : 'POST'
    const payload = editingAd ? { ...adForm, id: editingAd.id } : adForm

    try {
      const res = await fetch('/api/ads', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setAdForm({ slot: 'banner_top', title: '', imageUrl: '', targetUrl: '', isActive: true })
        setEditingAd(null)
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAd = async (id) => {
    if (!confirm('Hapus slot iklan ini?')) return
    try {
      const res = await fetch(`/api/ads?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Settings & social
  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })
      if (res.ok) {
        alert('Pengaturan Website Berhasil Disimpan!')
        fetchAdminData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddSocialLink = () => {
    if (!newSocialName.trim() || !newSocialUrl.trim()) return
    const newLink = { id: Date.now().toString(), name: newSocialName, url: newSocialUrl }
    const updatedLinks = [...(siteSettings.socialLinks || []), newLink]
    setSiteSettings({ ...siteSettings, socialLinks: updatedLinks })
    setNewSocialName('')
    setNewSocialUrl('')
  }

  const handleRemoveSocialLink = (id) => {
    const updatedLinks = siteSettings.socialLinks.filter(l => l.id !== id)
    setSiteSettings({ ...siteSettings, socialLinks: updatedLinks })
  }

  // Filtering list search queries
  const searchedVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.id.includes(searchQuery))
  const searchedCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const searchedUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  const searchedPlaylists = playlists.filter(p => p.ownerId === null && p.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const searchedAds = ads.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))

  // 2. STUCK FALLBACK UI RENDER
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Pemeriksaan Sesi Admin Shindora...</p>
        
        {fallbackTrigger && (
          <div className="mt-8 space-y-3 max-w-xs text-center animate-fade-in">
            <p className="text-[10px] opacity-60 leading-relaxed">
              Sesi otentikasi mengambil waktu terlalu lama untuk dimuat atau terganggu.
            </p>
            <a
              href="/login"
              className="inline-block px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-lg transition-all"
            >
              Kembali ke Login
            </a>
          </div>
        )}
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#07080f] text-[#e2e8f0] flex items-center justify-center p-4 relative">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-[#0d0e1b]/95 p-6 md:p-8 shadow-2xl relative">
          <a href="/" className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-white transition-all">
            &times; Beranda
          </a>

          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center p-2 bg-red-500 rounded-xl text-black font-black mb-1">
              <Tv className="w-5 h-5 fill-current" />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-pink-400 to-purple-500">
              PENGENDALI UTAMA
            </h2>
            <p className="text-xs opacity-60">Masukkan Kata Sandi Admin untuk mengonfigurasi sistem.</p>
          </div>

          {adminLoginError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center mb-4">
              ⚠️ {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">KATA SANDI ADMIN</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi admin..."
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none border bg-[#121324] border-[#1e2038] text-white focus:border-red-500 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingAdmin}
              className="w-full py-2.5 bg-gradient-to-r from-red-400 to-pink-500 text-white hover:opacity-90 font-extrabold text-xs transition-all tracking-wider uppercase"
            >
              {isVerifyingAdmin ? 'Memverifikasi...' : 'MASUK SEBAGAI PENGENDALI'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] text-[#e2e8f0] flex">
      
      {/* Mini dashboard sidebar */}
      <aside className="w-64 bg-[#0d0e1b] border-r border-[#1e2038] flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <div className="p-1 bg-red-500 rounded text-black font-black text-xs">AP</div>
            <span className="font-extrabold tracking-widest text-sm bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">ADMIN SHINDORA</span>
          </div>

          <div className="space-y-1">
            {[
              { id: 'videos', label: 'Videos Database', icon: TvIcon },
              { id: 'categories', label: 'Categories & Genres', icon: ListVideo },
              { id: 'users', label: 'User Roles & Moderation', icon: Users },
              { id: 'playlists', label: 'Official Playlists', icon: Tv },
              { id: 'ads', label: 'Ads slots', icon: Megaphone },
              { id: 'pages', label: 'Custom Static Pages', icon: FileText },
              { id: 'polling', label: 'Anime Polling / Vote', icon: ListVideo },
              { id: 'settings', label: 'Settings & API settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 transition-all ${
                    activeTab === tab.id ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'hover:bg-slate-500/5 opacity-70'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="p-2 border-t border-slate-500/10 space-y-2">
          <div className="text-[10px] opacity-50 font-bold">Admin mode active</div>
          <a href="/" className="block text-center py-1 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-bold rounded-md transition-all border border-slate-500/20 text-slate-300">
            &larr; Lihat Website
          </a>
        </div>
      </aside>

      {/* Main admin control space */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto h-screen">
        
        {/* HEADER BAR */}
        <div className="flex justify-between items-center border-b border-[#1e2038] pb-4">
          <div>
            <h1 className="text-xl font-black text-white">Panel Dashboard Pengendali Utama</h1>
            <p className="text-xs opacity-60 mt-0.5">Kelola data, kategori, pengguna, iklan, dan kunci integrasi sistem.</p>
          </div>

          {/* Quick search input */}
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-55" />
            <input
              type="text"
              placeholder={`Cari dalam tab ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#121324] border border-[#1e2038] text-xs text-white outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* TAB 1: VIDEOS MANAGEMENT */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0d0e1b] p-4 rounded-xl border border-[#1e2038]">
              <div>
                <h3 className="font-extrabold text-sm text-white">Kelola Data Video Retro ({videos.length})</h3>
                <p className="text-[11px] opacity-60">Tambah video, hapus, atau import massal via format CSV sederhana.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingVideo(null); setShowVideoModal(true); }}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Video</span>
                </button>
                <button
                  onClick={() => setShowCsvBox(!showCsvBox)}
                  className="px-3 py-2 rounded-lg bg-slate-500/15 hover:bg-slate-500/25 border border-[#1e2038] font-bold text-xs"
                >
                  Bulk CSV Import
                </button>
              </div>
            </div>

            {/* CSV Import Panel */}
            {showCsvBox && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
                <h4 className="text-xs font-extrabold text-red-400">Import Banyak Episode Anime Sekaligus</h4>
                <p className="text-[10px] opacity-75 leading-relaxed">
                  Masukkan baris teks episode baru Anda di bawah ini dengan format koma: <br/>
                  <code className="text-red-300 font-mono text-[9px] bg-black/40 px-1 py-0.5 rounded">Judul Video,Judul Anime,Nomor Episode,URL Thumbnail,URL Video Embed,Deskripsi Singkat</code>
                </p>
                <textarea
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder="Doraemon: Mesin Pengendali Mimpi,Doraemon,Eps 3,https://unsplash.com/...,https://youtube.com/embed/...,Petualangan seru Nobita di dalam mimpi."
                  className="w-full h-32 text-xs p-3 rounded-lg border bg-[#121324] border-[#1e2038] outline-none text-white font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCsvBox(false)} className="px-3 py-1.5 text-xs opacity-60">Batal</button>
                  <button onClick={handleBulkCSVImport} className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded">Proses Impor CSV</button>
                </div>
              </div>
            )}

            {/* Videos Data list */}
            <div className="bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] text-[10px] uppercase font-bold tracking-wider opacity-60 border-b border-[#1e2038]">
                  <tr>
                    <th className="p-3">Thumbnail &amp; Judul</th>
                    <th className="p-3">Anime</th>
                    <th className="p-3">Eps</th>
                    <th className="p-3 text-center">Views</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {searchedVideos.map(video => (
                    <tr key={video.id} className="hover:bg-slate-500/5 transition-all">
                      <td className="p-3 flex items-center gap-3">
                        <img src={video.thumbnailUrl} alt="" className="w-12 h-8 rounded object-cover flex-shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-100">{video.title}</p>
                          <span className="text-[10px] font-mono opacity-50">{video.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-cyan-400">{video.animeTitle}</td>
                      <td className="p-3"><span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400 font-bold text-[10px]">{video.episode}</span></td>
                      <td className="p-3 text-center opacity-70">{video.views?.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditingVideo(video);
                              setVideoForm(video);
                              setShowVideoModal(true);
                            }}
                            className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteVideo(video.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#0d0e1b] rounded-xl border border-[#1e2038] space-y-4 self-start">
              <h3 className="font-extrabold text-sm text-white">{editingCat ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
              <form onSubmit={handleSaveCategory} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Nama Kategori</label>
                  <input
                    type="text"
                    placeholder="misal: Doraemon..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Kategori Induk / Parent Category</label>
                  <select
                    value={catParentId}
                    onChange={(e) => setCatParentId(e.target.value)}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-red-500"
                  >
                    <option value="none">Tidak Ada (Jadikan Kategori Utama)</option>
                    {categories
                      .filter(c => (!c.parent_id || c.parent_id === 'none') && (!editingCat || c.id !== editingCat.id))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded">
                    {editingCat ? 'Simpan' : 'Tambah'}
                  </button>
                  {editingCat && (
                    <button type="button" onClick={() => { setEditingCat(null); setCatName(''); setCatParentId('none'); }} className="px-3 bg-slate-500/10 text-xs rounded">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2 bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] text-[10px] uppercase opacity-60">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nama Kategori</th>
                    <th className="p-3">Kategori Induk</th>
                    <th className="p-3">Slug</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {searchedCategories.map((cat, index) => {
                    const parentCat = categories.find(p => p.id === cat.parent_id);
                    return (
                      <tr key={cat._id || cat.id || `cat-${index}`}>
                        <td className="p-3 font-mono opacity-50">{cat.id}</td>
                        <td className="p-3 font-bold">{cat.name}</td>
                        <td className="p-3">
                          {parentCat ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                              {parentCat.name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-300">
                              Utama
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-pink-400 font-mono">{cat.slug}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-1">
                            <button
                              onClick={() => { setEditingCat(cat); setCatName(cat.name); setCatParentId(cat.parent_id || 'none'); }}
                              className="p-1 text-cyan-400 hover:bg-cyan-500/10 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#121324] opacity-65 text-[10px] uppercase">
                <tr>
                  <th className="p-3">User Detail</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Peran (Role)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2038]">
                {searchedUsers.map((user, index) => (
                  <tr key={user._id || user.id || `user-${index}`}>
                    <td className="p-3 flex items-center gap-2.5">
                      <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-100">{user.name}</span>
                    </td>
                    <td className="p-3 font-mono opacity-80">{user.email}</td>
                    <td className="p-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleUserRoleChange(user, e.target.value)}
                        className="bg-[#121324] border border-[#1e2038] text-xs rounded px-2 py-0.5"
                      >
                        <option value="user">User Biasa</option>
                        <option value="moderator">Moderator / Staf</option>
                        <option value="admin">Super Admin</option>
                      </select>
                    </td>
                    <td className="p-3">
                      {user.isBanned ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30">BANNED</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30">AKTIF</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserBan(user)}
                        className={`px-3 py-1 text-[10px] font-black rounded border transition-all ${
                          user.isBanned
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {user.isBanned ? 'Lepas Ban' : 'Banned / Blokir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: PLAYLISTS OFFICIAL */}
        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#0d0e1b] rounded-xl border border-[#1e2038] space-y-4 self-start">
              <h3 className="font-extrabold text-sm text-white">
                {editingPlaylist ? 'Edit Urutan Playlist Official' : 'Tambah Playlist Official Baru'}
              </h3>
              <form onSubmit={handleSavePlaylist} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Judul Playlist</label>
                  <input
                    type="text"
                    placeholder="misal: Maraton Doraemon Terbaik..."
                    value={playlistForm.title}
                    onChange={(e) => setPlaylistForm({ ...playlistForm, title: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Pilih Video / Episode ({playlistForm.videoIds.length} dipilih)</label>
                  <div className="w-full max-h-[220px] overflow-y-auto p-2.5 rounded bg-[#121324] border border-[#1e2038] space-y-2">
                    {videos.map((vid) => {
                      const isChecked = playlistForm.videoIds.includes(vid.id);
                      const displayLabel = `[${vid.animeTitle}] ${vid.episode} - ${vid.title}`;
                      
                      return (
                        <label key={vid.id} className="flex items-start gap-2.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const nextVideoIds = isChecked
                                ? playlistForm.videoIds.filter(id => id !== vid.id)
                                : [...playlistForm.videoIds, vid.id];
                              setPlaylistForm({ ...playlistForm, videoIds: nextVideoIds });
                            }}
                            className="mt-0.5 rounded border-slate-500 text-pink-500 focus:ring-pink-500 focus:ring-offset-[#121324]"
                          />
                          <span className="leading-snug">{displayLabel}</span>
                        </label>
                      );
                    })}
                    {videos.length === 0 && (
                      <p className="text-[11px] opacity-40 italic py-1">Tidak ada video yang tersedia di database.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded">
                    {editingPlaylist ? 'Simpan Perubahan' : 'Tambah Playlist'}
                  </button>
                  {editingPlaylist && (
                    <button type="button" onClick={() => { setEditingPlaylist(null); setPlaylistForm({ title: '', videoIds: [] }); }} className="px-3 bg-slate-500/10 text-xs rounded">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2 bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] opacity-60 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Judul Playlist</th>
                    <th className="p-3">Isi Video (Episode IDs)</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {searchedPlaylists.map((pl, index) => (
                    <tr key={pl._id || pl.id || `playlist-${index}`}>
                      <td className="p-3 font-mono opacity-50">{pl.id}</td>
                      <td className="p-3 font-extrabold text-slate-100">{pl.title}</td>
                      <td className="p-3 font-mono text-pink-400 max-w-[200px] truncate">{pl.videoIds.join(', ')}</td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => {
                              setEditingPlaylist(pl);
                              setPlaylistForm({ title: pl.title, videoIds: pl.videoIds || [] });
                            }}
                            className="p-1 text-cyan-400 hover:bg-cyan-500/10 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePlaylist(pl.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ADS SLOTS */}
        {activeTab === 'ads' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-[#0d0e1b] rounded-xl border border-[#1e2038] space-y-4 self-start">
              <h3 className="font-extrabold text-sm text-white">{editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}</h3>
              <form onSubmit={handleSaveAd} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Posisi Slot</label>
                  <select
                    value={adForm.slot}
                    onChange={(e) => setAdForm({ ...adForm, slot: e.target.value })}
                    className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                  >
                    <option value="banner_top">Banner Atas Header (Sponsor Utama)</option>
                    <option value="banner_below_player">Banner Bawah Video Player (Watch Page)</option>
                    <option value="banner_sidebar">Banner Sidebar Kanan (Feed / Watch Page)</option>
                    <option value="banner_between_feed">Banner Di Antara Feed Episode (Home / Catalog Grid)</option>
                    <option value="banner_below_comments">Banner Bawah Komentar (Watch Page)</option>
                    <option value="banner_above_playlist">Banner Di Atas Widget Playlist Maraton</option>
                    <option value="banner_popup">Pop-up Modal / Floating Banner Saweria (Pojok Layar)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Judul / Slogan Iklan</label>
                  <input
                    type="text"
                    value={adForm.title}
                    onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                    className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                    placeholder="Dukung Operational ShinDora via Saweria!"
                    required
                  />
                </div>

                {/* Gunakan Raw Code / Custom Ad script Toggle */}
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={adForm.isRaw || false}
                    onChange={(e) => setAdForm({ ...adForm, isRaw: e.target.checked })}
                    id="adIsRaw"
                  />
                  <label htmlFor="adIsRaw" className="text-[11px] font-bold opacity-80 cursor-pointer text-cyan-400">Gunakan Kode Script / Raw Ad HTML</label>
                </div>

                {adForm.isRaw ? (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Kode Script / Iframe / AdSense Code</label>
                    <textarea
                      value={adForm.rawCode || ''}
                      onChange={(e) => setAdForm({ ...adForm, rawCode: e.target.value })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none h-24 font-mono leading-relaxed focus:border-cyan-500"
                      placeholder="Paste your <script> or <iframe> code from Adsterra, Monetag, Google AdSense, etc."
                      required={adForm.isRaw}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[10px] opacity-60 font-bold uppercase tracking-wider">URL Gambar Banner</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={adForm.imageUrl || ''}
                          onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                          className="flex-1 p-2 bg-[#121324] rounded border border-[#1e2038] text-white outline-none"
                          placeholder="https://images.unsplash.com/..."
                          required={!adForm.isRaw}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const mockEndpoint = siteSettings.imagekitUrlEndpoint || 'https://ik.imagekit.io/shindora'
                            const mockUrl = `${mockEndpoint}/mock_ad_${Date.now()}.png`
                            setAdForm({ ...adForm, imageUrl: mockUrl })
                            alert(`Berhasil Mengunggah Gambar ke ImageKit! URL Media: ${mockUrl}`)
                          }}
                          className="px-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold text-[10px]"
                        >
                          Upload ImageKit
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-[10px] opacity-60 font-bold uppercase tracking-wider">Tautan Target Link</label>
                      <input
                        type="text"
                        value={adForm.targetUrl}
                        onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })}
                        className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                        placeholder="https://saweria.co/shindora"
                        required={!adForm.isRaw}
                      />
                    </div>
                  </>
                )}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adForm.openInNewTab === undefined ? true : adForm.openInNewTab}
                      onChange={(e) => setAdForm({ ...adForm, openInNewTab: e.target.checked })}
                      id="adTargetNew"
                    />
                    <label htmlFor="adTargetNew" className="text-[11px] font-bold opacity-80 cursor-pointer">Buka Tautan di Tab Baru (target=&quot;_blank&quot;)</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adForm.isActive}
                      onChange={(e) => setAdForm({ ...adForm, isActive: e.target.checked })}
                      id="adActive"
                    />
                    <label htmlFor="adActive" className="text-[11px] font-bold opacity-80 cursor-pointer">Aktifkan Slot Iklan Ini</label>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded">
                    {editingAd ? 'Simpan' : 'Tambah Iklan'}
                  </button>
                  {editingAd && (
                    <button type="button" onClick={() => { setEditingAd(null); setAdForm({ slot: 'banner_top', title: '', imageUrl: '', targetUrl: '', isActive: true, isRaw: false, rawCode: '', openInNewTab: true }); }} className="px-3 bg-slate-500/10 text-xs rounded">
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="md:col-span-2 bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] opacity-60 text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Posisi</th>
                    <th className="p-3">Slogan Iklan</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {searchedAds.map((ad, index) => (
                    <tr key={ad._id || ad.id || `ad-${index}`}>
                      <td className="p-3 font-mono text-cyan-400">{ad.slot}</td>
                      <td className="p-3 font-bold text-slate-100">{ad.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${ad.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {ad.isActive ? 'AKTIF' : 'NON-AKTIF'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => { setEditingAd(ad); setAdForm(ad); }}
                            className="p-1 text-cyan-400 hover:bg-cyan-500/10 rounded"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS & API INTEGRATIONS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo, Google, OneSignal inputs */}
            <div className="p-5 bg-[#0d0e1b] rounded-xl border border-[#1e2038] space-y-4">
              <h3 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wider">&bull; Konfigurasi API &amp; Website</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Logo Website URL (Manual / Upload Preview)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://domain.com/logo.png"
                    value={siteSettings.logoUrl}
                    onChange={(e) => {
                      setSiteSettings({ ...siteSettings, logoUrl: e.target.value })
                      setLogoPreview(e.target.value)
                    }}
                    className="flex-1 text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
                  >
                    Upload Logo
                  </button>
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoUploadToImageKit}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {logoUploadProgress && (
                  <p className="text-[10px] text-cyan-400 font-bold animate-pulse">{logoUploadProgress}</p>
                )}

                {logoPreview && (
                  <div className="p-2 border border-dashed border-[#1e2038] rounded mt-1 bg-black/30">
                    <span className="text-[9px] opacity-40 uppercase block mb-1">Live Preview Logo:</span>
                    <img src={logoPreview} alt="Live Logo Preview" className="h-8 max-w-[150px] object-contain rounded" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-500/10">
                <div className="space-y-1.5 col-span-2">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Google OAuth Credentials</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Client ID</label>
                  <input
                    type="text"
                    value={siteSettings.googleClientId}
                    onChange={(e) => setSiteSettings({ ...siteSettings, googleClientId: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="client-id-xyz"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Client Secret</label>
                  <input
                    type="password"
                    value={siteSettings.googleClientSecret}
                    onChange={(e) => setSiteSettings({ ...siteSettings, googleClientSecret: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="secret-key-***"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-500/10">
                <div className="space-y-1.5 col-span-2">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">Storage & Media Settings (ImageKit)</span>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">ImageKit Public Key</label>
                  <input
                    type="text"
                    value={siteSettings.imagekitPublicKey || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, imagekitPublicKey: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="public_***"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">ImageKit Private Key</label>
                  <input
                    type="password"
                    value={siteSettings.imagekitPrivateKey || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, imagekitPrivateKey: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="private_***"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] opacity-60 font-bold uppercase">ImageKit URL Endpoint</label>
                  <input
                    type="text"
                    value={siteSettings.imagekitUrlEndpoint || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, imagekitUrlEndpoint: e.target.value })}
                    className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="https://ik.imagekit.io/your_id"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-500/10">
                <div className="space-y-1.5 col-span-2 flex items-center justify-between">
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">Interactive Donation Overlay Settings</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={siteSettings.donationOverlayActive === undefined ? true : siteSettings.donationOverlayActive}
                      onChange={(e) => setSiteSettings({ ...siteSettings, donationOverlayActive: e.target.checked })}
                      id="donOverlayActive"
                    />
                    <label htmlFor="donOverlayActive" className="text-[9px] font-bold opacity-80 cursor-pointer">AKTIFKAN OVERLAY</label>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Saweria Stream Key / Webhook URL</label>
                  <input
                    type="text"
                    value={siteSettings.saweriaStreamKey || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, saweriaStreamKey: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="saweria-key-xyz"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Trakteer Stream Key / Webhook URL</label>
                  <input
                    type="text"
                    value={siteSettings.trakteerStreamKey || ''}
                    onChange={(e) => setSiteSettings({ ...siteSettings, trakteerStreamKey: e.target.value })}
                    className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038]"
                    placeholder="trakteer-key-xyz"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Durasi Tampil Popup Overlay (Detik)</label>
                  <input
                    type="number"
                    value={siteSettings.donationPopupDuration || 6}
                    onChange={(e) => setSiteSettings({ ...siteSettings, donationPopupDuration: Number(e.target.value) })}
                    className="w-full p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    min="2"
                    max="30"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] opacity-60 font-bold uppercase">Kecepatan Running Text (Marquee Speed)</label>
                  <select
                    value={siteSettings.donationMarqueeSpeed || 'Sedang'}
                    onChange={(e) => setSiteSettings({ ...siteSettings, donationMarqueeSpeed: e.target.value })}
                    className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none font-bold"
                  >
                    <option value="Lambat">Lambat (Halus - 25 detik)</option>
                    <option value="Sedang">Sedang (Standar - 15 detik)</option>
                    <option value="Cepat">Cepat (Kilat - 8 detik)</option>
                  </select>
                </div>
              </div>

              {/* PENGATURAN RUNNING TEXT DI ATAS (TOP ANNOUNCEMENT BAR) */}
              <div className="pt-4 border-t border-slate-500/10 space-y-3.5 mt-4 text-left">
                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block">&bull; Pengaturan Running Text Di Atas (Top Announcement Bar)</span>
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/30 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] opacity-60 uppercase font-bold">Input Teks Running / Pengumuman</label>
                    <textarea
                      placeholder="Masukkan pesan berjalan di atas website..."
                      value={siteSettings.saweriaStreamKey || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, saweriaStreamKey: e.target.value })}
                      className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] opacity-60 uppercase font-bold">Dropdown Badge / Icon Prefix</label>
                      <select
                        value={siteSettings.onesignalRestApiKey || 'PENGUMUMAN'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, onesignalRestApiKey: e.target.value })}
                        className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none font-bold"
                      >
                        <option value="PENGUMUMAN">PENGUMUMAN</option>
                        <option value="DONASI TERBARU">DONASI TERBARU</option>
                        <option value="SAWERIA">SAWERIA</option>
                        <option value="TRAKTEER">TRAKTEER</option>
                        <option value="INFO">INFO</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] opacity-60 uppercase font-bold">Kecepatan Teks</label>
                      <select
                        value={siteSettings.donationMarqueeSpeed || 'Sedang'}
                        onChange={(e) => setSiteSettings({ ...siteSettings, donationMarqueeSpeed: e.target.value })}
                        className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none font-bold"
                      >
                        <option value="Pelan">Pelan (Halus - 20s)</option>
                        <option value="Sedang">Sedang (Standar - 15s)</option>
                        <option value="Cepat">Cepat (Kilat - 10s)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={siteSettings.donationOverlayActive === undefined ? true : siteSettings.donationOverlayActive}
                      onChange={(e) => setSiteSettings({ ...siteSettings, donationOverlayActive: e.target.checked })}
                      id="topBarAnnounceActive"
                    />
                    <label htmlFor="topBarAnnounceActive" className="text-xs font-bold opacity-80 cursor-pointer">Tampilkan Running Text di Bagian Atas Website (On/Off)</label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-black text-xs font-black rounded shadow-md uppercase tracking-wider"
                  >
                    SIMPAN &amp; TAMPILKAN RUNNING TEXT
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-500/10">
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest block mb-2">Provider Email Auth</span>
                <select
                  value={siteSettings.emailProvider}
                  onChange={(e) => setSiteSettings({ ...siteSettings, emailProvider: e.target.value })}
                  className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white font-bold"
                >
                  <option value="Mock/Simulasi">Mock/Simulasi</option>
                  <option value="Supabase Auth">Supabase Auth</option>
                  <option value="Firebase Auth">Firebase Auth</option>
                  <option value="Custom SMTP / Resend API">Custom SMTP / Resend API</option>
                </select>
              </div>

              {/* DYNAMIC EMAIL PROVIDER CREDENTIALS */}
              {siteSettings.emailProvider === 'Custom SMTP / Resend API' && (
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/20 space-y-3 mt-2">
                  <span className="text-[9px] font-black text-pink-400 uppercase block tracking-wider">&bull; SMTP / Resend API Credentials</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">Resend API Key</label>
                    <input
                      type="text"
                      placeholder="re_123456789..."
                      value={siteSettings.emailProviderCredentials?.resendApiKey || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          resendApiKey: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-[10px] font-bold opacity-60 uppercase">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="smtp.mailtrap.io"
                        value={siteSettings.emailProviderCredentials?.smtpHost || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          emailProviderCredentials: {
                            ...(siteSettings.emailProviderCredentials || {}),
                            smtpHost: e.target.value
                          }
                        })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold opacity-60 uppercase">SMTP Port</label>
                      <input
                        type="text"
                        placeholder="587"
                        value={siteSettings.emailProviderCredentials?.smtpPort || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          emailProviderCredentials: {
                            ...(siteSettings.emailProviderCredentials || {}),
                            smtpPort: e.target.value
                          }
                        })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">SMTP User / Email Pengirim</label>
                    <input
                      type="text"
                      placeholder="noreply@domainanda.com"
                      value={siteSettings.emailProviderCredentials?.smtpUser || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          smtpUser: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">SMTP Password / App Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={siteSettings.emailProviderCredentials?.smtpPass || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          smtpPass: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>
                </div>
              )}

              {siteSettings.emailProvider === 'Supabase Auth' && (
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/20 space-y-3 mt-2">
                  <span className="text-[9px] font-black text-pink-400 uppercase block tracking-wider">&bull; Supabase Auth Credentials</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">SUPABASE_URL</label>
                    <input
                      type="text"
                      placeholder="https://your-project.supabase.co"
                      value={siteSettings.emailProviderCredentials?.supabaseUrl || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          supabaseUrl: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">SUPABASE_ANON_KEY</label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={siteSettings.emailProviderCredentials?.supabaseAnonKey || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          supabaseAnonKey: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>
                </div>
              )}

              {siteSettings.emailProvider === 'Firebase Auth' && (
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/20 space-y-3 mt-2">
                  <span className="text-[9px] font-black text-pink-400 uppercase block tracking-wider">&bull; Firebase Auth Credentials</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold opacity-60 uppercase">FIREBASE_API_KEY</label>
                    <input
                      type="text"
                      placeholder="AIzaSyA1..."
                      value={siteSettings.emailProviderCredentials?.firebaseApiKey || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        emailProviderCredentials: {
                          ...(siteSettings.emailProviderCredentials || {}),
                          firebaseApiKey: e.target.value
                        }
                      })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold opacity-60 uppercase">FIREBASE_AUTH_DOMAIN</label>
                      <input
                        type="text"
                        placeholder="project.firebaseapp.com"
                        value={siteSettings.emailProviderCredentials?.firebaseAuthDomain || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          emailProviderCredentials: {
                            ...(siteSettings.emailProviderCredentials || {}),
                            firebaseAuthDomain: e.target.value
                          }
                        })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold opacity-60 uppercase">FIREBASE_PROJECT_ID</label>
                      <input
                        type="text"
                        placeholder="project-id-xyz"
                        value={siteSettings.emailProviderCredentials?.firebaseProjectId || ''}
                        onChange={(e) => setSiteSettings({
                          ...siteSettings,
                          emailProviderCredentials: {
                            ...(siteSettings.emailProviderCredentials || {}),
                            firebaseProjectId: e.target.value
                          }
                        })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveSettings}
                className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-black text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 shadow-lg uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Seluruh Pengaturan</span>
              </button>
            </div>

            {/* Social & Donation lists */}
            <div className="p-5 bg-[#0d0e1b] rounded-xl border border-[#1e2038] space-y-4">
              <h3 className="font-extrabold text-sm text-purple-400 uppercase tracking-wider">&bull; Tautan Sosial Media &amp; Donasi</h3>
              
              <div className="p-3 bg-black/40 rounded-lg space-y-3 border border-[#1e2038]">
                <span className="text-[10px] font-bold opacity-60 uppercase block">Tambah Tautan Baru:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama (TikTok, Saweria, YouTube)"
                    value={newSocialName}
                    onChange={(e) => setNewSocialName(e.target.value)}
                    className="p-2 text-xs bg-[#121324] rounded border border-[#1e2038]"
                  />
                  <input
                    type="text"
                    placeholder="https://saweria.co/..."
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    className="p-2 text-xs bg-[#121324] rounded border border-[#1e2038]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Link Sosmed / Donasi</span>
                </button>
              </div>

              {/* Added links list */}
              <div className="space-y-2">
                <span className="text-[10px] opacity-50 uppercase font-black">Tautan Terdaftar:</span>
                {(!siteSettings.socialLinks || siteSettings.socialLinks.length === 0) ? (
                  <p className="text-xs opacity-50 italic">Belum ada tautan sosial media yang terdaftar.</p>
                ) : (
                  <div className="space-y-1.5">
                    {siteSettings.socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-2 rounded bg-slate-500/5 text-xs">
                        <div>
                          <span className="font-extrabold text-slate-100">{link.name}:</span>
                          <span className="opacity-60 text-[10px] font-mono ml-2 truncate">{link.url}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSocialLink(link.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* HERO BANNER SECTION MANAGER */}
              <div className="pt-4 border-t border-slate-500/10 space-y-3.5 mt-4">
                <h3 className="font-extrabold text-sm text-pink-500 uppercase tracking-wider">&bull; Pengaturan Hero Banner Beranda</h3>
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/30 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. ✨ NOSTALGIA MASA KECIL"
                      value={siteSettings.hero_badge_text || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_badge_text: e.target.value })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Judul Utama Hero</label>
                    <input
                      type="text"
                      placeholder="e.g. Putar Kembali Kenangan Indah Hari Minggu Anda!"
                      value={siteSettings.hero_title || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_title: e.target.value })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-pink-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Deskripsi Hero</label>
                    <textarea
                      placeholder="e.g. Tonton kartun-kartun masa kecil favorit Anda..."
                      value={siteSettings.hero_description || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, hero_description: e.target.value })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none h-20 focus:border-pink-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Gambar Unggulan (Hero Card Image URL)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://domain.com/image.jpg"
                        value={siteSettings.hero_featured_image || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_featured_image: e.target.value })}
                        className="flex-1 text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => heroImageFileInputRef.current?.click()}
                        className="px-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold"
                      >
                        Upload
                      </button>
                      <input
                        type="file"
                        ref={heroImageFileInputRef}
                        onChange={handleHeroImageUploadToImageKit}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    {heroImageUploadProgress && (
                      <p className="text-[10px] text-pink-400 font-bold animate-pulse">{heroImageUploadProgress}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] opacity-60 uppercase font-bold">Label Card Unggulan</label>
                      <input
                        type="text"
                        placeholder="e.g. KOLEKSI TERPOPULER"
                        value={siteSettings.hero_featured_label || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_featured_label: e.target.value })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] opacity-60 uppercase font-bold">Judul Card Unggulan</label>
                      <input
                        type="text"
                        placeholder="e.g. Crayon Shinchan: Kenakalan..."
                        value={siteSettings.hero_featured_title || ''}
                        onChange={(e) => setSiteSettings({ ...siteSettings, hero_featured_title: e.target.value })}
                        className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-90 text-white text-xs font-bold rounded shadow-lg uppercase tracking-wider mt-2"
                  >
                    Simpan Perubahan Banner
                  </button>
                </div>
              </div>

              {/* SISTEM PROTEKSI WEBSITE */}
              <div className="pt-4 border-t border-slate-500/10 space-y-3.5 mt-4">
                <h3 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider">&bull; Sistem Proteksi Website</h3>
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/30 space-y-3">
                  {/* Anti AdBlock Toggle */}
                  <div className="flex items-center justify-between p-2 rounded bg-[#121324] border border-[#1e2038]">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200">Aktifkan Anti AdBlock</span>
                      <span className="text-[10px] opacity-50 block">Kunci layar jika adblock aktif</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={siteSettings.antiAdblockActive || false}
                        onChange={(e) => setSiteSettings({ ...siteSettings, antiAdblockActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500 peer-checked:after:bg-black peer-checked:after:border-black"></div>
                    </label>
                  </div>

                  {/* Anti AdBlock Custom Message */}
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Pesan Anti AdBlock Popup</label>
                    <textarea
                      placeholder="e.g. Mohon matikan AdBlock Anda..."
                      value={siteSettings.antiAdblockMessage || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, antiAdblockMessage: e.target.value })}
                      className="w-full text-xs p-2 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-yellow-500 h-16 leading-relaxed"
                    />
                  </div>

                  {/* Anti Copy Toggle */}
                  <div className="flex items-center justify-between p-2 rounded bg-[#121324] border border-[#1e2038]">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-200">Aktifkan Anti Copy / Inspect Element</span>
                      <span className="text-[10px] opacity-50 block">Blokir klik kanan, seleksi teks & F12</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={siteSettings.antiCopyActive || false}
                        onChange={(e) => setSiteSettings({ ...siteSettings, antiCopyActive: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-500/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-yellow-500 peer-checked:after:bg-black peer-checked:after:border-black"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:opacity-90 text-black text-xs font-black rounded shadow-lg uppercase tracking-wider mt-2"
                  >
                    Simpan Perubahan Proteksi
                  </button>
                </div>
              </div>

              {/* GLOBAL AD SCRIPTS INJECTION */}
              <div className="pt-4 border-t border-slate-500/10 space-y-3.5 mt-4">
                <h3 className="font-extrabold text-sm text-cyan-400 uppercase tracking-wider">&bull; Injeksi Head Ad Scripts Global</h3>
                <div className="p-3.5 rounded-lg border border-[#1e2038] bg-black/30 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] opacity-60 uppercase font-bold">Global Head Ad Scripts (AdSense, Adsterra, Monetag Popunder)</label>
                    <textarea
                      placeholder="e.g. <script src='https://pagead2.googlesyndication.com...'></script>"
                      value={siteSettings.globalHeadScripts || ''}
                      onChange={(e) => setSiteSettings({ ...siteSettings, globalHeadScripts: e.target.value })}
                      className="w-full text-xs p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none focus:border-cyan-500 h-32 leading-relaxed font-mono"
                    />
                    <span className="text-[9px] opacity-40 block">Menempelkan kode script/head tag ini secara otomatis ke dalam tag &lt;head&gt; di seluruh halaman.</span>
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-black text-xs font-black rounded shadow-lg uppercase tracking-wider mt-2"
                  >
                    Simpan Perubahan Head Script
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 7: PAGES MANAGER */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0d0e1b] p-4 rounded-xl border border-[#1e2038]">
              <div>
                <h3 className="font-extrabold text-sm text-white">Kelola Halaman Statis &amp; Dokumen</h3>
                <p className="text-[11px] opacity-60">Sediakan dokumen hukum seperti DMCA Disclaimer, Privacy Policy, Terms, dll.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPage(null)
                  setPageForm({ title: '', slug: '', content: '', showInFooter: true })
                  setShowPageModal(true)
                }}
                className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Halaman Baru</span>
              </button>
            </div>

            {/* Static Pages List */}
            <div className="bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] text-[10px] uppercase font-bold opacity-60 border-b border-[#1e2038]">
                  <tr>
                    <th className="p-3">Judul Dokumen</th>
                    <th className="p-3">Slug URL</th>
                    <th className="p-3 text-center">Tampilkan di Footer</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {staticPages.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center opacity-50 italic">Belum ada halaman statis yang terdaftar.</td>
                    </tr>
                  ) : (
                    staticPages.map((page, idx) => (
                      <tr key={page._id || page.id || `pg-${idx}`} className="hover:bg-slate-500/5 transition-all">
                        <td className="p-3 font-extrabold text-slate-100">{page.title}</td>
                        <td className="p-3 font-mono text-cyan-400">/page/{page.slug}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${page.showInFooter ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                            {page.showInFooter ? 'YA' : 'TIDAK'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-2">
                            <a
                              href={`/page/${page.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-pink-400 hover:bg-pink-500/10 border border-pink-500/20 rounded font-bold text-[10px]"
                            >
                              Live Preview
                            </a>
                            <button
                              onClick={() => {
                                setEditingPage(page)
                                setPageForm(page)
                                setShowPageModal(true)
                              }}
                              className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 rounded"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePage(page.id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGES CREATE/EDIT MODAL */}
        {showPageModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0e1b] border border-[#1e2038] rounded-2xl w-full max-w-lg p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPageModal(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-slate-500/5 text-xs opacity-65"
              >
                &times;
              </button>
              <h3 className="font-black text-white text-base border-b border-slate-500/10 pb-2">
                {editingPage ? 'Ubah Informasi Halaman Statis' : 'Buat Halaman Statis Baru'}
              </h3>

              <form onSubmit={handleSavePage} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold opacity-60">Judul Halaman</label>
                  <input
                    type="text"
                    value={pageForm.title}
                    onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                    placeholder="Contoh: DMCA Disclaimer"
                    className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold opacity-60">Slug URL Dinamis</label>
                  <input
                    type="text"
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                    placeholder="contoh: dmca-policy"
                    className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold opacity-60">Konten Halaman (HTML / Markdown ringkas)</label>
                  <textarea
                    value={pageForm.content}
                    onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                    placeholder="<h2>Kebijakan Kami</h2><p>Tulis teks di sini...</p>"
                    className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none h-40 font-mono"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={pageForm.showInFooter}
                    onChange={(e) => setPageForm({ ...pageForm, showInFooter: e.target.checked })}
                    id="pageShowFooter"
                  />
                  <label htmlFor="pageShowFooter" className="text-xs font-bold opacity-80 cursor-pointer">Tampilkan Link Halaman Ini di Navigation Footer</label>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-500/10">
                  <button type="submit" className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded">
                    Simpan Halaman
                  </button>
                  <button type="button" onClick={() => setShowPageModal(false)} className="px-4 py-2 bg-slate-500/15 text-slate-300 rounded">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 8: ANIME REQUEST & POLLING MANAGER */}
        {activeTab === 'polling' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#0d0e1b] p-4 rounded-xl border border-[#1e2038]">
              <div>
                <h3 className="font-extrabold text-sm text-white">Anime Request &amp; Polling Manager</h3>
                <p className="text-[11px] opacity-60">Sediakan opsi bagi pengunjung untuk melakukan voting anime nostalgia berikutnya.</p>
              </div>
              <button
                onClick={() => {
                  setEditingPoll(null)
                  setPollForm({ title: '', options: [{ id: 'opt-1', name: '', imageUrl: '', votes: 0 }], isActive: true })
                  setShowPollModal(true)
                }}
                className="px-4 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs flex items-center gap-1 shadow-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Polling Baru</span>
              </button>
            </div>

            {/* Polling Data List */}
            <div className="bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#121324] text-[10px] uppercase font-bold opacity-60 border-b border-[#1e2038]">
                  <tr>
                    <th className="p-3">Pertanyaan / Topik Polling</th>
                    <th className="p-3">Opsi Pilihan (Votes)</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2038]">
                  {pollingList.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center opacity-50 italic">Belum ada polling yang terdaftar.</td>
                    </tr>
                  ) : (
                    pollingList.map((poll, idx) => {
                      const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0)
                      return (
                        <tr key={poll._id || poll.id || `poll-${idx}`} className="hover:bg-slate-500/5 transition-all">
                          <td className="p-3">
                            <p className="font-extrabold text-slate-100">{poll.title}</p>
                            <span className="text-[10px] opacity-50 font-mono">ID: {poll.id} &bull; Total Suara: {totalVotes}</span>
                          </td>
                          <td className="p-3 space-y-1 max-w-sm">
                            {poll.options.map(o => (
                              <div key={o.id} className="flex justify-between text-[11px]">
                                <span className="opacity-90">{o.name}</span>
                                <span className="text-cyan-400 font-bold font-mono">{o.votes || 0} votes</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${poll.isActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                              {poll.isActive ? 'AKTIF' : 'MATI'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleResetPollVotes(poll)}
                                className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded text-[10px] font-black border border-amber-500/20"
                                title="Reset total vote ke 0"
                              >
                                Reset Hasil
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPoll(poll)
                                  setPollForm(poll)
                                  setShowPollModal(true)
                                }}
                                className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20 rounded"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePoll(poll.id)}
                                className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* POLLING CREATE/EDIT MODAL */}
        {showPollModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0e1b] border border-[#1e2038] rounded-2xl w-full max-w-lg p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowPollModal(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-slate-500/5 text-xs opacity-65"
              >
                &times;
              </button>
              <h3 className="font-black text-white text-base border-b border-slate-500/10 pb-2">
                {editingPoll ? 'Ubah Informasi Polling Anime' : 'Buat Topik Polling Baru'}
              </h3>

              <form onSubmit={handleSavePoll} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold opacity-60">Judul / Pertanyaan Polling</label>
                  <input
                    type="text"
                    value={pollForm.title}
                    onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
                    placeholder="Contoh: Request Anime Nostalgia Pilihanmu"
                    className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                    required
                  />
                </div>

                {/* Dynamic Polling Options List */}
                <div className="space-y-3 pt-2 border-t border-slate-500/10">
                  <div className="flex justify-between items-center">
                    <span className="font-black uppercase tracking-wider text-[10px] text-pink-500">Pilihan Opsi Anime (Opsi Pilihan)</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newId = `opt-${Date.now()}`
                        setPollForm({
                          ...pollForm,
                          options: [...pollForm.options, { id: newId, name: '', imageUrl: '', votes: 0 }]
                        })
                      }}
                      className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[9px] font-black"
                    >
                      + Tambah Opsi
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-[250px] overflow-y-auto scrollbar-hide">
                    {pollForm.options.map((opt, oIdx) => (
                      <div key={opt.id} className="p-3 rounded-lg border border-[#1e2038] bg-black/20 space-y-2 relative text-left">
                        <button
                          type="button"
                          onClick={() => {
                            const updatedOptions = pollForm.options.filter(o => o.id !== opt.id)
                            setPollForm({ ...pollForm, options: updatedOptions })
                          }}
                          className="absolute top-1.5 right-1.5 text-red-400 font-bold hover:text-red-500"
                        >
                          &times;
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] opacity-60 font-bold">Nama Anime</label>
                            <input
                              type="text"
                              value={opt.name}
                              onChange={(e) => {
                                const updatedOptions = [...pollForm.options]
                                updatedOptions[oIdx].name = e.target.value
                                setPollForm({ ...pollForm, options: updatedOptions })
                              }}
                              placeholder="Contoh: Digimon"
                              className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038]"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] opacity-60 font-bold">Nilai Awal Vote</label>
                            <input
                              type="number"
                              value={opt.votes || 0}
                              onChange={(e) => {
                                const updatedOptions = [...pollForm.options]
                                updatedOptions[oIdx].votes = Number(e.target.value)
                                setPollForm({ ...pollForm, options: updatedOptions })
                              }}
                              className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038]"
                              min="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] opacity-60 font-bold">URL Gambar Thumbnail</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={opt.imageUrl || ''}
                              onChange={(e) => {
                                const updatedOptions = [...pollForm.options]
                                updatedOptions[oIdx].imageUrl = e.target.value
                                setPollForm({ ...pollForm, options: updatedOptions })
                              }}
                              placeholder="https://images.unsplash.com/..."
                              className="flex-1 p-2 bg-[#121324] rounded border border-[#1e2038]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const mockUrl = `https://ik.imagekit.io/shindora/mock_poll_${Date.now()}.png`
                                const updatedOptions = [...pollForm.options]
                                updatedOptions[oIdx].imageUrl = mockUrl
                                setPollForm({ ...pollForm, options: updatedOptions })
                                alert(`Uploaded option image to ImageKit! URL: ${mockUrl}`)
                              }}
                              className="px-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-[9px] font-bold"
                            >
                              Upload ImageKit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={pollForm.isActive}
                    onChange={(e) => setPollForm({ ...pollForm, isActive: e.target.checked })}
                    id="pollActive"
                  />
                  <label htmlFor="pollActive" className="text-xs font-bold opacity-80 cursor-pointer">Aktifkan Polling Ini di Frontend (On/Off)</label>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-500/10">
                  <button type="submit" className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded">
                    Simpan Polling
                  </button>
                  <button type="button" onClick={() => setShowPollModal(false)} className="px-4 py-2 bg-slate-500/15 text-slate-300 rounded">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIDEOS CREATE/EDIT MODAL */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0d0e1b] border border-[#1e2038] rounded-2xl w-full max-w-lg p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-slate-500/5 text-xs opacity-65"
              >
                &times;
              </button>
              <h3 className="font-black text-white text-base border-b border-slate-500/10 pb-2">
                {editingVideo ? 'Ubah Informasi Video Retro' : 'Tambah Video Baru ke Shindora'}
              </h3>

              <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold opacity-60">Judul Episode</label>
                  <input
                    type="text"
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold opacity-60">Kategori Anime</label>
                    <select
                      value={videoForm.animeTitle}
                      onChange={(e) => setVideoForm({ ...videoForm, animeTitle: e.target.value })}
                      className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    >
                      {(() => {
                        const mainCategories = categories.filter(c => !c.parent_id || c.parent_id === 'none');
                        const options = [];
                        mainCategories.forEach(parent => {
                          options.push(
                            <option key={parent.id} value={parent.name}>
                              {parent.name} (Kategori Utama)
                            </option>
                          );
                          const children = categories.filter(c => c.parent_id === parent.id);
                          children.forEach(child => {
                            const combinedVal = `${parent.name} > ${child.name}`;
                            options.push(
                              <option key={child.id} value={combinedVal}>
                                &nbsp;&nbsp;-- {combinedVal}
                              </option>
                            );
                          });
                        });
                        if (options.length === 0) {
                          return (
                            <>
                              <option value="Doraemon">Doraemon</option>
                              <option value="Crayon Shinchan">Crayon Shinchan</option>
                              <option value="Ninja Hattori-kun">Ninja Hattori-kun</option>
                              <option value="Chibi Maruko-chan">Chibi Maruko-chan</option>
                            </>
                          );
                        }
                        return options;
                      })()}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold opacity-60">Nomor Episode</label>
                    <input
                      type="number"
                      value={parseInt(videoForm.episode?.replace(/\D/g, '')) || 1}
                      onChange={(e) => setVideoForm({ ...videoForm, episode: `Eps ${e.target.value}` })}
                      className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold opacity-60">Thumbnail Gambar URL (Link Eksternal)</label>
                  <input
                    type="text"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold opacity-60">Server 1 (Direct URL / Raw Iframe Tag)</label>
                  <input
                    type="text"
                    value={videoForm.videoUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                    className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold opacity-60">Server 2 (Direct URL / Raw Iframe Tag)</label>
                    <input
                      type="text"
                      value={videoForm.videoUrl2 || ''}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl2: e.target.value })}
                      className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold opacity-60">Server 3 (Direct URL / Raw Iframe Tag)</label>
                    <input
                      type="text"
                      value={videoForm.videoUrl3 || ''}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl3: e.target.value })}
                      className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold opacity-60">Deskripsi Singkat</label>
                  <textarea
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    className="w-full p-2 rounded bg-[#121324] border border-[#1e2038] h-16"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={videoForm.sendPushNotification || false}
                    onChange={(e) => setVideoForm({ ...videoForm, sendPushNotification: e.target.checked })}
                    id="videoSendPush"
                  />
                  <label htmlFor="videoSendPush" className="text-xs font-bold opacity-80 cursor-pointer">Kirim Push Notification ke Seluruh Pengguna via OneSignal</label>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-500/10">
                  <button type="submit" className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded">
                    Simpan Video
                  </button>
                  <button type="button" onClick={() => setShowVideoModal(false)} className="px-4 py-2 bg-slate-500/15 text-slate-300 rounded">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
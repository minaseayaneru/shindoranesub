'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Menu,
  Tv,
  Search,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Play,
  Heart,
  Clock,
  Plus,
  Trash2,
  LogOut,
  X,
  User,
  Upload,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FolderHeart,
  ListVideo,
  Bell,
  BarChart3
} from 'lucide-react'

const AdSlotContainer = ({ ad }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!ad || !ad.isRaw || !ad.rawCode || !containerRef.current) return;

    // Clear the container
    containerRef.current.innerHTML = '';

    // Create temporary element to parse rawCode
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ad.rawCode;

    // Extract and execute script tags
    const scripts = tempDiv.querySelectorAll('script');
    
    // Append non-script elements first
    Array.from(tempDiv.childNodes).forEach(node => {
      if (node.tagName !== 'SCRIPT') {
        containerRef.current.appendChild(node.cloneNode(true));
      }
    });

    // Append and execute scripts
    scripts.forEach(scr => {
      const newScript = document.createElement('script');
      // Copy attributes
      Array.from(scr.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      // Set content
      newScript.innerHTML = scr.innerHTML;
      containerRef.current.appendChild(newScript);
    });

    // If it's an AdSense block, push the ad
    if (ad.rawCode.includes('adsbygoogle') || ad.rawCode.includes('ins class="adsbygoogle"')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('[AdSense] adsbygoogle push error:', e);
      }
    }
  }, [ad]);

  if (!ad) return null;

  if (ad.isRaw && ad.rawCode) {
    return (
      <div 
        ref={containerRef} 
        className="my-4 w-full flex justify-center items-center overflow-hidden min-h-[50px] relative z-0" 
      />
    );
  }

  // Standard image ad render
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-purple-500/10 bg-purple-500/5 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />}
        <div>
          <span className="text-[8px] uppercase tracking-wider text-pink-400 font-bold block">SPONSOR</span>
          <p className="font-extrabold text-slate-200">{ad.title}</p>
        </div>
      </div>
      <a
        href={ad.targetUrl}
        target={ad.openInNewTab !== false ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="px-4 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-extrabold transition-all text-center self-stretch sm:self-auto"
      >
        Kunjungi
      </a>
    </div>
  );
};

export default function App() {
  const [isMounted, setIsMounted] = useState(false)

  const renderCategoryBadges = (animeTitle, textClass = "text-[8px]") => {
    if (!animeTitle) return null;
    const parts = animeTitle.split(' > ');
    if (parts.length === 2) {
      return (
        <div className="flex flex-wrap gap-1">
          <span className={`px-1.5 py-0.5 rounded font-bold bg-black/80 text-cyan-400 uppercase ${textClass}`}>
            {parts[0]}
          </span>
          <span className={`px-1.5 py-0.5 rounded font-bold bg-cyan-500 text-black uppercase ${textClass}`}>
            {parts[1]}
          </span>
        </div>
      );
    }
    return (
      <span className={`px-1.5 py-0.5 rounded font-bold bg-black/80 text-cyan-400 uppercase ${textClass}`}>
        {animeTitle}
      </span>
    );
  };
  // Theme and UI state
  const [theme, setTheme] = useState('dark')
  const [sidebarOpen, setSidebarOpen] = useState(false) // Collapse initially on desktop!
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('tab') || 'home'
    }
    return 'home'
  }) // home, trending, playlists, later, liked, profile, watch
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('SEMUA')

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null)

  // Core Data Lists
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [ads, setAds] = useState([])
  const [staticPages, setStaticPages] = useState([])
  const [pollingList, setPollingList] = useState([])
  const [adblockDetected, setAdblockDetected] = useState(false)
  const [playlistSelectorVideo, setPlaylistSelectorVideo] = useState(null)
  const [settings, setSettings] = useState({
    logoUrl: '',
    socialLinks: []
  })

  // Watch State
  const [activeVideo, setActiveVideo] = useState(null)
  const [activeServer, setActiveServer] = useState(1)
  const [likedVideoIds, setLikedVideos] = useState([])
  const [watchLaterIds, setWatchLater] = useState([])
  
  // Comments for active video
  const [comments, setComments] = useState([])
  const [newCommentText, setNewCommentText] = useState('')
  const [activeReplyToId, setActiveReplyToId] = useState(null)
  const [replyText, setReplyText] = useState('')


  const [showAnnouncement, setShowAnnouncement] = useState(true)


  // Donation Overlay States

  // User custom polling creation modal state
  const [showUserPollModal, setShowUserPollModal] = useState(false)
  const [userPollForm, setUserPollForm] = useState({
    title: '', options: [{ id: 'opt-1', name: '', imageUrl: '', votes: 0 }, { id: 'opt-2', name: '', imageUrl: '', votes: 0 }]
  })

  const [activeOverlayDonation, setActiveOverlayDonation] = useState(null)
  const [lastSeenDonationId, setLastSeenDonationId] = useState(null)

  const getAnnouncementBadgeLabel = () => {
    const val = settings?.onesignalRestApiKey || 'PENGUMUMAN'
    if (val.includes('key') || val.includes('secret') || val === 'onesignal-rest-key-123') {
      return 'PENGUMUMAN'
    }
    return val
  }

  const getAnnouncementMessageLabel = () => {
    const val = settings?.saweriaStreamKey || ''
    if (val.includes('key') || val.includes('secret') || val === 'saweria-mock-key-123' || !val) {
      return 'Selamat datang di ShinDora Nesub! Terima kasih kepada Bagas (Rp 10.000) & Ahmad Fauzi (Rp 100.000) yang telah mendonasikan dukungannya! | Episode baru Shin-chan tayang setiap Sabtu!'
    }
    return val
  }

  // ANTI ADBLOCK DETECTOR HOOK
  useEffect(() => {
    if (!isMounted || !settings || !settings.antiAdblockActive) {
      setAdblockDetected(false);
      return;
    }

    const verifyAdblock = async () => {
      // DOM check
      const tester = document.createElement('div');
      tester.className = 'adsbox ad-placement ad-banner pub_300x250';
      tester.style.position = 'absolute';
      tester.style.left = '-9999px';
      tester.style.width = '1px';
      tester.style.height = '1px';
      document.body.appendChild(tester);
      const domBlocked = tester.offsetParent === null || window.getComputedStyle(tester).display === 'none';
      document.body.removeChild(tester);
      
      if (domBlocked) {
        setAdblockDetected(true);
        return;
      }

      // Fetch check
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', { method: 'HEAD', mode: 'no-cors' });
        setAdblockDetected(false);
      } catch (err) {
        setAdblockDetected(true);
      }
    };

    verifyAdblock();
    const interval = setInterval(verifyAdblock, 5000);
    return () => clearInterval(interval);
  }, [isMounted, settings]);

  // ANTI COPY / INSPECT ELEMENT HOOK
  useEffect(() => {
    if (!isMounted || !settings || !settings.antiCopyActive) return;

    const handleContextMenu = (e) => {
      e.preventDefault();
      alert('Proteksi Klik Kanan Aktif!');
    };
    window.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        alert('Proteksi Inspect Element Aktif!');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key?.toLowerCase() === 'i') {
        e.preventDefault();
        alert('Proteksi Inspect Element Aktif!');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key?.toLowerCase() === 'j') {
        e.preventDefault();
        alert('Proteksi Inspect Element Aktif!');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key?.toLowerCase() === 'u') {
        e.preventDefault();
        alert('Proteksi View Source Aktif!');
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMounted, settings]);

  // GLOBAL HEAD AD SCRIPTS INJECTOR HOOK
  useEffect(() => {
    if (!isMounted || !settings || !settings.globalHeadScripts) return;

    // Clean up old scripts
    const exist = document.querySelectorAll('.dynamic-global-head-script');
    exist.forEach(el => el.remove());

    // Create temporary div to parse tags
    const temp = document.createElement('div');
    temp.innerHTML = settings.globalHeadScripts;

    // Inject non-script tags
    const others = temp.querySelectorAll('link, style, meta, font');
    others.forEach(oth => {
      const cloned = oth.cloneNode(true);
      cloned.className = 'dynamic-global-head-script';
      document.head.appendChild(cloned);
    });

    // Inject script tags
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(scr => {
      const newScript = document.createElement('script');
      newScript.className = 'dynamic-global-head-script';
      Array.from(scr.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.innerHTML = scr.innerHTML;
      document.head.appendChild(newScript);
    });
  }, [isMounted, settings]);


  // Playlist Mode Player
  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0)
  const [isAutoplayPlaylist, setIsAutoplayPlaylist] = useState(true)

  // Profile Form Upload
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(null)
  const fileInputRef = useRef(null)

  // Create Playlist Form state in Profile page
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [playlistSearchQuery, setPlaylistSearchQuery] = useState('')

  // Load Initial Configuration and data
  useEffect(() => {
    // Sync with localStorage on client
    const savedTheme = localStorage.getItem('shindora-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')

    const storedUser = localStorage.getItem('shindora-user')
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser))
    }

    const savedLiked = localStorage.getItem('shindora-liked')
    if (savedLiked) setLikedVideos(JSON.parse(savedLiked))

    const savedLater = localStorage.getItem('shindora-later')
    if (savedLater) setWatchLater(JSON.parse(savedLater))

    const initFetch = async () => {
      try {
        const vidRes = await fetch('/api/videos')
        const vids = await vidRes.json()
        const validVids = Array.isArray(vids) ? vids : []
        setVideos(validVids)

        const catRes = await fetch('/api/categories')
        const cats = await catRes.json()
        setCategories(Array.isArray(cats) ? cats : [])

        const adRes = await fetch('/api/ads')
        const adList = await adRes.json()
        setAds(Array.isArray(adList) ? adList : [])

        const setRes = await fetch('/api/settings')
        const sets = await setRes.json()
        if (sets && sets.id) setSettings(sets)

        // Restore activeTab & activeVideo from URL params!
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search)
          const tab = params.get('tab') || 'home'
          const vidId = params.get('id')

          setActiveTab(tab)
          if (tab === 'watch' && vidId) {
            const matchingVid = validVids.find(v => v.id === vidId)
            if (matchingVid) {
              setActiveVideo(matchingVid)
            }
          } else {
            setActiveVideo(null)
          }
        }
        setIsMounted(true)
      } catch (err) {
        console.error('Failed to load initial data:', err)
        setIsMounted(true)
      }
    }
    initFetch()
  }, [])


  const getSortedCategoryEpisodes = (categoryName) => {
    if (!categoryName || !videos) return []
    return videos
      .filter(v => v.animeTitle === categoryName)
      .sort((a, b) => {
        const numA = parseInt(a.episode?.replace(/\D/g, '')) || 0
        const numB = parseInt(b.episode?.replace(/\D/g, '')) || 0
        return numA - numB
      })
  }

  const getPrevEpisode = () => {
    if (!activeVideo || !videos || videos.length === 0) return null
    const sorted = getSortedCategoryEpisodes(activeVideo.animeTitle)
    const currentIndex = sorted.findIndex(v => v.id === activeVideo.id)
    if (currentIndex > 0) {
      return sorted[currentIndex - 1]
    }
    return null
  }

  const getNextEpisode = () => {
    if (!activeVideo || !videos || videos.length === 0) return null
    const sorted = getSortedCategoryEpisodes(activeVideo.animeTitle)
    const currentIndex = sorted.findIndex(v => v.id === activeVideo.id)
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      return sorted[currentIndex + 1]
    }
    return null
  }

  const getEmbedUrl = (video) => {
    if (!video) return ''
    let url = video.videoUrl
    if (activeServer === 2 && video.videoUrl2) {
      url = video.videoUrl2
    } else if (activeServer === 3 && video.videoUrl3) {
      url = video.videoUrl3
    }
    return `${url}${url?.includes('?') ? '&' : '?'}autoplay=1&mute=0`
  }

  const getActiveServerUrl = (video) => {
    if (!video) return ''
    let url = video.videoUrl
    if (activeServer === 2 && video.videoUrl2) {
      url = video.videoUrl2
    } else if (activeServer === 3 && video.videoUrl3) {
      url = video.videoUrl3
    }
    return url || ''
  }



  const safeFetchJson = async (url, options = {}) => {
    try {
      const response = await fetch(url, options)
      const contentType = response.headers.get("content-type")
      if (response.ok && contentType && contentType.includes("application/json")) {
        return await response.json()
      } else {
        console.warn(`[SafeFetch] non-JSON or error response from ${url}:`, response.status)
        return null
      }
    } catch (err) {
      console.error(`[SafeFetch] network error for ${url}:`, err)
      return null
    }
  }

  const fetchCoreData = async () => {
    try {
      const vids = await safeFetchJson('/api/videos')
      const validVids = Array.isArray(vids) ? vids : []
      setVideos(validVids)

      const cats = await safeFetchJson('/api/categories')
      setCategories(Array.isArray(cats) ? cats : [])

      const adList = await safeFetchJson('/api/ads')
      setAds(Array.isArray(adList) ? adList : [])

      const sets = await safeFetchJson('/api/settings')
      if (sets && sets.id) setSettings(sets)

      const pList = await safeFetchJson('/api/pages')
      setStaticPages(Array.isArray(pList) ? pList : [])

      const polls = await safeFetchJson('/api/polling')
      setPollingList(Array.isArray(polls) ? polls : [])

      fetchPlaylists()
    } catch (err) {
      console.error('Failed to load initial data:', err)
    }
  }

  const handleCastVote = async (pollId, optionId) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`shindora-voted-${pollId}`, optionId)
    }
    try {
      const res = await fetch('/api/polling/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pollId, 
          optionId,
          userId: currentUser ? currentUser.id : null
        })
      })
      if (res.ok) {
        fetchCoreData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateUserPoll = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    if (!userPollForm.title.trim()) return

    const hasActivePoll = pollingList.some(p => p.ownerId === currentUser.id && p.isActive)
    if (hasActivePoll) {
      alert("Anda sudah memiliki 1 vote yang sedang berjalan. Hapus atau tunggu vote Anda selesai untuk membuat vote baru.")
      setShowUserPollModal(false)
      return
    }

    try {
      const res = await fetch('/api/polling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: userPollForm.title,
          options: userPollForm.options,
          ownerId: currentUser.id,
          isActive: true
        })
      })
      if (res.ok) {
        alert('Vote kustom Anda berhasil dibuat dan diterbitkan!')
        setUserPollForm({ title: '', options: [{ id: 'opt-1', name: '', imageUrl: '', votes: 0 }, { id: 'opt-2', name: '', imageUrl: '', votes: 0 }] })
        setShowUserPollModal(false)
        fetchCoreData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteUserPoll = async (pollId) => {
    if (!confirm('Hapus vote kustom Anda? Tindakan ini akan mereset kuota pembuatan vote Anda.')) return
    try {
      const res = await fetch(`/api/polling?id=${pollId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchCoreData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Update URL Query Parameters dynamically on tab or activeVideo change
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const params = new URLSearchParams()
      if (activeTab) params.set('tab', activeTab)
      if (activeTab === 'watch' && activeVideo) {
        params.set('id', activeVideo.id)
      }
      
      const newUrl = params.toString() ? `?${params.toString()}` : '/'
      window.history.replaceState(null, '', newUrl)
    }
  }, [isMounted, activeTab, activeVideo])

  // Re-fetch data on activeTab changes to keep the video catalogs updated in real-time
  useEffect(() => {
    fetchCoreData()
  }, [activeTab])

  // Ok.ru Player API & PostMessage autoplay listener
  useEffect(() => {
    const handleMessage = (event) => {
      // Support SHINDORA_VIDEO_ENDED, SHINDORA_AUTOPLAY, complete, or ok.ru player sdk ended events
      const isVideoEnded = 
        event.data === 'SHINDORA_AUTOPLAY' || 
        event.data === 'complete' || 
        event.data?.event === 'complete' || 
        event.data?.event === 'api.video.ended' ||
        event.data === 'api.video.ended' ||
        event.data?.event === 'SHINDORA_VIDEO_ENDED' ||
        event.data === 'SHINDORA_VIDEO_ENDED' ||
        // OK.ru SDK fapi messages
        event.data?.method === 'api.video.ended' ||
        event.data?.type === 'api.video.ended' ||
        // Sibnet HTML5 message states
        event.data === 'ended' ||
        event.data?.event === 'ended' ||
        event.data === 'sibnet_video_ended' ||
        event.data === 'video_ended' ||
        event.data?.message === 'ended' ||
        event.data?.message === 'complete';

      if (isVideoEnded) {
        console.log('[PostMessage] Video ended event received. Playing next!')
        if (isAutoplayPlaylist && currentPlaylist) {
          playNextPlaylistItem()
        } else {
          // Watch Episode Normal autoplay next
          const nextVid = getNextEpisode()
          if (nextVid) {
            setActiveVideo(nextVid)
            setActiveServer(1)
          }
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [videos, activeVideo, currentPlaylist, isAutoplayPlaylist])

  // AUTOMATIC VIEWS INCREMENT HOOK
  useEffect(() => {
    if (activeVideo && activeVideo.id) {
      const incrementViews = async () => {
        try {
          const res = await fetch('/api/videos/increment-views', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: activeVideo.id })
          });
          if (res.ok) {
            const updatedVid = await res.json();
            setVideos(prev => prev.map(v => v.id === updatedVid.id ? { ...v, views: updatedVid.views } : v));
            setActiveVideo(prev => prev && prev.id === updatedVid.id ? { ...prev, views: updatedVid.views } : prev);
          }
        } catch (err) {
          console.error('[Views Increment] Error:', err);
        }
      };
      // Delay slightly to simulate watch start or debounce instant clicking
      const t = setTimeout(incrementViews, 1000);
      return () => clearTimeout(t);
    }
  }, [activeVideo?.id]);

  // Poll Donation logs every 7 seconds for real-time overlay notifications
  useEffect(() => {
    if (settings && settings.donationOverlayActive === false) return

    const pollDonations = async () => {
      try {
        const latestDons = await safeFetchJson('/api/webhooks/poll')
        if (Array.isArray(latestDons) && latestDons.length > 0) {
          const newest = latestDons[0]
          
          if (!lastSeenDonationId) {
            setLastSeenDonationId(newest.id)
            return
          }

          if (newest.id !== lastSeenDonationId) {
            setLastSeenDonationId(newest.id)
            setActiveOverlayDonation(newest)

            const popupDuration = (settings?.donationPopupDuration || 6) * 1000
            setTimeout(() => {
              setActiveOverlayDonation(null)
            }, popupDuration)
          }
        }
      } catch (err) {
        console.error('Donation polling error:', err)
      }
    }

    const interval = setInterval(pollDonations, 7000)
    return () => clearInterval(interval)
  }, [settings, lastSeenDonationId])

  const fetchPlaylists = async () => {
    try {
      const userId = currentUser ? currentUser.id : ''
      const plList = await safeFetchJson(`/api/playlists?userId=${userId}`)
      setPlaylists(Array.isArray(plList) ? plList : [])
    } catch (err) {
      console.error('Failed to load playlists:', err)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchPlaylists()
    } else {
      // Just keep public playlists
      setPlaylists(prev => prev.filter(p => p.ownerId === null))
    }
  }, [currentUser])

  // Load comments for active video
  useEffect(() => {
    if (activeVideo) {
      fetchComments(activeVideo.id)
    }
  }, [activeVideo])

  const fetchComments = async (videoId) => {
    try {
      const data = await safeFetchJson(`/api/comments?videoId=${videoId}`)
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('shindora-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem('shindora-user')
    setCurrentUser(null)
    setActiveTab('home')
  }

  // Like video handler
  const handleLikeVideo = async (video) => {
    const isLiked = likedVideoIds.includes(video.id)
    const action = isLiked ? 'unlike' : 'like'
    
    // Snappy optimistic local state toggle
    const updated = isLiked 
      ? likedVideoIds.filter(id => id !== video.id) 
      : [...likedVideoIds, video.id]
      
    setLikedVideos(updated)
    localStorage.setItem('shindora-liked', JSON.stringify(updated))

    try {
      const res = await fetch('/api/videos/toggle-like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: video.id, action })
      })
      if (res.ok) {
        const updatedVid = await res.json()
        setVideos(prev => prev.map(v => v.id === updatedVid.id ? { ...v, likes: updatedVid.likes } : v))
        setActiveVideo(prev => prev && prev.id === updatedVid.id ? { ...prev, likes: updatedVid.likes } : prev)
      }
    } catch (err) {
      console.error('[Like Toggle Error]:', err)
    }
  }

  // Watch Later handler
  const handleWatchLater = (video) => {
    let updated = []
    if (watchLaterIds.includes(video.id)) {
      updated = watchLaterIds.filter(id => id !== video.id)
    } else {
      updated = [...watchLaterIds, video.id]
    }
    setWatchLater(updated)
    localStorage.setItem('shindora-later', JSON.stringify(updated))
  }

  // Create user playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylistTitle.trim() || !currentUser) return

    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPlaylistTitle,
          ownerId: currentUser.id,
          isPrivate: true,
          videoIds: []
        })
      })
      if (res.ok) {
        setNewPlaylistTitle('')
        fetchPlaylists()
      }
    } catch (err) {
      console.error('Error creating playlist:', err)
    }
  }

  // Add video to playlist
  const handleAddVideoToPlaylist = async (playlistId, videoId) => {
    const playlist = playlists.find(p => p.id === playlistId)
    if (!playlist) return

    const updatedVideoIds = playlist.videoIds.includes(videoId)
      ? playlist.videoIds
      : [...playlist.videoIds, videoId]

    try {
      const res = await fetch('/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: playlistId,
          videoIds: updatedVideoIds
        })
      })
      if (res.ok) {
        fetchPlaylists()
      }
    } catch (err) {
      console.error('Error adding to playlist:', err)
    }
  }

  // Remove video from playlist
  const handleRemoveVideoFromPlaylist = async (playlistId, videoId) => {
    const playlist = playlists.find(p => p.id === playlistId)
    if (!playlist) return

    const updatedVideoIds = playlist.videoIds.filter(id => id !== videoId)

    try {
      const res = await fetch('/api/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: playlistId,
          videoIds: updatedVideoIds
        })
      })
      if (res.ok) {
        fetchPlaylists()
      }
    } catch (err) {
      console.error('Error removing from playlist:', err)
    }
  }

  const handleDeletePlaylist = async (id) => {
    if (!confirm('Hapus playlist ini?')) return
    try {
      const res = await fetch(`/api/playlists?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchPlaylists()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Handle Comment Submission
  const handlePostComment = async (e, parentId = null) => {
    e.preventDefault()
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk berkomentar!')
      return
    }

    const text = parentId ? replyText : newCommentText
    if (!text.trim()) return

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: activeVideo.id,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatarUrl,
          content: text,
          parentId
        })
      })

      if (res.ok) {
        if (parentId) {
          setReplyText('')
          setActiveReplyToId(null)
        } else {
          setNewCommentText('')
        }
        fetchComments(activeVideo.id)
      }
    } catch (err) {
      console.error('Error posting comment:', err)
    }
  }

  // Handle Comment Deletion (Staff or direct owner)
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Hapus komentar ini beserta seluruh balasannya?')) return

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchComments(activeVideo.id)
      }
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  // Avatar Upload (Max 1MB, JPG/PNG/WEBP validation)
  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validasi format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validFormats.includes(file.type)) {
      alert('Format berkas tidak valid! Hanya mendukung JPG, PNG, atau WEBP.')
      return
    }

    // Validasi ukuran < 1MB (1024 * 1024 bytes)
    const maxSize = 1 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Gagal! Batas ukuran foto profil maksimal adalah 1 MB (1024 KB).')
      return
    }

    // Convert file to base64 with simulation progress indicators
    setUploadProgress(10)
    const reader = new FileReader()
    
    // Simulate upload stages
    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer)
          return 90
        }
        return prev + 20
      })
    }, 100)

    reader.onloadend = async () => {
      clearInterval(timer)
      setUploadProgress(100)
      const base64Data = reader.result
      setAvatarPreview(base64Data)

      try {
        const res = await fetch('/api/auth/update-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            avatarUrl: base64Data
          })
        })
        const updatedUser = await res.json()
        if (res.ok && updatedUser && !updatedUser.error) {
          setCurrentUser(updatedUser)
          localStorage.setItem('shindora-user', JSON.stringify(updatedUser))
          alert('Foto profil berhasil diperbarui!')
        } else {
          alert('Gagal memperbarui foto profil: ' + (updatedUser.error || 'Server error'))
        }
      } catch (err) {
        console.error('Error saving avatar:', err)
        alert('Terjadi kesalahan koneksi saat mengupload foto profil.')
      } finally {
        setTimeout(() => setUploadProgress(null), 1000)
      }
    }
    reader.readAsDataURL(file)
  }

  // Playlist Navigation Player
  const startPlaylistPlayback = (playlist) => {
    if (!playlist || playlist.videoIds.length === 0) return
    setCurrentPlaylist(playlist)
    
    if (activeVideo && playlist.videoIds.includes(activeVideo.id)) {
      setActiveTab('watch')
    } else {
      const firstVid = videos.find(v => v.id === playlist.videoIds[0])
      if (firstVid) {
        setActiveVideo(firstVid)
        setActiveTab('watch')
      }
    }
  }

  const playNextPlaylistItem = () => {
    if (!currentPlaylist || !activeVideo) return
    
    const playlistVids = currentPlaylist.videoIds
      .map(vidId => videos.find(v => v.id === vidId))
      .filter(Boolean)

    if (playlistVids.length === 0) return

    const currentIndex = playlistVids.findIndex(v => v.id === activeVideo.id)
    const nextIndex = currentIndex + 1

    if (nextIndex < playlistVids.length) {
      const nextVid = playlistVids[nextIndex]
      if (nextVid) {
        setActiveVideo(nextVid)
        setActiveServer(1)
      }
    } else {
      alert(`Playlist Maraton "${currentPlaylist.title}" selesai!`)
      setCurrentPlaylist(null)
    }
  }

  // Video Finished simulation trigger
  const simulateVideoEnded = () => {
    if (isAutoplayPlaylist && currentPlaylist) {
      playNextPlaylistItem()
    } else {
      alert('Video selesai diputar.')
    }
  }

  // Filtered Video Catalog
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.animeTitle.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = activeCategory === 'SEMUA' || 
      video.animeTitle.toUpperCase() === activeCategory.toUpperCase() ||
      (video.animeTitle && video.animeTitle.toUpperCase().startsWith(activeCategory.toUpperCase() + ' > '))

    return matchesSearch && matchesCategory
  })

  // Get active ads
  const topBannerAd = ads.find(ad => ad.slot === 'banner_top' && ad.isActive)


  const renderAdSlot = (slotName) => {
    const ad = ads.find(a => a.slot === slotName && a.isActive)
    return <AdSlotContainer ad={ad} />
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#07080f] text-white flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400 animate-pulse">Memuat ShinDora Nesub...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0b14] text-[#e2e8f0]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      
      {/* 0. CUSTOM RUNNING TEXT ANNOUNCEMENT TOP BAR */}
      {showAnnouncement && settings?.donationOverlayActive !== false && (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marqueeAnnouncement {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
            .marquee-announcement-text {
              animation: marqueeAnnouncement var(--announcement-speed, 15s) linear infinite;
            }
            .marquee-announcement-container:hover .marquee-announcement-text {
              animation-play-state: paused;
            }
          `}} />

          <div 
            className="w-full h-8 overflow-hidden bg-gradient-to-r from-[#101226] via-[#1a1c32] to-[#101226] border-b border-pink-500/20 text-white flex items-center justify-between gap-3 px-4 relative marquee-announcement-container select-none z-50"
            style={{
              '--announcement-speed': (() => {
                const spd = settings?.donationMarqueeSpeed || 'Sedang'
                if (spd === 'Pelan') return '25s'
                if (spd === 'Cepat') return '10s'
                return '15s'
              })()
            }}
          >
            {/* Left badge prefix */}
            <div className="flex items-center gap-2 relative z-10 bg-[#101226] pr-3 h-full border-r border-pink-500/20">
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase text-white bg-pink-600 animate-pulse">
                {getAnnouncementBadgeLabel()}
              </span>
            </div>

            {/* Marquee text area */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
              <div className="marquee-announcement-text whitespace-nowrap text-[11px] font-bold text-slate-100 uppercase tracking-wide absolute flex items-center gap-1.5">
                <span>{getAnnouncementMessageLabel()}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowAnnouncement(false)}
              className="p-1 rounded hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all flex-shrink-0 relative z-10 bg-[#101226] pl-3 border-l border-pink-500/20 h-full"
              title="Tutup Pengumuman"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}

      {/* 1. TOP NAVBAR / HEADER */}
      <header className={`sticky top-0 z-40 border-b px-4 py-2 ${theme === 'dark' ? 'bg-[#0d0e1b]/95 border-[#1e2038]' : 'bg-white/95 border-slate-200'} backdrop-blur-md`}>
        {/* Mobile View: Single Line Layout */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger (≡) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'border-[#1e2038] hover:bg-[#1a1c32]' : 'border-slate-200 hover:bg-slate-100'}`}
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo Website */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('home'); setActiveVideo(null); }}>
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-8 max-w-[120px] object-contain rounded"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-pink-500 rounded text-white font-black text-sm">SD</div>
                  <span className="font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 hidden sm:inline md:block text-base md:text-lg">
                    SHINDORA NESUB
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search Box in Header */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari judul episode anime nostalgia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-1.5 rounded-full text-sm outline-none transition-all border ${
                  theme === 'dark'
                    ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    : 'bg-slate-100 border-slate-200 text-slate-900 focus:border-cyan-500'
                }`}
              />
            </div>
          </div>

          {/* Right Header actions in single row */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={handleToggleTheme}
              className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-[#1a1c32] text-yellow-400' : 'hover:bg-slate-100 text-slate-700'}`}
              title="Ganti Tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Custom Links & Panels shortcuts */}
            {currentUser && currentUser.role === 'moderator' && (
              <a
                href="/moderator"
                className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all hidden md:block"
              >
                Panel Staf
              </a>
            )}

            {/* User Profile avatar or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 border border-purple-500/30 hover:border-purple-500/60 p-0.5 rounded-full bg-purple-500/10"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-full text-red-400 hover:bg-red-500/10 transition-all hidden md:block`}
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </a>
            )}
          </div>
        </div>

        {/* Mobile-only Search input line underneath to prevent crowded row if screen too small */}
        <div className="mt-2 block sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari episode anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-3 py-1 rounded-full text-xs outline-none border ${
                theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white' : 'bg-slate-100 border-slate-200'
              }`}
            />
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CENTER) */}
      <div className="flex min-h-[calc(100vh-60px)] relative">
        
        {/* SIDEBAR NAVIGATION
            - Initial State Desktop: CLOSED/COLLAPSED if isOpen=false
            - Mobile Drawer: limit width to 70-75% screen with padding-compact and backdrop blur outside
         */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:sticky top-[60px] h-[calc(100vh-60px)] z-30 transition-all duration-300 border-r flex flex-col justify-between ${
            sidebarOpen 
              ? 'w-[72%] max-w-[280px] sm:w-[260px] translate-x-0' 
              : 'w-0 lg:w-16 lg:translate-x-0 -translate-x-full'
          } ${
            theme === 'dark'
              ? 'bg-[#0d0e1b]/95 border-[#1e2038] text-[#a9adc1]'
              : 'bg-white border-slate-200 text-slate-600'
          }`}
        >
          {/* Main list items */}
          <div className="p-3 flex-1 space-y-1.5 overflow-y-auto">
            {sidebarOpen && <div className="text-[10px] uppercase font-bold tracking-wider opacity-40 px-3 mb-2">Navigasi</div>}
            
            <button
              onClick={() => { setActiveTab('home'); setActiveVideo(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <Tv className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Beranda</span>}
            </button>

            <button
              onClick={() => { setActiveTab('trending'); setActiveVideo(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Trending</span>}
            </button>

            <button
              onClick={() => { setActiveTab('later'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'later'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex justify-between items-center w-full">
                  <span>Tonton Nanti</span>
                  <span className="text-xs bg-slate-500/20 px-1.5 py-0.2 rounded-full font-bold">{watchLaterIds.length}</span>
                </div>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('liked'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'liked'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <Heart className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && (
                <div className="flex justify-between items-center w-full">
                  <span>Video Disukai</span>
                  <span className="text-xs bg-slate-500/20 px-1.5 py-0.2 rounded-full font-bold">{likedVideoIds.length}</span>
                </div>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('playlists'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'playlists'
                  ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <FolderHeart className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Playlist</span>}
            </button>

            <a
              href="/putar-manual"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-slate-500/5 text-purple-400"
              onClick={() => setSidebarOpen(false)}
            >
              <ListVideo className="w-4 h-4 flex-shrink-0 text-purple-400" />
              {sidebarOpen && <span>Putar Manual</span>}
            </a>

            <button
              onClick={() => { setActiveTab('vote'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === 'vote'
                  ? 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 font-medium border border-pink-500/20'
                  : 'hover:bg-slate-500/5'
              }`}
            >
              <BarChart3 className="w-4 h-4 flex-shrink-0 text-pink-400" />
              {sidebarOpen && <span>Vote Anime</span>}
            </button>

            {/* Nostalgia Category List in Sidebar */}
            {sidebarOpen && (
              <div className="pt-4 border-t border-slate-500/10 mt-4">
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-40 px-3 mb-2">Kategori Nostalgia</div>
                {(() => {
                  const sortedCategoriesList = [];
                  const mainCats = categories.filter(c => !c.parent_id || c.parent_id === 'none');
                  mainCats.forEach(main => {
                    sortedCategoriesList.push(main);
                    const subs = categories.filter(c => c.parent_id === main.id);
                    subs.forEach(sub => {
                      sortedCategoriesList.push(sub);
                    });
                  });
                  const orphans = categories.filter(c => c.parent_id && c.parent_id !== 'none' && !categories.some(p => p.id === c.parent_id));
                  orphans.forEach(orphan => {
                    sortedCategoriesList.push(orphan);
                  });

                  return sortedCategoriesList.map((catObj) => {
                    const isSub = catObj.parent_id && catObj.parent_id !== 'none';
                    const parent = isSub ? categories.find(p => p.id === catObj.parent_id) : null;
                    const filterValue = parent ? `${parent.name} > ${catObj.name}` : catObj.name;
                    
                    // Count calculation
                    let count = 0;
                    if (!isSub) {
                      count = videos.filter(v => v.animeTitle === catObj.name || (v.animeTitle && v.animeTitle.startsWith(catObj.name + ' > '))).length;
                    } else {
                      count = videos.filter(v => v.animeTitle === filterValue).length;
                    }

                    return (
                      <button
                        key={catObj.id}
                        onClick={() => {
                          setActiveCategory(filterValue.toUpperCase())
                          setActiveTab('home')
                          setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded transition-all hover:bg-slate-500/5 ${
                          activeCategory.toUpperCase() === filterValue.toUpperCase() && activeTab === 'home' ? 'text-cyan-400 font-semibold' : ''
                        }`}
                      >
                        <span className="truncate">
                          {isSub ? `\u00A0\u00A0↳ ${catObj.name}` : `↳ ${catObj.name}`}
                        </span>
                        <span className="text-[10px] opacity-60 bg-slate-500/10 px-1.5 py-0.5 rounded font-bold">{count}</span>
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </div>

          {/* Social Icons inside Sidebar footer */}
          {sidebarOpen && settings.socialLinks && settings.socialLinks.length > 0 && (
            <div className={`p-4 border-t ${theme === 'dark' ? 'border-[#1e2038]' : 'border-slate-200'} text-xs`}>
              <p className="font-bold uppercase tracking-wider text-[10px] opacity-40 mb-2">Ikuti Kami</p>
              <div className="flex flex-wrap gap-1.5">
                {settings.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-500/5 border border-slate-500/10 hover:text-cyan-400 transition-all font-semibold"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* 3. CENTER CONTENT SECTION */}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden max-w-full">
          
          {/* TOP AD BANNER */}
          {renderAdSlot('banner_top') || (topBannerAd && (
            <div className="relative mb-6 rounded-xl overflow-hidden border border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between p-4 md:p-6 gap-4">
              <div className="flex items-center gap-4">
                {topBannerAd.imageUrl && (
                  <img
                    src={topBannerAd.imageUrl}
                    alt="Sponsor Logo"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">SPONSOR / PENGUMUMAN</span>
                  <h3 className="text-sm md:text-base font-bold text-slate-100">{topBannerAd.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Klik link eksternal ini untuk mendukung operasional ShinDora Nesub!</p>
                </div>
              </div>
              <a
                href={topBannerAd.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black flex items-center gap-1 shadow-md transition-all self-stretch md:self-auto text-center justify-center"
              >
                <span>Kunjungi</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}

          {/* DYNAMIC VIEW ROOT SWITCH */}

          {/* VIEW: HOME */}
          {activeTab === 'home' && !activeVideo && (
            <div className="space-y-6 animate-fade-in">
              {/* HERO BANNER */}
              <div className={`rounded-2xl border p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 justify-between ${
                theme === 'dark' 
                  ? 'border-[#1e2038] bg-gradient-to-r from-[#101226] to-[#0d0e1b]' 
                  : 'border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100'
              }`}>
                <div className="max-w-xl space-y-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-pink-500/10 text-pink-400 border border-pink-500/20 uppercase tracking-widest">
                    {settings?.hero_badge_text || "✨ NOSTALGIA MASA KECIL"}
                  </span>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                    {settings?.hero_title || "Putar Kembali Kenangan Indah Hari Minggu Anda!"}
                  </h1>
                  <p className="text-xs md:text-sm opacity-80 leading-relaxed">
                    {settings?.hero_description || "Saksikan petualangan ajaib Doraemon, kekonyolan Shinchan, teknik ninja Hattori, dan keceriaan Maruko-chan terlengkap dengan kualitas modern."}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => {
                        if (videos.length > 0) {
                          setActiveVideo(videos[0])
                          setActiveTab('watch')
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-90 flex items-center gap-2 transition-all shadow-lg"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Menonton</span>
                    </button>
                    {playlists.length > 0 && (
                      <button
                        onClick={() => startPlaylistPlayback(playlists[0])}
                        className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          theme === 'dark' 
                            ? 'border-[#1e2038] hover:bg-slate-500/5 text-white' 
                            : 'border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Lihat Playlist
                      </button>
                    )}
                  </div>
                </div>
                <div className="relative w-full max-w-[260px] h-[160px] md:h-[180px] rounded-xl overflow-hidden border border-[#1e2038] shadow-2xl flex-shrink-0">
                  <img
                    src={settings?.hero_featured_image || "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500"}
                    alt="ShinDora Retro Anime"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                    <span className="text-[9px] uppercase tracking-wider text-pink-400 font-black">
                      {settings?.hero_featured_label || "KOLEKSI TERPOPULER"}
                    </span>
                    <p className="text-xs font-bold text-white truncate">
                      {settings?.hero_featured_title || "Crayon Shinchan: Kenakalan Menolong Ibu"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CATALOUGE TABS & COUNT */}
              <div className="border-b border-slate-500/10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {(() => {
                    const sortedCategoriesList = [];
                    const mainCats = categories.filter(c => !c.parent_id || c.parent_id === 'none');
                    mainCats.forEach(main => {
                      sortedCategoriesList.push(main);
                      const subs = categories.filter(c => c.parent_id === main.id);
                      subs.forEach(sub => {
                        sortedCategoriesList.push(sub);
                      });
                    });
                    const orphans = categories.filter(c => c.parent_id && c.parent_id !== 'none' && !categories.some(p => p.id === c.parent_id));
                    orphans.forEach(orphan => {
                      sortedCategoriesList.push(orphan);
                    });

                    const tabList = [
                      { value: 'SEMUA', label: 'SEMUA' },
                      ...sortedCategoriesList.map(c => {
                        const parent = categories.find(p => p.id === c.parent_id);
                        const filterValue = parent ? `${parent.name} > ${c.name}` : c.name;
                        return {
                          value: filterValue.toUpperCase(),
                          label: c.name.toUpperCase()
                        };
                      })
                    ];

                    return tabList.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => setActiveCategory(tab.value)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase transition-all ${
                          activeCategory.toUpperCase() === tab.value.toUpperCase()
                            ? 'bg-cyan-500 text-black font-extrabold shadow-md'
                            : theme === 'dark' 
                              ? 'bg-[#121324] hover:bg-[#1a1c32] text-slate-300' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ));
                  })()}
                </div>
                <div className="text-xs opacity-60 font-semibold self-end sm:self-center">
                  Menampilkan {filteredVideos.length} Episode
                </div>
              </div>

              {/* DIRECT CATALOG LIST GRID */}
              {filteredVideos.length === 0 ? (
                <div className="text-center py-16 opacity-60 text-sm">
                  Tidak ada episode nostalgia yang cocok dengan filter atau kata kunci pencarian Anda.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
                  {[...filteredVideos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).reduce((acc, video, idx) => {
                    acc.push(
                      <div
                        key={video.id}
                        onClick={() => {
                          setActiveVideo(video)
                          setActiveTab('watch')
                        }}
                        className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${
                          theme === 'dark'
                            ? 'border-[#1e2038] bg-[#0d0e1b] hover:border-cyan-500/40'
                            : 'border-slate-200 bg-white hover:border-cyan-400'
                        }`}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                            {renderCategoryBadges(video.animeTitle, "text-[8px]")}
                            <span className="self-start px-1.5 py-0.5 rounded text-[8px] font-bold bg-pink-600 text-white uppercase">
                              {video.episode}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 md:p-3 space-y-1">
                          <h3 className="text-xs md:text-sm font-bold leading-snug group-hover:text-cyan-400 transition-all line-clamp-1">
                            {video.title}
                          </h3>
                          <p className="text-[10px] md:text-[11px] opacity-70 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                            {video.description}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[9px] md:text-[10px] opacity-50 font-bold border-t border-slate-500/10 mt-1.5 pt-1.5">
                            <span>{video.views ? video.views.toLocaleString() : 0} views</span>
                            
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {/* Like Button */}
                              <button
                                onClick={() => handleLikeVideo(video)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all border ${
                                  likedVideoIds.includes(video.id)
                                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-400 font-extrabold shadow-sm'
                                    : 'bg-slate-500/5 hover:bg-slate-500/10 border-transparent text-slate-300 hover:text-white'
                                }`}
                              >
                                <span>❤️</span>
                                <span>{video.likes || 0}</span>
                              </button>

                              {/* + Playlist Button */}
                              <button
                                onClick={() => {
                                  if (!currentUser) {
                                    alert('Silakan login untuk mengelola playlist pribadi!');
                                    return;
                                  }
                                  setPlaylistSelectorVideo(video);
                                }}
                                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-500/5 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-all"
                                title="Tambah ke Playlist"
                              >
                                <span>➕</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );

                    // Insert the inline ad after the 4th item (index 3)
                    if (idx === 3) {
                      acc.push(
                        <div key="grid-inline-ad" className="col-span-full my-2">
                          {renderAdSlot('banner_between_feed')}
                        </div>
                      );
                    }

                    return acc;
                  }, [])}
                </div>
              )}
            </div>
          )}

          {/* VIEW: TRENDING */}
          {activeTab === 'trending' && !activeVideo && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-cyan-400">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span>Trending Minggu Ini</span>
                </h2>
                <p className="text-xs opacity-60">Episode paling banyak ditonton oleh pecinta retro anime.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...videos].sort((a,b) => b.views - a.views).map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      setActiveVideo(video)
                      setActiveTab('watch')
                    }}
                    className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                      theme === 'dark' ? 'border-[#1e2038] bg-[#0d0e1b]' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                        {renderCategoryBadges(video.animeTitle, "text-[9px]")}
                        <span className="self-start px-2 py-0.5 rounded text-[9px] font-bold bg-pink-600 text-white">{video.episode}</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1">
                      <h3 className="text-xs md:text-sm font-bold line-clamp-1 group-hover:text-cyan-400 transition-all">{video.title}</h3>
                      <p className="text-[11px] opacity-70 line-clamp-2">{video.description}</p>
                      <div className="flex justify-between items-center text-[10px] opacity-50 border-t border-slate-500/10 mt-1.5 pt-1.5">
                        <span>🔥 {video.views ? video.views.toLocaleString() : 0} kali diputar</span>
                        
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Like Button */}
                          <button
                            onClick={() => handleLikeVideo(video)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-all border ${
                              likedVideoIds.includes(video.id)
                                ? 'bg-pink-500/20 border-pink-500/40 text-pink-400 font-extrabold shadow-sm'
                                : 'bg-slate-500/5 hover:bg-slate-500/10 border-transparent text-slate-300 hover:text-white'
                            }`}
                          >
                            <span>❤️</span>
                            <span>{video.likes || 0}</span>
                          </button>

                          {/* + Playlist Button */}
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                alert('Silakan login untuk mengelola playlist pribadi!');
                                return;
                              }
                              setPlaylistSelectorVideo(video);
                            }}
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-500/5 hover:bg-cyan-500/20 border border-transparent hover:border-cyan-500/20 text-slate-300 hover:text-cyan-400 transition-all"
                            title="Tambah ke Playlist"
                          >
                            <span>➕</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: WATCH PAGE PLAYER */}
          {activeTab === 'watch' && activeVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {/* Left column - Player and description */}
              <div className="lg:col-span-2 space-y-4">
                
                {/* Vintage TV Player Frame */}
                <div className="relative border-4 border-[#1e2038] rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
                  {/* CRT Glass Scanlines layer */}
                  <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-15" />
                  
                  {activeServer === 1 ? (
                    <iframe
                      src={getEmbedUrl(activeVideo)}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      scrolling="no"
                      className="w-full h-full border-0 relative z-0"
                    />
                  ) : (() => {
                    const currentStream = getActiveServerUrl(activeVideo);
                    if (!currentStream) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-xs opacity-50 text-white">
                          Aliran video tidak tersedia.
                        </div>
                      );
                    }

                    const isRawIframe = currentStream.trim().startsWith('<iframe') || currentStream.toLowerCase().includes('<iframe');
                    
                    if (isRawIframe) {
                      // Process raw iframe string to make it perfectly responsive inside our frame
                      let processed = currentStream
                        .replace(/width=["']\d+["']/gi, 'width="100%"')
                        .replace(/height=["']\d+["']/gi, 'height="100%"');
                      
                      if (processed.includes('class=')) {
                        processed = processed.replace(/class=["']([^"']+)["']/i, 'class="$1 w-full h-full border-0 relative z-0"');
                      } else {
                        processed = processed.replace(/<iframe/i, '<iframe class="w-full h-full border-0 relative z-0"');
                      }

                      return (
                        <div 
                          className="w-full h-full"
                          dangerouslySetInnerHTML={{ __html: processed }}
                        />
                      );
                    } else {
                      const finalUrl = currentStream.includes('autoplay') ? currentStream : `${currentStream}${currentStream.includes('?') ? '&' : '?'}autoplay=1&mute=0`;
                      
                      // Check if it's an embed URL (standard links that are not raw iframe HTML)
                      const isEmbedUrl = finalUrl.includes('youtube.com/embed') || finalUrl.includes('ok.ru/video') || finalUrl.includes('drive.google.com') || finalUrl.includes('sibnet.ru') || finalUrl.includes('embed');
                      
                      if (isEmbedUrl) {
                        return (
                          <iframe
                            src={finalUrl}
                            title={activeVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            scrolling="no"
                            className="w-full h-full border-0 relative z-0"
                          />
                        );
                      } else {
                        // Standard HTML5 Video Player for direct HLS/MP4 streams
                        return (
                          <video
                            src={currentStream}
                            controls
                            autoPlay
                            className="w-full h-full relative z-0 object-contain bg-black"
                            playsInline
                            onEnded={() => {
                              console.log('[HTML5 Video] Ended. Trigger next!')
                              if (isAutoplayPlaylist && currentPlaylist) {
                                playNextPlaylistItem()
                              } else {
                                const nextVid = getNextEpisode()
                                if (nextVid) {
                                  setActiveVideo(nextVid)
                                  setActiveServer(1)
                                }
                              }
                            }}
                          />
                        );
                      }
                    }
                  })()}
                </div>

                {/* MULTI-SERVER STREAM SWITCHER */}
                <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-pink-500 tracking-wider">PILIH SERVER ALIRAN (STREAM SWITCHER):</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: 1, label: 'Server 1 - Utama' },
                      { id: 2, label: 'Server 2 - HD' },
                      { id: 3, label: 'Server 3 - Cadangan' }
                    ].map((srv) => {
                      const isActive = activeServer === srv.id
                      const isAvailable = srv.id === 1 || (srv.id === 2 ? activeVideo.videoUrl2 : activeVideo.videoUrl3)
                      return (
                        <button
                          key={srv.id}
                          onClick={() => {
                            if (isAvailable) {
                              setActiveServer(srv.id)
                            } else {
                              alert('Server aliran ini tidak tersedia untuk episode ini! Menggunakan Server 1 Utama.')
                              setActiveServer(1)
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] md:text-xs font-black transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                              : isAvailable
                                ? theme === 'dark'
                                  ? 'bg-[#121324] hover:bg-[#1a1c32] text-slate-300 border border-[#1e2038]'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border'
                                : 'opacity-40 cursor-not-allowed bg-slate-500/10 text-slate-500 line-through'
                          }`}
                        >
                          {srv.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Banner Bawah Video Player */}
                {renderAdSlot('banner_below_player')}


                {/* Video Info Headers */}
                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {renderCategoryBadges(activeVideo.animeTitle, "text-[10px]")}
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-500 text-white uppercase">{activeVideo.episode}</span>
                  </div>
                  <h1 className="text-lg md:text-xl font-extrabold">{activeVideo.title}</h1>
                  
                  {/* Actions Bar */}
                  <div className="flex flex-col gap-4 mt-3 pt-3 border-t border-slate-500/10">
                    <div className="flex items-center justify-between text-xs opacity-60">
                      <span>{activeVideo.views ? activeVideo.views.toLocaleString() : 0} views</span>
                      <span>{activeVideo.likes} suka</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Row 1: Action Buttons (Suka, Tonton Nanti, + Playlist) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleLikeVideo(activeVideo)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            likedVideoIds.includes(activeVideo.id)
                              ? 'bg-pink-500/20 border-pink-500 text-pink-400'
                              : 'hover:bg-slate-500/5'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${likedVideoIds.includes(activeVideo.id) ? 'fill-current' : ''}`} />
                          <span>Suka</span>
                        </button>

                        <button
                          onClick={() => handleWatchLater(activeVideo)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            watchLaterIds.includes(activeVideo.id)
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                              : 'hover:bg-slate-500/5'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Tonton Nanti</span>
                        </button>

                        {/* Dropdown Add to Playlist */}
                        {currentUser ? (
                          <button 
                            onClick={() => setPlaylistSelectorVideo(activeVideo)}
                            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold border hover:bg-slate-500/5 transition-all cursor-pointer select-none"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Playlist</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => alert('Silakan login untuk mengelola playlist pribadi!')}
                            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-bold border opacity-50 cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Playlist</span>
                          </button>
                        )}
                      </div>

                      {/* Row 2: Episode Navigation (← Eps Sebelum / Eps Selanjutnya →) */}
                      {/* Grid 2-column on mobile, compact text and padding */}
                      <div className="grid grid-cols-2 gap-2 w-full pt-1">
                        <button
                          onClick={() => {
                            const prevVideo = getPrevEpisode()
                            if (prevVideo) {
                              setActiveVideo(prevVideo)
                              setActiveServer(1)
                            }
                          }}
                          disabled={!getPrevEpisode()}
                          className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all border ${
                            getPrevEpisode()
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                              : 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-slate-500/5'
                          }`}
                          title="Tonton Episode Sebelumnya"
                        >
                          <span>&larr; Eps Sebelum</span>
                        </button>

                        <button
                          onClick={() => {
                            const nextVideo = getNextEpisode()
                            if (nextVideo) {
                              setActiveVideo(nextVideo)
                              setActiveServer(1)
                            }
                          }}
                          disabled={!getNextEpisode()}
                          className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all border ${
                            getNextEpisode()
                              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                              : 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-slate-500/5'
                          }`}
                          title="Tonton Episode Selanjutnya"
                        >
                          <span>Eps Selanjutnya &rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm opacity-80 mt-4 leading-relaxed border-t border-slate-500/10 pt-4">
                    {activeVideo.description}
                  </p>
                </div>



                {/* Banner Di Atas Widget Playlist Maraton */}
                {renderAdSlot('banner_above_playlist')}

                {/* PLAYLIST MARATON QUEUE WIDGET */}
                {currentPlaylist && (
                  <div className={`p-4 rounded-xl border space-y-3 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between border-b border-slate-500/10 pb-2">
                      <div>
                        <span className="text-[9px] font-black uppercase text-pink-500">PLAYLIST MARATON</span>
                        <h4 className="text-xs md:text-sm font-black line-clamp-1">{currentPlaylist.title}</h4>
                      </div>
                      <button onClick={() => setCurrentPlaylist(null)} className="text-xs opacity-60 hover:opacity-100 hover:text-red-400 font-bold">Tutup</button>
                    </div>

                    {/* Maraton Autoplay Mode Selector */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-500/5 border border-slate-500/10 text-xs">
                      <span className="font-bold">Putar Maraton / Autoplay:</span>
                      <button
                        onClick={() => setIsAutoplayPlaylist(!isAutoplayPlaylist)}
                        className={`px-3 py-1 rounded font-black tracking-wide text-[10px] uppercase transition-all ${
                          isAutoplayPlaylist ? 'bg-cyan-500 text-black' : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {isAutoplayPlaylist ? 'ON (Pindah Otomatis)' : 'OFF (Pilih Manual)'}
                      </button>
                    </div>

                    {/* Playlist Items Queue */}
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {currentPlaylist.videoIds
                        .map(vidId => videos.find(v => v.id === vidId))
                        .filter(Boolean)
                        .map((vid) => {
                          const isActive = activeVideo.id === vid.id

                          return (
                            <div
                              key={vid.id}
                              onClick={() => {
                                setActiveVideo(vid)
                                setActiveServer(1)
                              }}
                              className={`p-2 rounded-lg flex gap-2.5 items-center cursor-pointer transition-all border text-xs ${
                                isActive
                                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-bold'
                                  : 'bg-slate-500/5 hover:bg-slate-500/10 border-transparent'
                              }`}
                            >
                              <img src={vid.thumbnailUrl} alt={vid.title} className="w-12 h-8 rounded object-cover flex-shrink-0" />
                              <div className="flex-1 truncate">
                                <span className="text-[10px] text-pink-400 mr-1">{vid.episode}</span>
                                <span className="truncate">{vid.title}</span>
                              </div>
                              {isActive && <div className="text-[10px] text-cyan-400 flex items-center gap-0.5">● Playing</div>}
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                )}

                {/* NESTED COMMENTS SECTION */}
                <div className={`p-4 rounded-xl border space-y-4 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-extrabold text-sm md:text-base text-cyan-400">Komentar Pecinta Retro ({comments.length})</h3>
                  
                  {/* New comment input */}
                  {currentUser ? (
                    <form onSubmit={(e) => handlePostComment(e)} className="flex gap-2">
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <textarea
                          placeholder="Tulis opini nostalgia Anda tentang episode ini..."
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                          className={`w-full text-xs p-2.5 rounded-lg border outline-none min-h-[70px] ${
                            theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                        <div className="flex justify-end">
                          <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold rounded-lg text-xs">
                            Kirim Komentar
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-4 bg-slate-500/5 rounded-lg text-xs">
                      Silakan <a href="/login" className="text-cyan-400 font-bold underline">Login</a> terlebih dahulu untuk menuangkan kenangan Anda di kolom komentar.
                    </div>
                  )}

                  {/* Comments Threads List */}
                  <div className="space-y-4 pt-2">
                    {comments.filter(c => c.parentId === null).map((parent, index) => {
                      const childReplies = comments.filter(c => c.parentId === parent.id)
                      const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator')

                      return (
                        <div key={parent._id || parent.id ? `parent-${parent._id || parent.id}-${index}` : `parent-idx-${index}`} className="border-b border-slate-500/5 pb-4 space-y-3">
                          {/* Parent Comment */}
                          <div className="flex gap-3">
                            <img src={parent.userAvatar} alt={parent.userName} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-slate-100">{parent.userName}</span>
                                  {parent.userId === 'user-admin-id' && (
                                    <span className="text-[9px] bg-red-500/20 text-red-400 px-1 py-0.2 rounded font-black border border-red-500/30">ADMIN</span>
                                  )}
                                  {parent.userId === 'user-mod-id' && (
                                    <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1 py-0.2 rounded font-black border border-cyan-500/30">STAF</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] opacity-40">{new Date(parent.createdAt).toLocaleDateString()}</span>
                                  
                                  {/* Direct Moderation Delete on Watch Page */}
                                  {isStaff && (
                                    <button
                                      onClick={() => handleDeleteComment(parent.id)}
                                      className="text-red-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10"
                                      title="Hapus Komentar beserta Rantai Balasannya"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs opacity-90 leading-relaxed text-slate-300">{parent.content}</p>
                              
                              {/* Reply Trigger button */}
                              {currentUser && (
                                <button
                                  onClick={() => setActiveReplyToId(parent.id)}
                                  className="text-[10px] text-cyan-400 font-bold hover:underline pt-1"
                                >
                                  Balas Kenangan
                                </button>
                              )}

                              {/* Nested Reply form */}
                              {activeReplyToId === parent.id && (
                                <form onSubmit={(e) => handlePostComment(e, parent.id)} className="flex gap-2 mt-2 pt-2 border-t border-slate-500/10">
                                  <input
                                    type="text"
                                    placeholder="Tulis balasan nostalgia Anda..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className={`flex-1 text-xs p-2 rounded-md outline-none ${
                                      theme === 'dark' ? 'bg-[#121324] border border-[#1e2038]' : 'bg-slate-100 border'
                                    }`}
                                  />
                                  <button type="submit" className="px-3 bg-cyan-500 text-black text-[11px] font-black rounded-md">
                                    Balas
                                  </button>
                                  <button onClick={() => setActiveReplyToId(null)} className="px-2 text-xs opacity-60">
                                    Batal
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>

                          {/* Children Nested Replies */}
                          {childReplies.length > 0 && (
                            <div className="pl-8 border-l-2 border-slate-500/10 space-y-3.5 mt-2 ml-4">
                              {childReplies.map((reply, idx) => (
                                <div key={reply._id || reply.id ? `reply-${reply._id || reply.id}-${idx}` : `reply-idx-${idx}`} className="flex gap-2.5">
                                  <img src={reply.userAvatar} alt={reply.userName} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-100">{reply.userName}</span>
                                        {reply.userId === 'user-admin-id' && <span className="text-[8px] bg-red-500/20 text-red-400 px-1 py-0.2 rounded font-black">ADMIN</span>}
                                        {reply.userId === 'user-mod-id' && <span className="text-[8px] bg-cyan-500/20 text-cyan-400 px-1 py-0.2 rounded font-black">STAF</span>}
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] opacity-40">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                        {isStaff && (
                                          <button
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="text-red-400 hover:text-red-500 p-0.5 rounded"
                                            title="Hapus Balasan"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs opacity-90 leading-relaxed text-slate-300">{reply.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Banner Bawah Komentar */}
                {renderAdSlot('banner_below_comments')}

              </div>

              {/* Right column - Playlist & Playlist Queue Sidebar */}
              <div className="space-y-4">

                {/* Banner Sidebar Kanan */}
                {renderAdSlot('banner_sidebar')}

                {/* More Retro Episode recommendations */}
                <div className={`p-4 rounded-xl border space-y-3.5 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-xs md:text-sm font-black border-b border-slate-500/10 pb-2">Rekomendasi Nostalgia Lainnya</h4>
                  <div className="space-y-3">
                    {videos.filter(v => v.id !== activeVideo.id).slice(0, 5).map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        className="group flex gap-2.5 cursor-pointer hover:bg-slate-500/5 p-1 rounded-lg transition-all"
                      >
                        <img src={vid.thumbnailUrl} alt={vid.title} className="w-16 h-10 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <span className="text-[9px] text-cyan-400 uppercase font-black">{vid.animeTitle} &bull; {vid.episode}</span>
                          <h5 className="text-xs font-bold truncate group-hover:text-cyan-400 transition-all">{vid.title}</h5>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LATER (WATCH LATER) */}
          {activeTab === 'later' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-cyan-400">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>Daftar Tonton Nanti Anda</span>
                </h2>
                <p className="text-xs opacity-60">Saksikan episode-episode yang Anda simpan di waktu senggang Anda.</p>
              </div>

              {watchLaterIds.length === 0 ? (
                <div className="text-center py-20 bg-slate-500/5 rounded-2xl p-6 border border-slate-500/10">
                  <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-45" />
                  <h4 className="text-base font-bold text-slate-300">Daftar Tonton Nanti Kosong</h4>
                  <p className="text-xs opacity-60 mt-1">Gunakan tombol &quot;Tonton Nanti&quot; pada halaman detail video untuk menyimpannya.</p>
                  <button onClick={() => setActiveTab('home')} className="mt-4 px-5 py-2 rounded bg-cyan-500 text-black text-xs font-black">
                    Jelajahi Beranda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.filter(v => watchLaterIds.includes(v.id)).map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        setActiveVideo(video)
                        setActiveTab('watch')
                      }}
                      className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                        theme === 'dark' ? 'border-[#1e2038] bg-[#0d0e1b]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {renderCategoryBadges(video.animeTitle, "text-[9px]")}
                        </div>
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h3 className="text-xs md:text-sm font-bold line-clamp-1 group-hover:text-cyan-400">{video.title}</h3>
                        <p className="text-[11px] opacity-70 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: LIKED */}
          {activeTab === 'liked' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-cyan-400">
                  <Heart className="w-5 h-5 text-cyan-400 fill-current" />
                  <span>Koleksi Video Disukai</span>
                </h2>
                <p className="text-xs opacity-60">Semua episode nostalgia yang paling Anda sukai.</p>
              </div>

              {likedVideoIds.length === 0 ? (
                <div className="text-center py-20 bg-slate-500/5 rounded-2xl p-6 border border-slate-500/10">
                  <Heart className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-45" />
                  <h4 className="text-base font-bold text-slate-300">Belum Ada Video Disukai</h4>
                  <p className="text-xs opacity-60 mt-1">Berikan jempol atau suka pada episode retro yang Anda tonton.</p>
                  <button onClick={() => setActiveTab('home')} className="mt-4 px-5 py-2 rounded bg-cyan-500 text-black text-xs font-black">
                    Jelajahi Beranda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.filter(v => likedVideoIds.includes(v.id)).map((video) => (
                    <div
                      key={video.id}
                      onClick={() => {
                        setActiveVideo(video)
                        setActiveTab('watch')
                      }}
                      className={`group rounded-xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                        theme === 'dark' ? 'border-[#1e2038] bg-[#0d0e1b]' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3.5 space-y-1">
                        <h3 className="text-xs md:text-sm font-bold line-clamp-1 group-hover:text-cyan-400">{video.title}</h3>
                        <p className="text-[11px] opacity-70 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: PLAYLISTS GENERAL INDEX */}
          {activeTab === 'playlists' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-500/10 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black flex items-center gap-2 text-cyan-400">
                    <FolderHeart className="w-5 h-5 text-cyan-400" />
                    <span>Daftar Playlist Official & Pribadi</span>
                  </h2>
                  <p className="text-xs opacity-60">Mainkan maraton secara autoplay atau maraton manual sesuka hati.</p>
                </div>

                {currentUser && (
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all self-start md:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kelola Playlist di Profil</span>
                  </button>
                )}
              </div>

              {/* Official Playlists Grid */}
              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-black text-pink-500 uppercase tracking-widest">&bull; Playlist Official Admin</h3>
                
                {playlists.filter(p => p.ownerId === null).length === 0 ? (
                  <p className="text-xs opacity-60 italic">Belum ada playlist official dari admin.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {playlists.filter(p => p.ownerId === null).map((pl, idx) => (
                      <div
                        key={pl._id || pl.id ? `pl-${pl._id || pl.id}-${idx}` : `pl-idx-${idx}`}
                        className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:border-cyan-500/20 ${
                          theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-sm md:text-base text-slate-100">{pl.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-400 uppercase tracking-wider">OFFICIAL PUBLIC</span>
                          <p className="text-xs opacity-60 pt-1">{pl.videoIds.length} video episode terurut.</p>
                        </div>
                        <button
                          onClick={() => startPlaylistPlayback(pl)}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                          disabled={pl.videoIds.length === 0}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Mulai Maraton Autoplay</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Private Playlists */}
              {currentUser && (
                <div className="space-y-4 pt-4 border-t border-slate-500/10">
                  <h3 className="text-sm md:text-base font-black text-purple-400 uppercase tracking-widest">&bull; Playlist Pribadi Anda</h3>
                  {playlists.filter(p => p.ownerId === currentUser.id).length === 0 ? (
                    <div className="text-center py-10 bg-slate-500/5 rounded-xl border border-dashed border-slate-500/20 text-xs">
                      <p className="opacity-60">Anda belum membuat playlist pribadi apa pun.</p>
                      <button onClick={() => setActiveTab('profile')} className="mt-2 text-cyan-400 font-bold underline">
                        Buat Playlist Pertama Anda &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playlists.filter(p => p.ownerId === currentUser.id).map((pl) => (
                        <div
                          key={pl.id}
                          className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition-all hover:border-purple-500/20 ${
                            theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <h4 className="font-extrabold text-sm md:text-base text-slate-100">{pl.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-purple-500/20 text-purple-400 uppercase tracking-wider">PRIVATE PLAYLIST</span>
                            <p className="text-xs opacity-60 pt-1">{pl.videoIds.length} video episode tersimpan.</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startPlaylistPlayback(pl)}
                              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                              disabled={pl.videoIds.length === 0}
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Mulai Maraton</span>
                            </button>
                            <button
                              onClick={() => handleDeletePlaylist(pl.id)}
                              className="px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 flex items-center justify-center"
                              title="Hapus Playlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: DEDICATED VOTE PAGE */}
          {activeTab === 'vote' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-500/10 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-pink-500 uppercase tracking-wider">PILIH ANIME NOSTALGIA SELANJUTNYA</h2>
                  <p className="text-xs opacity-60">Suarakan aspirasi Anda! Vote anime favorit masa kecil Anda untuk dirilis di ShinDora Nesub berikutnya.</p>
                </div>

                {currentUser ? (
                  <button
                    onClick={() => {
                      const hasActivePoll = pollingList.some(p => p.ownerId === currentUser.id && p.isActive)
                      if (hasActivePoll) {
                        alert("Anda sudah memiliki 1 vote yang sedang berjalan. Hapus atau tunggu vote Anda selesai untuk membuat vote baru.")
                      } else {
                        setShowUserPollModal(true)
                      }
                    }}
                    className="px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Vote Baru (+)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => alert('Silakan login terlebih dahulu untuk membuat voting kustom!')}
                    className="px-5 py-2.5 rounded-lg bg-slate-500/10 text-slate-400 border border-transparent font-bold text-xs"
                  >
                    Masuk Untuk Membuat Vote
                  </button>
                )}
              </div>

              {/* Grid cards of all voting topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pollingList.map((poll, pIdx) => {
                  const hasVotedOptionId = typeof window !== 'undefined' ? localStorage.getItem(`shindora-voted-${poll.id}`) : null
                  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1
                  const isUserOwned = currentUser && poll.ownerId === currentUser.id

                  return (
                    <div
                      key={poll.id || pIdx}
                      className={`p-5 rounded-2xl border space-y-4 shadow-xl ${
                        theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            poll.ownerId === null ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {poll.ownerId === null ? 'Official Vote' : 'User Request'}
                          </span>
                          <h3 className="text-sm md:text-base font-black text-slate-100 mt-1 leading-snug">{poll.title}</h3>
                          <span className="text-[10px] opacity-50 font-bold block mt-1">Total: {totalVotes} suara &bull; Status: {poll.isActive ? 'Aktif' : 'Selesai'}</span>
                        </div>

                        {/* User custom delete button */}
                        {isUserOwned && (
                          <button
                            onClick={() => handleDeleteUserPoll(poll.id)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs font-bold"
                            title="Hapus voting kustom saya"
                          >
                            Hapus Vote Saya
                          </button>
                        )}
                      </div>

                      <div className="space-y-3.5 pt-2 border-t border-slate-500/5">
                        {poll.options.map((opt) => {
                          const isOptionVoted = hasVotedOptionId === opt.id
                          const percentage = Math.round(((opt.votes || 0) / totalVotes) * 100)

                          return (
                            <div key={opt.id} className="space-y-1.5 text-xs text-left">
                              <div className="flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2.5">
                                  {opt.imageUrl && (
                                    <img src={opt.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-500/10" />
                                  )}
                                  <span className="font-extrabold text-slate-200">{opt.name}</span>
                                </div>
                                <span className="text-[10px] font-mono text-cyan-400 font-bold">{opt.votes || 0} votes ({percentage}%)</span>
                              </div>

                              <div className="w-full bg-slate-500/15 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>

                              {poll.isActive && !hasVotedOptionId && (
                                <button
                                  onClick={() => handleCastVote(poll.id, opt.id)}
                                  className="w-full py-1.5 bg-slate-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-white rounded text-[10px] font-black border border-cyan-500/20 transition-all uppercase"
                                >
                                  PILIH / VOTE
                                </button>
                              )}

                              {isOptionVoted && (
                                <div className="text-[9px] text-pink-400 font-black tracking-wide uppercase pt-1 text-right">★ Pilihan Anda</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* USER CREATION POLL MODAL */}
              {showUserPollModal && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-[#0d0e1b] border border-[#1e2038] rounded-2xl w-full max-w-lg p-6 relative space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <button
                      onClick={() => setShowUserPollModal(false)}
                      className="absolute top-4 right-4 p-1 rounded hover:bg-slate-500/5 text-xs opacity-65 font-bold"
                    >
                      &times; Tutup
                    </button>
                    <h3 className="font-black text-white text-base border-b border-slate-500/10 pb-2">
                      Buat Polling Anime Nostalgia Baru
                    </h3>

                    <form onSubmit={handleCreateUserPoll} className="space-y-4 text-xs text-left">
                      <div className="space-y-1">
                        <label className="font-bold opacity-60">Judul / Pertanyaan Polling</label>
                        <input
                          type="text"
                          value={userPollForm.title}
                          onChange={(e) => setUserPollForm({ ...userPollForm, title: e.target.value })}
                          placeholder="Contoh: Tolong tayangkan Digimon Adventure dong!"
                          className="w-full p-2.5 rounded bg-[#121324] border border-[#1e2038] text-white outline-none"
                          required
                        />
                      </div>

                      {/* Options dynamic fields */}
                      <div className="space-y-3 pt-2 border-t border-slate-500/10">
                        <span className="font-black uppercase tracking-wider text-[9px] text-pink-500 block">Daftar Pilihan Anime (Opsi Pilihan)</span>
                        <div className="space-y-3.5">
                          {userPollForm.options.map((opt, oIdx) => (
                            <div key={opt.id} className="p-3 rounded-lg border border-[#1e2038] bg-black/25 space-y-2 relative">
                              <div className="space-y-1">
                                <label className="text-[9px] opacity-60 font-bold">Nama Pilihan Anime {oIdx + 1}</label>
                                <input
                                  type="text"
                                  value={opt.name}
                                  onChange={(e) => {
                                    const updated = [...userPollForm.options]
                                    updated[oIdx].name = e.target.value
                                    setUserPollForm({ ...userPollForm, options: updated })
                                  }}
                                  placeholder="Contoh: Digimon Adventure (1999)"
                                  className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] opacity-60 font-bold">Thumbnail Gambar URL (Opsional)</label>
                                <input
                                  type="text"
                                  value={opt.imageUrl}
                                  onChange={(e) => {
                                    const updated = [...userPollForm.options]
                                    updated[oIdx].imageUrl = e.target.value
                                    setUserPollForm({ ...userPollForm, options: updated })
                                  }}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full p-2 rounded bg-[#121324] border border-[#1e2038]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-2 border-t border-slate-500/10">
                        <button type="submit" className="flex-1 py-2 bg-pink-500 hover:bg-pink-600 text-white font-extrabold rounded">
                          Terbitkan Vote Saya
                        </button>
                        <button type="button" onClick={() => setShowUserPollModal(false)} className="px-4 py-2 bg-slate-500/15 text-slate-300 rounded">
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: PROFILE */}
          {activeTab === 'profile' && currentUser && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              <div className="border-b border-slate-500/10 pb-3">
                <h2 className="text-xl md:text-2xl font-black text-cyan-400">Profil Anggota Shindora</h2>
                <p className="text-xs opacity-60">Kelola foto profil Anda (maks 1 MB), info akun, dan playlist pribadi.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card & Avatar single Upload */}
                <div className={`p-6 rounded-2xl border text-center space-y-4 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                  
                  {/* Single Upload Avatar Component with live preview & validations */}
                  <div className="relative w-28 h-28 mx-auto group">
                    <img
                      src={avatarPreview || currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover border-4 border-purple-500/40 group-hover:opacity-75 transition-all shadow-xl"
                    />
                    
                    {/* Trigger file dialog overlay */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white text-xs font-bold"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      <span>Ubah</span>
                    </button>
                    
                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                    />
                  </div>

                  {/* Progress Indicator */}
                  {uploadProgress !== null && (
                    <div className="w-full space-y-1">
                      <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-cyan-400 font-bold">Mengompres & Mengupload ({uploadProgress}%)</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-100">{currentUser.name}</h3>
                    <p className="text-xs opacity-60">{currentUser.email}</p>
                    <span className="inline-block px-2.5 py-0.5 mt-1 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  {/* Custom quick staff link inside card */}
                  {currentUser.role === 'moderator' && (
                    <a
                      href="/moderator"
                      className="block w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90 text-black text-xs font-black rounded-lg transition-all text-center uppercase tracking-wider"
                    >
                      Masuk Panel Moderator
                    </a>
                  )}
                </div>

                {/* Playlist Manager in Profile Page */}
                <div className="md:col-span-2 space-y-4">
                  <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-extrabold text-sm md:text-base text-cyan-400">Buat Playlist Pribadi Baru</h3>
                    
                    <form onSubmit={handleCreatePlaylist} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama playlist baru (misal: Maraton Shinchan)..."
                        value={newPlaylistTitle}
                        onChange={(e) => setNewPlaylistTitle(e.target.value)}
                        className={`flex-1 text-xs p-2.5 rounded-lg border outline-none ${
                          theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-50 border-slate-200'
                        }`}
                        required
                      />
                      <button type="submit" className="px-5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-lg text-xs flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Buat</span>
                      </button>
                    </form>
                  </div>

                  <div className={`p-6 rounded-2xl border space-y-4 ${theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-extrabold text-sm md:text-base text-purple-400">Kelola Playlist Pribadi Anda</h3>

                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto">
                      {playlists.filter(p => p.ownerId === currentUser.id).length === 0 ? (
                        <p className="text-xs opacity-60 italic text-center py-4">Belum ada playlist pribadi. Silakan buat menggunakan form di atas!</p>
                      ) : (
                        playlists.filter(p => p.ownerId === currentUser.id).map((pl) => (
                          <div key={pl.id} className="p-3.5 rounded-xl border border-slate-500/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-extrabold text-xs md:text-sm text-slate-100">{pl.title}</h4>
                                <span className="text-[10px] opacity-50">{pl.videoIds.length} video tersimpan</span>
                              </div>
                              <button
                                onClick={() => handleDeletePlaylist(pl.id)}
                                className="text-red-400 hover:text-red-500 p-1.5 rounded hover:bg-red-500/5 transition-all"
                                title="Hapus Playlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Playlist inner content management list */}
                            {pl.videoIds.length > 0 && (
                              <div className="space-y-1.5 pt-1 border-t border-slate-500/5">
                                {pl.videoIds.map((vidId) => {
                                  const vid = videos.find(v => v.id === vidId)
                                  if (!vid) return null
                                  return (
                                    <div key={vidId} className="flex justify-between items-center text-xs p-1 rounded hover:bg-slate-500/5">
                                      <span className="truncate opacity-80">{vid.episode} &bull; {vid.title}</span>
                                      <button
                                        onClick={() => handleRemoveVideoFromPlaylist(pl.id, vidId)}
                                        className="text-slate-500 hover:text-red-400 font-extrabold"
                                        title="Keluarkan dari Playlist"
                                      >
                                        &times;
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 4. FOOTER */}
      <footer className={`border-t py-6 text-center text-xs opacity-50 mt-12 ${theme === 'dark' ? 'border-[#1e2038] bg-[#090a12]' : 'border-slate-200 bg-slate-50'} space-y-3`}>
        {staticPages && staticPages.filter(p => p.showInFooter).length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 font-bold text-[10px] md:text-xs">
            {staticPages.filter(p => p.showInFooter).map(p => (
              <a key={p.id} href={`/page/${p.slug}`} className="hover:text-cyan-400 transition-all uppercase tracking-wider">
                {p.title}
              </a>
            ))}
          </div>
        )}
        <p>&copy; {new Date().getFullYear()} ShinDora Nesub &bull; Retro &amp; Nostalgia Anime Watch Platform.</p>
        <p className="mt-1 text-[10px]">Dibuat dengan sepenuh cinta demi melestarikan tontonan masa kecil hari Minggu.</p>
      </footer>

      {/* POP-UP / FLOATING BANNER AD SAWERIA */}
      {(() => {
        const ad = ads.find(a => a.slot === 'banner_popup' && a.isActive)
        if (!ad) return null
        return (
          <div className="fixed bottom-4 right-4 z-50 max-w-xs p-4 rounded-xl border border-pink-500/30 bg-[#0d0e1b]/95 shadow-2xl space-y-3 animate-bounce">
            <div className="flex items-center gap-3">
              {ad.imageUrl && <img src={ad.imageUrl} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />}
              <div>
                <span className="text-[8px] uppercase tracking-wider text-pink-400 font-bold block">DONASI / PENGUMUMAN</span>
                <p className="text-xs font-extrabold text-slate-100">{ad.title}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={ad.targetUrl}
                target={ad.openInNewTab !== false ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="flex-1 text-center py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-[11px] rounded-lg shadow-md"
              >
                Kunjungi
              </a>
              <button
                onClick={() => {
                  setAds(ads.map(a => a.slot === 'banner_popup' ? { ...a, isActive: false } : a))
                }}
                className="px-2 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        )
      })()}

      {/* INTERACTIVE DONATION OVERLAY BANNER */}
      {activeOverlayDonation && (
        <>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marqueeDonation {
              0% { transform: translateX(100vw); }
              100% { transform: translateX(-100%); }
            }
            .marquee-donation-text {
              animation: marqueeDonation var(--marquee-speed, 15s) linear infinite;
            }
            .marquee-donation-container:hover .marquee-donation-text {
              animation-play-state: paused;
            }
          `}} />

          <div 
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-lg rounded-xl border shadow-2xl overflow-hidden bg-[#0d0e1b]/95 border-pink-500/40 text-white marquee-donation-container p-3 flex items-center justify-between gap-3"
            style={{ 
              '--marquee-speed': (() => {
                const speed = settings?.donationMarqueeSpeed || 'Sedang'
                if (speed === 'Lambat') return '25s'
                if (speed === 'Cepat') return '8s'
                return '15s'
              })()
            }}
          >
            <div className="flex-1 overflow-hidden relative h-10 flex items-center">
              <div className="marquee-donation-text whitespace-nowrap flex items-center gap-3 absolute">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white shadow ${
                  activeOverlayDonation.platform === 'Saweria' ? 'bg-orange-500' : 'bg-red-600'
                }`}>
                  {activeOverlayDonation.platform}
                </span>
                <span className="text-xs">
                  <strong className="text-pink-400 font-extrabold">{activeOverlayDonation.name}</strong> telah mendonasikan <strong className="text-cyan-400 font-extrabold">{activeOverlayDonation.amount}</strong>!
                  {activeOverlayDonation.message && <span className="italic text-slate-300 ml-2 font-medium">&ldquo;{activeOverlayDonation.message}&rdquo;</span>}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveOverlayDonation(null)}
              className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all flex-shrink-0 relative z-10 bg-[#0d0e1b]"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </>
      )}

      {/* ANTI COPY SELECTION STYLING */}
      {settings?.antiCopyActive && (
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
          }
        `}} />
      )}

      {/* ANTI ADBLOCK OVERLAY MODAL */}
      {adblockDetected && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-[#0d0e1b] border border-yellow-500/30 rounded-2xl w-full max-w-md p-6 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 bg-yellow-500/15 text-yellow-500 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20 text-3xl animate-bounce">
              ⚠️
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">AdBlocker Terdeteksi!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {settings?.antiAdblockMessage || "Mohon matikan AdBlock Anda untuk mendukung keberlangsungan platform streaming ini!"}
            </p>
            <div className="pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all w-full uppercase tracking-wider"
              >
                Saya Sudah Mematikan AdBlock
              </button>
            </div>
          </div>
        </div>
      )}
      {/* QUICK PLAYLIST SELECTOR MODAL */}
      {playlistSelectorVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div 
            onClick={() => setPlaylistSelectorVideo(null)} 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <div className={`relative w-full max-w-sm rounded-2xl p-5 border space-y-4 shadow-2xl animate-fade-in ${
            theme === 'dark' ? 'bg-[#0d0e1b] border-[#1e2038]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-500/10 pb-2">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider text-pink-500 font-bold block">Simpan Ke Playlist</span>
                <h4 className="text-xs font-extrabold text-slate-100 truncate max-w-[200px]">{playlistSelectorVideo.title}</h4>
              </div>
              <button 
                onClick={() => setPlaylistSelectorVideo(null)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all text-xs font-bold"
              >
                &times; Tutup
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {!currentUser ? (
                <p className="text-xs opacity-60 text-center py-4 italic">Silakan login untuk mengelola playlist pribadi!</p>
              ) : playlists.filter(p => p.ownerId !== null).length === 0 ? (
                <div className="text-center py-4 opacity-60 text-xs italic space-y-2">
                  <p>Belum ada playlist pribadi.</p>
                  <button 
                    onClick={() => { setPlaylistSelectorVideo(null); setActiveTab('profile'); }}
                    className="px-4 py-1.5 bg-cyan-500 text-black font-extrabold rounded text-[10px] uppercase"
                  >
                    Buat di Profil
                  </button>
                </div>
              ) : (
                playlists.filter(p => p.ownerId !== null).map((pl) => {
                  const contains = pl.videoIds.includes(playlistSelectorVideo.id)
                  return (
                    <button
                      key={pl.id}
                      onClick={() => {
                        if (contains) {
                          handleRemoveVideoFromPlaylist(pl.id, playlistSelectorVideo.id)
                        } else {
                          handleAddVideoToPlaylist(pl.id, playlistSelectorVideo.id)
                        }
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border flex items-center justify-between transition-all ${
                        contains 
                          ? 'bg-pink-500/15 border-pink-500 text-pink-400 font-extrabold' 
                          : theme === 'dark'
                            ? 'bg-[#121324] border-[#1e2038] text-slate-300 hover:bg-[#1a1c32]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-xs truncate">{pl.title}</span>
                      <span className="text-xs font-bold">
                        {contains ? '✓' : '+'}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { Tv, ListVideo, Play, ChevronRight, Sun, Moon } from 'lucide-react'

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

export default function PutarManualPage() {
  const [theme, setTheme] = useState('dark')
  const [videos, setVideos] = useState([])
  const [activeVideo, setActiveVideo] = useState(null)
  const [categories, setCategories] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [settings, setSettings] = useState(null)
  const [ads, setAds] = useState([])

  const [activeServer, setActiveServer] = useState(1)

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
    return `${url}${url?.includes('?') ? '&' : '?'}autoplay=1`
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

  // Ok.ru Player API & PostMessage autoplay listener for putar-manual
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
        console.log('[PostMessage PutarManual] Video ended event received. Jumper next!')
        const nextVideo = getNextEpisode()
        if (nextVideo) {
          setActiveVideo(nextVideo)
          setActiveServer(1)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [videos, activeVideo])
  useEffect(() => {
    const savedTheme = localStorage.getItem('shindora-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')

    fetchVideos()
    fetchSettings()
    fetchAds()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAds = async () => {
    try {
      const res = await fetch('/api/ads')
      const data = await res.json()
      setAds(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
    }
  }

  const renderAdSlot = (slotName) => {
    const ad = ads.find(a => a.slot === slotName && a.isActive)
    return <AdSlotContainer ad={ad} />
  }

  // GLOBAL HEAD AD SCRIPTS INJECTOR HOOK
  useEffect(() => {
    if (!settings || !settings.globalHeadScripts) return;

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
  }, [settings]);

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
      const t = setTimeout(incrementViews, 1000);
      return () => clearTimeout(t);
    }
  }, [activeVideo?.id]);

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos')
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
        // Extract unique anime titles as categories
        const uniqueCats = [...new Set(data.map(v => v.animeTitle))]
        setCategories(uniqueCats)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('shindora-theme', nextTheme)
    document.documentElement.classList.toggle('dark', nextTheme === 'dark')
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0b14] text-[#e2e8f0]' : 'bg-[#f8fafc] text-[#0f172a]'}`}>
      
      {/* HEADER */}
      <header className={`border-b px-4 py-3 sticky top-0 z-40 backdrop-blur-md ${
        theme === 'dark' ? 'bg-[#0d0e1b]/95 border-[#1e2038]' : 'bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-1.5 rounded-lg border hover:bg-slate-500/5 transition-all text-xs font-bold flex items-center gap-1">
              &larr; Kembali ke Beranda
            </a>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-600 rounded text-white font-black text-xs">PM</div>
              <span className="font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 text-sm md:text-base">
                PUTAR MANUAL SHINDORA
              </span>
            </div>
          </div>

          <button
            onClick={handleToggleTheme}
            className={`p-2 rounded-full transition-all ${theme === 'dark' ? 'hover:bg-[#1a1c32] text-yellow-400' : 'hover:bg-slate-100 text-slate-700'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Banner info */}
        <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-2">
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-wider">Mode Mandiri</span>
          <h2 className="text-xl font-bold flex items-center gap-1.5">
            <ListVideo className="w-5 h-5 text-purple-400" />
            <span>Katalog Putar Manual</span>
          </h2>
          <p className="text-xs opacity-70 leading-relaxed max-w-3xl">
            Tonton episode favorit Anda satu per satu tanpa terganggu oleh sistem putar otomatis (autoplay) atau playlist maraton. 
            Sempurna untuk fokus menikmati satu cerita retro saja.
          </p>
        </div>

        {/* STANDALONE PLAYER AREA */}
        {/* STANDALONE PLAYER AREA */}
        {activeVideo && (
          <div className="space-y-4 animate-fade-in max-w-4xl mx-auto">
            {renderAdSlot('banner_above_playlist')}
            <div className="relative border-4 border-[#1e2038] rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
              {/* CRT Glass Scanlines */}
              <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] opacity-10" />
              {activeServer === 1 ? (
                <iframe
                  src={getEmbedUrl(activeVideo)}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
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
                          console.log('[HTML5 Video PutarManual] Ended. Trigger next!')
                          const nextVid = getNextEpisode()
                          if (nextVid) {
                            setActiveVideo(nextVid)
                            setActiveServer(1)
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

            {/* Video Info & Navigations Card */}
            <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-500/10 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded uppercase">{activeVideo.animeTitle} &bull; {activeVideo.episode}</span>
                  <h3 className="font-extrabold text-sm md:text-base text-white mt-1.5">{activeVideo.title}</h3>
                  <p className="text-xs opacity-75 mt-1 leading-relaxed">{activeVideo.description}</p>
                </div>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-black text-xs transition-all self-stretch md:self-auto text-center"
                >
                  Tutup Pemutar
                </button>
              </div>

              {renderAdSlot('banner_below_player')}

              {/* EPISODE NAVIGATION BUTTONS ROW */}
              <div className="grid grid-cols-2 gap-2 w-full pt-2 border-t border-slate-500/10">
                <button
                  onClick={() => {
                    const prevVideo = getPrevEpisode()
                    if (prevVideo) {
                      setActiveVideo(prevVideo)
                      setActiveServer(1)
                    }
                  }}
                  disabled={!getPrevEpisode()}
                  className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                    getPrevEpisode()
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                      : 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-slate-500/5'
                  }`}
                  title="Tonton Episode Sebelumnya"
                >
                  <span>&larr; Eps Sebelumnya</span>
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
                  className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-black transition-all border ${
                    getNextEpisode()
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                      : 'opacity-40 cursor-not-allowed border-transparent text-slate-500 bg-slate-500/5'
                  }`}
                  title="Tonton Episode Selanjutnya"
                >
                  <span>Eps Selanjutnya &rarr;</span>
                </button>
              </div>

              {/* DAFTAR TOMBOL EPISODE BERURUTAN */}
              <div className="pt-3 border-t border-slate-500/10 space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider opacity-60">Daftar Episode ({activeVideo.animeTitle}):</span>
                <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {getSortedCategoryEpisodes(activeVideo.animeTitle).map((epVid) => {
                    const isActive = epVid.id === activeVideo.id;
                    const epLabel = epVid.episode || `Eps ${parseInt(epVid.episode?.replace(/\D/g, '')) || '?'}`;
                    
                    return (
                      <button
                        key={epVid.id}
                        onClick={() => {
                          setActiveVideo(epVid);
                          setActiveServer(1);
                        }}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          isActive
                            ? 'bg-pink-500 border-pink-600 text-white shadow-md font-extrabold'
                            : theme === 'dark'
                              ? 'bg-[#121324] hover:bg-[#1a1c32] border-[#1e2038] text-slate-300'
                              : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {epLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CATALOGUE GROUPED BY ANIME TITLE */}
        <div className="space-y-4">
          {categories.map((animeTitle) => {
            const animeEpisodes = getSortedCategoryEpisodes(animeTitle)
            const isExpanded = expandedCategories[animeTitle] || false
            
            return (
              <div key={animeTitle} className={`rounded-xl border overflow-hidden transition-all ${
                theme === 'dark' ? 'border-[#1e2038] bg-[#0d0e1b]' : 'border-slate-200 bg-white'
              }`}>
                {/* Folder Accordion Header */}
                <button
                  onClick={() => setExpandedCategories(prev => ({ ...prev, [animeTitle]: !isExpanded }))}
                  className="w-full flex items-center justify-between p-4 text-left transition-all hover:bg-slate-500/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📁</span>
                    <span className="font-extrabold text-sm md:text-base text-slate-100 uppercase tracking-wide">
                      {animeTitle}
                    </span>
                    <span className="text-[10px] bg-slate-500/15 px-2 py-0.5 rounded-full opacity-70 font-semibold">
                      {animeEpisodes.length} Episode
                    </span>
                  </div>
                  <span className={`text-xs opacity-60 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    &bull;&bull;&bull;
                  </span>
                </button>

                {/* Folder Accordion Content - Grid of Episode Buttons */}
                {isExpanded && (
                  <div className="p-4 border-t border-[#1e2038] bg-black/20 animate-fade-in">
                    {animeEpisodes.length === 0 ? (
                      <p className="text-xs opacity-50 italic py-2">Belum ada episode di folder ini.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {animeEpisodes.map((video) => {
                          const isPlaying = activeVideo && activeVideo.id === video.id
                          const epLabel = video.episode || `Eps ${parseInt(video.episode?.replace(/\D/g, '')) || '?'}`;
                          
                          return (
                            <button
                              key={video.id}
                              onClick={() => {
                                setActiveVideo(video)
                                setActiveServer(1)
                                window.scrollTo({ top: 120, behavior: 'smooth' })
                              }}
                              className={`px-3 py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                                isPlaying
                                  ? 'bg-pink-500 border-pink-600 text-white font-extrabold shadow-md'
                                  : theme === 'dark' 
                                    ? 'bg-[#121324] hover:bg-[#1a1c32] border-[#1e2038] text-slate-300' 
                                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              }`}
                              title={video.title}
                            >
                              {epLabel}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs opacity-50 mt-12 bg-[#090a12] border-[#1e2038]">
        <p>&copy; ShinDora Nesub Putar Manual &bull; Retro &amp; Nostalgia streaming platform.</p>
      </footer>
    </div>
  )
}
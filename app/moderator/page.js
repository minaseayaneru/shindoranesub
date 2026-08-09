'use client'

import { useState, useEffect } from 'react'
import { Trash2, Search, Filter, Shield, AlertTriangle } from 'lucide-react'

export default function ModeratorPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Real-time lists and tools
  const [comments, setComments] = useState([])
  const [videos, setVideos] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [episodeFilter, setEpisodeFilter] = useState('ALL')

  useEffect(() => {
    // Quick role check session
    const storedUser = localStorage.getItem('shindora-user')
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      if (parsed.role === 'moderator' || parsed.role === 'admin') {
        setIsAuthorized(true)
        fetchCommentsAndVideos()
      } else {
        alert('Akses Ditolak! Hanya peran Moderator atau Admin yang dapat mengakses panel ini!')
        window.location.href = '/'
      }
    } else {
      alert('Silakan login sebagai moderator terlebih dahulu!')
      window.location.href = '/login'
    }
    setLoading(false)
  }, [])

  const fetchCommentsAndVideos = async () => {
    try {
      const comRes = await fetch('/api/comments')
      const comData = await comRes.json()
      setComments(Array.isArray(comData) ? comData : [])

      const vidRes = await fetch('/api/videos')
      const vidData = await vidRes.json()
      setVideos(Array.isArray(vidData) ? vidData : [])
    } catch (err) {
      console.error(err)
    }
  }

  // Deleting comment and all nested replying children
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Hapus komentar ini beserta seluruh rantai balasannya? Tindakan ini tidak dapat dibatalkan.')) return

    try {
      const res = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        alert(`Berhasil menghapus ${data.deletedCount || 1} komentar/balasan!`)
        fetchCommentsAndVideos()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Searched & Filtered comment lists
  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.userName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesEpisode = episodeFilter === 'ALL' || comment.videoId === episodeFilter

    return matchesSearch && matchesEpisode
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080f] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Memeriksa Hak Akses Moderator...</span>
      </div>
    )
  }

  if (!isAuthorized) return null

  return (
    <div className="min-h-screen bg-[#0a0b14] text-[#e2e8f0] flex flex-col">
      
      {/* NAVBAR HEADER */}
      <header className="border-b border-[#1e2038] bg-[#0d0e1b] px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="px-3 py-1 bg-slate-500/10 hover:bg-slate-500/20 text-xs font-black rounded-lg transition-all border border-slate-500/20 text-slate-300">
              &larr; Kembali ke Website
            </a>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400 fill-cyan-400/10" />
              <span className="font-extrabold tracking-widest text-sm bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent uppercase">
                Panel Moderasi Komentar Shindora
              </span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">MODE STAF</span>
        </div>
      </header>

      {/* CORE MODERATION WORKSPACE */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 flex-1 w-full">
        
        {/* Banner info */}
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-white">Panduan Moderasi Opini Retro</h3>
            <p className="text-xs opacity-70 leading-relaxed max-w-4xl">
              Halaman ini memantau seluruh opini, balasan, dan pesan yang diposting oleh pecinta anime retro di ShinDora Nesub. 
              Sebagai Moderator/Staf, Anda dapat menghapus komentar bermasalah secara langsung. 
              Menghapus komentar induk (parent) akan <strong>otomatis menghapus seluruh rantai balasannya</strong> demi kerapian database.
            </p>
          </div>
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#0d0e1b] p-4 rounded-xl border border-[#1e2038]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari kata kunci isi komentar atau nama user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8.5 pr-4 py-2 bg-[#121324] border border-[#1e2038] text-white outline-none rounded-lg"
            />
          </div>

          <div className="relative flex items-center">
            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={episodeFilter}
              onChange={(e) => setEpisodeFilter(e.target.value)}
              className="w-full text-xs pl-8.5 pr-4 py-2 bg-[#121324] border border-[#1e2038] text-white outline-none rounded-lg font-bold"
            >
              <option value="ALL">Semua Video Episode</option>
              {videos.map(video => (
                <option key={video.id} value={video.id}>{video.animeTitle} - {video.episode} ({video.title})</option>
              ))}
            </select>
          </div>

          <div className="text-right flex items-center justify-end text-xs opacity-65 font-bold">
            Ditemukan {filteredComments.length} komentar dari database.
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-[#0d0e1b] rounded-xl border border-[#1e2038] overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#121324] opacity-70 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-3">Pengirim</th>
                <th className="p-3">Episode Target</th>
                <th className="p-3">Isi Komentar / Pesan</th>
                <th className="p-3 text-center">Tipe</th>
                <th className="p-3 text-right">Aksi Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2038]">
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center opacity-50 italic">
                    Komentar tidak ditemukan atau database kosong.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment, index) => {
                  const targetVid = videos.find(v => v.id === comment.videoId)
                  return (
                    <tr key={comment._id || comment.id ? `mod-comm-${comment._id || comment.id}-${index}` : `mod-idx-${index}`} className="hover:bg-slate-500/5 transition-all">
                      <td className="p-3 flex items-center gap-2">
                        <img src={comment.userAvatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-100">{comment.userName}</p>
                          <span className="text-[9px] font-mono opacity-40">{comment.userId}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-cyan-400">
                        {targetVid ? `${targetVid.animeTitle} - ${targetVid.episode}` : comment.videoId}
                      </td>
                      <td className="p-3 max-w-sm">
                        <p className="leading-relaxed opacity-95 text-slate-200">{comment.content}</p>
                        <span className="text-[9px] opacity-40 mt-1 block">Diposting: {new Date(comment.createdAt).toLocaleString()}</span>
                      </td>
                      <td className="p-3 text-center">
                        {comment.parentId ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-pink-500/10 text-pink-400">REPLY (Balasan)</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/10 text-cyan-400">PARENT (Induk)</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/50 rounded-lg transition-all"
                          title="Hapus Komentar beserta Rantai Balasannya secara Rekursif"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </main>

      <footer className="border-t border-[#1e2038] py-4 text-center text-xs opacity-50 bg-[#090a12] mt-12">
        <p>&copy; ShinDora Nesub Moderator Dashboard.</p>
      </footer>

    </div>
  )
}
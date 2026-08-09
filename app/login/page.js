'use client'

import { useState, useEffect } from 'react'
import { X, User, Lock, Mail, Tv } from 'lucide-react'

export default function LoginPage() {
  const [theme, setTheme] = useState('dark')
  
  // Login form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Staf/Staff Mode state
  const [isStaffMode, setIsStaffMode] = useState(false)

  // Registration Mode option
  const [isRegister, setIsRegister] = useState(false)
  const [regName, setRegName] = useState('')

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccessMessage, setResetSuccessMessage] = useState('')
  useEffect(() => {
    const savedTheme = localStorage.getItem('shindora-theme') || 'dark'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          isStaffOnly: isStaffMode
        })
      })
      const data = await res.json()

      if (res.ok && data && !data.error) {
        localStorage.setItem('shindora-user', JSON.stringify(data))
        window.location.href = '/'
      } else {
        setError(data.error || 'Terjadi kesalahan sistem saat masuk!')
      }
    } catch (err) {
      console.error(err)
      setError('Koneksi server gagal! Silakan coba beberapa saat lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email,
          password
        })
      })
      const data = await res.json()

      if (res.ok && data && !data.error) {
        alert('Pendaftaran Berhasil! Silakan masuk dengan akun Anda.')
        setIsRegister(false)
        setError('')
      } else {
        setError(data.error || 'Pendaftaran gagal!')
      }
    } catch (err) {
      console.error(err)
      setError('Gagal mendaftar. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResetSuccessMessage('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      })
      const data = await res.json()
      if (res.ok && data && !data.error) {
        setResetSuccessMessage(data.message || 'Instruksi reset password berhasil dikirim ke email Anda!')
        setResetEmail('')
      } else {
        setError(data.error || 'Gagal mengirim instruksi reset password!')
      }
    } catch (err) {
      console.error(err)
      setError('Koneksi server gagal! Silakan coba beberapa saat lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulated Google OAuth login
  const handleGoogleLogin = async () => {
    setError('')
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pecinta Retro Google',
          email: 'google-user@shindora.com'
        })
      })
      const data = await res.json()
      if (res.ok && data && !data.error) {
        localStorage.setItem('shindora-user', JSON.stringify(data))
        window.location.href = '/'
      } else {
        setError(data.error || 'Google login failed')
      }
    } catch (err) {
      console.error(err)
      setError('Google OAuth Error!')
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative ${
      theme === 'dark' ? 'bg-[#07080f] text-[#e2e8f0]' : 'bg-[#f1f5f9] text-[#0f172a]'
    }`}>
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LOGIN CARD */}
      <div className={`w-full max-w-md rounded-2xl border p-6 md:p-8 relative shadow-2xl backdrop-blur-md transition-all ${
        theme === 'dark' ? 'bg-[#0d0e1b]/90 border-[#1e2038]' : 'bg-white border-slate-200'
      }`}>
        
        {/* CLOSE BUTTON (X) - REDIRECT TO HOME */}
        <a
          href="/"
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all border ${
            theme === 'dark' ? 'border-[#1e2038] hover:bg-[#1a1c32]' : 'border-slate-200 hover:bg-slate-100'
          }`}
          title="Kembali ke Beranda"
        >
          <X className="w-4 h-4" />
        </a>

        {/* Logo and Titles */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl text-black font-black mb-1">
            <Tv className="w-5 h-5 fill-current" />
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-500">
            {isForgotPassword ? 'RESET PASSWORD' : isRegister ? 'BUAT AKUN BARU' : isStaffMode ? 'MASUK KHUSUS STAF' : 'MASUK KE SHINDORA'}
          </h2>
          <p className="text-xs opacity-60">
            {isForgotPassword
              ? 'Masukkan email untuk menerima kode/instruksi reset.'
              : isRegister 
                ? 'Daftar untuk mengelola playlist pribadi hari Minggu Anda.' 
                : isStaffMode 
                  ? 'Validasi otentikasi peran Moderator / Admin.' 
                  : 'Temukan kembali kebahagiaan masa kecil Anda.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center mb-4">
            ⚠️ {error}
          </div>
        )}

        {resetSuccessMessage && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold text-center mb-4">
            ✓ {resetSuccessMessage}
          </div>
        )}

        {/* FORMS */}
        {isForgotPassword ? (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Ketik email terdaftar Anda..."
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-90 font-extrabold text-xs transition-all tracking-wider uppercase"
            >
              {isSubmitting ? 'Mengirim...' : 'KIRIM PIN VERIFIKASI'}
            </button>
          </form>
        ) : isRegister ? (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ketik nama lengkap Anda..."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Ketik email terdaftar..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Min. 6 karakter..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs transition-all tracking-wider uppercase mt-2"
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>
        ) : (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Masukkan email Anda..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider opacity-60">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  placeholder="Masukkan kata sandi..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs outline-none border transition-all ${
                    theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white focus:border-cyan-500' : 'bg-slate-100 border'
                  }`}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setError(''); setResetSuccessMessage(''); }}
                  className="text-[10px] text-pink-400 font-bold hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black hover:opacity-90 font-extrabold text-xs transition-all tracking-wider uppercase"
            >
              {isSubmitting ? 'Memverifikasi...' : isStaffMode ? 'MASUK SEBAGAI STAF' : 'MASUK SEKARANG'}
            </button>
          </form>
        )}

        {/* Google OAuth Simulation Trigger */}
        {!isRegister && !isStaffMode && (
          <div className="space-y-3 mt-4 pt-4 border-t border-slate-500/10">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className={`w-full py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                theme === 'dark' ? 'bg-[#121324] border-[#1e2038] text-white hover:bg-slate-500/5' : 'bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <img src="https://avatars.githubusercontent.com/in/1201222?s=40&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Google Logo" className="w-4 h-4 rounded-full" />
              <span>Lanjutkan dengan Google</span>
            </button>
          </div>
        )}

        {/* Navigation toggles & Links */}
        <div className="mt-5 text-center space-y-2.5">
          {isForgotPassword ? (
            <button
              onClick={() => { setIsForgotPassword(false); setError(''); setResetSuccessMessage(''); }}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              Sudah ingat kata sandi? Masuk di sini
            </button>
          ) : isRegister ? (
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              className="text-xs text-cyan-400 font-bold hover:underline"
            >
              Sudah punya akun? Masuk di sini
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setIsRegister(true); setError(''); setIsStaffMode(false); }}
                className="text-xs text-pink-400 font-bold hover:underline"
              >
                Belum punya akun? Daftar sebagai Anggota
              </button>

              <button
                onClick={() => { setIsStaffMode(!isStaffMode); setError(''); }}
                className="text-[10px] text-purple-400 font-semibold hover:underline"
              >
                {isStaffMode ? 'Beralih ke Login Anggota Biasa?' : 'Masuk sebagai Moderator / Staf?'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
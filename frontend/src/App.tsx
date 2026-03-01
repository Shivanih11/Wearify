import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { AboutPage } from './pages/AboutPage'
import { HomePage } from './pages/HomePage'
import { TryOnStudioPage } from './pages/TryOnStudioPage'
import { WardrobePage } from './pages/WardrobePage'
import { login, signup } from './lib/api'

function AuthPanel() {
  const [email, setEmail] = useState('demo@wearify.ai')
  const [password, setPassword] = useState('wearify123')
  const [name, setName] = useState('Demo User')
  const [message, setMessage] = useState('')

  const applyToken = async (fn: Promise<{ access_token: string }>) => {
    try {
      const data = await fn
      localStorage.setItem('wearify_token', data.access_token)
      setMessage('Authenticated. Open Try-On Studio.')
    } catch {
      setMessage('Authentication failed')
    }
  }

  return (
    <div className="glass mx-auto mt-8 max-w-2xl p-6">
      <h2 className="text-xl font-semibold">Login / Signup</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input className="rounded-lg border border-white/20 bg-transparent px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        <input className="rounded-lg border border-white/20 bg-transparent px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="rounded-lg border border-white/20 bg-transparent px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      </div>
      <div className="mt-4 flex gap-3">
        <button onClick={() => applyToken(signup(email, name, password))} className="rounded-xl border border-white/20 px-4 py-2">Sign up</button>
        <button onClick={() => applyToken(login(email, password))} className="rounded-xl bg-cyan-400 px-4 py-2 text-slate-900">Login</button>
      </div>
      <p className="mt-3 text-sm text-cyan-300">{message}</p>
    </div>
  )
}

export default function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100">
      <Navbar dark={dark} onToggle={() => setDark((v) => !v)} />
      <Routes>
        <Route path="/" element={<><HomePage /><AuthPanel /></>} />
        <Route path="/studio" element={<TryOnStudioPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

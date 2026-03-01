import { Moon, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'

type Props = { dark: boolean; onToggle: () => void }

export function Navbar({ dark, onToggle }: Props) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-wide text-cyan-300">Wearify</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-cyan-300">Home</Link>
          <Link to="/studio" className="hover:text-cyan-300">Try-On Studio</Link>
          <Link to="/wardrobe" className="hover:text-cyan-300">My Wardrobe</Link>
          <Link to="/about" className="hover:text-cyan-300">About</Link>
          <button onClick={onToggle} className="rounded-full border border-white/20 p-2 hover:border-cyan-300">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </nav>
  )
}

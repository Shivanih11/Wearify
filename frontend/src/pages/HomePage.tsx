import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const cards = [
  { title: 'AI Cloth Extraction', text: 'Upload any shopping screenshot and remove background instantly.' },
  { title: 'AR Pose Tracking', text: 'MediaPipe shoulders + hips detection for realistic alignment.' },
  { title: 'Smart Wardrobe', text: 'Save outfits, compare before/after, and build your digital closet.' },
]

export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-900/30 via-slate-900 to-purple-900/30 p-10">
        <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-40 w-40 rounded-full bg-purple-400/30 blur-3xl" />
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
        >
          Wearify — AI Virtual Try-On Like a Snapchat Filter for Fashion
        </motion.h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Upload dress screenshots, remove background with AI, and try clothes in real-time AR with live pose tracking.
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/studio" className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-900">Start Try-On</Link>
          <a href="#how" className="rounded-xl border border-white/20 px-5 py-3">How it works</a>
        </div>
      </section>

      <section id="how" className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((card, idx) => (
          <motion.div key={card.title} whileHover={{ y: -5 }} className="glass p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.1 }}>
            <h3 className="text-lg font-semibold text-cyan-200">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.text}</p>
          </motion.div>
        ))}
      </section>
    </main>
  )
}

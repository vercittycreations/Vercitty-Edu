import { motion } from 'framer-motion'

export default function Loader({ fullscreen = false, text = 'Loading…' }) {
  const wrap = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center mesh-bg'
    : 'flex flex-col items-center justify-center py-16'

  return (
    <div className={wrap}>
      {/* Spinning rings */}
      <div className="relative w-14 h-14 mb-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-transparent
            border-t-indigo-500 border-r-indigo-500/40"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full border-2 border-transparent
            border-t-green-400/60"
        />
        <div className="absolute inset-4 rounded-full bg-indigo-500/10
          flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-indigo-400
            shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        </div>
      </div>
      <p className="text-slate-500 text-sm font-mono">{text}</p>
    </div>
  )
}
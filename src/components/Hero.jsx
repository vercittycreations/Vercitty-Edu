import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import {
  ArrowRight, Sparkles, Users, Clock, Award,
} from 'lucide-react'

const stats = [
  { icon: Users, value: '500+',  label: 'Students Enrolled' },
  { icon: Clock, value: '8 Wks', label: 'Program Duration'  },
  { icon: Award, value: '100%',  label: 'Certificate Given' },
]

const floatVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center
      mesh-bg grid-overlay overflow-hidden px-5 pt-24 pb-16">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full
          bg-indigo-600/10 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full
          bg-green-500/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full bg-indigo-500/4 blur-[120px]" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.6 }}
        className="badge mb-6"
      >
        <Sparkles size={12} />
        Applications Open — Batch 2025
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display font-extrabold text-center leading-[1.08]
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl glow-text"
      >
        Launch Your{' '}
        <span className="gradient-text">Tech Career</span>
        <br />with Real Experience
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mt-6 text-center text-slate-400 text-base sm:text-lg
          max-w-xl leading-relaxed"
      >
        Hands-on internship program designed to transform students into
        job-ready professionals. Work on live projects. Get certified.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.6, delay: 0.38 }}
        className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
      >
        <Link to="/apply" className="relative group">
          <span className="absolute inset-0 rounded-xl bg-indigo-500/30
            blur-lg scale-110 group-hover:bg-indigo-500/50
            transition-all duration-300 animate-glow-pulse" />
          <span className="relative btn-primary text-base px-8 py-4 rounded-xl">
            Apply Now
            <ArrowRight size={18} />
          </span>
        </Link>

        <button
          onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })}
          className="btn-outline text-base px-8 py-4"
        >
          View Courses
        </button>
      </motion.div>

      {/* Stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1,  y: 0  }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-lg"
      >
        {stats.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1,  scale: 1   }}
            transition={{ delay: 0.55 + i * 0.1, duration: 0.4 }}
            className="flex flex-col items-center gap-1.5 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20
              flex items-center justify-center mb-1">
              <Icon size={16} className="text-indigo-400" />
            </div>
            <span className="font-display font-bold text-xl text-white">{value}</span>
            <span className="text-xs text-slate-500 leading-tight">{label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating 3-D cube decoration */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2"
        style={{ perspective: 600 }}
      >
        <div className="rotate-3d w-24 h-24 rounded-2xl
          bg-gradient-to-br from-indigo-500/30 to-indigo-900/20
          border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.25)]
          backdrop-blur-sm"
        />
        {/* orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-6"
        >
          <div className="absolute top-0 left-1/2 w-2.5 h-2.5 -translate-x-1/2
            rounded-full bg-indigo-400 shadow-[0_0_10px_#6366F1]" />
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col
          items-center gap-2 text-slate-600 text-xs"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-px h-8 bg-gradient-to-b from-transparent to-indigo-500/50"
        />
        scroll
      </motion.div>
    </section>
  )
}
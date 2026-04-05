import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence }        from 'framer-motion'
import {
  Home, ArrowRight, Download,
  Sparkles, Star,
} from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'
import Navbar         from '../components/Navbar'
import SuccessCard    from '../components/SuccessCard'

/* ─────────────────────────────────────────────
   3-D Rotating Gem  (CSS + JS canvas-free)
───────────────────────────────────────────── */
function RotatingGem() {
  return (
    <div className="relative w-32 h-32 mx-auto" style={{ perspective: '600px' }}>
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-indigo-500/20"
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2
          w-2.5 h-2.5 rounded-full bg-indigo-400
          shadow-[0_0_12px_4px_rgba(99,102,241,0.6)]" />
      </motion.div>

      {/* Middle ring (opposite) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border border-green-500/15"
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2
          w-2 h-2 rounded-full bg-green-400
          shadow-[0_0_10px_3px_rgba(34,197,94,0.5)]" />
      </motion.div>

      {/* Core gem */}
      <motion.div
        animate={{
          rotateX: [0, 15, 0, -15, 0],
          rotateY: [0, 180, 360, 180, 0],
          scale:   [1, 1.05, 1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className="absolute inset-8 rounded-2xl
          bg-gradient-to-br from-indigo-400/40 via-indigo-600/30 to-violet-700/40
          border border-indigo-400/40
          shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_0_20px_rgba(99,102,241,0.15)]
          backdrop-blur-sm"
      >
        {/* Shine face */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            animate={{ x: ['−100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            className="absolute top-0 bottom-0 w-1/3
              bg-gradient-to-r from-transparent via-white/20 to-transparent
              skew-x-12"
          />
        </div>
      </motion.div>

      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-full
        bg-indigo-500/10 blur-2xl scale-150 -z-10" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   Floating particles
───────────────────────────────────────────── */
function Particle({ delay, x, size, color }) {
  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0, x, rotate: 0 }}
      animate={{
        y: '-20vh',
        opacity: [0, 1, 1, 0],
        rotate: 360,
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: 'easeOut',
      }}
      style={{ left: `${x}%`, position: 'absolute', bottom: 0 }}
      className={`rounded-sm ${size} ${color}`}
    />
  )
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  delay: i * 0.12,
  x:     Math.random() * 100,
  size:  ['w-2 h-2', 'w-1.5 h-1.5', 'w-1 h-3', 'w-3 h-1'][i % 4],
  color: [
    'bg-indigo-400', 'bg-violet-400', 'bg-green-400',
    'bg-yellow-300', 'bg-pink-400',   'bg-sky-400',
  ][i % 6],
}))

/* ─────────────────────────────────────────────
   Tick SVG check animation
───────────────────────────────────────────── */
function AnimatedTick() {
  return (
    <div className="relative mx-auto w-20 h-20">
      {/* Pulse rings */}
      {[1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2,   opacity: 0    }}
          transition={{
            duration: 1.6,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute inset-0 rounded-full bg-green-500/30"
        />
      ))}

      {/* Circle bg */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative w-20 h-20 rounded-full
          bg-gradient-to-br from-green-400 to-green-600
          flex items-center justify-center
          shadow-[0_0_40px_rgba(34,197,94,0.5)]"
      >
        {/* Checkmark path */}
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <motion.path
            d="M10 21 L17 28 L30 14"
            stroke="white"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: 0.45, ease: 'easeOut' }}
          />
        </svg>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const record   = location.state?.record

  // Guard: no record → redirect
  useEffect(() => {
    if (!record) navigate('/', { replace: true })
  }, [record, navigate])

  if (!record) return null

  return (
    <PageTransition>
      <div className="relative min-h-screen mesh-bg overflow-hidden">
        <Navbar />

        {/* Confetti particles */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
        </div>

        {/* Stars sparkle (static) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 2,
                delay: Math.random() * 3,
                repeat: Infinity,
                repeatDelay: Math.random() * 4,
              }}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top:  `${Math.random() * 100}%`,
                width: 2, height: 2,
              }}
              className="rounded-full bg-indigo-300"
            />
          ))}
        </div>

        <main className="relative z-10 pt-24 pb-20 px-5">
          <div className="max-w-lg mx-auto">

            {/* ── Top section: tick + headline ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-10"
            >
              {/* Animated tick */}
              <div className="mb-6">
                <AnimatedTick />
              </div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1,  scale: 1   }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-1.5 badge-green badge mb-4"
              >
                <Sparkles size={11} />
                Enrollment Confirmed
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1,  y:  0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="font-display font-extrabold text-3xl sm:text-4xl mb-3"
              >
                Welcome aboard,{' '}
                <span className="gradient-text">
                  {record.fullName.split(' ')[0]}!
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-slate-400 text-sm leading-relaxed"
              >
                Your seat has been secured. Save your Student ID below —
                you'll need it for all future communications.
              </motion.p>
            </motion.div>

            {/* ── 3D Gem ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1,  scale: 1   }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="mb-10"
            >
              <RotatingGem />
            </motion.div>

            {/* ── Detail card ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-6 sm:p-8 mb-6"
            >
              {/* Amount paid pill */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                    Amount Paid
                  </p>
                  <p className="font-display font-extrabold text-3xl text-white mt-0.5">
                    ₹{record.amountPaid?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="badge-green badge text-xs">
                    Payment Successful
                  </span>
                  {record.couponUsed && (
                    <span className="text-xs text-slate-500 font-mono">
                      Coupon: {record.couponUsed}
                    </span>
                  )}
                </div>
              </div>

              <div className="divider mb-6" />

              {/* Info rows */}
              <SuccessCard record={record} />
            </motion.div>

            {/* ── Stars rating prompt ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="glass-sm rounded-2xl px-5 py-4 flex items-center
                justify-between gap-4 mb-6"
            >
              <p className="text-sm text-slate-400">
                How excited are you for the program?
              </p>
              <Stars />
            </motion.div>

            {/* ── Action buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link to="/" className="flex-1">
                <button className="btn-outline w-full py-3.5 rounded-xl">
                  <Home size={16} />
                  Back to Home
                </button>
              </Link>

              <button
                onClick={() => handleDownload(record)}
                className="flex-1 btn-primary py-3.5 rounded-xl"
              >
                <Download size={16} />
                Save Details
              </button>
            </motion.div>

            {/* Next steps */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <NextSteps />
            </motion.div>

          </div>
        </main>
      </div>
    </PageTransition>
  )
}

/* ─────────────────────────────────────────────
   Stars component
───────────────────────────────────────────── */
function Stars() {
  const [rating, setRating] = useState(0)
  const [hover,  setHover]  = useState(0)

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
        >
          <motion.div whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}>
            <Star
              size={18}
              className="transition-colors duration-150"
              fill={i <= (hover || rating) ? '#FACC15' : 'transparent'}
              color={i <= (hover || rating) ? '#FACC15' : '#475569'}
            />
          </motion.div>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Next steps card
───────────────────────────────────────────── */
function NextSteps() {
  const steps = [
    {
      num: '01',
      title: 'Check your email',
      desc:  'Confirmation & joining details sent to your inbox.',
    },
    {
      num: '02',
      title: 'Join WhatsApp group',
      desc:  'Link will be shared 24 hours before batch starts.',
    },
    {
      num: '03',
      title: 'Attend orientation',
      desc:  'First session is an intro + resource sharing.',
    },
  ]

  return (
    <div className="glass rounded-2xl p-5">
      <p className="font-display font-semibold text-sm text-white mb-4
        flex items-center gap-2">
        <ArrowRight size={14} className="text-indigo-400" />
        What happens next?
      </p>
      <div className="flex flex-col gap-4">
        {steps.map(({ num, title, desc }, i) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1,  x:   0 }}
            transition={{ delay: 1.1 + i * 0.1 }}
            className="flex gap-4 items-start"
          >
            <span className="font-mono text-xs text-indigo-400/60 pt-0.5
              shrink-0 w-6">
              {num}
            </span>
            <div>
              <p className="text-sm font-medium text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Download helper
───────────────────────────────────────────── */
function handleDownload(record) {
  const lines = [
    '========================================',
    '     VAULTCRAFT INTERNSHIP PROGRAM      ',
    '   ENROLLMENT CONFIRMATION RECEIPT      ',
    '========================================',
    '',
    `Student ID   : ${record.studentId}`,
    `Name         : ${record.fullName}`,
    `Email        : ${record.email}`,
    `Mobile       : +91 ${record.mobile}`,
    `Course       : ${record.course}`,
    `Batch        : ${record.batch}`,
    '',
    '--- Payment Details ---',
    `Amount Paid  : ₹${record.amountPaid}`,
    `Payment ID   : ${record.paymentId}`,
    `Order ID     : ${record.orderId}`,
    record.couponUsed ? `Coupon Used  : ${record.couponUsed}` : '',
    '',
    `Date         : ${new Date().toLocaleString('en-IN')}`,
    '',
    '========================================',
    'Keep this receipt for your records.',
    'Support: hello@vaultcraft.in',
    '========================================',
  ].filter(l => l !== undefined)

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `VaultCraft_${record.studentId}_Receipt.txt`
  a.click()
  URL.revokeObjectURL(url)
}
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence }        from 'framer-motion'
import {
  Home, ArrowRight, Download,
  Sparkles, Star, FileText, Award,
} from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'
import Navbar         from '../components/Navbar'
import SuccessCard    from '../components/SuccessCard'

/* ─────────────────────────────────────────────
   PDF helpers — pure canvas, no jsPDF needed
   We use the browser's print API via a hidden
   iframe so no extra npm package is required.
───────────────────────────────────────────── */

function buildCertificateHTML(record) {
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>VaultCraft Certificate — ${record.studentId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: 'Inter', sans-serif;
    background: #0F172A;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 40px;
  }
  .cert {
    width: 900px; height: 636px;
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    border: 2px solid #6366F1;
    border-radius: 20px;
    padding: 56px 72px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 80px rgba(99,102,241,0.25);
  }
  .cert::before {
    content: '';
    position: absolute; top: -80px; right: -80px;
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(99,102,241,0.08);
  }
  .cert::after {
    content: '';
    position: absolute; bottom: -60px; left: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(34,197,94,0.06);
  }
  .top-line {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 36px;
  }
  .brand { font-size: 22px; font-weight: 800; color: #F8FAFC; letter-spacing: -0.5px; }
  .brand span { color: #818CF8; }
  .badge {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    color: #818CF8; padding: 6px 16px; border-radius: 999px;
  }
  .title {
    font-size: 13px; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: #64748B; margin-bottom: 10px;
  }
  .name {
    font-size: 48px; font-weight: 800; color: #F8FAFC;
    letter-spacing: -1px; line-height: 1.1; margin-bottom: 24px;
  }
  .desc {
    font-size: 15px; color: #94A3B8; line-height: 1.7;
    max-width: 580px; margin-bottom: 40px;
  }
  .desc strong { color: #C7D2FE; font-weight: 600; }
  .footer {
    display: flex; align-items: flex-end;
    justify-content: space-between;
    border-top: 1px solid rgba(99,102,241,0.15);
    padding-top: 28px;
  }
  .meta { display: flex; gap: 40px; }
  .meta-item { display: flex; flex-direction: column; gap: 4px; }
  .meta-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; font-weight: 600; }
  .meta-value { font-size: 14px; color: #CBD5E1; font-weight: 600; font-family: monospace; }
  .seal {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #6366F1, #4F46E5);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 30px rgba(99,102,241,0.5);
  }
  .seal-inner { color: white; font-size: 26px; font-weight: 800; }
  @media print {
    body { background: white; padding: 0; }
    .cert { box-shadow: none; border-color: #6366F1; }
  }
</style>
</head>
<body>
<div class="cert">
  <div class="top-line">
    <div class="brand">Vault<span>Craft</span></div>
    <div class="badge">Certificate of Completion</div>
  </div>
  <div class="title">This is to certify that</div>
  <div class="name">${record.fullName}</div>
  <div class="desc">
    has successfully completed the
    <strong>${record.course}</strong> internship program at VaultCraft,
    demonstrating exceptional commitment and skill development
    throughout the duration of the program.
  </div>
  <div class="footer">
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Student ID</span>
        <span class="meta-value">${record.studentId}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Program</span>
        <span class="meta-value">${record.course}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Issue Date</span>
        <span class="meta-value">${date}</span>
      </div>
    </div>
    <div class="seal"><div class="seal-inner">VC</div></div>
  </div>
</div>
</body>
</html>`
}

function buildInvoiceHTML(record) {
  const date   = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const invoiceNo = `INV-${record.studentId}-${Date.now().toString().slice(-5)}`
  const gst    = Math.round(record.amountPaid * 0.18 * 100) / 100
  const base   = Math.round((record.amountPaid - gst) * 100) / 100
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice ${invoiceNo}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#fff; color:#1E293B; padding:60px; font-size:14px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px; }
  .brand { font-size:26px; font-weight:800; letter-spacing:-0.5px; color:#1E293B; }
  .brand span { color:#6366F1; }
  .inv-title { font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#64748B; margin-bottom:4px; }
  .inv-no { font-size:18px; font-weight:700; color:#1E293B; }
  .section { margin-bottom:32px; }
  .section-label { font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#94A3B8; margin-bottom:10px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
  .field { margin-bottom:6px; }
  .field span { color:#64748B; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:left; padding:10px 12px; font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#64748B; border-bottom:1px solid #E2E8F0; }
  td { padding:12px; border-bottom:1px solid #F1F5F9; }
  .total-row td { font-weight:700; font-size:16px; color:#1E293B; border-bottom:none; border-top:2px solid #6366F1; padding-top:16px; }
  .paid-badge { display:inline-block; background:#EAF3DE; color:#27500A; border:1px solid #97C459; border-radius:999px; font-size:12px; font-weight:600; padding:4px 14px; }
  .footer { margin-top:48px; padding-top:24px; border-top:1px solid #E2E8F0; color:#94A3B8; font-size:12px; line-height:1.7; }
  @media print { body { padding: 40px; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Vault<span>Craft</span></div>
      <div style="color:#64748B;font-size:13px;margin-top:6px;">hello@vaultcraft.in · New Delhi, India</div>
    </div>
    <div style="text-align:right">
      <div class="inv-title">Tax Invoice</div>
      <div class="inv-no">${invoiceNo}</div>
      <div style="color:#64748B;margin-top:4px;font-size:13px;">${date}</div>
    </div>
  </div>

  <div class="grid2 section">
    <div>
      <div class="section-label">Billed to</div>
      <div style="font-weight:600;font-size:15px;">${record.fullName}</div>
      <div class="field" style="margin-top:6px"><span>Email: </span>${record.email}</div>
      <div class="field"><span>Mobile: </span>+91 ${record.mobile}</div>
    </div>
    <div>
      <div class="section-label">Payment info</div>
      <div class="field"><span>Payment ID: </span><span style="font-family:monospace;font-size:12px">${record.paymentId}</span></div>
      <div class="field"><span>Student ID: </span><span style="font-family:monospace">${record.studentId}</span></div>
      <div class="field"><span>Status: </span><span class="paid-badge">PAID</span></div>
    </div>
  </div>

  <div class="section">
    <div class="section-label">Invoice details</div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:right">HSN</th>
          <th style="text-align:right">Base amount</th>
          <th style="text-align:right">GST 18%</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-weight:500">${record.course} Internship Program</div>
            <div style="font-size:12px;color:#64748B;margin-top:2px">${record.batch}</div>
          </td>
          <td style="text-align:right;font-family:monospace">998313</td>
          <td style="text-align:right">₹${base.toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${gst.toLocaleString('en-IN')}</td>
          <td style="text-align:right;font-weight:600">₹${record.amountPaid.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4">Total amount paid</td>
          <td style="text-align:right">₹${record.amountPaid.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>This is a computer-generated invoice and does not require a physical signature.</div>
    <div>For support, contact hello@vaultcraft.in</div>
  </div>
</body>
</html>`
}

function printInNewWindow(html, filename) {
  const win = window.open('', '_blank', 'width=1000,height=700')
  if (!win) { alert('Please allow popups for this site to download PDF.'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => {
    win.focus()
    win.print()
  }
}

/* ─────────────────────────────────────────────
   3-D Rotating Gem
───────────────────────────────────────────── */
function RotatingGem() {
  return (
    <div className="relative w-32 h-32 mx-auto" style={{ perspective: '600px' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 rounded-full border border-indigo-500/20"
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2
          w-2.5 h-2.5 rounded-full bg-indigo-400
          shadow-[0_0_12px_4px_rgba(99,102,241,0.6)]" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 rounded-full border border-green-500/15"
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2
          w-2 h-2 rounded-full bg-green-400
          shadow-[0_0_10px_3px_rgba(34,197,94,0.5)]" />
      </motion.div>
      <motion.div
        animate={{
          rotateX: [0, 15, 0, -15, 0],
          rotateY: [0, 180, 360, 180, 0],
          scale:   [1, 1.05, 1, 1.05, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="absolute inset-8 rounded-2xl
          bg-gradient-to-br from-indigo-400/40 via-indigo-600/30 to-violet-700/40
          border border-indigo-400/40
          shadow-[0_0_40px_rgba(99,102,241,0.4),inset_0_0_20px_rgba(99,102,241,0.15)]
          backdrop-blur-sm"
      >
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            className="absolute top-0 bottom-0 w-1/3
              bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>
      </motion.div>
      <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-2xl scale-150 -z-10" />
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
      animate={{ y: '-20vh', opacity: [0, 1, 1, 0], rotate: 360 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeOut' }}
      style={{ left: `${x}%`, position: 'absolute', bottom: 0 }}
      className={`rounded-sm ${size} ${color}`}
    />
  )
}

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  delay: i * 0.12,
  x:    Math.random() * 100,
  size: ['w-2 h-2', 'w-1.5 h-1.5', 'w-1 h-3', 'w-3 h-1'][i % 4],
  color: ['bg-indigo-400','bg-violet-400','bg-green-400','bg-yellow-300','bg-pink-400','bg-sky-400'][i % 6],
}))

/* ─────────────────────────────────────────────
   Animated tick
───────────────────────────────────────────── */
function AnimatedTick() {
  return (
    <div className="relative mx-auto w-20 h-20">
      {[1, 2].map(i => (
        <motion.div
          key={i}
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.6, delay: i * 0.3, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-green-500/30"
        />
      ))}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative w-20 h-20 rounded-full
          bg-gradient-to-br from-green-400 to-green-600
          flex items-center justify-center
          shadow-[0_0_40px_rgba(34,197,94,0.5)]"
      >
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <motion.path
            d="M10 21 L17 28 L30 14"
            stroke="white" strokeWidth="3.5"
            strokeLinecap="round" strokeLinejoin="round"
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
   Stars
───────────────────────────────────────────── */
function Stars() {
  const [rating, setRating] = useState(0)
  const [hover,  setHover]  = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} onClick={() => setRating(i)}
          onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
          <motion.div whileHover={{ scale: 1.3 }} whileTap={{ scale: 0.9 }}>
            <Star size={18} className="transition-colors duration-150"
              fill={i <= (hover || rating) ? '#FACC15' : 'transparent'}
              color={i <= (hover || rating) ? '#FACC15' : '#475569'} />
          </motion.div>
        </button>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Next steps
───────────────────────────────────────────── */
function NextSteps() {
  const steps = [
    { num: '01', title: 'Check your email',    desc: 'Confirmation & joining details sent to your inbox.' },
    { num: '02', title: 'Join WhatsApp group', desc: 'Link will be shared 24 hours before batch starts.' },
    { num: '03', title: 'Attend orientation',  desc: 'First session is an intro + resource sharing.' },
  ]
  return (
    <div className="glass rounded-2xl p-5">
      <p className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-2">
        <ArrowRight size={14} className="text-indigo-400" />
        What happens next?
      </p>
      <div className="flex flex-col gap-4">
        {steps.map(({ num, title, desc }, i) => (
          <motion.div key={num}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 + i * 0.1 }}
            className="flex gap-4 items-start">
            <span className="font-mono text-xs text-indigo-400/60 pt-0.5 shrink-0 w-6">{num}</span>
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
   Plain-text receipt download (existing)
───────────────────────────────────────────── */
function downloadReceipt(record) {
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
  a.href = url; a.download = `VaultCraft_${record.studentId}_Receipt.txt`; a.click()
  URL.revokeObjectURL(url)
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
export default function Success() {
  const location = useLocation()
  const navigate = useNavigate()
  const record   = location.state?.record

  useEffect(() => {
    if (!record) navigate('/', { replace: true })
  }, [record, navigate])

  if (!record) return null

  return (
    <PageTransition>
      <div className="relative min-h-screen mesh-bg overflow-hidden">
        <Navbar />

        {/* Confetti */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
          {PARTICLES.map(p => <Particle key={p.id} {...p} />)}
        </div>

        {/* Stars sparkle */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, delay: Math.random() * 3, repeat: Infinity, repeatDelay: Math.random() * 4 }}
              style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 2, height: 2 }}
              className="rounded-full bg-indigo-300"
            />
          ))}
        </div>

        <main className="relative z-10 pt-24 pb-20 px-5">
          <div className="max-w-lg mx-auto">

            {/* Tick + headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-10"
            >
              <div className="mb-6"><AnimatedTick /></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="inline-flex items-center gap-1.5 badge-green badge mb-4"
              >
                <Sparkles size={11} />
                Enrollment Confirmed
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
                className="font-display font-extrabold text-3xl sm:text-4xl mb-3"
              >
                Welcome aboard,{' '}
                <span className="gradient-text">{record.fullName.split(' ')[0]}!</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-slate-400 text-sm leading-relaxed"
              >
                Your seat has been secured. Save your Student ID below —
                you'll need it for all future communications.
              </motion.p>
            </motion.div>

            {/* 3D Gem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="mb-10"
            >
              <RotatingGem />
            </motion.div>

            {/* Detail card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-6 sm:p-8 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">Amount Paid</p>
                  <p className="font-display font-extrabold text-3xl text-white mt-0.5">
                    ₹{record.amountPaid?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="badge-green badge text-xs">Payment Successful</span>
                  {record.couponUsed && (
                    <span className="text-xs text-slate-500 font-mono">Coupon: {record.couponUsed}</span>
                  )}
                </div>
              </div>
              <div className="divider mb-6" />
              <SuccessCard record={record} />
            </motion.div>

            {/* Stars rating */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
              className="glass-sm rounded-2xl px-5 py-4 flex items-center justify-between gap-4 mb-6"
            >
              <p className="text-sm text-slate-400">How excited are you for the program?</p>
              <Stars />
            </motion.div>

            {/* ── Action buttons ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3"
            >
              <Link to="/" className="flex-1">
                <button className="btn-outline w-full py-3.5 rounded-xl">
                  <Home size={16} />
                  Back to Home
                </button>
              </Link>
              <button
                onClick={() => downloadReceipt(record)}
                className="flex-1 btn-primary py-3.5 rounded-xl"
              >
                <Download size={16} />
                Save Receipt (.txt)
              </button>
            </motion.div>

            {/* ── NEW: Certificate + Invoice row ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              <button
                onClick={() => printInNewWindow(buildCertificateHTML(record), `VaultCraft_Certificate_${record.studentId}`)}
                className="btn-accent py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <Award size={16} />
                Download Certificate
              </button>
              <button
                onClick={() => printInNewWindow(buildInvoiceHTML(record), `VaultCraft_Invoice_${record.studentId}`)}
                className="btn-outline py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm"
              >
                <FileText size={16} />
                Download GST Invoice
              </button>
            </motion.div>

            {/* Next steps */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="mt-2"
            >
              <NextSteps />
            </motion.div>

          </div>
        </main>
      </div>
    </PageTransition>
  )
}
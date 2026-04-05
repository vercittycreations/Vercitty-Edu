import { motion } from 'framer-motion'
import {
  CheckCircle2, Copy, ExternalLink,
  BookOpen, CreditCard, Hash, Calendar,
} from 'lucide-react'
import { useState } from 'react'

function InfoRow({ icon: Icon, label, value, mono = false, highlight = false }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1,  x:  0 }}
      className={`
        flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl
        ${highlight
          ? 'bg-indigo-500/10 border border-indigo-500/20'
          : 'glass-sm'}
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
          ${highlight
            ? 'bg-indigo-500/20'
            : 'bg-slate-700/50'}`}
        >
          <Icon size={13} className={highlight ? 'text-indigo-400' : 'text-slate-400'} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
            {label}
          </p>
          <p className={`text-sm mt-0.5 truncate
            ${mono ? 'font-mono text-indigo-300' : 'text-slate-200'}
            ${highlight ? 'font-bold text-white' : ''}`}
          >
            {value}
          </p>
        </div>
      </div>

      {mono && (
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/5
            text-slate-500 hover:text-slate-300 transition-colors"
        >
          {copied
            ? <CheckCircle2 size={13} className="text-green-400" />
            : <Copy size={13} />
          }
        </button>
      )}
    </motion.div>
  )
}

export default function SuccessCard({ record }) {
  const rows = [
    {
      icon: Hash,       label: 'Student ID',
      value: record?.studentId,
      mono: true, highlight: true,
    },
    {
      icon: BookOpen,   label: 'Course Enrolled',
      value: record?.course,
    },
    {
      icon: Calendar,   label: 'Batch',
      value: record?.batch,
    },
    {
      icon: CreditCard, label: 'Payment ID',
      value: record?.paymentId,
      mono: true,
    },
    {
      icon: Hash,       label: 'Order ID',
      value: record?.orderId,
      mono: true,
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, i) => (
        <motion.div
          key={r.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1,  y:  0 }}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.35 }}
        >
          <InfoRow {...r} />
        </motion.div>
      ))}
    </div>
  )
}
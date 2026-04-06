import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Hash, BookOpen, Calendar, CreditCard,
         CheckCircle2, AlertCircle, Loader2, Copy } from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import PageTransition from '../components/ui/PageTransition'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function InfoRow({ label, value, mono = false }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between gap-3 py-3
      border-b border-indigo-500/8 last:border-0">
      <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-sm truncate ${mono ? 'font-mono text-indigo-300 text-xs' : 'text-slate-200'}`}>
          {value || '—'}
        </span>
        {mono && value && (
          <button onClick={copy}
            className="text-slate-600 hover:text-slate-300 transition-colors flex-shrink-0">
            {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function StudentLookup() {
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState(null)
  const [error,   setError]   = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    const id = input.trim().toUpperCase()
    if (!id) return

    setError('')
    setStudent(null)
    setLoading(true)

    try {
      const q    = query(collection(db, 'students'), where('studentId', '==', id))
      const snap = await getDocs(q)

      if (snap.empty) {
        setError(`No student found with ID "${id}". Please check and try again.`)
      } else {
        setStudent({ docId: snap.docs[0].id, ...snap.docs[0].data() })
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg grid-overlay">
        <Navbar />

        <main className="pt-28 pb-20 px-5">
          <div className="max-w-lg mx-auto">

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center mb-10"
            >
              <span className="badge mb-3 inline-flex">
                <Hash size={11} /> Student Portal
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl mb-3">
                Verify Your{' '}
                <span className="gradient-text">Enrollment</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enter your Student ID to view your enrollment details,
                course, batch, and payment info.
              </p>
            </motion.div>

            {/* Search form */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="glass rounded-2xl p-6 mb-6"
            >
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
                Student ID
              </label>
              <div className="flex gap-3">
                <div className="input-wrap flex-1">
                  <span className="input-icon-left"><Hash size={15} /></span>
                  <input
                    type="text"
                    placeholder="VC-2025-001"
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())}
                    className="form-input form-input-icon-left font-mono tracking-wider uppercase"
                    maxLength={15}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={!loading ? { y: -1 } : {}}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary px-5 rounded-xl text-sm flex items-center gap-2 flex-shrink-0 disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Search size={15} />
                  }
                  {loading ? 'Searching…' : 'Look up'}
                </motion.button>
              </div>
              <p className="text-xs text-slate-600 mt-2.5">
                Your Student ID was sent to your email after enrollment. Format: VC-YYYY-XXX
              </p>
            </motion.form>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2.5 px-4 py-3 rounded-xl
                    bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result card */}
            <AnimatePresence>
              {student && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1,  y:  0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="glass rounded-2xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <h2 className="font-bold text-white text-xl">{student.fullName}</h2>
                      <p className="text-indigo-400 font-mono text-sm mt-0.5">{student.studentId}</p>
                    </div>
                    <span className="badge-green badge text-xs flex-shrink-0">
                      <CheckCircle2 size={11} />
                      Enrolled
                    </span>
                  </div>

                  <div className="divider mb-4" />

                  {/* Info rows */}
                  <InfoRow label="Course"     value={student.course} />
                  <InfoRow label="Batch"      value={student.batch} />
                  <InfoRow label="Email"      value={student.email} />
                  <InfoRow label="Mobile"     value={`+91 ${student.mobile}`} />
                  <InfoRow label="Amount Paid" value={`₹${student.amountPaid?.toLocaleString('en-IN')}`} />
                  <InfoRow label="Payment ID" value={student.paymentId} mono />
                  <InfoRow label="Student ID" value={student.studentId} mono />
                  {student.couponUsed && (
                    <InfoRow label="Coupon Used" value={student.couponUsed} mono />
                  )}

                  {/* Enrolled on */}
                  {student.createdAt?.toDate && (
                    <div className="mt-4 pt-4 border-t border-indigo-500/8">
                      <p className="text-xs text-slate-600 text-center">
                        Enrolled on{' '}
                        {student.createdAt.toDate().toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Help text */}
            {!student && !error && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-center text-slate-600 text-xs mt-6"
              >
                Lost your Student ID? Email us at{' '}
                <a href="mailto:hello@educrek.in"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  hello@educrek.in
                </a>
              </motion.p>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
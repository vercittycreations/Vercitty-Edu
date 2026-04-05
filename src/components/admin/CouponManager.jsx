import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Tag, Trash2, X, Check,
  Loader2, AlertCircle, CheckCircle2,
  Sparkles, TrendingDown,
} from 'lucide-react'
import {
  collection, onSnapshot, query, orderBy,
  addDoc, deleteDoc, doc, getDocs, where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from "../../config/firebase";
import { BASE_PRICE } from '../../config/razorpay'

/* ── Usage bar ──────────────────────────────── */
function UsageBar({ used, total }) {
  const pct = total > 0 ? (used / total) * 100 : 0
  const color =
    pct > 60 ? 'bg-green-500' :
    pct > 25 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-mono text-slate-400 whitespace-nowrap tabular-nums">
        {used}/{total}
      </span>
    </div>
  )
}

/* ── Inline alert ───────────────────────────── */
function Alert({ type, message, onClose }) {
  const styles = {
    success: 'bg-green-500/10 border-green-500/25 text-green-400',
    error:   'bg-red-500/10   border-red-500/25   text-red-400',
  }
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1,  y:  0, height: 'auto' }}
      exit={{    opacity: 0,  y: -4, height: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border
        text-sm overflow-hidden ${styles[type]}`}
    >
      <Icon size={14} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X size={13} />
        </button>
      )}
    </motion.div>
  )
}

/* ── Main component ─────────────────────────── */
export default function CouponManager() {
  const [coupons,  setCoupons]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [alert,    setAlert]    = useState(null) // { type, message }

  const [form, setForm] = useState({
    code: '', discountedPrice: '', usageLimit: '',
  })
  const [formErr, setFormErr] = useState({})
  const codeRef = useRef(null)

  /* ── Real-time listener ─── */
  useEffect(() => {
    const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setCoupons(snap.docs.map(d => ({ docId: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('[CouponManager]', err)
      setLoading(false)
    })
    return unsub
  }, [])

  /* ── Auto-focus when form opens ─── */
  useEffect(() => {
    if (adding) setTimeout(() => codeRef.current?.focus(), 60)
  }, [adding])

  /* ── Auto-dismiss alert after 4.5s ─── */
  useEffect(() => {
    if (!alert) return
    const t = setTimeout(() => setAlert(null), 4500)
    return () => clearTimeout(t)
  }, [alert])

  const set = k => e =>
    setForm(p => ({
      ...p,
      [k]: k === 'code' ? e.target.value.toUpperCase() : e.target.value,
    }))

  /* ── Validation ─── */
  function validate() {
    const e = {}
    if (!form.code.trim())
      e.code = 'Coupon code is required.'
    else if (!/^[A-Z0-9_-]{2,20}$/.test(form.code.trim()))
      e.code = 'Use 2–20 letters, numbers, _ or - only.'

    const dp = Number(form.discountedPrice)
    if (!form.discountedPrice || isNaN(dp) || dp <= 0)
      e.discountedPrice = 'Enter a valid price.'
    else if (dp >= BASE_PRICE)
      e.discountedPrice = `Must be less than ₹${BASE_PRICE}.`

    const ul = Number(form.usageLimit)
    if (!form.usageLimit || isNaN(ul) || ul < 1)
      e.usageLimit = 'Minimum usage limit is 1.'

    return e
  }

  /* ── Duplicate check (Firestore query) ─── */
  async function isDuplicate(code) {
    const q = query(collection(db, 'coupons'), where('code', '==', code))
    const snap = await getDocs(q)
    return !snap.empty
  }

  /* ── Create coupon ─── */
  async function handleCreate() {
    const e = validate()
    setFormErr(e)
    if (Object.keys(e).length) return

    setBusy(true)
    try {
      const code = form.code.trim()

      // Prevent duplicates
      if (await isDuplicate(code)) {
        setFormErr(p => ({ ...p, code: `Coupon "${code}" already exists.` }))
        setBusy(false)
        return
      }

      await addDoc(collection(db, 'coupons'), {
        code,
        discountedPrice: Number(form.discountedPrice),
        usageLeft:       Number(form.usageLimit),
        totalLimit:      Number(form.usageLimit),
        createdAt:       serverTimestamp(),
      })

      setForm({ code: '', discountedPrice: '', usageLimit: '' })
      setFormErr({})
      setAdding(false)
      setAlert({ type: 'success', message: `Coupon "${code}" created successfully!` })
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to create coupon. Please try again.' })
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  /* ── Delete coupon ─── */
  async function handleDelete(docId, code) {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return
    setDeleting(docId)
    try {
      await deleteDoc(doc(db, 'coupons', docId))
      setAlert({ type: 'success', message: `Coupon "${code}" deleted.` })
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete coupon. Try again.' })
    } finally {
      setDeleting(null)
    }
  }

  function cancelAdd() {
    setAdding(false)
    setForm({ code: '', discountedPrice: '', usageLimit: '' })
    setFormErr({})
  }

  const discount =
    Number(form.discountedPrice) > 0 && Number(form.discountedPrice) < BASE_PRICE
      ? BASE_PRICE - Number(form.discountedPrice)
      : null

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-white text-xl">Coupon Management</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Create discount codes for student enrollment.{' '}
            Base price:{' '}
            <span className="text-indigo-400 font-mono font-semibold">
              ₹{BASE_PRICE.toLocaleString('en-IN')}
            </span>
          </p>
        </div>
        {!adding && (
          <motion.button
            onClick={() => setAdding(true)}
            whileHover={{ y: -1, boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary py-2.5 px-4 rounded-xl text-sm
              flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} /> New Coupon
          </motion.button>
        )}
      </div>

      {/* ── Alert banner ── */}
      <AnimatePresence>
        {alert && (
          <Alert
            key={alert.message + Date.now()}
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Create form ── */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1,  height: 'auto' }}
            exit={{    opacity: 0,  height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col gap-4
              border border-indigo-500/20">

              {/* Form heading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15
                    flex items-center justify-center">
                    <Sparkles size={13} className="text-indigo-400" />
                  </div>
                  <p className="font-semibold text-white text-sm">Create New Coupon</p>
                </div>
                <button onClick={cancelAdd}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white
                    hover:bg-white/5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase
                    tracking-widest font-mono">
                    Coupon Code *
                  </label>
                  <div className="input-wrap">
                    <span className="input-icon-left"><Tag size={14} /></span>
                    <input
                      ref={codeRef}
                      type="text"
                      placeholder="LAUNCH50"
                      value={form.code}
                      onChange={set('code')}
                      maxLength={20}
                      onKeyDown={e => e.key === 'Enter' && handleCreate()}
                      className={`form-input form-input-icon-left text-sm
                        font-mono uppercase tracking-widest
                        ${formErr.code ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                  {formErr.code
                    ? <p className="text-xs text-red-400">{formErr.code}</p>
                    : <p className="text-xs text-slate-600">
                        Letters, numbers, _ or - only
                      </p>
                  }
                </div>

                {/* Discounted price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase
                    tracking-widest font-mono">
                    Discounted Price (₹) *
                  </label>
                  <div className="input-wrap">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2
                      font-mono text-slate-400 text-sm pointer-events-none
                      select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      placeholder="999"
                      min="1"
                      max={BASE_PRICE - 1}
                      value={form.discountedPrice}
                      onChange={set('discountedPrice')}
                      className={`form-input text-sm
                        ${formErr.discountedPrice ? 'border-red-500/60' : ''}`}
                      style={{ paddingLeft: 26 }}
                    />
                  </div>
                  {formErr.discountedPrice
                    ? <p className="text-xs text-red-400">{formErr.discountedPrice}</p>
                    : discount
                    ? <p className="text-xs text-green-400 flex items-center gap-1">
                        <TrendingDown size={11} />
                        Saves ₹{discount.toLocaleString('en-IN')}
                      </p>
                    : <p className="text-xs text-slate-600">
                        Must be less than ₹{BASE_PRICE}
                      </p>
                  }
                </div>

                {/* Usage limit */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase
                    tracking-widest font-mono">
                    Usage Limit *
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    min="1"
                    value={form.usageLimit}
                    onChange={set('usageLimit')}
                    className={`form-input text-sm
                      ${formErr.usageLimit ? 'border-red-500/60' : ''}`}
                  />
                  {formErr.usageLimit
                    ? <p className="text-xs text-red-400">{formErr.usageLimit}</p>
                    : <p className="text-xs text-slate-600">
                        Max times this code can be used
                      </p>
                  }
                </div>
              </div>

              {/* Live preview pill */}
              <AnimatePresence>
                {form.code && discount && form.usageLimit && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1,  y: 0 }}
                    exit={{    opacity: 0,  y: -4 }}
                    className="flex flex-wrap items-center gap-3 px-4 py-3
                      rounded-xl bg-indigo-500/6 border border-indigo-500/15"
                  >
                    <span className="font-mono font-bold text-indigo-300
                      bg-indigo-500/15 px-2.5 py-1 rounded-lg text-xs">
                      {form.code}
                    </span>
                    <span className="text-slate-400 text-xs">
                      ₹{Number(form.discountedPrice).toLocaleString('en-IN')}
                      {' · '}saves ₹{discount.toLocaleString('en-IN')}
                      {' · '}{form.usageLimit} uses
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit / cancel */}
              <div className="flex gap-2.5 pt-1">
                <motion.button
                  onClick={handleCreate}
                  disabled={busy}
                  whileHover={!busy ? { y: -1 } : {}}
                  whileTap={{ scale: 0.97 }}
                  className="btn-accent py-2.5 px-5 rounded-xl text-sm
                    flex items-center gap-1.5 disabled:opacity-55"
                >
                  {busy
                    ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
                    : <><Check size={14} /> Create Coupon</>
                  }
                </motion.button>
                <button
                  onClick={cancelAdd}
                  className="glass-sm py-2.5 px-4 rounded-xl text-sm
                    text-slate-400 hover:text-white transition-colors
                    flex items-center gap-1.5"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Coupons table ── */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-indigo-400" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-600">
            <Tag size={30} className="opacity-25" />
            <p className="text-sm">No coupons yet.</p>
            <button
              onClick={() => setAdding(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Create your first coupon →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="data-table" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  {['Code','Original','Discounted','Saves','Usage','Created',''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {coupons.map((c, i) => {
                    const saves = BASE_PRICE - (c.discountedPrice ?? 0)
                    const createdOn = c.createdAt?.toDate
                      ? c.createdAt.toDate().toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : '—'
                    return (
                      <motion.tr
                        key={c.docId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1,  y: 0 }}
                        exit={{    opacity: 0,  x: 24 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td>
                          <span className="font-mono font-semibold text-indigo-300
                            bg-indigo-500/10 px-2.5 py-1 rounded-lg text-xs
                            tracking-wider">
                            {c.code}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-slate-500
                            line-through text-sm">
                            ₹{BASE_PRICE.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono text-white font-semibold">
                            ₹{c.discountedPrice?.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <span className="text-green-400 font-mono text-sm font-semibold">
                            − ₹{saves.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td>
                          <UsageBar used={c.usageLeft} total={c.totalLimit} />
                        </td>
                        <td>
                          <span className="text-slate-500 text-xs">{createdOn}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(c.docId, c.code)}
                            disabled={deleting === c.docId}
                            className="p-2 rounded-lg glass-sm text-slate-500
                              hover:text-red-400 hover:bg-red-500/8 transition-all
                              disabled:opacity-40"
                          >
                            {deleting === c.docId
                              ? <Loader2 size={13} className="animate-spin" />
                              : <Trash2 size={13} />
                            }
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && coupons.length > 0 && (
          <div className="px-5 py-3 border-t border-indigo-500/8
            flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setAdding(true)}
              className="text-xs text-indigo-500 hover:text-indigo-400
                transition-colors flex items-center gap-1"
            >
              <Plus size={11} /> Add another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
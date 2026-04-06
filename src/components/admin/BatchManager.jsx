import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }      from 'framer-motion'
import {
  Plus, CalendarDays, Trash2, Pencil,
  Check, X, Loader2, AlertCircle,
  CheckCircle2, Users, Clock,
} from 'lucide-react'
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../../config/firebase'

const SCHEDULES = [
  'Weekday Morning (9AM–11AM)',
  'Weekday Evening (6PM–8PM)',
  'Weekend Morning (10AM–1PM)',
  'Weekend Evening (3PM–6PM)',
]

function Alert({ type, message, onClose }) {
  const s = {
    success: 'bg-green-500/10 border-green-500/25 text-green-400',
    error:   'bg-red-500/10 border-red-500/25 text-red-400',
  }
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, height: 0 }}
      animate={{ opacity: 1,  y:  0, height: 'auto' }}
      exit={{    opacity: 0,  y: -4, height: 0 }}
      transition={{ duration: 0.22 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl
        border text-sm overflow-hidden ${s[type]}`}
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

function statusBadge(batch) {
  const now   = new Date()
  const start = batch.startDate?.toDate
    ? batch.startDate.toDate() : new Date(batch.startDate)
  const end   = batch.endDate?.toDate
    ? batch.endDate.toDate()
    : batch.endDate ? new Date(batch.endDate) : null

  if (end && now > end) return { label: 'Completed', cls: 'bg-slate-700/40 text-slate-400' }
  if (now >= start)     return { label: 'Ongoing',   cls: 'bg-green-500/10 text-green-400 border border-green-500/20' }
  return                       { label: 'Upcoming',  cls: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' }
}

const EMPTY = { name: '', course: '', schedule: '', startDate: '', endDate: '', capacity: '' }

export default function BatchManager() {
  const [batches,  setBatches]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [busy,     setBusy]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [alert,    setAlert]    = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [formErr,  setFormErr]  = useState({})
  const nameRef = useRef(null)

  useEffect(() => {
    const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q,
      snap => { setBatches(snap.docs.map(d => ({ docId: d.id, ...d.data() }))); setLoading(false) },
      err  => { console.error('[BatchManager]', err); setLoading(false) }
    )
    return unsub
  }, [])

  useEffect(() => { if (adding) setTimeout(() => nameRef.current?.focus(), 60) }, [adding])

  useEffect(() => {
    if (!alert) return
    const t = setTimeout(() => setAlert(null), 4000)
    return () => clearTimeout(t)
  }, [alert])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.name.trim())                            e.name      = 'Batch name is required.'
    if (!form.course.trim())                          e.course    = 'Course is required.'
    if (!form.schedule)                               e.schedule  = 'Select a schedule.'
    if (!form.startDate)                              e.startDate = 'Start date is required.'
    if (!form.capacity || Number(form.capacity) < 1) e.capacity  = 'Enter a valid capacity.'
    return e
  }

  async function handleAdd() {
    const e = validate()
    setFormErr(e)
    if (Object.keys(e).length) return
    setBusy(true)
    try {
      const data = {
        name:      form.name.trim(),
        course:    form.course.trim(),
        schedule:  form.schedule,
        startDate: Timestamp.fromDate(new Date(form.startDate)),
        capacity:  Number(form.capacity),
        createdAt: serverTimestamp(),
      }
      if (form.endDate) data.endDate = Timestamp.fromDate(new Date(form.endDate))
      await addDoc(collection(db, 'batches'), data)
      setForm(EMPTY); setFormErr({}); setAdding(false)
      setAlert({ type: 'success', message: `Batch "${form.name.trim()}" created!` })
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to create batch.' })
      console.error(err)
    } finally { setBusy(false) }
  }

  async function handleRename(docId) {
    const name = editName.trim()
    if (!name) return
    setBusy(true)
    try {
      await updateDoc(doc(db, 'batches', docId), { name })
      setEditId(null)
      setAlert({ type: 'success', message: 'Batch renamed.' })
    } catch {
      setAlert({ type: 'error', message: 'Failed to rename.' })
    } finally { setBusy(false) }
  }

  async function handleDelete(docId, name) {
    if (!confirm(`Delete batch "${name}"?`)) return
    setDeleting(docId)
    try {
      await deleteDoc(doc(db, 'batches', docId))
      setAlert({ type: 'success', message: `Batch "${name}" deleted.` })
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete.' })
    } finally { setDeleting(null) }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-white text-xl">Batch Manager</h3>
          <p className="text-slate-500 text-sm mt-0.5">Create and manage internship batches.</p>
        </div>
        {!adding && (
          <motion.button onClick={() => setAdding(true)}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
            className="btn-primary py-2.5 px-4 rounded-xl text-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus size={15} /> New Batch
          </motion.button>
        )}
      </div>

      {/* Alert */}
      <AnimatePresence>
        {alert && <Alert key={alert.message} type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      </AnimatePresence>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col gap-4 border border-indigo-500/20">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white text-sm">Create New Batch</p>
                <button onClick={() => { setAdding(false); setForm(EMPTY); setFormErr({}) }}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">Batch Name *</label>
                  <input ref={nameRef} type="text" placeholder="Batch 5 — Jan 2026"
                    value={form.name} onChange={set('name')} maxLength={60}
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    className={`form-input text-sm ${formErr.name ? 'border-red-500/60' : ''}`} />
                  {formErr.name && <p className="text-xs text-red-400">{formErr.name}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">Course *</label>
                  <input type="text" placeholder="Full-Stack Development"
                    value={form.course} onChange={set('course')} maxLength={80}
                    className={`form-input text-sm ${formErr.course ? 'border-red-500/60' : ''}`} />
                  {formErr.course && <p className="text-xs text-red-400">{formErr.course}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">Schedule *</label>
                  <select value={form.schedule} onChange={set('schedule')}
                    className={`form-input text-sm cursor-pointer ${formErr.schedule ? 'border-red-500/60' : ''}`}>
                    <option value="">Choose schedule…</option>
                    {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {formErr.schedule && <p className="text-xs text-red-400">{formErr.schedule}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">Capacity *</label>
                  <input type="number" placeholder="30" min="1"
                    value={form.capacity} onChange={set('capacity')}
                    className={`form-input text-sm ${formErr.capacity ? 'border-red-500/60' : ''}`} />
                  {formErr.capacity && <p className="text-xs text-red-400">{formErr.capacity}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">Start Date *</label>
                  <input type="date" min={todayStr} value={form.startDate} onChange={set('startDate')}
                    className={`form-input text-sm ${formErr.startDate ? 'border-red-500/60' : ''}`} />
                  {formErr.startDate && <p className="text-xs text-red-400">{formErr.startDate}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 uppercase tracking-widest font-mono">End Date (optional)</label>
                  <input type="date" min={form.startDate || todayStr}
                    value={form.endDate} onChange={set('endDate')} className="form-input text-sm" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <motion.button onClick={handleAdd} disabled={busy}
                  whileHover={!busy ? { y: -1 } : {}} whileTap={{ scale: 0.97 }}
                  className="btn-accent py-2.5 px-5 rounded-xl text-sm flex items-center gap-1.5 disabled:opacity-55">
                  {busy ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><Check size={14} /> Create Batch</>}
                </motion.button>
                <button onClick={() => { setAdding(false); setForm(EMPTY); setFormErr({}) }}
                  className="glass-sm py-2.5 px-4 rounded-xl text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-indigo-400" />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-600">
            <CalendarDays size={30} className="opacity-25" />
            <p className="text-sm">No batches yet.</p>
            <button onClick={() => setAdding(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Create your first batch →
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {batches.map((b, i) => {
              const status   = statusBadge(b)
              const startStr = b.startDate?.toDate
                ? b.startDate.toDate().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'
              const endStr = b.endDate?.toDate
                ? b.endDate.toDate().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : null

              return (
                <motion.div key={b.docId}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-4 border-b border-indigo-500/8
                    last:border-0 hover:bg-indigo-500/4 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={15} className="text-indigo-400" />
                  </div>

                  {editId === b.docId ? (
                    <div className="flex-1 flex gap-2.5">
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key==='Enter') handleRename(b.docId); if (e.key==='Escape') setEditId(null) }}
                        className="form-input text-sm py-2 flex-1" maxLength={60} autoFocus />
                      <button onClick={() => handleRename(b.docId)} disabled={busy}
                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors">
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="p-2 rounded-lg glass-sm text-slate-500 hover:text-white transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm text-slate-200 font-medium truncate">{b.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Users size={10} /> {b.capacity} seats
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {b.schedule}
                          </span>
                          <span className="text-xs text-slate-600">
                            {startStr}{endStr ? ` → ${endStr}` : ''}
                          </span>
                        </div>
                        <p className="text-xs text-indigo-400/60 mt-0.5">{b.course}</p>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => { setEditId(b.docId); setEditName(b.name) }}
                          className="p-2 rounded-lg glass-sm text-slate-500 hover:text-indigo-400 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDelete(b.docId, b.name)} disabled={deleting === b.docId}
                          className="p-2 rounded-lg glass-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all disabled:opacity-40">
                          {deleting === b.docId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        {!loading && batches.length > 0 && (
          <div className="px-5 py-3 border-t border-indigo-500/8 flex items-center justify-between">
            <p className="text-xs text-slate-600">{batches.length} batch{batches.length !== 1 ? 'es' : ''}</p>
            <button onClick={() => setAdding(true)}
              className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Plus size={11} /> Add another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
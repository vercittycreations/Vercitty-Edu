import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Check, X,
  BookOpen, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react'
import {
  collection, onSnapshot, query, orderBy,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../config/firebase'

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

export default function CourseManager() {
  const [courses,  setCourses]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newErr,   setNewErr]   = useState('')
  const [editId,   setEditId]   = useState(null)
  const [editName, setEditName] = useState('')
  const [editErr,  setEditErr]  = useState('')
  const [busy,     setBusy]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [alert,    setAlert]    = useState(null) // { type, message }

  const addInputRef  = useRef(null)
  const editInputRef = useRef(null)

  /* ── Real-time listener ─── */
  useEffect(() => {
    const q = query(collection(db, 'courses'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      setCourses(snap.docs.map(d => ({ docId: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('[CourseManager]', err)
      setLoading(false)
    })
    return unsub
  }, [])

  /* ── Auto-focus add input ─── */
  useEffect(() => {
    if (adding) setTimeout(() => addInputRef.current?.focus(), 60)
  }, [adding])

  /* ── Auto-focus edit input ─── */
  useEffect(() => {
    if (editId) setTimeout(() => editInputRef.current?.focus(), 60)
  }, [editId])

  /* ── Auto-dismiss alert ─── */
  useEffect(() => {
    if (!alert) return
    const t = setTimeout(() => setAlert(null), 4500)
    return () => clearTimeout(t)
  }, [alert])

  /* ── Add course ─── */
  async function handleAdd() {
    const name = newName.trim()
    if (!name) { setNewErr('Course name is required.'); return }
    if (name.length < 3) { setNewErr('Name must be at least 3 characters.'); return }

    // Local duplicate check (fast, no extra query needed since we have all)
    if (courses.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setNewErr(`"${name}" already exists.`)
      return
    }

    setBusy(true)
    try {
      await addDoc(collection(db, 'courses'), {
        name,
        createdAt: serverTimestamp(),
      })
      setNewName('')
      setNewErr('')
      setAdding(false)
      setAlert({ type: 'success', message: `Course "${name}" added successfully!` })
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to add course. Please try again.' })
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  /* ── Update course ─── */
  async function handleUpdate(docId, originalName) {
    const name = editName.trim()
    if (!name) { setEditErr('Course name is required.'); return }
    if (name === originalName) { setEditId(null); return }

    if (courses.some(c => c.name.toLowerCase() === name.toLowerCase() && c.docId !== docId)) {
      setEditErr(`"${name}" already exists.`)
      return
    }

    setBusy(true)
    try {
      await updateDoc(doc(db, 'courses', docId), { name })
      setEditId(null)
      setEditErr('')
      setAlert({ type: 'success', message: `Course renamed to "${name}".` })
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update course. Please try again.' })
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  /* ── Delete course ─── */
  async function handleDelete(docId, name) {
    if (!confirm(`Delete course "${name}"? Students who enrolled with this course will still have their data.`)) return
    setDeleting(docId)
    try {
      await deleteDoc(doc(db, 'courses', docId))
      setAlert({ type: 'success', message: `Course "${name}" deleted.` })
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete course. Try again.' })
    } finally {
      setDeleting(null)
    }
  }

  function cancelAdd() {
    setAdding(false)
    setNewName('')
    setNewErr('')
  }

  function startEdit(course) {
    setEditId(course.docId)
    setEditName(course.name)
    setEditErr('')
  }

  function cancelEdit() {
    setEditId(null)
    setEditName('')
    setEditErr('')
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-white text-xl">Course Management</h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage courses available in the student enrollment form.
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
            <Plus size={15} /> Add Course
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

      {/* ── Add form ── */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1,  height: 'auto' }}
            exit={{    opacity: 0,  height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="glass rounded-2xl p-5 border border-indigo-500/20">
              <p className="text-sm font-semibold text-white mb-3">
                Add New Course
              </p>
              <div className="flex gap-3">
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="input-wrap">
                    <span className="input-icon-left">
                      <BookOpen size={14} />
                    </span>
                    <input
                      ref={addInputRef}
                      type="text"
                      placeholder="e.g. Flutter Development"
                      value={newName}
                      onChange={e => { setNewName(e.target.value); setNewErr('') }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAdd()
                        if (e.key === 'Escape') cancelAdd()
                      }}
                      maxLength={60}
                      className={`form-input form-input-icon-left text-sm
                        ${newErr ? 'border-red-500/60' : ''}`}
                    />
                  </div>
                  {newErr && (
                    <p className="text-xs text-red-400">{newErr}</p>
                  )}
                </div>
                <button
                  onClick={handleAdd}
                  disabled={busy || !newName.trim()}
                  className="btn-accent py-2.5 px-4 rounded-xl text-sm
                    disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {busy
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Check size={14} />
                  }
                  Save
                </button>
                <button
                  onClick={cancelAdd}
                  className="glass-sm py-2.5 px-3 rounded-xl text-slate-400
                    hover:text-white transition-colors shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Course list ── */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-indigo-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-600">
            <BookOpen size={30} className="opacity-25" />
            <p className="text-sm">No courses yet.</p>
            <button
              onClick={() => setAdding(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Add your first course →
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {courses.map((c, i) => (
              <motion.div
                key={c.docId}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1,  x:   0 }}
                exit={{    opacity: 0,  x:  16 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-5 py-4
                  border-b border-indigo-500/8 last:border-0
                  hover:bg-indigo-500/4 transition-colors group"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10
                  flex items-center justify-center shrink-0">
                  <BookOpen size={14} className="text-indigo-400" />
                </div>

                {/* Inline edit mode */}
                {editId === c.docId ? (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex gap-2.5">
                      <input
                        ref={editInputRef}
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setEditErr('') }}
                        onKeyDown={e => {
                          if (e.key === 'Enter')  handleUpdate(c.docId, c.name)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        maxLength={60}
                        className={`form-input text-sm py-2 flex-1
                          ${editErr ? 'border-red-500/60' : ''}`}
                      />
                      <button
                        onClick={() => handleUpdate(c.docId, c.name)}
                        disabled={busy}
                        className="p-2 rounded-lg bg-green-500/10 text-green-400
                          hover:bg-green-500/20 transition-colors shrink-0"
                      >
                        {busy
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Check size={13} />
                        }
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 rounded-lg glass-sm text-slate-500
                          hover:text-white transition-colors shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    {editErr && (
                      <p className="text-xs text-red-400">{editErr}</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Course name + created date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {c.name}
                      </p>
                      {c.createdAt?.toDate && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          Added{' '}
                          {c.createdAt.toDate().toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Actions — visible on hover */}
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100
                      transition-opacity shrink-0">
                      <button
                        onClick={() => startEdit(c)}
                        className="p-2 rounded-lg glass-sm text-slate-500
                          hover:text-indigo-400 transition-colors"
                        title="Rename"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.docId, c.name)}
                        disabled={deleting === c.docId}
                        className="p-2 rounded-lg glass-sm text-slate-500
                          hover:text-red-400 hover:bg-red-500/8 transition-all
                          disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === c.docId
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Footer count */}
        {!loading && courses.length > 0 && (
          <div className="px-5 py-3 border-t border-indigo-500/8
            flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {courses.length} course{courses.length !== 1 ? 's' : ''}
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
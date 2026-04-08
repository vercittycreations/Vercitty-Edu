import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, MapPin, BookOpen, Calendar, ChevronDown,
} from 'lucide-react'
import { getAllCourses } from '../services/courseService'

const BATCHES = [
  'Batch 1',
  'Batch 2',
  'Batch 3',
  'Batch 4',
]

/* 
  KEY FIX: Field component now uses .input-wrap + .input-icon-left
  pattern from index.css instead of raw Tailwind absolute positioning
  that was causing icon/input overlaps.
*/
function Field({ icon: Icon, label, error, children, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1,  y:  0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex flex-col gap-1.5 min-w-0"
    >
      <label className="flex items-center gap-1.5 text-xs font-semibold
        text-slate-400 uppercase tracking-wider">
        <Icon size={11} className="text-indigo-400 flex-shrink-0" />
        {label}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y:  0 }}
          className="text-xs text-red-400"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

export default function StudentForm({ onNext, defaultValues }) {
  const [form, setForm] = useState({
    fullName: '', email: '', mobile: '',
    address: '', course: '', batch: '',
    ...defaultValues,
  })
  const [errors,  setErrors]  = useState({})
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllCourses()
      .then(setCourses)
      .catch(() => setCourses([]))
  }, [])

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  function validate() {
    const e = {}
    if (!form.fullName.trim())               e.fullName = 'Full name is required.'
    if (!form.email.match(/^\S+@\S+\.\S+$/)) e.email   = 'Enter a valid email.'
    if (!form.mobile.match(/^[6-9]\d{9}$/)) e.mobile   = 'Enter valid 10-digit number.'
    if (!form.address.trim())                e.address  = 'Address is required.'
    if (!form.course)                        e.course   = 'Please select a course.'
    if (!form.batch)                         e.batch    = 'Please select a batch.'
    return e
  }

  async function handleNext() {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 300))
    setLoading(false)
    onNext(form)
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Row 1: Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={User} label="Full Name" error={errors.fullName} index={0}>
          <div className="input-wrap">
            <span className="input-icon-left"><User size={15} /></span>
            <input
              className={`form-input form-input-icon-left ${errors.fullName ? 'border-red-500/60' : ''}`}
              placeholder="Rahul Sharma"
              value={form.fullName}
              onChange={set('fullName')}
            />
          </div>
        </Field>

        <Field icon={Mail} label="Email Address" error={errors.email} index={1}>
          <div className="input-wrap">
            <span className="input-icon-left"><Mail size={15} /></span>
            <input
              type="email"
              className={`form-input form-input-icon-left ${errors.email ? 'border-red-500/60' : ''}`}
              placeholder="rahul@example.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>
        </Field>
      </div>

      {/* Row 2: Mobile + Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={Phone} label="Mobile Number" error={errors.mobile} index={2}>
          <div className="input-wrap">
            {/* +91 prefix — fixed width so it doesn't overlap */}
            <span className="input-icon-left text-slate-500 font-mono text-sm
              !w-auto px-0" style={{ left: '14px', width: 'auto' }}>+91</span>
            <input
              type="tel"
              maxLength={10}
              className={`form-input ${errors.mobile ? 'border-red-500/60' : ''}`}
              style={{ paddingLeft: '46px' }}
              placeholder="9876543210"
              value={form.mobile}
              onChange={set('mobile')}
            />
          </div>
        </Field>

        <Field icon={MapPin} label="Address" error={errors.address} index={3}>
          <div className="input-wrap">
            <span className="input-icon-left"><MapPin size={15} /></span>
            <input
              className={`form-input form-input-icon-left ${errors.address ? 'border-red-500/60' : ''}`}
              placeholder="City, State, PIN"
              value={form.address}
              onChange={set('address')}
            />
          </div>
        </Field>
      </div>

      {/* Row 3: Course + Batch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={BookOpen} label="Select Course" error={errors.course} index={4}>
          <div className="input-wrap">
            <select
              className={`form-input pr-10 cursor-pointer ${errors.course ? 'border-red-500/60' : ''}`}
              value={form.course}
              onChange={set('course')}
            >
              <option value="">Choose a course…</option>
              {courses.length > 0
                ? courses.map(c => (
                    <option key={c.docId} value={c.name}>{c.name}</option>
                  ))
                : <>
                    <option value="Full-Stack Development">Python Development</option>
                    <option value="UI/UX Design">Web Development with AI</option>
                    <option value="Data Science">Graphics Design</option>
                    <option value="Cyber Security">Communication Skills</option>
                  </>
              }
            </select>
            <span className="input-icon-right pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>
        </Field>

        <Field icon={Calendar} label="Select Batch" error={errors.batch} index={5}>
          <div className="input-wrap">
            <select
              className={`form-input pr-10 cursor-pointer ${errors.batch ? 'border-red-500/60' : ''}`}
              value={form.batch}
              onChange={set('batch')}
            >
              <option value="">Choose a batch…</option>
              {BATCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <span className="input-icon-right pointer-events-none">
              <ChevronDown size={14} />
            </span>
          </div>
        </Field>
      </div>

      {/* Submit */}
      <motion.button
        onClick={handleNext}
        disabled={loading}
        whileHover={{ y: -2, boxShadow: '0 0 28px rgba(99,102,241,0.45)' }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary w-full py-3.5 rounded-xl text-sm mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Saving…
          </span>
        ) : 'Continue to Coupon & Payment →'}
      </motion.button>
    </div>
  )
}
/**
 * AdminManage.jsx
 * ──────────────────────────────────────────────
 * Standalone admin management page for Coupons and Courses.
 * Accessible via /admin/manage from the AdminDashboard sidebar,
 * or directly as a standalone route.
 *
 * Features:
 *  - Tab switcher: Coupons | Courses
 *  - Real-time Firestore (onSnapshot)
 *  - Duplicate prevention
 *  - Success / error alerts with auto-dismiss
 *  - Fully responsive, matches app design system
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, BookOpen, ArrowLeft, Zap } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'
import CouponManager  from '../components/admin/CouponManager'
import CourseManager  from '../components/admin/CourseManager'

const TABS = [
  {
    id:    'coupons',
    label: 'Coupons',
    icon:  Tag,
    desc:  'Create & manage discount codes',
  },
  {
    id:    'courses',
    label: 'Courses',
    icon:  BookOpen,
    desc:  'Manage available internship tracks',
  },
]

export default function AdminManage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('coupons')

  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg grid-overlay">

        {/* ── Top bar ── */}
        <header className="sticky top-0 z-30 glass border-b border-indigo-500/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14
            flex items-center gap-3">

            {/* Back */}
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg text-slate-400 hover:text-white
                hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <ArrowLeft size={16} />
            </button>

            {/* Logo mark */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br
              from-indigo-500 to-indigo-700 flex items-center justify-center
              flex-shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Zap size={13} fill="white" color="white" />
            </div>

            <div className="min-w-0">
              <h1 className="font-bold text-white text-sm truncate">
                Admin Management
              </h1>
              <p className="text-slate-500 text-xs hidden sm:block">
                Coupons & Courses
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">

          {/* ── Page heading ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1,  y:  0 }}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <span className="badge mb-3 inline-flex">Admin Panel</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Manage Your Program
            </h2>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg">
              Create coupon codes for discounts and manage the list of
              courses available on the enrollment form.
            </p>
          </motion.div>

          {/* ── Tab switcher ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y:  0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 mb-8 max-w-md"
          >
            {TABS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex flex-col items-start gap-1.5 px-4 py-4
                  rounded-2xl border text-left transition-all duration-200
                  ${tab === id
                    ? 'bg-indigo-500/12 border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.12)]'
                    : 'glass-sm border-slate-700/40 hover:border-indigo-500/20'
                  }`}
              >
                {/* Active dot */}
                {tab === id && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute top-3 right-3 w-1.5 h-1.5
                      rounded-full bg-indigo-400"
                  />
                )}

                <div className={`w-8 h-8 rounded-xl flex items-center
                  justify-center transition-colors
                  ${tab === id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'bg-slate-700/40 text-slate-500'}`}
                >
                  <Icon size={15} />
                </div>

                <div>
                  <p className={`font-semibold text-sm transition-colors
                    ${tab === id ? 'text-white' : 'text-slate-400'}`}>
                    {label}
                  </p>
                  <p className="text-slate-600 text-xs leading-tight">{desc}</p>
                </div>
              </button>
            ))}
          </motion.div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1,  y:  0 }}
              exit={{    opacity: 0,  y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === 'coupons' && <CouponManager />}
              {tab === 'courses' && <CourseManager />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </PageTransition>
  )
}
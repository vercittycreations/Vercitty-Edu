import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Users, Tag, BookOpen, LogOut,
  Menu, X, ClipboardCheck, Settings2,
} from 'lucide-react'
import PageTransition   from '../components/ui/PageTransition'
import StudentTable     from '../components/admin/StudentTable'
import CourseManager    from '../components/admin/CourseManager'
import CouponManager    from '../components/admin/CouponManager'
import AttendanceButton from '../components/admin/AttendanceButton'

const TABS = [
  { id: 'students',   label: 'Students',   icon: Users          },
  { id: 'courses',    label: 'Courses',    icon: BookOpen       },
  { id: 'coupons',    label: 'Coupons',    icon: Tag            },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
]

export default function AdminDashboard() {
  const navigate   = useNavigate()
  const [tab,      setTab]      = useState('students')
  const [sideOpen, setSideOpen] = useState(false)

  function logout() {
    sessionStorage.removeItem('vc_admin')
    navigate('/admin-login', { replace: true })
  }

  function switchTab(id) {
    setTab(id)
    setSideOpen(false)
  }

  return (
    <PageTransition>
      <div className="admin-layout bg-bg">

        {/* ── Mobile overlay ── */}
        <AnimatePresence>
          {sideOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              onClick={() => setSideOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <motion.aside
          initial={false}
          animate={{ x: sideOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="
            fixed top-0 left-0 bottom-0 z-40 w-60
            glass border-r border-indigo-500/10
            flex flex-col
            lg:relative lg:translate-x-0 lg:flex
          "
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-4 h-14
            border-b border-indigo-500/10 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br
                from-indigo-500 to-indigo-700 flex items-center justify-center
                flex-shrink-0 shadow-[0_0_14px_rgba(99,102,241,0.4)]">
                <Zap size={13} fill="white" color="white" />
              </div>
              <span className="font-bold text-sm truncate">
                Vault<span className="text-indigo-400">Craft</span>
              </span>
            </div>
            <span className="text-2xs text-slate-600 font-mono flex-shrink-0">
              Admin
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
            <p className="text-2xs text-slate-600 uppercase tracking-widest
              font-mono px-3 py-2 flex-shrink-0">
              Management
            </p>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => switchTab(id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium text-left transition-all duration-200
                  min-w-0
                  ${tab === id
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}
                `}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="truncate">{label}</span>
                {tab === id && (
                  <motion.div
                    layoutId="tab-dot"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"
                  />
                )}
              </button>
            ))}

            {/* Quick link to full management page */}
            <div className="mt-3 pt-3 border-t border-indigo-500/8">
              <p className="text-2xs text-slate-600 uppercase tracking-widest
                font-mono px-3 pb-2 flex-shrink-0">
                Quick Access
              </p>
              <Link
                to="/admin/manage"
                onClick={() => setSideOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  text-sm font-medium text-left transition-all duration-200
                  text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/8"
              >
                <Settings2 size={15} className="flex-shrink-0" />
                <span className="truncate">Manage Page</span>
              </Link>
            </div>
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-indigo-500/10 flex-shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-sm text-slate-500 hover:text-red-400
                hover:bg-red-500/8 transition-all duration-200"
            >
              <LogOut size={15} className="flex-shrink-0" />
              Sign Out
            </button>
          </div>
        </motion.aside>

        {/* ── Main content ── */}
        <div className="admin-main">

          {/* Topbar */}
          <header className="h-14 glass border-b border-indigo-500/10
            flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSideOpen(v => !v)}
                className="lg:hidden p-2 rounded-lg text-slate-400
                  hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
              >
                {sideOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="min-w-0">
                <h1 className="font-bold text-white text-base truncate">
                  {TABS.find(t => t.id === tab)?.label}
                </h1>
                <p className="text-slate-500 text-xs hidden sm:block truncate">
                  VaultCraft Admin Dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Manage shortcut */}
              <Link
                to="/admin/manage"
                className="hidden sm:flex items-center gap-1.5 glass-sm
                  rounded-xl px-3 py-1.5 text-xs text-slate-400
                  hover:text-indigo-300 transition-colors"
              >
                <Settings2 size={12} />
                Manage
              </Link>

              <div className="hidden sm:flex items-center gap-2 glass-sm
                rounded-xl px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0
                  shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <span className="text-xs text-slate-400 whitespace-nowrap">Admin</span>
              </div>
            </div>
          </header>

          {/* Tab content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="max-w-6xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1,  y:  0 }}
                  exit={{    opacity: 0,  y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {tab === 'students'   && <StudentTable     />}
                  {tab === 'courses'    && <CourseManager    />}
                  {tab === 'coupons'    && <CouponManager    />}
                  {tab === 'attendance' && (
                    <div className="max-w-2xl flex flex-col gap-5">
                      <div>
                        <h3 className="font-bold text-white text-lg">
                          Attendance
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                          Use Google Form to track daily attendance.
                        </p>
                      </div>
                      <AttendanceButton />
                      <div className="glass rounded-2xl p-5">
                        <p className="text-sm font-semibold text-white mb-3">
                          How to use
                        </p>
                        <ol className="flex flex-col gap-3">
                          {[
                            'Open the Google Form link.',
                            'Share with students before each session.',
                            'Students fill Student ID + name.',
                            'Responses auto-save in Google Sheets.',
                            'Edit the form URL in AttendanceButton.jsx.',
                          ].map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-400">
                              <span className="font-mono text-indigo-400/60 flex-shrink-0">
                                {String(i+1).padStart(2,'0')}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </PageTransition>
  )
}
import { useState, useEffect }         from 'react'
import { useNavigate, Link }            from 'react-router-dom'
import { motion, AnimatePresence }      from 'framer-motion'
import { signOut }                      from 'firebase/auth'
import { auth }                         from '../config/firebase'
import {
  Zap, Users, Tag, BookOpen, LogOut,
  Menu, X, ClipboardCheck, Settings2,
  TrendingUp, DollarSign, Award, Bell,
  BarChart2, Calendar,
} from 'lucide-react'
import PageTransition    from '../components/ui/PageTransition'
import StudentTable      from '../components/admin/StudentTable'
import CourseManager     from '../components/admin/CourseManager'
import CouponManager     from '../components/admin/CouponManager'
import AttendanceButton  from '../components/admin/AttendanceButton'
import BatchManager      from '../components/admin/BatchManager'
import { getAllStudents } from '../services/studentService'

/* ─────────────────────────────────────────────────────────
   TAB CONFIG
───────────────────────────────────────────────────────── */
const TABS = [
  { id: 'students',   label: 'Students',   icon: Users          },
  { id: 'courses',    label: 'Courses',    icon: BookOpen       },
  { id: 'coupons',    label: 'Coupons',    icon: Tag            },
  { id: 'batches',    label: 'Batches',    icon: Calendar       },
  { id: 'attendance', label: 'Attendance', icon: ClipboardCheck },
]

/* ─────────────────────────────────────────────────────────
   SKELETON PULSE  — "boneyard" style shimmer blocks
   Usage: <Skeleton w="w-24" h="h-4" />
───────────────────────────────────────────────────────── */
function Skeleton({ w = 'w-full', h = 'h-4', rounded = 'rounded-lg', className = '' }) {
  return (
    <div className={`${w} ${h} ${rounded} ${className} relative overflow-hidden bg-indigo-500/8`}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/12 to-transparent skew-x-12"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   STAT CARD SKELETON
───────────────────────────────────────────────────────── */
function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <Skeleton w="w-24" h="h-3" />
          <Skeleton w="w-16" h="h-7" />
          <Skeleton w="w-28" h="h-3" />
        </div>
        <Skeleton w="w-10" h="h-10" rounded="rounded-xl" className="flex-shrink-0" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, icon: Icon, gradient, glowColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      className="relative glass rounded-2xl p-5 overflow-hidden cursor-default"
      style={{ boxShadow: `0 0 24px ${glowColor}22` }}
    >
      <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full opacity-15 blur-2xl"
        style={{ background: gradient }} />
      <div className="absolute top-0 left-6 right-6 h-px opacity-60"
        style={{ background: gradient }} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-1.5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-[0.1em]">{label}</p>
          <p className="font-bold text-[1.6rem] leading-none text-white truncate">{value}</p>
          {sub && <p className="text-slate-500 text-xs">{sub}</p>}
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${glowColor}22`, border: `1px solid ${glowColor}44` }}>
          <Icon size={19} style={{ color: glowColor }} />
        </div>
      </div>
    </motion.div>
  )
}


/* ─────────────────────────────────────────────────────────
   SIDEBAR SKELETON  (shown while stats load)
───────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full">
      {/* stat cards skeleton row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
      </div>
      {/* table skeleton */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-4">
        {/* toolbar */}
        <div className="flex gap-3">
          <Skeleton w="w-full" h="h-10" rounded="rounded-xl" />
          <Skeleton w="w-20" h="h-10" rounded="rounded-xl" />
          <Skeleton w="w-20" h="h-10" rounded="rounded-xl" />
        </div>
        {/* table rows */}
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="flex gap-4 items-center py-1">
            <Skeleton w="w-28" h="h-3.5" className={`opacity-${100 - i*10}`} />
            <Skeleton w="w-32" h="h-3.5" className={`opacity-${90 - i*10}`} />
            <Skeleton w="w-40" h="h-3.5" className="hidden sm:block" />
            <Skeleton w="w-24" h="h-3.5" className="hidden md:block" />
            <Skeleton w="w-16" h="h-6" rounded="rounded-full" className="ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate    = useNavigate()
  const [tab,       setTab]       = useState('students')
  const [sideOpen,  setSideOpen]  = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats,     setStats]     = useState({
    total: 0, paid: 0, revenue: 0, courses: 0,
  })

  /* Load dashboard stats */
  useEffect(() => {
    setStatsLoading(true)
    getAllStudents()
      .then(students => {
        const paid    = students.filter(s => s.paymentStatus === 'paid')
        const revenue = paid.reduce((a, s) => a + (s.amountPaid || 0), 0)
        const courses = [...new Set(students.map(s => s.course))].length
        setStats({ total: students.length, paid: paid.length, revenue, courses })
      })
      .catch(console.error)
      .finally(() => setStatsLoading(false))
  }, [])

  /* Logout — supports both Firebase auth AND sessionStorage fallback */
  async function logout() {
    try { if (auth?.currentUser) await signOut(auth) } catch (e) { console.error(e) }
    finally { sessionStorage.removeItem('vc_admin'); navigate('/admin-login', { replace: true }) }
  }

  function switchTab(id) {
    setTab(id)
    setSideOpen(false)
  }

  const adminEmail = auth?.currentUser?.email || 'admin@educrek.in'
  const adminInitial = adminEmail.charAt(0).toUpperCase()

  return (
    <PageTransition>
      {/*
        ─── CENTERING FIX ───────────────────────────────────
        admin-layout = display:flex; height:100vh; width:100%
        The sidebar is fixed-width (240px), flex-shrink:0
        The main area takes flex:1, min-width:0 (critical!)
        This ensures the content is always properly centered
        inside its own available width, NOT the full viewport.
        ─────────────────────────────────────────────────────
      */}
      <div className="admin-layout bg-bg overflow-hidden">

        {/* ── Mobile overlay ───────────────────────────────── */}
         <AnimatePresence>
          {sideOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSideOpen(false)}
              className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" />
          )}
        </AnimatePresence>

        {/* ── SIDEBAR ──────────────────────────────────────── */}
        <motion.aside
          initial={false}
          animate={{ x: sideOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed top-0 left-0 bottom-0 z-40 w-60 flex flex-col border-r border-white/5 bg-[#080f1e] lg:relative lg:translate-x-0 lg:flex"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-indigo-600/10 blur-[70px]" />
          </div>

          {/* Sidebar ambient glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full
              bg-indigo-600/10 blur-[70px]" />
            <div className="absolute bottom-0 left-0 right-0 h-32
              bg-gradient-to-t from-indigo-950/20 to-transparent" />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-3 px-5 h-16 border-b border-white/5 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', boxShadow: '0 0 18px rgba(99,102,241,0.5)' }}>
              <Zap size={15} fill="white" color="white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[15px] leading-none tracking-tight">
                Vault<span className="text-indigo-400">Craft</span>
              </p>
              <p className="text-[10px] text-slate-600 mt-0.5 font-mono truncate">Admin Console</p>
            </div>
          </div>

           {/* Nav */}
          <nav className="relative flex-1 px-3 pt-5 pb-2 flex flex-col gap-0.5 overflow-y-auto">
            <p className="text-[10px] text-slate-700 uppercase tracking-[0.14em] font-bold px-3 mb-3">Navigation</p>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => switchTab(id)}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 min-w-0
                  ${tab === id ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/4'}`}
              >
                {tab === id && (
                  <motion.div layoutId="sidebar-active-bg"
                    className="absolute inset-0 rounded-xl bg-indigo-500/15 border border-indigo-500/25"
                    transition={{ type: 'spring', stiffness: 350, damping: 35 }} />
                )}
                <Icon size={15} className="flex-shrink-0 relative z-10" />
                <span className="truncate relative z-10 flex-1">{label}</span>
                {tab === id && (
                  <motion.div layoutId="tab-dot"
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0 relative z-10 shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
                )}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-slate-700 uppercase tracking-[0.14em] font-bold px-3 mb-3">Quick Access</p>
              <Link to="/admin/manage" onClick={() => setSideOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/8">
                <Settings2 size={15} className="flex-shrink-0" />
                <span className="truncate">Manage Page</span>
              </Link>
              <Link to="/student-lookup" onClick={() => setSideOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 text-slate-500 hover:text-slate-300 hover:bg-white/4">
                <Users size={15} className="flex-shrink-0" />
                <span className="truncate">Student Lookup</span>
              </Link>
              <Link to="/" onClick={() => setSideOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 text-slate-500 hover:text-slate-300 hover:bg-white/4">
                <BarChart2 size={15} className="flex-shrink-0" />
                <span className="truncate">View Site</span>
              </Link>
            </div>
          </nav>

          <div className="relative px-3 py-4 border-t border-white/5 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/4 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-indigo-300"
                style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)' }}>
                {adminInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-white font-medium truncate leading-none">{adminEmail}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0 shadow-[0_0_5px_rgba(34,197,94,0.7)]" />
                  <p className="text-[10px] text-slate-500">Online</p>
                </div>
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group">
              <LogOut size={14} className="flex-shrink-0 group-hover:translate-x-0.5 transition-transform duration-200" />
              Sign Out
            </button>
          </div>
        </motion.aside>

        {/* ── MAIN CONTENT ─────────────────────────────────── */}
        <div className="admin-main">

         {/* Top bar */}
          <header className="h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 sticky top-0 z-20 border-b border-white/5"
            style={{ background: 'rgba(8,15,30,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => setSideOpen(v => !v)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/6 transition-colors flex-shrink-0"
                aria-label="Toggle sidebar">
                <motion.div animate={{ rotate: sideOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                  {sideOpen ? <X size={18} /> : <Menu size={18} />}
                </motion.div>
              </button>
              <div className="min-w-0">
                <motion.h1 key={tab} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-bold text-white text-base leading-none truncate">
                  {TABS.find(t => t.id === tab)?.label}
                </motion.h1>
                <p className="text-slate-600 text-xs mt-0.5 hidden sm:block">EduCrek Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to="/admin/manage"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/8 transition-colors border border-transparent hover:border-indigo-500/20">
                <Settings2 size={12} className="flex-shrink-0" />
                Manage
              </Link>
              <button className="relative p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/6 transition-colors" aria-label="Notifications">
                <Bell size={16} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400"
                  style={{ boxShadow: '0 0 6px rgba(99,102,241,0.9)' }} />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/6">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"
                  style={{ boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Admin</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <div className="max-w-6xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div key={tab}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >

                  {/* Students */}
                  {tab === 'students' && (
                    <div className="flex flex-col gap-6">
                      {statsLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          {[0,1,2,3].map(i => <StatCardSkeleton key={i} />)}
                        </div>
                      ) : (
                        <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                          <StatCard label="Total Students" value={stats.total} sub="All enrollments"
                            icon={Users} gradient="linear-gradient(135deg,#6366F1,#4F46E5)" glowColor="#6366F1" />
                          <StatCard label="Paid" value={stats.paid} sub="Confirmed payments"
                            icon={Award} gradient="linear-gradient(135deg,#22C55E,#16A34A)" glowColor="#22C55E" />
                          <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} sub="Total collected"
                            icon={DollarSign} gradient="linear-gradient(135deg,#F59E0B,#D97706)" glowColor="#F59E0B" />
                          <StatCard label="Active Courses" value={stats.courses} sub="Unique courses"
                            icon={TrendingUp} gradient="linear-gradient(135deg,#8B5CF6,#7C3AED)" glowColor="#8B5CF6" />
                        </motion.div>
                      )}
                      <StudentTable />
                    </div>
                  )}

                  {tab === 'courses'    && <CourseManager />}
                  {tab === 'coupons'    && <CouponManager />}
                  {tab === 'batches'    && <BatchManager />}


                 {/* Attendance */}
                  {tab === 'attendance' && (
                    <div className="max-w-2xl flex flex-col gap-5">
                      <div>
                        <h3 className="font-bold text-white text-xl mb-1">Attendance</h3>
                        <p className="text-slate-500 text-sm">Track student attendance using Google Form.</p>
                      </div>
                      <AttendanceButton />
                      <div className="glass rounded-2xl p-6">
                        <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <span className="w-1 h-4 rounded-full bg-indigo-500 flex-shrink-0" />
                          How to use
                        </p>
                        <ol className="flex flex-col gap-3.5">
                          {[
                            'Open the Google Form link.',
                            'Share with students before each session.',
                            'Students fill their Student ID + name.',
                            'Responses auto-save to Google Sheets.',
                            'Edit the form URL in AttendanceButton.jsx.',
                          ].map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-400 items-start">
                              <span className="font-mono text-xs flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                                {i + 1}
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
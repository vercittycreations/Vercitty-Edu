import { useState }        from 'react'
import { useNavigate }     from 'react-router-dom'
import { motion }          from 'framer-motion'
import { Zap, Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react'
import PageTransition      from '../components/ui/PageTransition'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'admin123'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form,    setForm]    = useState({ username: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [shake,   setShake]   = useState(false)

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))

    if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
      sessionStorage.setItem('vc_admin', 'true')
      navigate('/admin', { replace: true })
    } else {
      setError('Invalid username or password.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    setLoading(false)
  }

  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg grid-overlay flex items-center
        justify-center px-5">

        {/* Ambient blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full
            bg-indigo-600/12 blur-[100px]" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full
            bg-violet-600/10 blur-[100px]" />
        </div>

        <motion.div
          animate={shake ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1,  y:   0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br
                from-indigo-500 to-indigo-700 flex items-center justify-center
                shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-4"
            >
              <Zap size={26} fill="white" color="white" />
            </motion.div>
            <h1 className="font-display font-extrabold text-2xl">
              Vault<span className="text-indigo-400">Craft</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Admin Portal</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1,  y:  0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22,1,0.36,1] }}
            className="glass rounded-3xl p-7"
          >
            <h2 className="font-display font-bold text-lg text-white mb-1">
              Welcome back
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Sign in to manage your internship program.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400
                  uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <User size={11} className="text-indigo-400" /> Username
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2
                    -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="admin"
                    value={form.username}
                    onChange={set('username')}
                    className="form-input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400
                  uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Lock size={11} className="text-indigo-400" /> Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2
                    -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={set('password')}
                    className="form-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                      text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1,  y:  0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                    bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2, boxShadow: '0 0 30px rgba(99,102,241,0.45)' }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 rounded-xl mt-1
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    <Lock size={15} /> Sign In
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <p className="text-center text-slate-600 text-xs mt-5">
            VaultCraft Admin · Restricted Access
          </p>
        </motion.div>
      </div>
    </PageTransition>
  )
}
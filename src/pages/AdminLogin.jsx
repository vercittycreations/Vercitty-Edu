import { useState }                        from 'react'
import { useNavigate }                     from 'react-router-dom'
import { motion }                          from 'framer-motion'
import { signInWithEmailAndPassword }      from 'firebase/auth'
import { auth }                            from '../config/firebase'
import {
  Zap, Eye, EyeOff, Mail,
  Lock, AlertCircle, ShieldCheck,
} from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'

/* Map Firebase error codes → readable messages */
function getAuthError(code) {
  const map = {
    'auth/user-not-found':        'No admin account found with this email.',
    'auth/wrong-password':        'Incorrect password. Please try again.',
    'auth/invalid-email':         'Invalid email address format.',
    'auth/too-many-requests':     'Too many failed attempts. Try again later.',
    'auth/invalid-credential':    'Invalid email or password.',
    'auth/network-request-failed':'Network error. Check your connection.',
  }
  return map[code] || 'Login failed. Please try again.'
}

export default function AdminLogin() {
  const navigate          = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(getAuthError(err.code))
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg grid-overlay flex items-center
        justify-center px-4 py-8">

        {/* Ambient blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full
            bg-indigo-600/12 blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full
            bg-violet-600/10 blur-[120px]" />
        </div>

        <motion.div
          animate={shake ? { x: [-10,10,-8,8,-4,4,0] } : {}}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
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
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500
                to-indigo-700 flex items-center justify-center
                shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-4 flex-shrink-0"
            >
              <Zap size={26} fill="white" color="white" />
            </motion.div>
            <h1 className="font-bold text-2xl">
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
            <h2 className="font-bold text-lg text-white mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Sign in with your admin credentials to manage the internship program.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold
                  text-slate-400 uppercase tracking-wider">
                  <Mail size={11} className="text-indigo-400 flex-shrink-0" />
                  Email Address
                </label>
                {/* 
                  KEY FIX: input-wrap + input-icon-left classes from index.css
                  Prevents icon from overlapping the input text 
                */}
                <div className="input-wrap">
                  <span className="input-icon-left">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="admin@vaultcraft.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    disabled={loading}
                    className="form-input form-input-icon-left
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold
                  text-slate-400 uppercase tracking-wider">
                  <Lock size={11} className="text-indigo-400 flex-shrink-0" />
                  Password
                </label>
                <div className="input-wrap">
                  <span className="input-icon-left">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    className="form-input form-input-icon-left form-input-icon-right
                      disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="input-icon-right clickable"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1,  y:  0, height: 'auto' }}
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                    bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                >
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { y: -2,
                  boxShadow: '0 0 28px rgba(99,102,241,0.45)' } : {}}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-3.5 rounded-xl mt-1
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 flex-shrink-0"
                      fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock size={15} className="flex-shrink-0" />
                    Sign In to Admin
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Security note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2
              text-slate-600 text-xs mt-5"
          >
            <ShieldCheck size={12} className="text-green-500/60 flex-shrink-0" />
            Secured by Firebase Authentication
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
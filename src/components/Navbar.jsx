import { useState, useEffect } from 'react'
import { Link, useLocation }   from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Zap } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home',      href: '/'      },
  { label: 'Apply Now', href: '/apply' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled ? 'glass shadow-lg shadow-black/30' : 'bg-transparent'}
        `}
      >
        {/* 
          KEY FIX:
          - overflow-hidden on nav prevents any child from causing horizontal scroll
          - max-w + mx-auto + px-4 for proper responsive padding
          - items-center + gap prevents squishing
        */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16
          flex items-center justify-between gap-4 overflow-hidden">

          {/* Logo — shrink-0 prevents logo from collapsing */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500
                to-indigo-700 flex items-center justify-center flex-shrink-0
                shadow-[0_0_16px_rgba(99,102,241,0.5)]"
            >
              <Zap size={15} fill="white" color="white" />
            </motion.div>
            <span className="font-bold text-[17px] tracking-tight whitespace-nowrap">
              Vault<span className="text-indigo-400">Craft</span>
            </span>
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                to={l.href}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  whitespace-nowrap
                  ${pathname === l.href
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                {l.label}
              </Link>
            ))}

            {/* 
              KEY FIX on "Enroll Now" button:
              - Removed heavy padding from old btn-primary
              - Clean, premium pill-style button
              - flex-shrink-0 + whitespace-nowrap = never collapses
            */}
            <Link to="/apply" className="ml-2 flex-shrink-0">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-1.5 px-4 py-2
                  bg-indigo-600 hover:bg-indigo-500
                  text-white text-sm font-semibold rounded-lg
                  transition-colors duration-200 whitespace-nowrap
                  shadow-[0_0_16px_rgba(99,102,241,0.3)]
                  hover:shadow-[0_0_22px_rgba(99,102,241,0.5)]"
              >
                Enroll Now
              </motion.span>
            </Link>
          </div>

          {/* Mobile hamburger — flex-shrink-0 so it never disappears */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            className="md:hidden flex-shrink-0 p-2 rounded-lg
              text-slate-400 hover:text-white hover:bg-white/5
              transition-colors"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1,  y:  0 }}
            exit={{    opacity: 0,  y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden
              glass border-t border-indigo-500/10"
          >
            <div className="flex flex-col p-3 gap-1.5">
              {NAV_LINKS.map(l => (
                <Link
                  key={l.href}
                  to={l.href}
                  className={`
                    px-4 py-3 rounded-xl text-sm font-medium
                    transition-all
                    ${pathname === l.href
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'}
                  `}
                >
                  {l.label}
                </Link>
              ))}
              <Link to="/apply" className="mt-1">
                <span className="flex items-center justify-center gap-2
                  w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500
                  text-white text-sm font-semibold rounded-xl
                  transition-colors duration-200">
                  Enroll Now
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
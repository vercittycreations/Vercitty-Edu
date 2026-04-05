import { motion } from 'framer-motion'

export default function GlowButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
}) {

  const base = `
    group relative inline-flex items-center justify-center gap-2 font-display font-semibold
    rounded-xl cursor-pointer select-none overflow-hidden
    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
  `

  const sizes = {
    sm: 'px-5 py-2.5 text-sm',
    md: 'px-7 py-3.5 text-[15px]',
    lg: 'px-9 py-4 text-base',
  }

  const variants_ = {
    primary: `
      bg-gradient-to-br from-indigo-500 to-indigo-600 text-white
      hover:-translate-y-0.5
      hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]
      active:translate-y-0
    `,
    accent: `
      bg-gradient-to-br from-green-500 to-green-600 text-white
      hover:-translate-y-0.5
      hover:shadow-[0_0_12px_rgba(34,197,94,0.25)]
      active:translate-y-0
    `,
    outline: `
      bg-transparent text-indigo-400 border border-indigo-500/30
      hover:bg-indigo-500/10 hover:border-indigo-400
      hover:-translate-y-0.5
    `,
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${sizes[size]} ${variants_[variant]} ${className}`}
    >

      {/* Subtle shimmer */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0
        group-hover:opacity-100 transition duration-500
        bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />

      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Processing…
        </>
      ) : children}
    </motion.button>
  )
}
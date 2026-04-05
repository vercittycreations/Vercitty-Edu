import { motion } from 'framer-motion'

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow  = false,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      className={`
        glass rounded-2xl p-6
        ${glow ? 'hover:shadow-[0_0_40px_rgba(99,102,241,0.2)]' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
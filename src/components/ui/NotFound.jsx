import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen mesh-bg grid-overlay flex items-center
      justify-center px-5">

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2
          w-96 h-96 rounded-full bg-indigo-500/6 blur-[120px]" />
      </div>

      <div className="text-center max-w-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1,  scale: 1   }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* 404 */}
          <p className="font-display font-extrabold text-[120px] leading-none
            gradient-text opacity-20 select-none">
            404
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1,  y:  0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="-mt-8"
        >
          <h1 className="font-display font-bold text-2xl text-white mb-3">
            Page not found
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="btn-outline py-3 px-5 rounded-xl text-sm
                flex items-center gap-2"
            >
              <ArrowLeft size={15} /> Go Back
            </button>
            <Link to="/">
              <button className="btn-primary py-3 px-5 rounded-xl text-sm
                flex items-center gap-2">
                <Home size={15} /> Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
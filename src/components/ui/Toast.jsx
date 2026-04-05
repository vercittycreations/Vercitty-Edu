import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

const ToastCtx = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertCircle,
  info:    Info,
}

const COLORS = {
  success: 'border-green-500/25  bg-green-500/8  text-green-400',
  error:   'border-red-500/25    bg-red-500/8    text-red-400',
  warning: 'border-yellow-500/25 bg-yellow-500/8 text-yellow-400',
  info:    'border-indigo-500/25 bg-indigo-500/8 text-indigo-400',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => {
      setToasts(p => p.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = (id) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col
        gap-2.5 items-end max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const Icon = ICONS[type]
            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y:  0, scale: 1   }}
                exit={{    opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`
                  flex items-start gap-3 px-4 py-3.5 rounded-2xl
                  glass border shadow-lg shadow-black/30
                  w-full ${COLORS[type]}
                `}
              >
                <Icon size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm text-slate-200 flex-1 leading-snug">
                  {message}
                </p>
                <button
                  onClick={() => dismiss(id)}
                  className="shrink-0 text-slate-500 hover:text-slate-300
                    transition-colors mt-0.5"
                >
                  <X size={13} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
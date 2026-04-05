import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tag, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { validateCoupon } from '../services/couponService'
import { BASE_PRICE } from '../config/razorpay'

export default function CouponSection({ onCouponApplied, appliedCoupon }) {
  const [code,    setCode]    = useState(appliedCoupon?.code    || '')
  const [status,  setStatus]  = useState(
    appliedCoupon ? 'success' : 'idle'
  )  // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState(
    appliedCoupon ? `Coupon applied! You save ₹${BASE_PRICE - appliedCoupon.discountedPrice}` : ''
  )
  const [couponData, setCouponData] = useState(appliedCoupon || null)

  async function handleApply() {
    if (!code.trim()) return
    setStatus('loading')
    setMessage('')

    try {
      const res = await validateCoupon(code, BASE_PRICE)
      if (res.valid) {
        setStatus('success')
        setCouponData(res.couponData)
        setMessage(`Coupon applied! You save ₹${res.discount}`)
        onCouponApplied({
          code:            code.trim().toUpperCase(),
          discountedPrice: res.discountedPrice,
          discount:        res.discount,
          couponData:      res.couponData,
        })
      } else {
        setStatus('error')
        setMessage(res.message)
        onCouponApplied(null)
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      onCouponApplied(null)
    }
  }

  function handleRemove() {
    setCode('')
    setStatus('idle')
    setMessage('')
    setCouponData(null)
    onCouponApplied(null)
  }

  const finalPrice = couponData ? couponData.discountedPrice : BASE_PRICE
  const discount   = couponData ? BASE_PRICE - couponData.discountedPrice : 0

  return (
    <div className="flex flex-col gap-5">

      {/* Coupon input row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2
            text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Enter coupon code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            disabled={status === 'success'}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            className={`
              form-input pl-10 font-mono tracking-widest uppercase
              disabled:opacity-50 disabled:cursor-not-allowed
              ${status === 'success' ? 'border-green-500/50' : ''}
              ${status === 'error'   ? 'border-red-500/50'   : ''}
            `}
          />
        </div>

        {status === 'success' ? (
          <motion.button
            onClick={handleRemove}
            whileTap={{ scale: 0.96 }}
            className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20
              text-red-400 text-sm font-semibold hover:bg-red-500/20
              transition-colors whitespace-nowrap"
          >
            Remove
          </motion.button>
        ) : (
          <motion.button
            onClick={handleApply}
            disabled={!code.trim() || status === 'loading'}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="btn-primary px-6 py-3 text-sm rounded-xl
              disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : 'Apply'}
          </motion.button>
        )}
      </div>

      {/* Status message */}
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={status}
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1,  y:  0, height: 'auto' }}
            exit={{    opacity: 0,  y: -6, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`
              flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm
              ${status === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10  border border-red-500/20  text-red-400'}
            `}
          >
            {status === 'success'
              ? <CheckCircle2 size={15} />
              : <XCircle size={15} />
            }
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price breakdown */}
      <div className="glass-sm rounded-xl p-4 flex flex-col gap-2.5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Base Price</span>
          <span className={`font-mono ${discount > 0 ? 'line-through text-slate-600' : 'text-white'}`}>
            ₹{BASE_PRICE.toLocaleString('en-IN')}
          </span>
        </div>

        <AnimatePresence>
          {discount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{    opacity: 0, height: 0 }}
              className="flex justify-between items-center text-sm"
            >
              <span className="text-green-400 flex items-center gap-1.5">
                <Tag size={12} />
                Coupon Discount
              </span>
              <span className="text-green-400 font-mono font-semibold">
                − ₹{discount.toLocaleString('en-IN')}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-px bg-indigo-500/10 my-0.5" />

        <div className="flex justify-between items-center">
          <span className="font-semibold text-white text-sm">Total Payable</span>
          <motion.span
            key={finalPrice}
            initial={{ scale: 1.15, color: '#4ADE80' }}
            animate={{ scale: 1,    color: '#FFFFFF' }}
            transition={{ duration: 0.35 }}
            className="font-display font-bold text-2xl"
          >
            ₹{finalPrice.toLocaleString('en-IN')}
          </motion.span>
        </div>
      </div>
    </div>
  )
}
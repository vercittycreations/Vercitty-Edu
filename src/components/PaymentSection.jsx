import { useState } from 'react'
import { motion }   from 'framer-motion'
import {
  ShieldCheck, CreditCard, Smartphone,
  AlertCircle, CheckCircle2, Zap,
} from 'lucide-react'
import { openRazorpay }   from '../services/paymentService'
import { saveStudent }    from '../services/studentService'
import { decrementCoupon } from '../services/couponService'
import { BASE_PRICE }     from '../config/razorpay'

const COURSE_IMAGES = {
  'Full-Stack Development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
  'UI/UX Design':           'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
  'Data Science':           'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
  'Cyber Security':         'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80',
}
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80'

const payMethods = [
  { icon: CreditCard,  label: 'Cards'    },
  { icon: Smartphone,  label: 'UPI'      },
  { icon: Zap,         label: 'Wallets'  },
]

export default function PaymentSection({ formData, coupon, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const finalPrice = coupon ? coupon.discountedPrice : BASE_PRICE
  const amountP    = finalPrice * 100   // paise

  const courseImage =
    COURSE_IMAGES[formData?.course] || FALLBACK_IMAGE

  async function handlePay() {
    setError('')
    setLoading(true)

    try {
      const response = await openRazorpay({
        amount:  amountP,
        prefill: {
          name:  formData.fullName,
          email: formData.email,
          phone: `91${formData.mobile}`,
        },
        notes: {
          course: formData.course,
          batch:  formData.batch,
        },
      })

      // Payment success → save to Firestore
      const studentRecord = await saveStudent({
        ...formData,
        couponCode: coupon?.code   || null,
        amountPaid: finalPrice,
        paymentId:  response.razorpay_payment_id,
        orderId:    response.razorpay_order_id || `order_${Date.now()}`,
      })

      // Decrement coupon if used
      if (coupon?.couponData?.docId) {
        await decrementCoupon(coupon.couponData.docId)
      }

      // Optional: email placeholder
      sendEnrollmentEmail(studentRecord)

      onSuccess(studentRecord)

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Course preview card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1,  y:  0 }}
        transition={{ duration: 0.4 }}
        className="glass rounded-2xl overflow-hidden"
      >
        {/* Course image */}
        <div className="relative h-36 overflow-hidden">
          <img
            src={courseImage}
            alt={formData?.course}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = FALLBACK_IMAGE }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="badge text-xs">{formData?.course}</span>
          </div>
        </div>

        {/* Order summary */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display font-bold text-white text-base">
                {formData?.course}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">{formData?.batch}</p>
            </div>
          </div>

          <div className="h-px bg-indigo-500/10" />

          {/* Summary rows */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Student</span>
              <span className="text-slate-200">{formData?.fullName}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Email</span>
              <span className="text-slate-200 text-xs">{formData?.email}</span>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-400">
                <span>Coupon ({coupon.code})</span>
                <span>− ₹{BASE_PRICE - coupon.discountedPrice}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-white pt-1
              border-t border-indigo-500/10">
              <span>Total</span>
              <span className="font-display text-lg">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3">
        {payMethods.map(({ icon: Icon, label }) => (
          <div key={label} className="glass-sm rounded-xl py-2.5 px-3
            flex flex-col items-center gap-1.5">
            <Icon size={16} className="text-indigo-400" />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1,  y:  0 }}
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl
            bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </motion.div>
      )}

      {/* Pay button */}
      <motion.button
        onClick={handlePay}
        disabled={loading}
        whileHover={!loading ? {
          y: -2,
          boxShadow: '0 0 40px rgba(99,102,241,0.55)',
        } : {}}
        whileTap={{ scale: 0.98 }}
        className="relative btn-primary w-full py-4 rounded-xl text-base
          disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
      >
        {/* Shimmer sweep */}
        <span className="absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          group-hover:translate-x-full transition-transform duration-700
          pointer-events-none" />

        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Processing Payment…
          </>
        ) : (
          <>
            <ShieldCheck size={18} />
            Pay ₹{finalPrice.toLocaleString('en-IN')} Securely
          </>
        )}
      </motion.button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2
        text-slate-600 text-xs">
        <ShieldCheck size={12} className="text-green-500/60" />
        Secured by Razorpay · 256-bit SSL Encryption
      </div>
    </div>
  )
}

/* ── Email placeholder ────────────────────── */
function sendEnrollmentEmail(studentRecord) {
  // TODO: Connect to your email service (EmailJS / Firebase Functions / Nodemailer)
  console.log('[EMAIL] Enrollment confirmation would be sent to:', studentRecord.email)
  console.log('[EMAIL] Student ID:', studentRecord.studentId)
}
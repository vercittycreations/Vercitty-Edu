import { useState }       from 'react'
import { motion }         from 'framer-motion'
import {
  ShieldCheck, CreditCard, Smartphone,
  AlertCircle, Zap, Mail, CheckCircle2,
  UserX,
} from 'lucide-react'
import { openRazorpay }            from '../services/paymentService'
import { saveStudent,
         checkDuplicateEnrollment,
         validatePaymentAmount }    from '../services/studentService'
import { decrementCoupon }         from '../services/couponService'
import { sendEnrollmentEmail }     from '../services/emailService'
import { trackPaymentSuccess }     from '../services/analyticsService'
import { BASE_PRICE }              from '../config/razorpay'

const COURSE_IMAGES = {
  'Full-Stack Development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
  'UI/UX Design':           'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80',
  'Data Science':           'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
  'Cyber Security':         'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80',
}
const FALLBACK = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80'

export default function PaymentSection({ formData, coupon, onSuccess }) {
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [emailStatus,  setEmailStatus]  = useState('idle')
  const [dupWarning,   setDupWarning]   = useState(null) // existing student record if dup found

  const finalPrice = coupon ? coupon.discountedPrice : BASE_PRICE
  const amountP    = finalPrice * 100

  async function handlePay() {
    setError('')
    setDupWarning(null)
    setLoading(true)

    try {
      // ── 1. Duplicate enrollment check ──
      const existing = await checkDuplicateEnrollment(formData.email)
      if (existing) {
        setDupWarning(existing)
        setLoading(false)
        return
      }

      // ── 2. Amount validation (client-side guard) ──
      const amountCheck = validatePaymentAmount(finalPrice, coupon, BASE_PRICE)
      if (!amountCheck.valid) {
        setError(amountCheck.message)
        setLoading(false)
        return
      }

      // ── 3. Open Razorpay (also validates amount internally) ──
      const response = await openRazorpay({
        amount:  amountP,
        coupon:  coupon,
        prefill: {
          name:  formData.fullName,
          email: formData.email,
          phone: `91${formData.mobile}`,
        },
        notes: { course: formData.course, batch: formData.batch },
      })

      // ── 4. Save to Firestore (sanitization happens inside saveStudent) ──
      const studentRecord = await saveStudent({
        ...formData,
        couponCode: coupon?.code   || null,
        amountPaid: finalPrice,
        paymentId:  response.razorpay_payment_id,
        orderId:    response.razorpay_order_id || `order_${Date.now()}`,
      })

      // ── 5. Decrement coupon usage ──
      if (coupon?.couponData?.docId) {
        await decrementCoupon(coupon.couponData.docId)
      }

      // ── 6. Analytics ──
      trackPaymentSuccess({
        student_id: studentRecord.studentId,
        course:     studentRecord.course,
        amount:     finalPrice,
      })

      // ── 7. Confirmation email ──
      setEmailStatus('sending')
      const emailResult = await sendEnrollmentEmail(studentRecord)
      setEmailStatus(emailResult.success ? 'sent' : 'failed')

      // ── 8. Navigate to success ──
      onSuccess(studentRecord)

    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const courseImage = COURSE_IMAGES[formData?.course] || FALLBACK

  return (
    <div className="flex flex-col gap-5">

      {/* Course card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1,  y:  0 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="relative h-32 overflow-hidden">
          <img src={courseImage} alt={formData?.course}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = FALLBACK }} />
          <div className="absolute inset-0 bg-gradient-to-t
            from-[#1E293B] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4">
            <span className="badge text-xs">{formData?.course}</span>
          </div>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div>
            <p className="font-bold text-white text-sm">{formData?.course}</p>
            <p className="text-slate-500 text-xs mt-0.5">{formData?.batch}</p>
          </div>
          <div className="h-px bg-indigo-500/10" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Student</span>
              <span className="text-slate-200 truncate ml-2 max-w-[180px]">
                {formData?.fullName}
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Email</span>
              <span className="text-slate-200 text-xs truncate ml-2 max-w-[180px]">
                {formData?.email}
              </span>
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
              <span className="font-bold text-base">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pay methods */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { icon: CreditCard, label: 'Cards'   },
          { icon: Smartphone, label: 'UPI'     },
          { icon: Zap,        label: 'Wallets' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="glass-sm rounded-xl py-2.5 px-3
            flex flex-col items-center gap-1.5">
            <Icon size={15} className="text-indigo-400 flex-shrink-0" />
            <span className="text-xs text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Duplicate enrollment warning ── */}
      {dupWarning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1,  y:  0 }}
          className="flex flex-col gap-2 px-4 py-3.5 rounded-xl
            bg-yellow-500/10 border border-yellow-500/20"
        >
          <div className="flex items-start gap-2.5 text-yellow-400">
            <UserX size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Already enrolled!</p>
              <p className="text-xs text-yellow-400/70 mt-0.5">
                This email is already registered as{' '}
                <span className="font-mono font-semibold">
                  {dupWarning.studentId}
                </span>{' '}
                in {dupWarning.course}.
              </p>
              <p className="text-xs text-yellow-400/70 mt-1">
                Contact us at hello@vaultcraft.in if you think this is a mistake.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Email status */}
      {emailStatus === 'sending' && (
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <svg className="animate-spin h-3.5 w-3.5 flex-shrink-0" fill="none"
            viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Sending confirmation email…
        </div>
      )}
      {emailStatus === 'sent' && (
        <div className="flex items-center gap-2 text-green-400 text-xs">
          <CheckCircle2 size={13} className="flex-shrink-0" />
          Confirmation email sent to {formData?.email}
        </div>
      )}
      {emailStatus === 'failed' && (
        <div className="flex items-center gap-2 text-yellow-400 text-xs">
          <Mail size={13} className="flex-shrink-0" />
          Email could not be sent (payment still successful)
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1,  y:  0 }}
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl
            bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {error}
        </motion.div>
      )}

      {/* Pay button — disabled if duplicate found */}
      <motion.button
        onClick={handlePay}
        disabled={loading || !!dupWarning}
        whileHover={!loading && !dupWarning ? {
          y: -2, boxShadow: '0 0 36px rgba(99,102,241,0.5)'
        } : {}}
        whileTap={{ scale: 0.98 }}
        className="relative btn-primary w-full py-4 rounded-xl text-sm
          disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden group"
      >
        <span className="absolute inset-0 -translate-x-full
          bg-gradient-to-r from-transparent via-white/10 to-transparent
          group-hover:translate-x-full transition-transform duration-700
          pointer-events-none" />
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 flex-shrink-0"
              fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Processing…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="flex-shrink-0" />
            Pay ₹{finalPrice.toLocaleString('en-IN')} Securely
          </span>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-2
        text-slate-600 text-xs">
        <ShieldCheck size={12} className="text-green-500/50 flex-shrink-0" />
        Secured by Razorpay · 256-bit SSL
      </div>
    </div>
  )
}
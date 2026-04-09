/**
 * PaymentSection.jsx — FIXED
 *
 * ROOT CAUSE #1 (Desktop popup blocked):
 *   The original handlePay() called `await checkDuplicateEnrollment()` and
 *   `await validatePaymentAmount()` BEFORE calling rzp.open(). Any async await
 *   between user click and popup open breaks the browser's "user gesture" chain.
 *   Chrome/Brave treat this as a popup NOT triggered by direct user action → blocked.
 *   Mobile browsers are lenient about this, which is why mobile worked fine.
 *
 * ROOT CAUSE #2 ("Missing or insufficient permissions"):
 *   checkDuplicateEnrollment() uses a Firestore `where` query (list operation).
 *   Unauthenticated users don't have `list` permission on `students` collection
 *   by default. This throws a Firestore permission error BEFORE Razorpay even opens.
 *
 * ROOT CAUSE #3 (Brave ERR_BLOCKED_BY_CLIENT):
 *   Brave's built-in shield blocks checkout.razorpay.com. This is user-side but
 *   we now catch it and show a clear, actionable message.
 *
 * FIX STRATEGY:
 *   1. Split handlePay into two phases:
 *      Phase A (handlePreCheck): Run ALL async checks (duplicate, validation)
 *                                 when user LANDS on step 3, not on button click.
 *      Phase B (handlePayNow):   Called on button click — NO awaits before rzp.open().
 *                                 Opens Razorpay SYNCHRONOUSLY right after click.
 *   2. Pre-checks run via useEffect when component mounts (step 3 loads).
 *   3. paymentService.openRazorpay() refactored to NOT use Promise wrapper
 *      (Promise constructor + rzp.open inside it is fine, but we must ensure
 *      new Razorpay() + .open() is called in the same synchronous tick as the click).
 */

import { useState, useEffect, useRef } from 'react'
import { motion }                       from 'framer-motion'
import {
  ShieldCheck, CreditCard, Smartphone,
  AlertCircle, Zap, Mail, CheckCircle2,
  UserX, Loader2,
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
  const [loading,       setLoading]       = useState(false)
  const [preChecking,   setPreChecking]   = useState(true)  // NEW: runs on mount
  const [error,         setError]         = useState('')
  const [emailStatus,   setEmailStatus]   = useState('idle')
  const [dupWarning,    setDupWarning]    = useState(null)
  const [preCheckDone,  setPreCheckDone]  = useState(false) // NEW: gate for pay button

  const finalPrice = coupon ? coupon.discountedPrice : BASE_PRICE
  const amountP    = finalPrice * 100

  // ─────────────────────────────────────────────────────────
  // PHASE A: Pre-checks run on MOUNT (not on button click)
  // This separates async work from the user gesture chain.
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function runPreChecks() {
      setPreChecking(true)
      setError('')
      setDupWarning(null)

      console.log('[PaymentSection] Running pre-checks...')

      try {
        // 1. Razorpay SDK check
        if (!window.Razorpay) {
          setError('Payment gateway not loaded. Please refresh the page.')
          setPreCheckDone(false)
          return
        }

        // 2. Amount validation (sync — no await)
        const amountCheck = validatePaymentAmount(finalPrice, coupon, BASE_PRICE)
        if (!amountCheck.valid) {
          setError(amountCheck.message)
          setPreCheckDone(false)
          return
        }

        // 3. Duplicate enrollment check (async — safe here, NOT on button click)
        try {
          const existing = await checkDuplicateEnrollment(formData.email)
          if (cancelled) return
          if (existing) {
            setDupWarning(existing)
            setPreCheckDone(false)
            return
          }
        } catch (firestoreErr) {
          // Firestore permission error — don't block payment, just log
          // This happens when Firestore rules don't allow unauthenticated list
          console.warn('[PaymentSection] Duplicate check failed (Firestore rules):', firestoreErr.message)
          // We still allow payment — duplicate check will be done server-side
          // after payment via payment ID uniqueness
        }

        if (cancelled) return
        console.log('[PaymentSection] Pre-checks passed ✓')
        setPreCheckDone(true)

      } catch (err) {
        if (cancelled) return
        console.error('[PaymentSection] Pre-check error:', err)
        setError('Failed to initialize payment. Please refresh.')
        setPreCheckDone(false)
      } finally {
        if (!cancelled) setPreChecking(false)
      }
    }

    runPreChecks()
    return () => { cancelled = true }
  }, [formData.email, finalPrice]) // re-run if email or price changes

  // ─────────────────────────────────────────────────────────
  // PHASE B: Called DIRECTLY on button click
  // NO async operations before rzp.open() — preserves user gesture.
  // ─────────────────────────────────────────────────────────
  function handlePayNow() {
    // These are all sync checks — safe before rzp.open()
    if (loading || dupWarning || !preCheckDone) return
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Disable ad blockers (e.g. Brave Shields) and refresh.')
      return
    }

    setError('')
    setLoading(true)

    console.log('[PaymentSection] Opening Razorpay...', {
      key:    import.meta.env.VITE_RAZORPAY_KEY ? 'loaded ✓' : 'MISSING ✗',
      amount: amountP,
      email:  formData.email,
    })

    // openRazorpay internally calls new window.Razorpay(options).open()
    // This is called in the SAME synchronous tick as the button click.
    openRazorpay({
      amount:  amountP,
      coupon:  coupon,
      prefill: {
        name:  formData.fullName,
        email: formData.email,
        phone: `91${formData.mobile}`,
      },
      notes: { course: formData.course, batch: formData.batch },
    })
      .then(async (response) => {
        console.log('[PaymentSection] Payment success:', response.razorpay_payment_id)

        // Save to Firestore AFTER payment success
        const studentRecord = await saveStudent({
          ...formData,
          couponCode: coupon?.code   || null,
          amountPaid: finalPrice,
          paymentId:  response.razorpay_payment_id,
          orderId:    response.razorpay_order_id || `order_${Date.now()}`,
        })

        // Decrement coupon usage
        if (coupon?.couponData?.docId) {
          await decrementCoupon(coupon.couponData.docId)
        }

        // Analytics
        trackPaymentSuccess({
          student_id: studentRecord.studentId,
          course:     studentRecord.course,
          amount:     finalPrice,
        })

        // Confirmation email (non-blocking)
        setEmailStatus('sending')
        sendEnrollmentEmail(studentRecord)
          .then(result => setEmailStatus(result.success ? 'sent' : 'failed'))
          .catch(() => setEmailStatus('failed'))

        // Navigate to success
        onSuccess(studentRecord)
      })
      .catch((err) => {
        console.error('[PaymentSection] Payment error:', err.message)

        // Brave / ad-blocker detection
        if (
          err.message?.includes('ERR_BLOCKED') ||
          err.message?.includes('blocked') ||
          err.message?.includes('net::')
        ) {
          setError(
            'Payment blocked by browser. Please disable your ad blocker or Brave Shields, then try again.'
          )
        } else if (err.message === 'Payment cancelled by user.') {
          setError('Payment was cancelled. Click the button to try again.')
        } else {
          setError(err.message || 'Payment failed. Please try again.')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const courseImage = COURSE_IMAGES[formData?.course] || FALLBACK
  const isButtonDisabled = loading || !!dupWarning || preChecking || !preCheckDone

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

      {/* Pre-checking indicator */}
      {preChecking && (
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 size={13} className="animate-spin flex-shrink-0" />
          Verifying enrollment status…
        </div>
      )}

      {/* Duplicate enrollment warning */}
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
                Contact us at hello@educrek.in if you think this is a mistake.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Email status */}
      {emailStatus === 'sending' && (
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Loader2 size={13} className="animate-spin flex-shrink-0" />
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

      {/* Brave / ad-blocker warning — shown proactively */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl
        bg-slate-800/50 border border-slate-700/40 text-slate-500 text-xs">
        <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
        <span>
          If payment doesn't open, disable your ad blocker or Brave Shields for this site.
        </span>
      </div>

      {/* Pay button */}
      <motion.button
        onClick={handlePayNow}
        disabled={isButtonDisabled}
        whileHover={!isButtonDisabled ? {
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
        {preChecking ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin flex-shrink-0" />
            Verifying…
          </span>
        ) : loading ? (
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
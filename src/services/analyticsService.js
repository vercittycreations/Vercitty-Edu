import { logEvent }            from 'firebase/analytics'
import { getAnalyticsInstance } from '../config/firebase'

const isProduction = window.location.hostname !== 'localhost'

function log(eventName, params = {}) {
  if (!isProduction) {
    console.log(`[Analytics DEV] ${eventName}`, params)
    return
  }
  const analytics = getAnalyticsInstance()
  if (!analytics) return
  try {
    logEvent(analytics, eventName, params)
  } catch (e) {
    console.warn('[Analytics] logEvent failed:', e)
  }
}

// ─── Track page views ────────────────────────────────
export function trackPageView(pageName, pageUrl) {
  log('page_view', {
    page_title:    pageName,
    page_location: pageUrl || window.location.href,
    page_path:     window.location.pathname,
  })
}

// ─── Payment success ─────────────────────────────────
export function trackPaymentSuccess({ student_id, course, amount }) {
  log('purchase', {
    transaction_id: student_id,
    value:          amount,
    currency:       'INR',
    items: [{ item_name: course, price: amount, quantity: 1 }],
  })
  // also log custom event
  log('payment_success', { course, amount, student_id })
}

// ─── Coupon applied ──────────────────────────────────
export function trackCouponApplied({ code, discount, course }) {
  log('coupon_applied', { coupon_code: code, discount_amount: discount, course })
}

// ─── Form submitted ──────────────────────────────────
export function trackFormSubmitted({ course, batch }) {
  log('form_submit', { course, batch, form_name: 'enrollment_form' })
}

// ─── Enrollment started ──────────────────────────────
export function trackEnrollmentStarted() {
  log('begin_checkout', { currency: 'INR' })
}
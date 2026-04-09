/**
 * paymentService.js — FIXED
 *
 * KEY RULE: new window.Razorpay(options).open() MUST be called
 * in the same synchronous tick as the user click event.
 *
 * The Promise wrapper here is fine because the Promise constructor
 * callback (executor) runs SYNCHRONOUSLY — rzp.open() is called
 * before any await. This preserves the user gesture chain.
 *
 * What was wrong before: Nothing in this file was broken.
 * The problem was in PaymentSection.jsx calling `await` before
 * calling openRazorpay(). Now that PaymentSection calls this
 * function directly in the click handler (no preceding awaits),
 * this file works correctly.
 */

import { RAZORPAY_KEY, RAZORPAY_CONFIG, BASE_PRICE } from '../config/razorpay'

/**
 * Validate that the amount in paise matches the expected price.
 * SYNC function — safe to call before rzp.open()
 */
export function validateAmount(amountInPaise, coupon) {
  const expectedPrice = coupon ? coupon.discountedPrice : BASE_PRICE
  const expectedPaise = expectedPrice * 100

  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw new Error('Invalid payment amount.')
  }
  if (amountInPaise !== expectedPaise) {
    throw new Error(
      `Amount mismatch: expected ₹${expectedPrice} (${expectedPaise} paise), got ${amountInPaise} paise.`
    )
  }
  return expectedPrice
}

/**
 * Opens Razorpay checkout modal.
 *
 * IMPORTANT: This function must be called DIRECTLY in a click handler,
 * with NO preceding async/await calls. The Promise executor runs
 * synchronously, so rzp.open() is called in the same tick as the click.
 *
 * @param {number} amount - Amount in paise (e.g. 149900 for ₹1499)
 * @param {object} prefill - { name, email, phone }
 * @param {object} notes - Extra notes
 * @param {object|null} coupon - Coupon object for amount validation
 * @returns {Promise} Resolves with Razorpay response on success
 */
export function openRazorpay({ amount, prefill, notes = {}, coupon = null }) {
  // DEBUG: Log what we're sending to Razorpay
  console.log('[openRazorpay] Initializing with:', {
    key:    RAZORPAY_KEY ? `${RAZORPAY_KEY.slice(0, 8)}...` : 'MISSING ✗',
    amount: amount,
    amountInRupees: amount / 100,
    currency: RAZORPAY_CONFIG.currency,
    name: prefill?.name,
    email: prefill?.email,
  })

  // Sync validation — throws immediately if wrong (no await)
  validateAmount(amount, coupon)

  return new Promise((resolve, reject) => {
    // Safety check — should never happen if index.html loads the script
    if (!window.Razorpay) {
      reject(new Error(
        'Razorpay SDK not loaded. Check your internet connection or disable ad blockers.'
      ))
      return
    }

    const options = {
      key:         RAZORPAY_KEY,
      amount:      amount,           // in paise
      currency:    RAZORPAY_CONFIG.currency,
      name:        RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image:       RAZORPAY_CONFIG.image,
      theme:       RAZORPAY_CONFIG.theme,

      // NOTE: We do NOT pass order_id here because we have no backend.
      // Frontend-only integration is valid for simple payment collection.
      // Razorpay allows this — payment_id is generated and returned in handler.
      // For production with refunds/webhooks, add backend order creation.

      prefill: {
        name:    prefill?.name    || '',
        email:   prefill?.email   || '',
        contact: prefill?.phone   || '',
      },
      notes,

      handler: (response) => {
        // Called on successful payment
        console.log('[openRazorpay] Payment successful:', {
          payment_id: response.razorpay_payment_id,
          order_id:   response.razorpay_order_id   || 'none (frontend-only mode)',
          signature:  response.razorpay_signature  || 'none (frontend-only mode)',
        })
        resolve(response)
      },

      modal: {
        ondismiss: () => {
          console.log('[openRazorpay] Modal dismissed by user.')
          reject(new Error('Payment cancelled by user.'))
        },
        // Prevent modal from closing on backdrop click accidentally
        escape:            true,
        backdropclose:     false,
        animation:         true,
      },
    }

    let rzp
    try {
      rzp = new window.Razorpay(options)
    } catch (err) {
      console.error('[openRazorpay] Failed to create Razorpay instance:', err)
      reject(new Error('Failed to initialize payment gateway. Please refresh and try again.'))
      return
    }

    rzp.on('payment.failed', (resp) => {
      console.error('[openRazorpay] payment.failed event:', resp.error)
      reject(new Error(
        resp.error?.description ||
        resp.error?.reason ||
        'Payment failed. Please try a different payment method.'
      ))
    })

    // ── THIS IS THE CRITICAL LINE ──
    // Must be called synchronously (no await before this in the call chain)
    rzp.open()
    console.log('[openRazorpay] rzp.open() called ✓')
  })
}
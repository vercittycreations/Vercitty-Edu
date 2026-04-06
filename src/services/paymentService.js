import { RAZORPAY_KEY, RAZORPAY_CONFIG, BASE_PRICE } from '../config/razorpay'

/**
 * Validate that the amount in paise matches the expected price.
 * Call this BEFORE opening Razorpay.
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
 * amount → in paise (e.g. 149900 for ₹1499)
 *
 * Returns a Promise that resolves with payment response on success,
 * or rejects on failure / user close.
 */
export function openRazorpay({ amount, prefill, notes = {}, coupon = null }) {
  // ── Amount validation before opening modal ──
  validateAmount(amount, coupon)

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Check internet connection.'))
      return
    }

    const options = {
      key:         RAZORPAY_KEY,
      amount:      amount,
      currency:    RAZORPAY_CONFIG.currency,
      name:        RAZORPAY_CONFIG.name,
      description: RAZORPAY_CONFIG.description,
      image:       RAZORPAY_CONFIG.image,
      theme:       RAZORPAY_CONFIG.theme,
      prefill: {
        name:    prefill?.name  || '',
        email:   prefill?.email || '',
        contact: prefill?.phone || '',
      },
      notes,
      handler: (response) => {
        resolve(response)
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user.'))
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (resp) => {
      reject(new Error(resp.error?.description || 'Payment failed.'))
    })
    rzp.open()
  })
}
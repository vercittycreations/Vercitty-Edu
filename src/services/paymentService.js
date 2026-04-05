import { RAZORPAY_KEY, RAZORPAY_CONFIG } from '../config/razorpay'

/**
 * Opens Razorpay checkout modal.
 * amount → in paise (e.g. 149900 for ₹1499)
 *
 * Returns a Promise that resolves with payment response on success,
 * or rejects on failure / user close.
 */
export function openRazorpay({ amount, prefill, notes = {} }) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Razorpay SDK not loaded. Check internet connection.'))
      return
    }

    const options = {
      key:         RAZORPAY_KEY,
      amount:      amount,         // in paise
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
        // response = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
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
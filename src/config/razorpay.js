export const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY

export const RAZORPAY_CONFIG = {
  currency: 'INR',
  name:     'EduCrek',
  description: 'Internship Program Enrollment',
  image:    '/favicon.svg',   // shown in Razorpay modal
  theme: {
    color: '#6366F1',
  },
}

// Base price in paise (₹1499 = 149900 paise)
export const BASE_PRICE     = 1499
export const BASE_PRICE_P   = BASE_PRICE * 100   // paise for Razorpay
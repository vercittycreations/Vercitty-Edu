import {
  collection, query, where, getDocs,
  runTransaction, doc,
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Validate coupon code.
 * Returns { valid, discountedPrice, couponData } or { valid: false, message }
 */
export async function validateCoupon(code, basePrice) {
  if (!code || !code.trim()) {
    return { valid: false, message: 'Please enter a coupon code.' }
  }

  const upper = code.trim().toUpperCase()
  const q     = query(
    collection(db, 'coupons'),
    where('code', '==', upper)
  )
  const snap  = await getDocs(q)

  if (snap.empty) {
    return { valid: false, message: 'Invalid coupon code.' }
  }

  const couponDoc  = snap.docs[0]
  const couponData = { docId: couponDoc.id, ...couponDoc.data() }

  if (couponData.usageLeft <= 0) {
    return { valid: false, message: 'This coupon has been fully used.' }
  }

  return {
    valid:           true,
    discountedPrice: couponData.discountedPrice,
    discount:        basePrice - couponData.discountedPrice,
    couponData,
  }
}

/**
 * Decrement coupon usage by 1 (called after payment success)
 */
export async function decrementCoupon(couponDocId) {
  const ref = doc(db, 'coupons', couponDocId)
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists()) return
    const current = snap.data().usageLeft || 0
    if (current > 0) {
      tx.update(ref, { usageLeft: current - 1 })
    }
  })
}

/**
 * Create a new coupon (admin)
 */
export async function createCoupon({ code, discountedPrice, usageLimit }) {
  const { addDoc } = await import('firebase/firestore')
  return addDoc(collection(db, 'coupons'), {
    code:           code.trim().toUpperCase(),
    discountedPrice: Number(discountedPrice),
    usageLeft:      Number(usageLimit),
    totalLimit:     Number(usageLimit),
    createdAt:      new Date(),
  })
}

/**
 * Delete a coupon (admin)
 */
export async function deleteCoupon(docId) {
  const { deleteDoc } = await import('firebase/firestore')
  return deleteDoc(doc(db, 'coupons', docId))
}

/**
 * Get all coupons (admin)
 */
export async function getAllCoupons() {
  const snap = await getDocs(collection(db, 'coupons'))
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}
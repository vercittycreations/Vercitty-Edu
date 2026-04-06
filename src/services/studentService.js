import {
  collection, doc, getDocs,
  addDoc, serverTimestamp, runTransaction,
  query, where, orderBy,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COUNTER_DOC = 'meta/studentCounter'

// ── Sanitize string: strip HTML tags and trim whitespace ──
function sanitize(str = '') {
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'`]/g, '')
    .trim()
}

/**
 * Check if a student with this email already exists.
 * Returns the existing student doc or null.
 */
export async function checkDuplicateEnrollment(email) {
  if (!email) return null
  const q = query(
    collection(db, 'students'),
    where('email', '==', email.trim().toLowerCase())
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { docId: snap.docs[0].id, ...snap.docs[0].data() }
}

/**
 * Generate next student ID: VC-YYYY-XXX
 * Uses a Firestore transaction to safely auto-increment
 */
export async function generateStudentId() {
  const year       = new Date().getFullYear()
  const counterRef = doc(db, COUNTER_DOC)

  const newCount = await runTransaction(db, async (tx) => {
    const snap    = await tx.get(counterRef)
    const current = snap.exists() ? (snap.data().count || 0) : 0
    const next    = current + 1
    tx.set(counterRef, { count: next }, { merge: true })
    return next
  })

  const padded = String(newCount).padStart(3, '0')
  return `VC-${year}-${padded}`
}

/**
 * Validate that the amount being paid matches expected price.
 * Prevents client-side amount manipulation.
 * Returns { valid, message }
 */
export function validatePaymentAmount(amountPaid, coupon, basePrice) {
  const expectedPrice = coupon ? coupon.discountedPrice : basePrice

  if (typeof amountPaid !== 'number' || isNaN(amountPaid)) {
    return { valid: false, message: 'Invalid payment amount.' }
  }
  if (amountPaid !== expectedPrice) {
    return {
      valid: false,
      message: `Payment amount mismatch. Expected ₹${expectedPrice}, got ₹${amountPaid}.`,
    }
  }
  return { valid: true }
}

/**
 * Save a new student record to Firestore after payment success.
 * Sanitizes all string inputs before saving.
 */
export async function saveStudent(data) {
  const studentId = await generateStudentId()

  const record = {
    studentId,
    fullName:      sanitize(data.fullName),
    email:         sanitize(data.email).toLowerCase(),
    mobile:        sanitize(data.mobile),
    address:       sanitize(data.address),
    course:        sanitize(data.course),
    batch:         sanitize(data.batch),
    couponUsed:    data.couponCode ? sanitize(data.couponCode) : null,
    amountPaid:    Number(data.amountPaid),
    paymentId:     sanitize(data.paymentId),
    orderId:       sanitize(data.orderId),
    paymentStatus: 'paid',
    createdAt:     serverTimestamp(),
  }

  const ref = await addDoc(collection(db, 'students'), record)
  return { ...record, docId: ref.id }
}

/**
 * Fetch all students (for admin)
 */
export async function getAllStudents() {
  const q    = query(collection(db, 'students'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}
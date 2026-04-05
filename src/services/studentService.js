import {
  collection, doc, getDoc, setDoc,
  addDoc, serverTimestamp, runTransaction,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COUNTER_DOC = 'meta/studentCounter'

/**
 * Generate next student ID: VC-YYYY-XXX
 * Uses a Firestore transaction to safely auto-increment
 */
export async function generateStudentId() {
  const year       = new Date().getFullYear()
  const counterRef = doc(db, COUNTER_DOC)

  const newCount = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef)
    const current = snap.exists() ? (snap.data().count || 0) : 0
    const next    = current + 1
    tx.set(counterRef, { count: next }, { merge: true })
    return next
  })

  const padded = String(newCount).padStart(3, '0')
  return `VC-${year}-${padded}`
}

/**
 * Save a new student record to Firestore after payment success
 */
export async function saveStudent(data) {
  const studentId = await generateStudentId()

  const record = {
    studentId,
    fullName:      data.fullName,
    email:         data.email,
    mobile:        data.mobile,
    address:       data.address,
    course:        data.course,
    batch:         data.batch,
    couponUsed:    data.couponCode || null,
    amountPaid:    data.amountPaid,
    paymentId:     data.paymentId,
    orderId:       data.orderId,
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
  const { getDocs, orderBy, query } = await import('firebase/firestore')
  const q    = query(collection(db, 'students'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}
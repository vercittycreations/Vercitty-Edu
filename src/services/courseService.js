import {
  collection, getDocs, addDoc,
  doc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Get all courses
 */
export async function getAllCourses() {
  const snap = await getDocs(collection(db, 'courses'))
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }))
}

/**
 * Add a new course (admin)
 */
export async function addCourse(name) {
  return addDoc(collection(db, 'courses'), {
    name:      name.trim(),
    createdAt: serverTimestamp(),
  })
}

/**
 * Update a course name (admin)
 */
export async function updateCourse(docId, name) {
  return updateDoc(doc(db, 'courses', docId), { name: name.trim() })
}

/**
 * Delete a course (admin)
 */
export async function deleteCourse(docId) {
  return deleteDoc(doc(db, 'courses', docId))
}
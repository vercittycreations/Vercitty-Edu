import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

/**
 * Send enrollment confirmation email via EmailJS.
 * 
 * EmailJS Template variables used:
 *   {{to_name}}      — student full name
 *   {{to_email}}     — student email
 *   {{student_id}}   — VC-2025-001
 *   {{course_name}}  — Full-Stack Development
 *   {{batch_name}}   — Batch 1 — Weekday Morning
 *   {{amount_paid}}  — ₹1,049
 *   {{payment_id}}   — pay_Xxx...
 *   {{portal_link}}  — https://educrek.in
 */
export async function sendEnrollmentEmail(studentRecord) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('[EmailJS] Missing env vars — email not sent.')
    return { success: false, error: 'EmailJS not configured.' }
  }

  const templateParams = {
    to_name:     studentRecord.fullName,
    to_email:    studentRecord.email,
    student_id:  studentRecord.studentId,
    course_name: studentRecord.course,
    batch_name:  studentRecord.batch,
    amount_paid: `₹${studentRecord.amountPaid?.toLocaleString('en-IN')}`,
    payment_id:  studentRecord.paymentId,
    portal_link: window.location.origin,
    year:        new Date().getFullYear(),
  }

  try {
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    )
    console.log('[EmailJS] Email sent:', result.status)
    return { success: true }
  } catch (err) {
    console.error('[EmailJS] Failed:', err)
    return { success: false, error: err?.text || 'Failed to send email.' }
  }
}
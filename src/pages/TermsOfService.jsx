import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'
import Navbar         from '../components/Navbar'
import Footer         from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    content: `By enrolling in any VaultCraft internship program and completing payment, you confirm that you are at least 16 years of age and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not proceed with enrollment.`,
  },
  {
    title: '2. Program enrollment',
    content: `Enrollment is confirmed only after successful payment is received. Your Student ID (format: VC-YYYY-XXX) is issued upon successful payment and is your unique identifier for the duration of the program. Seats are limited per batch and are allocated on a first-come, first-served basis.`,
  },
  {
    title: '3. Payment and fees',
    content: `The program fee is ₹1,499 (or the discounted amount if a valid coupon is applied). All payments are processed securely through Razorpay. The fee is non-transferable between students. Coupon codes have usage limits and expiry — once exhausted or expired, they cannot be applied.`,
  },
  {
    title: '4. Refund policy',
    content: `Refund requests made within 3 days of enrollment will be considered, provided that no program materials or sessions have been accessed. After 3 days, or once program materials have been accessed, no refunds will be issued. Refund requests must be submitted to hello@vaultcraft.in with your Student ID.`,
  },
  {
    title: '5. Program participation',
    content: `Students are expected to attend sessions regularly and maintain professional conduct. VaultCraft reserves the right to revoke enrollment (without refund) for conduct that is disruptive, abusive, or violates the code of conduct. Certificates are issued only to students who complete all required sessions and assignments.`,
  },
  {
    title: '6. Intellectual property',
    content: `All program materials, including slides, videos, code resources, and exercises provided by VaultCraft are the intellectual property of VaultCraft. Students may use these materials for personal learning but may not reproduce, distribute, or sell them without written permission.`,
  },
  {
    title: '7. Limitation of liability',
    content: `VaultCraft is not liable for any indirect, incidental, or consequential damages arising from your participation in the program. Our total liability shall not exceed the amount paid by you for the program. We do not guarantee job placement or specific outcomes from participation.`,
  },
  {
    title: '8. Modifications',
    content: `VaultCraft reserves the right to modify these Terms of Service, program schedules, or content at any time. Enrolled students will be notified of material changes via email. Continued participation after such notification constitutes acceptance of the modified terms.`,
  },
  {
    title: '9. Governing law',
    content: `These Terms of Service are governed by the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.`,
  },
]

export default function TermsOfService() {
  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <main className="pt-24 pb-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-500
                hover:text-indigo-400 text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10
                  border border-indigo-500/20 flex items-center justify-center">
                  <FileText size={18} className="text-indigo-400" />
                </div>
                <span className="badge">Legal</span>
              </div>
              <h1 className="font-bold text-3xl sm:text-4xl text-white mb-3">
                Terms of Service
              </h1>
              <p className="text-slate-400 text-sm">
                Last updated: January 1, 2025
              </p>
              <p className="text-slate-400 mt-4 leading-relaxed">
                Please read these Terms of Service carefully before enrolling
                in any VaultCraft internship program. By completing enrollment,
                you agree to these terms.
              </p>
            </motion.div>

            <div className="flex flex-col gap-6">
              {SECTIONS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="glass rounded-2xl p-5 sm:p-6"
                >
                  <h2 className="font-semibold text-white text-base mb-3">
                    {s.title}
                  </h2>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {s.content}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-600 text-sm">
                Questions?{' '}
                <a href="mailto:hello@vaultcraft.in"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  hello@vaultcraft.in
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}
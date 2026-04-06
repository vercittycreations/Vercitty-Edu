import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'
import Navbar         from '../components/Navbar'
import Footer         from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Information we collect',
    content: `When you enroll in a EduCrek internship program, we collect personal information you provide directly: your full name, email address, mobile number, and address. We also collect payment-related information such as Razorpay payment IDs and order IDs. We do not store your card details — all payment processing is handled securely by Razorpay.`,
  },
  {
    title: '2. How we use your information',
    content: `We use the information we collect to: process your internship enrollment and payment; generate and assign your unique Student ID; communicate important updates about your batch, schedule, and program; provide customer support; and improve our services. We do not sell your personal data to any third party.`,
  },
  {
    title: '3. Data storage and security',
    content: `Your data is stored securely in Google Firebase (Firestore), which complies with industry-standard security practices. All data in transit is encrypted using SSL/TLS. Access to student data is restricted to authorized EduCrek administrators only. We retain your data for as long as you are an enrolled student or as required by applicable law.`,
  },
  {
    title: '4. Cookies',
    content: `Our website uses minimal cookies necessary for the application to function correctly. We do not use third-party advertising cookies. Session data (such as admin login state) is stored in your browser's sessionStorage and is cleared when you close the browser tab.`,
  },
  {
    title: '5. Third-party services',
    content: `We use the following third-party services: Razorpay for payment processing (subject to Razorpay's Privacy Policy); Google Firebase for database and authentication services; Google Forms for attendance tracking. Each service has its own privacy policy and data handling practices.`,
  },
  {
    title: '6. Your rights',
    content: `You have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data (subject to legal requirements), and withdraw consent where applicable. To exercise any of these rights, please contact us at hello@educrek.in.`,
  },
  {
    title: '7. Changes to this policy',
    content: `We may update this Privacy Policy from time to time. We will notify enrolled students of significant changes via email. The date of the last update is shown at the top of this page. Continued use of our services after any changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: '8. Contact us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at: Email: hello@educrek.in | Phone: +91 98765 43210 | Address: New Delhi, India.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg">
        <Navbar />
        <main className="pt-24 pb-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">

            {/* Back link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-500
                hover:text-indigo-400 text-sm mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Home
            </Link>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10
                  border border-indigo-500/20 flex items-center justify-center">
                  <Shield size={18} className="text-indigo-400" />
                </div>
                <span className="badge">Legal</span>
              </div>
              <h1 className="font-bold text-3xl sm:text-4xl text-white mb-3">
                Privacy Policy
              </h1>
              <p className="text-slate-400 text-sm">
                Last updated: January 1, 2025
              </p>
              <p className="text-slate-400 mt-4 leading-relaxed">
                At EduCrek, we take your privacy seriously. This policy explains
                how we collect, use, and protect your personal information when you
                use our internship enrollment platform.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="flex flex-col gap-6">
              {SECTIONS.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
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
                <a href="mailto:hello@educrek.in"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  hello@educrek.in
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
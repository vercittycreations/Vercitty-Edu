import { useState }        from 'react'
import { useNavigate }     from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ClipboardList, Tag, CreditCard } from 'lucide-react'
import PageTransition  from '../components/ui/PageTransition'
import Navbar          from '../components/Navbar'
import Footer          from '../components/Footer'
import StudentForm     from '../components/StudentForm'
import CouponSection   from '../components/CouponSection'
import PaymentSection  from '../components/PaymentSection'
import { useToast }    from '../components/ui/Toast'

const STEPS = [
  { id: 1, label: 'Details',  icon: ClipboardList },
  { id: 2, label: 'Coupon',   icon: Tag           },
  { id: 3, label: 'Payment',  icon: CreditCard    },
]

const slideVariants = {
  enter:  dir => ({ x: dir > 0 ?  60 : -60, opacity: 0 }),
  center: {
    x: 0, opacity: 1,
    transition: { duration: 0.38, ease: [0.22,1,0.36,1] },
  },
  exit: dir => ({
    x: dir > 0 ? -60 : 60, opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  }),
}

export default function Apply() {
  const navigate = useNavigate()
  const toast    = useToast()

  const [step,      setStep]      = useState(1)
  const [direction, setDirection] = useState(1)
  const [formData,  setFormData]  = useState(null)
  const [coupon,    setCoupon]    = useState(null)

  function goTo(s) {
    setDirection(s > step ? 1 : -1)
    setStep(s)
  }

  function handleFormNext(data) {
    setFormData(data)
    toast('Details saved! Apply a coupon or skip.', 'success')
    goTo(2)
  }

  function handleCouponNext() {
    if (!coupon) {
      toast('No coupon applied — proceeding at full price.', 'info')
    }
    goTo(3)
  }

  function handleSuccess(record) {
    toast('Payment successful! Redirecting…', 'success')
    setTimeout(() => navigate('/success', { state: { record } }), 800)
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <PageTransition>
      <div className="min-h-screen mesh-bg grid-overlay">
        <Navbar />

        <main className="pt-24 pb-20 px-5">
          <div className="max-w-2xl mx-auto">

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1,  y:  0 }}
              transition={{ duration: 0.45 }}
              className="text-center mb-10"
            >
              <span className="badge mb-3 inline-flex">Enrollment Form</span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl">
                Secure Your{' '}
                <span className="gradient-text">Internship Seat</span>
              </h1>
              <p className="text-slate-400 text-sm mt-3">
                Complete the form below — takes less than 2 minutes.
              </p>
            </motion.div>

            {/* Step indicator */}
            <div className="mb-10">
              <div className="relative flex items-center justify-between mb-4">
                <div className="absolute left-5 right-5 top-1/2
                  -translate-y-1/2 h-px bg-slate-700/60" />
                <motion.div
                  className="absolute left-5 top-1/2 -translate-y-1/2 h-px
                    bg-gradient-to-r from-indigo-500 to-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `calc(${progress}% - 0px)` }}
                  transition={{ duration: 0.4, ease: [0.22,1,0.36,1] }}
                />
                {STEPS.map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => id < step && goTo(id)}
                    disabled={id > step}
                    className="relative z-10 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      animate={{
                        background: id < step
                          ? 'linear-gradient(135deg,#22C55E,#16A34A)'
                          : id === step
                          ? 'linear-gradient(135deg,#6366F1,#4F46E5)'
                          : '#1E293B',
                        borderColor: id <= step
                          ? 'transparent'
                          : 'rgba(99,102,241,0.3)',
                        boxShadow: id === step
                          ? '0 0 18px rgba(99,102,241,0.5)'
                          : 'none',
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-10 h-10 rounded-full border
                        flex items-center justify-center"
                    >
                      <Icon size={16} color="white" />
                    </motion.div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between px-0">
                {STEPS.map(({ id, label }) => (
                  <span key={id}
                    className={`text-xs font-medium transition-colors duration-200
                      ${id === step ? 'text-indigo-400' : 'text-slate-600'}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Card */}
            <div className="glass rounded-3xl p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center gap-3 mb-7">
                {step > 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1,  x:  0 }}
                    onClick={() => goTo(step - 1)}
                    className="w-8 h-8 rounded-lg glass-sm flex items-center
                      justify-center text-slate-400 hover:text-white
                      transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </motion.button>
                )}
                <div>
                  <p className="text-xs text-slate-500 font-mono uppercase
                    tracking-widest">
                    Step {step} of {STEPS.length}
                  </p>
                  <h2 className="font-display font-bold text-lg text-white">
                    {step === 1 && 'Your Details'}
                    {step === 2 && 'Apply Coupon Code'}
                    {step === 3 && 'Complete Payment'}
                  </h2>
                </div>
              </div>

              <div className="relative overflow-hidden">
                <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {step === 1 && (
                      <StudentForm
                        onNext={handleFormNext}
                        defaultValues={formData}
                      />
                    )}
                    {step === 2 && (
                      <div className="flex flex-col gap-6">
                        <CouponSection
                          onCouponApplied={setCoupon}
                          appliedCoupon={coupon}
                        />
                        <motion.button
                          onClick={handleCouponNext}
                          whileHover={{ y: -2, boxShadow: '0 0 28px rgba(99,102,241,0.4)' }}
                          whileTap={{ scale: 0.98 }}
                          className="btn-primary w-full py-4 rounded-xl text-base"
                        >
                          Continue to Payment →
                        </motion.button>
                        <p className="text-center text-slate-600 text-xs">
                          No coupon? No problem — skip and proceed.
                        </p>
                      </div>
                    )}
                    {step === 3 && (
                      <PaymentSection
                        formData={formData}
                        coupon={coupon}
                        onSuccess={handleSuccess}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-slate-600 text-xs mt-5"
            >
              Your data is encrypted and never shared with third parties.
            </motion.p>
          </div>
        </main>
        <Footer />
      </div>
    </PageTransition>
  )
}
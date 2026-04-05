import { motion } from 'framer-motion'
import { ExternalLink, ClipboardCheck } from 'lucide-react'

// 🔁 Replace this with your actual Google Form URL
const ATTENDANCE_FORM_URL = 'https://forms.google.com/your-form-id'

export default function AttendanceButton() {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row
      items-center gap-5">

      <div className="w-12 h-12 rounded-2xl bg-green-500/10 border
        border-green-500/20 flex items-center justify-center shrink-0">
        <ClipboardCheck size={22} className="text-green-400" />
      </div>

      <div className="flex-1 text-center sm:text-left">
        <h4 className="font-display font-bold text-white text-base">
          Student Attendance
        </h4>
        <p className="text-slate-500 text-sm mt-0.5">
          Mark today's session attendance via Google Form.
          Share this link with your students.
        </p>
      </div>

      <motion.a
        href={ATTENDANCE_FORM_URL}
        target="_blank"
        rel="noreferrer"
        whileHover={{ y: -2, boxShadow: '0 0 28px rgba(34,197,94,0.4)' }}
        whileTap={{ scale: 0.97 }}
        className="btn-accent py-3 px-6 rounded-xl text-sm flex items-center
          gap-2 whitespace-nowrap shrink-0"
      >
        <ClipboardCheck size={16} />
        Open Form
        <ExternalLink size={13} />
      </motion.a>
    </div>
  )
}
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Zap, Github,Linkedin, Mail, Phone, MapPin,
  ExternalLink,
} from 'lucide-react'

const socials = [
  { icon: Github, href: 'https://github.com/educrek', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/educrek', label: 'LinkedIn' }
]

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Apply Now', to: '/apply' },
  { label: 'Student Lookup', to: '/student-lookup' },
  { label: 'Admin Login', to: '/admin-login' },
]

const contacts = [
  { icon: Mail, text: 'educrek@gmail.com' },
  { icon: Phone, text: 'Available Soon' },
  { icon: MapPin, text: 'New Delhi, India' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-indigo-500/10 bg-[#0a1020]">

      {/* Top glow line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px
        bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-5 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500
                to-indigo-700 flex items-center justify-center
                shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                <Zap size={16} fill="white" color="white" />
              </div>
              <span className="font-display font-bold text-lg">
                Edu<span className="text-indigo-400">Crek</span>
              </span>
            </Link>

            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              Empowering students with real-world tech skills through immersive
              internship programs.
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl glass-sm flex items-center justify-center
                    text-slate-400 hover:text-indigo-400
                    hover:border-indigo-500/40 transition-colors duration-200"
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-display font-semibold text-sm text-white mb-5
              uppercase tracking-widest">
              Quick Links
            </p>
            <ul className="space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-slate-500 text-sm hover:text-indigo-400
                      transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500/40
                      group-hover:bg-indigo-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-display font-semibold text-sm text-white mb-5
              uppercase tracking-widest">
              Contact
            </p>
            <ul className="space-y-3.5">
              {contacts.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3
                  text-slate-500 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/8
                    flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-indigo-400/70" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* Attendance CTA */}
          <div>
            <p className="font-display font-semibold text-sm text-white mb-5
              uppercase tracking-widest">
              Students
            </p>
            <div className="glass-sm rounded-xl p-4 flex flex-col gap-3">
              <p className="text-slate-400 text-xs leading-relaxed">
                Already enrolled? Mark your attendance for today's session.
              </p>
              <motion.a
                href="https://forms.google.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-accent py-2.5 px-4 text-sm rounded-xl
                  flex items-center justify-center gap-2"
              >
                Mark Attendance
                <ExternalLink size={13} />
              </motion.a>
              <p className="text-slate-600 text-[11px] text-center">
                Opens Google Form
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between
  gap-3 text-slate-600 text-xs">
          <p>© {new Date().getFullYear()} EduCrek. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to="/student-lookup"
              className="hover:text-slate-400 transition-colors">
              Student Lookup
            </Link>
            <Link to="/privacy"
              className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms"
              className="hover:text-slate-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
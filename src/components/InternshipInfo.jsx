import { motion } from 'framer-motion'
import { Link }   from 'react-router-dom'
import {
  Code2, Palette, BarChart3, Shield,
  CheckCircle2, ArrowRight, Calendar,
  BookOpen, Trophy, Laptop,
} from 'lucide-react'
import GlassCard from './ui/GlassCard'

/* ── data ─────────────────────────────────── */
const courses = [
  {
    icon:  Code2,
    title: 'Ai Web Development',
    desc:  'React, Node.js, Interactive web apps,and also real work experience',
    tags:  ['React', 'Node.js', 'Ai Web Devlopment'],
    color: 'indigo',
  },
  {
    icon:  Palette,
    title: 'Python Development',
    desc:  'Basics to Advance Python Course,1 Major,2 Minor Python project',
    tags:  ['Python Libraries', 'Ai with Python', 'Python'],
    color: 'violet',
  },
  {
    icon:  Palette,
    title: 'Graphic Design',
    desc:  'Free Canva Pro Subcription,Logo with Ai, Basic Video Editing',
    tags:  ['Full Canva Acces', 'Video Editing', 'AIMM Certificate','Capcut'],
    color: 'cyan',
  },
  {
    icon:  Shield,
    title: 'Communications Skills',
    desc:  'Basic Communication skill for interviwes.',
    tags:  ['Confidence Building', 'Vocabullary', 'English'],
    color: 'green',
  },
]

const perks = [
  { icon: BookOpen, text: 'Live project experience' },
  { icon: Trophy,   text: 'Industry-recognized certificate' },
  { icon: Laptop,   text: 'Work-from-home flexibility' },
  { icon: Calendar, text: 'Flexible weekend batches' },
]

const colorMap = {
  indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  cyan:   'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
  green:  'text-green-400  bg-green-500/10  border-green-500/20',
}

const tagMap = {
  indigo: 'bg-indigo-500/10 text-indigo-300',
  violet: 'bg-violet-500/10 text-violet-300',
  cyan:   'bg-cyan-500/10   text-cyan-300',
  green:  'bg-green-500/10  text-green-300',
}

/* ── component ────────────────────────────── */
export default function InternshipInfo() {
  return (
    <section id="courses" className="relative py-24 px-5">

      {/* Section header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="badge mb-4 inline-flex"
        >
          What We Offer
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl
            leading-tight mb-4"
        >
          Choose Your{' '}
          <span className="gradient-text">Internship Track</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-slate-400 text-base sm:text-lg leading-relaxed"
        >
          4-week intensive programs built for students who want to go beyond theory.
          Pick a track, learn by doing, and graduate job-ready.
        </motion.p>
      </div>

      {/* Course cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
        {courses.map((c, i) => {
          const Icon = c.icon
          return (
            <GlassCard key={c.title} delay={i * 0.08} glow hover className="flex flex-col gap-4">
              <div className={`w-11 h-11 rounded-xl border flex items-center justify-center
                ${colorMap[c.color]}`}>
                <Icon size={20} />
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-white mb-1.5">
                  {c.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{c.desc}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-auto">
                {c.tags.map(t => (
                  <span key={t} className={`text-xs px-2.5 py-1 rounded-full font-medium
                    ${tagMap[c.color]}`}>
                    {t}
                  </span>
                ))}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Divider */}
      <div className="divider max-w-4xl mx-auto mb-20" />

      {/* Perks + CTA row */}
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12
        items-center lg:items-start">

        {/* Perks list */}
        <div className="flex-1 w-full">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl mb-8"
          >
            Everything included at{' '}
            <span className="text-indigo-400">₹1,499</span>
          </motion.h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {perks.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 glass-sm rounded-xl px-4 py-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10
                  flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-indigo-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
                <CheckCircle2 size={14} className="text-green-400 ml-auto shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-80 neon-border rounded-2xl p-7 text-center
            flex flex-col items-center gap-5"
        >
          <span className="badge-green badge text-xs">Limited Seats</span>

          <div>
            <p className="text-slate-400 text-sm mb-1">Program Fee</p>
            <p className="font-display font-extrabold text-5xl text-white">
              ₹1,499
            </p>
            <p className="text-slate-500 text-xs mt-1">one-time · all inclusive</p>
          </div>

          <div className="divider w-full" />

          <ul className="text-left w-full space-y-2.5">
            {['4-week live program', 'Certificate of completion',
              'Project portfolio', 'Mentor support'].map(item => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <Link to="/apply" className="w-full">
            <button className="btn-primary w-full rounded-xl py-3.5">
              Enroll Now <ArrowRight size={16} />
            </button>
          </Link>

          <p className="text-slate-600 text-xs">
            Use a coupon code to get flat discount
          </p>
        </motion.div>
      </div>
    </section>
  )
}
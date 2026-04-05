import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import * as XLSX from 'xlsx'
import {
  Search, Download, Filter,
  ChevronUp, ChevronDown, RefreshCw,
  CheckCircle2, Clock, User, X,
} from 'lucide-react'
import { getAllStudents } from '../../services/studentService'

const COLS = [
  { key: 'studentId',     label: 'Student ID',  mono: true  },
  { key: 'fullName',      label: 'Name'                     },
  { key: 'email',         label: 'Email'                    },
  { key: 'mobile',        label: 'Mobile',      mono: true  },
  { key: 'course',        label: 'Course'                   },
  { key: 'batch',         label: 'Batch'                    },
  { key: 'amountPaid',    label: 'Amount',      mono: true  },
  { key: 'paymentStatus', label: 'Status'                   },
  { key: 'paymentId',     label: 'Payment ID',  mono: true  },
]

export default function StudentTable() {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')   // 'all' | 'paid'
  const [sort,     setSort]     = useState({ key: 'createdAt', dir: 'desc' })
  const [page,     setPage]     = useState(1)
  const PAGE_SIZE = 10

  async function load() {
    setLoading(true)
    try {
      const data = await getAllStudents()
      setStudents(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* ── Filter + Search + Sort ── */
  const processed = useMemo(() => {
    let arr = [...students]

    // filter
    if (filter === 'paid') arr = arr.filter(s => s.paymentStatus === 'paid')

    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(s =>
        s.fullName?.toLowerCase().includes(q)   ||
        s.email?.toLowerCase().includes(q)      ||
        s.studentId?.toLowerCase().includes(q)  ||
        s.course?.toLowerCase().includes(q)     ||
        s.paymentId?.toLowerCase().includes(q)
      )
    }

    // sort
    arr.sort((a, b) => {
      const va = a[sort.key] ?? ''
      const vb = b[sort.key] ?? ''
      const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })

    return arr
  }, [students, search, filter, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const paginated  = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key) {
    setSort(s => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
    )
    setPage(1)
  }

  /* ── Export ── */
  function exportExcel() {
    const rows = processed.map(s => ({
      'Student ID':    s.studentId,
      'Full Name':     s.fullName,
      'Email':         s.email,
      'Mobile':        s.mobile,
      'Course':        s.course,
      'Batch':         s.batch,
      'Amount Paid':   `₹${s.amountPaid}`,
      'Payment Status': s.paymentStatus,
      'Payment ID':    s.paymentId,
      'Order ID':      s.orderId,
      'Coupon Used':   s.couponUsed || '—',
      'Enrolled On':   s.createdAt?.toDate
        ? s.createdAt.toDate().toLocaleDateString('en-IN')
        : '—',
    }))
    const ws  = XLSX.utils.json_to_sheet(rows)
    const wb  = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, `VaultCraft_Students_${Date.now()}.xlsx`)
  }

  function exportCSV() {
    const rows = processed.map(s => ([
      s.studentId, s.fullName, s.email, s.mobile,
      s.course, s.batch, s.amountPaid,
      s.paymentStatus, s.paymentId, s.orderId,
      s.couponUsed || '',
    ]))
    const header = [
      'Student ID','Name','Email','Mobile',
      'Course','Batch','Amount','Status','Payment ID','Order ID','Coupon',
    ]
    const csv  = [header, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `VaultCraft_Students_${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ── Sort icon ── */
  function SortIcon({ col }) {
    if (sort.key !== col) return <ChevronUp size={12} className="text-slate-700" />
    return sort.dir === 'asc'
      ? <ChevronUp   size={12} className="text-indigo-400" />
      : <ChevronDown size={12} className="text-indigo-400" />
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2
            -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, ID, course…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input pl-10 text-sm py-2.5"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                text-slate-500 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter pill */}
        <div className="flex gap-2">
          {['all','paid'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase
                tracking-widest transition-all duration-200
                ${filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'glass-sm text-slate-500 hover:text-slate-300'}`}
            >
              {f === 'all' ? 'All' : 'Paid'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={load}
            className="glass-sm px-3 py-2.5 rounded-xl text-slate-400
              hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportCSV}
            className="glass-sm px-4 py-2.5 rounded-xl text-xs font-semibold
              text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Download size={13} /> CSV
          </button>
          <button onClick={exportExcel}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Students', value: students.length,
            icon: User, color: 'text-indigo-400' },
          { label: 'Paid',
            value: students.filter(s => s.paymentStatus === 'paid').length,
            icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Revenue',
            value: `₹${students.reduce((a,s) => a + (s.amountPaid||0), 0).toLocaleString('en-IN')}`,
            icon: Download, color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label}
            className="glass-sm rounded-xl px-4 py-3 flex items-center gap-3">
            <Icon size={16} className={color} />
            <div>
              <p className="font-display font-bold text-white text-lg
                leading-none">{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="data-table min-w-[900px]">
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className="cursor-pointer select-none hover:text-slate-300
                      transition-colors whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5">
                      {c.label}
                      <SortIcon col={c.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {COLS.map(c => (
                      <td key={c.key}>
                        <div className="shimmer-bg h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3 text-slate-600">
                      <User size={32} className="opacity-30" />
                      <p className="text-sm">No students found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {paginated.map((s, i) => (
                    <motion.tr
                      key={s.docId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {COLS.map(c => (
                        <td key={c.key}>
                          {c.key === 'paymentStatus' ? (
                            <span className={`inline-flex items-center gap-1.5
                              px-2.5 py-1 rounded-full text-xs font-semibold
                              ${s.paymentStatus === 'paid'
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-yellow-500/10 text-yellow-400'}`}
                            >
                              {s.paymentStatus === 'paid'
                                ? <CheckCircle2 size={11} />
                                : <Clock size={11} />
                              }
                              {s.paymentStatus}
                            </span>
                          ) : c.key === 'amountPaid' ? (
                            <span className="font-mono text-green-400">
                              ₹{s.amountPaid?.toLocaleString('en-IN')}
                            </span>
                          ) : c.key === 'batch' ? (
                            <span className="text-xs text-slate-400 max-w-[160px]
                              block truncate" title={s.batch}>
                              {s.batch}
                            </span>
                          ) : (
                            <span className={c.mono
                              ? 'font-mono text-xs text-indigo-300'
                              : 'text-sm'}>
                              {s[c.key] || '—'}
                            </span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3
            border-t border-indigo-500/10">
            <p className="text-xs text-slate-500">
              Showing {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, processed.length)} of {processed.length}
            </p>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono transition-all
                    ${p === page
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-600 hover:text-slate-300'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
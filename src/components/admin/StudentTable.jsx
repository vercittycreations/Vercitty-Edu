import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import * as XLSX from 'xlsx'
import {
  Search, Download, RefreshCw,
  ChevronUp, ChevronDown,
  CheckCircle2, Clock, User, X,
  TrendingUp,
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
  const [filter,   setFilter]   = useState('all')
  const [sort,     setSort]     = useState({ key: 'createdAt', dir: 'desc' })
  const [page,     setPage]     = useState(1)
  const PAGE_SIZE = 10

  async function load() {
    setLoading(true)
    try { setStudents(await getAllStudents()) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const processed = useMemo(() => {
    let arr = [...students]
    if (filter === 'paid') arr = arr.filter(s => s.paymentStatus === 'paid')
    if (search.trim()) {
      const q = search.toLowerCase()
      arr = arr.filter(s =>
        s.fullName?.toLowerCase().includes(q)  ||
        s.email?.toLowerCase().includes(q)     ||
        s.studentId?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q)    ||
        s.paymentId?.toLowerCase().includes(q)
      )
    }
    arr.sort((a, b) => {
      const cmp = String(a[sort.key] ?? '').localeCompare(
        String(b[sort.key] ?? ''), undefined, { numeric: true }
      )
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [students, search, filter, sort])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const paginated  = processed.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  function toggleSort(key) {
    setSort(s => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' }
    )
    setPage(1)
  }

  function exportExcel() {
    const rows = processed.map(s => ({
      'Student ID':    s.studentId,
      'Full Name':     s.fullName,
      'Email':         s.email,
      'Mobile':        s.mobile,
      'Course':        s.course,
      'Batch':         s.batch,
      'Amount Paid':   `₹${s.amountPaid}`,
      'Status':        s.paymentStatus,
      'Payment ID':    s.paymentId,
      'Order ID':      s.orderId,
      'Coupon':        s.couponUsed || '—',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Students')
    XLSX.writeFile(wb, `VaultCraft_Students_${Date.now()}.xlsx`)
  }

  function exportCSV() {
    const header = ['Student ID','Name','Email','Mobile','Course','Batch',
      'Amount','Status','Payment ID','Order ID','Coupon']
    const rows = processed.map(s => [
      s.studentId, s.fullName, s.email, s.mobile,
      s.course, s.batch, s.amountPaid,
      s.paymentStatus, s.paymentId, s.orderId, s.couponUsed||'',
    ])
    const csv  = [header,...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `VaultCraft_${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function SortIcon({ col }) {
    if (sort.key !== col) return <ChevronUp size={11} className="text-slate-700" />
    return sort.dir === 'asc'
      ? <ChevronUp   size={11} className="text-indigo-400" />
      : <ChevronDown size={11} className="text-indigo-400" />
  }

  const totalRevenue = students.reduce((a,s) => a + (s.amountPaid||0), 0)
  const paidCount    = students.filter(s => s.paymentStatus === 'paid').length

  return (
    <div className="flex flex-col gap-5">

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label:'Total Students', value: students.length,
            icon: User, color:'text-indigo-400', bg:'bg-indigo-500/10 border-indigo-500/20' },
          { label:'Paid',           value: paidCount,
            icon: CheckCircle2, color:'text-green-400', bg:'bg-green-500/10 border-green-500/20' },
          { label:'Revenue',
            value:`₹${totalRevenue.toLocaleString('en-IN')}`,
            icon: TrendingUp, color:'text-violet-400', bg:'bg-violet-500/10 border-violet-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label}
            className={`glass-sm rounded-xl px-4 py-3.5 flex items-center
              gap-3 border ${bg}`}>
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center
              justify-center flex-shrink-0`}>
              <Icon size={15} className={color} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-lg leading-none truncate">
                {value}
              </p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* 
          KEY FIX: input-wrap + input-icon-left/right classes
          Prevents search icon from overlapping input text
        */}
        <div className="input-wrap flex-1">
          <span className="input-icon-left">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search name, email, ID, course…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="form-input form-input-icon-left form-input-icon-right text-sm py-2.5"
          />
          {/* Clear button — only shows when there's text */}
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1) }}
              className="input-icon-right clickable"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-shrink-0">
          {['all','paid'].map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase
                tracking-widest transition-all duration-200 whitespace-nowrap
                ${filter === f
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'glass-sm text-slate-500 hover:text-slate-300'}`}
            >
              {f === 'all' ? 'All' : 'Paid'}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={load}
            title="Refresh"
            className="glass-sm px-3 py-2.5 rounded-xl text-slate-400
              hover:text-white transition-colors flex-shrink-0">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={exportCSV}
            className="glass-sm px-4 py-2.5 rounded-xl text-xs font-semibold
              text-slate-400 hover:text-white transition-colors
              flex items-center gap-1.5 whitespace-nowrap">
            <Download size={13} /> CSV
          </button>
          <button onClick={exportExcel}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs
              flex items-center gap-1.5 whitespace-nowrap">
            <Download size={13} /> Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* table-wrapper from index.css: overflow-x:auto with touch support */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {COLS.map(c => (
                  <th key={c.key}
                    onClick={() => toggleSort(c.key)}
                    className="cursor-pointer select-none hover:text-slate-300
                      transition-colors">
                    <span className="flex items-center gap-1.5">
                      {c.label}
                      <SortIcon col={c.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {COLS.map(c => (
                        <td key={c.key}>
                          <div className="shimmer-bg h-3.5 rounded w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginated.length === 0
                  ? (
                    <tr>
                      <td colSpan={COLS.length}
                        className="text-center py-14 text-slate-600">
                        <div className="flex flex-col items-center gap-3">
                          <User size={30} className="opacity-20" />
                          <p className="text-sm">
                            {search ? 'No results match your search.' : 'No students yet.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )
                  : (
                    <AnimatePresence>
                      {paginated.map((s, i) => (
                        <motion.tr
                          key={s.docId}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1,  y: 0 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          {COLS.map(c => (
                            <td key={c.key}>
                              {c.key === 'paymentStatus' ? (
                                <span className={`inline-flex items-center gap-1.5
                                  px-2.5 py-1 rounded-full text-xs font-semibold
                                  whitespace-nowrap
                                  ${s.paymentStatus === 'paid'
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-yellow-500/10 text-yellow-400'}`}>
                                  {s.paymentStatus === 'paid'
                                    ? <CheckCircle2 size={11} />
                                    : <Clock size={11} />}
                                  {s.paymentStatus}
                                </span>
                              ) : c.key === 'amountPaid' ? (
                                <span className="font-mono text-green-400 text-sm">
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
                  )
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3
            border-t border-indigo-500/10 flex-wrap gap-2">
            <p className="text-xs text-slate-500">
              Showing {(page-1)*PAGE_SIZE+1}–
              {Math.min(page*PAGE_SIZE, processed.length)} of {processed.length}
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: totalPages }, (_,i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono
                    transition-all flex-shrink-0
                    ${p === page
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-600 hover:text-slate-300'}`}>
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
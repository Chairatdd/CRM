import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import { getInteractions } from '../api'

const fmtDateTime = (d) => d
  ? new Date(d).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' })
  : '-'

const typeIcon    = { Call:'📞', Email:'✉️', Visit:'🏢', Chat:'💬', Social:'📱' }
const outcomeRing = { Positive:'border-emerald-300 bg-emerald-50', Neutral:'border-slate-200 bg-slate-50', Negative:'border-rose-300 bg-rose-50' }

export default function Interactions() {
  const [interactions, setInteractions] = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type:'', outcome:'' })

  const load = async (pg = page) => {
    setLoading(true)
    try {
      const res = await getInteractions({ ...filters, page: pg, limit: 15 })
      setInteractions(res.data.data)
      setTotal(res.data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { setPage(1); load(1) }, [filters])
  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(total / 15)

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Interactions</h1>
        <p className="text-slate-500 text-sm mt-1">ประวัติการติดต่อลูกค้าทุก channel</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-slate-400" />
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">ประเภททั้งหมด</option>
          {['Call','Email','Visit','Chat','Social'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.outcome} onChange={e => setFilters(f => ({ ...f, outcome: e.target.value }))}>
          <option value="">ผลลัพธ์ทั้งหมด</option>
          {['Positive','Neutral','Negative'].map(o => <option key={o}>{o}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{total} รายการ</span>
      </div>

      {/* List */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {interactions.map(item => (
            <div key={item.id}
              className={`bg-white rounded-xl shadow-sm border p-4 flex gap-4 hover:shadow-md transition-all ${outcomeRing[item.outcome] || 'border-slate-100'}`}>
              <div className="text-2xl flex-shrink-0 pt-1">{typeIcon[item.type] || '💬'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Link to={`/customers/${item.customer_id}`}
                    className="font-semibold text-slate-800 text-sm hover:text-indigo-600 transition-colors">
                    {item.customer_name}
                  </Link>
                  <span className="text-slate-300 text-xs">{item.customer_code}</span>
                  <Badge label={item.type} />
                  <Badge label={item.outcome} />
                </div>
                <p className="font-medium text-slate-700 text-sm mb-0.5">{item.subject}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{item.notes}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span>👤 {item.agent_name}</span>
                  <span>🕐 {fmtDateTime(item.interaction_date)}</span>
                </div>
              </div>
            </div>
          ))}
          {interactions.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-slate-400 text-sm border border-slate-100">
              ไม่พบ interaction ที่ตรงกัน
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <span className="text-xs text-slate-500">หน้า {page} จาก {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

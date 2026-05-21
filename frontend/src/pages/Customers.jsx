import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import Badge from '../components/Badge'
import LoadingSpinner from '../components/LoadingSpinner'
import { getCustomers, getSegments } from '../api'

const fmt = (n) => new Intl.NumberFormat('th-TH').format(Math.round(n))

const RFMStars = ({ score }) => (
  <span className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={10} className={i <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
  </span>
)

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [segments,  setSegments]  = useState([])
  const [total,  setTotal]  = useState(0)
  const [page,   setPage]   = useState(1)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({ search:'', status:'', type:'', segment:'' })

  const load = useCallback(async (pg = page) => {
    setLoading(true)
    try {
      const res = await getCustomers({ ...filters, page: pg, limit: 12 })
      setCustomers(res.data.data)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { getSegments().then(r => setSegments(r.data)) }, [])

  useEffect(() => { setPage(1); load(1) }, [filters])
  useEffect(() => { load(page) }, [page])

  const totalPages = Math.ceil(total / 12)

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">ลูกค้าทั้งหมด</h1>
          <p className="text-slate-500 text-sm mt-1">จัดการข้อมูลลูกค้าและ Customer Profile</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <UserPlus size={16} />
          เพิ่มลูกค้า
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="ค้นหาชื่อ, อีเมล, รหัสลูกค้า..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          />
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">สถานะทั้งหมด</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>Churned</option>
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
        >
          <option value="">ประเภททั้งหมด</option>
          <option value="Individual">Individual</option>
          <option value="Corporate">Corporate</option>
        </select>
        <select
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={filters.segment}
          onChange={e => setFilters(f => ({ ...f, segment: e.target.value }))}
        >
          <option value="">Segment ทั้งหมด</option>
          {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500">พบ <strong className="text-slate-800">{total}</strong> ราย</span>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ลูกค้า</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ติดต่อ</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ประเภท</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Segment</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">LTV</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">RFM</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/customers/${c.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: c.avatar_color }}>
                          {c.first_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-xs text-slate-400">{c.customer_code}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600 text-xs">{c.email}</p>
                      <p className="text-slate-400 text-xs">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={c.customer_type} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.segments ? c.segments.split(',').map((seg, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: c.segment_colors?.split(',')[i] + '22', color: c.segment_colors?.split(',')[i] }}>
                            {seg}
                          </span>
                        )) : <span className="text-slate-300 text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-700">฿{fmt(c.lifetime_value)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <RFMStars score={c.rfm_score} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">หน้า {page} จาก {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors">
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
